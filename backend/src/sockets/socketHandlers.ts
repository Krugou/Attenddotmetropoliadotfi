import crypto from 'crypto';
import {config} from 'dotenv';
import {Server, Socket} from 'socket.io';
import doFetch from '../utils/doFetch.js';
// import logger from '../utils/logger.js';
/**
 * Socket event handlers for managing attendance in lectures.
 * This module sets up Socket.IO server event handlers for various actions related to lecture attendance,
 * including starting and finishing lectures, handling student arrivals, and manual operations by teachers.
 *
 * @module setupSocketHandlers
 */
config();

/**
 * The speed at which the hash changes, in milliseconds.
 * @type {number}
 */
let speedOfHashChange = 6000;

/**
 * The number of times leeway is allowed.
 * @type {number}
 */
let leewaytimes = 5;

/**
 * The timeout duration, in milliseconds.
 * @type {number}
 */
let timeout = 3600000;

/**
 * The amount of leeway allowed.
 * @type {number}
 */
let howMuchLeeWay = 0;

interface LectureData {
	[lectureid: string]: {
		timestamps: Array<{start: number; end: number; hash: string}>;
		hash: string | null;
	};
}

// eslint-disable-next-line prefer-const
let lectureData: LectureData = {};

/**
 * The Student interface.
 * @interface
 */
interface Student {
	studentnumber: number;
	GDPR: number;
	first_name: string;
	last_name: string;
	// add other properties as needed
}
/**
 * Retrieves a token by making a POST request with the dev account credentials.
 *
 * @returns {Promise<string>} A promise that resolves to the token string.
 */
const getToken = async () => {
	try {
		// admin login to get token use dev account from .env file
		const response = await doFetch('http://localhost:3002/users/', {
			method: 'post', // or 'GET'
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: process.env.devaccount,
				password: process.env.devpass,
			}),
		});

		return response.token;
	} catch (error) {
		// Handle the error here
		console.error(error);
	}
};
/**
 * Fetches data and updates the `speedOfHashChange`, `leewaytimes`, and `timeout` variables.
 *
 * @returns {Promise<void>} A promise that resolves when the data has been fetched and the variables have been updated.
 */
const fetchDataAndUpdate = async () => {
	try {
		const token = await getToken();
		const response = await doFetch('http://localhost:3002/admin/ ', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + token,
			},
		});

		speedOfHashChange = response.speedofhash;
		leewaytimes = response.leewayspeed;
		timeout = response.timeouttime;
	} catch (error) {
		// Handle the error here
		console.error(error);
	}
};

/**
 * Updates the hash and timestamps.
 * Generates a new random hash, calculates the start and end times, and adds them to the timestamps array.
 * If the timestamps array exceeds a certain length, the oldest hash and timestamp are removed.
 */

const updateHash = (lectureid: string) => {
	// Generate a random hash
	const start = Date.now();
	const hash = crypto.randomBytes(20).toString('hex');
	const end = Date.now() + speedOfHashChange;

	// Initialize the lecture data if it doesn't exist
	if (!lectureData[lectureid]) {
		lectureData[lectureid] = {timestamps: [], hash: null};
	}

	// Add the hash and timestamps to the timestamps array
	lectureData[lectureid].timestamps.push({start, end, hash});
	lectureData[lectureid].hash = hash;

	const timestampslength = howMuchLeeWay / speedOfHashChange;

	// Remove the oldest hash and timestamp if the timestamps array is too long
	if (lectureData[lectureid].timestamps.length > timestampslength) {
		lectureData[lectureid].timestamps.shift();
	}
};
/**
 * Sends a POST request to the '/lecturefinished/' route and emits 'lecturefinished' event to connected sockets.
 *
 * @param {string} lectureid - The ID of the finished lecture.
 * @param {Server} io - The Socket.IO server.
 */
const finishLecture = async (lectureid: string, io: Server) => {
	// Prepare the data to be sent
	try {
		const data = {
			date: new Date().toISOString().slice(0, 19).replace('T', ' '),
			studentnumbers: notYetPresentStudents[lectureid].map(
				student => student.studentnumber,
			),
			lectureid: lectureid,
		};
		const token = await getToken();
		// Send a POST request to the '/lecturefinished/' route
		const response = await fetch(
			'http://localhost:3002/courses/attendance/lecturefinished/',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token,
				},
				body: JSON.stringify(data),
			},
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		if (response.ok) {
			io.to(lectureid).emit('lectureFinished', lectureid);
			// Purge lectureid from notYetPresentStudents and presentStudents
			delete notYetPresentStudents[lectureid];
			delete presentStudents[lectureid];
			delete lectureData[lectureid];
			clearTimeout(lectureTimeoutIds.get(lectureid));
			console.log('lectureFinished ' + lectureid + ' ' + new Date().toISOString());
		}
	} catch (error) {
		console.error('Error:', error);
	}
};
// The lists of students who have arrived and who have not yet arrived
const presentStudents: {[lectureid: string]: any[]} = {};
const notYetPresentStudents: {[lectureid: string]: Student[]} = {};
// The timeout id for the lecture
const lectureTimeoutIds = new Map();

/**
 * Sets up Socket event handlers for a given Socket.IO server.
 *
 * @param {Server} io - The Socket.IO server.
 *
 * The function handles the following events:
 * - 'connection': Logs when a user connects and disconnects.
 * - 'createAttendanceCollection': Handles the creation of an attendance collection for a lecture.
 * - 'inputThatStudentHasArrivedToLecture': Handles the event when a student inputs the secure hash and unixtime.
 * - 'manualstudentinsert': Handles the event when the teacher manually inputs the student id.
 * - 'manualStudentRemove': Handles the event when the teacher manually removes a student.
 */
const setupSocketHandlers = (io: Server) => {
	io.on('connection', (socket: Socket) => {
		// console.log('user joined: ' + socket.id);

		// handle disconnect
		socket.on('disconnect', () => {
			// console.log('user disconnected');
		});
		socket.on('createAttendanceCollection', async lectureid => {
			console.log(
				'createAttendanceCollection ',
				lectureid + ' ' + new Date().toISOString(),
			);
			// logger.info('createAttendanceCollection ' + lectureid);
			// Initialize the lecture data if it doesn't exist
			if (!lectureData[lectureid]) {
				lectureData[lectureid] = {timestamps: [], hash: null};
			}
			// Fetch and update data when a new lecture is started
			fetchDataAndUpdate()
				.then(async () => {
					howMuchLeeWay = speedOfHashChange * leewaytimes;
					// Join the room with the lectureid
					socket.join(lectureid);
					// Emit the 'lecturestarted' event to the room with the lectureid
					io.to(lectureid).emit('lectureStarted', lectureid, timeout);
					console.log(
						'lecture started ' + lectureid + ' ' + new Date().toISOString(),
					);
					io.to(lectureid).emit('pingEvent', lectureid, Date.now());
					setInterval(() => {
						io.to(lectureid).emit('pingEvent', lectureid, Date.now());
					}, 5000);
					socket.on('pongEvent', (lectureid: string, unixtime: number) => {
						socket.emit('pongEvent', lectureid, unixtime);
					});
					// Get the list of students who have arrived and who have not yet arrived
					const token = await getToken();
					if (presentStudents[lectureid] && notYetPresentStudents[lectureid]) {
						// If the lists already exist, emit them to the room with the lectureid
						io
							.to(lectureid)
							.emit('getallstudentsinlecture', notYetPresentStudents[lectureid]);
						console.log(
							'Page reload detected for lectureid: ' +
								lectureid +
								' ' +
								new Date().toISOString(),
						);
					} else {
						// If the lists do not exist, fetch them from the server and emit them to the room with the lectureid
						doFetch(
							'http://localhost:3002/courses/attendance/getallstudentsinlecture/',
							{
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									Authorization: 'Bearer ' + token,
								},
								body: JSON.stringify({
									lectureid: lectureid,
								}),
							},
						)
							.then(response => {
								// Handle the response here
								notYetPresentStudents[lectureid] = response;
								presentStudents[lectureid] = [];
								// Emit the lists to the room with the lectureid
								io
									.to(lectureid)
									.emit('getallstudentsinlecture', notYetPresentStudents[lectureid]);
								console.log(
									'getallstudentsinlecture ' +
										lectureid +
										' ' +
										new Date().toISOString(),
								);
								// logger.info('getallstudentsinlecture ' + lectureid);
							})
							.catch(error => {
								console.error('Error:', error + ' ' + new Date().toISOString());
							});
					}
					// Update the hash for this lecture
					updateHash(lectureid);
					setInterval(() => updateHash(lectureid), speedOfHashChange);
					setTimeout(() => {
						io
							.to(lectureid)
							.emit(
								'updateAttendanceCollectionData',
								lectureData[lectureid].hash,
								lectureid,
								presentStudents[lectureid],
								notYetPresentStudents[lectureid],
							);
					}, 1000);
					// Create an object to store interval IDs
					const intervals: {[lectureid: string]: NodeJS.Timeout} = {};

					// If an interval already exists for the lectureid, clear it
					if (intervals[lectureid]) {
						clearInterval(intervals[lectureid]);
					}

					// Set a new interval and store its ID in the intervals object
					intervals[lectureid] = setInterval(() => {
						io
							.to(lectureid)
							.emit(
								'updateAttendanceCollectionData',
								lectureData[lectureid].hash,
								lectureid,
								presentStudents[lectureid],
								notYetPresentStudents[lectureid],
							);
					}, speedOfHashChange);

					if (lectureTimeoutIds.has(lectureid)) {
						clearTimeout(lectureTimeoutIds.get(lectureid));
					}
					// Set a timeout to emit 'classfinished' event after 'timeout' milliseconds
					const timeoutId = setTimeout(() => {
						console.log(
							'Lecture finished with timeout ' +
								lectureid +
								' ' +
								new Date().toISOString(),
						);
						// logger.info('Lecture finished with timeout ' + lectureid);
						finishLecture(lectureid, io);
					}, timeout);
					console.log(
						'setting timeout to timeoutids ' + lectureid,
						timeoutId + ' ' + new Date().toISOString(),
					);
					// logger.info('setting timeout to timeoutids ' + lectureid);
					lectureTimeoutIds.set(lectureid, timeoutId);
					// Handle the 'lecturefinishedwithbutton' event
					socket.on('lectureFinishedWithButton', async (lectureid: string) => {
						console.log(
							'lectureFinishedWithButton ' +
								lectureid +
								' ' +
								new Date().toISOString(),
						);
						// logger.info('lectureFinishedWithButton ' + lectureid);
						finishLecture(lectureid, io);
					});
					// Clear the interval when the socket disconnects
					socket.on('disconnect', () => {
						clearInterval(intervals[lectureid]);
						// logger.info('disconnect ' + lectureid);
					});
				})
				.catch(error => {
					console.error(error);
				});
		});
		// Handle the 'inputThatStudentHasArrivedToLecture' event
		// This event is emitted when the student inputs the secure hash and unixtime
		socket.on(
			'inputThatStudentHasArrivedToLecture',
			async (
				secureHash: string,
				studentId: string,
				unixtime: number,
				lectureid: number,
			) => {
				if (studentId === '') {
					io
						.to(socket.id)
						.emit('inputThatStudentHasArrivedToLectureTooSlow', lectureid);
				}
				// find the timestamp that matches the secureHash and unixtime
				const timestamp = lectureData[lectureid].timestamps.find(
					t => t.hash === secureHash && unixtime >= t.start && unixtime <= t.end,
				);

				if (timestamp) {
					console.log('timestamp found for ' + studentId + ' !');
					// logger.info('timestamp found for ' + studentId + ' !');
				} else {
					console.log('lectureid: ' + lectureid);
					console.log(secureHash + ' ' + unixtime + ' ' + new Date().toISOString());
					console.log('Current timestamps: ');
					console.log(lectureData[lectureid].timestamps);
					console.log('timestamp not found for ' + studentId + ' !');
					// logger.info('lectureid: ' + lectureid);
					// logger.info(secureHash + ' ' + unixtime + ' ' + new Date().toISOString());
					// logger.info('Current timestamps: ');
					// logger.info(lectureData[lectureid].timestamps);
					// logger.info('timestamp not found for ' + studentId + ' !');
				}

				// console.log(
				// 	'🚀 ~ file: socketHandlers.ts:257 ~ io.on ~ timestamp:',
				// 	timestamp,
				// );
				if (timestamp) {
					const token = await getToken();
					doFetch('http://localhost:3002/courses/attendance/', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: 'Bearer ' + token,
						},
						body: JSON.stringify({
							status: '1',
							date: new Date().toISOString().slice(0, 19).replace('T', ' '),
							studentnumber: studentId,
							lectureid: lectureid,
						}),
					})
						.then(response => {
							console.log(
								' inputThatStudentHasArrivedToLecture Success:' +
									new Date().toISOString(),
							);
							console.log(response);

							const studentIndex = notYetPresentStudents[lectureid].findIndex(
								(student: Student) =>
									Number(student.studentnumber) === Number(studentId),
							);

							if (studentIndex !== -1) {
								const student = notYetPresentStudents[lectureid][studentIndex];
								presentStudents[lectureid].push(student);
								notYetPresentStudents[lectureid].splice(studentIndex, 1);
								io
									.to(lectureid.toString())
									.emit('updateCourseStudents', notYetPresentStudents[lectureid]);
								io
									.to(lectureid.toString())
									.emit('updateAttendees', presentStudents[lectureid]);
							} else {
								io.to(socket.id).emit('studentNotFound', lectureid);
								console.error('Student not found');
							}

							io.to(socket.id).emit('youHaveBeenSavedIntoLecture', lectureid);
							console.log(
								'youHaveBeenSavedIntoLecture ' +
									lectureid +
									' ' +
									studentId +
									' ' +
									new Date().toISOString(),
							);
						})
						.catch(error => {
							// Handle the error here
							console.error(error);
						});
				} else {
					io
						.to(socket.id)
						.emit('inputThatStudentHasArrivedToLectureTooSlow', lectureid);
					console.log(
						'inputThatStudentHasArrivedToLectureTooSlow ' +
							lectureid +
							' ' +
							studentId +
							' ' +
							new Date().toISOString(),
					);
				}
			},
		);
		// Handle the 'manualstudentinsert' event
		// This event is emitted when the teacher inputs the student id
		socket.on(
			'manualStudentInsert',
			async (studentId: string, lectureid: number) => {
				console.log(
					'manualStudentInsert ',
					studentId + ' ' + lectureid + ' ' + new Date().toISOString(),
				);
				// Emit the 'manualstudentinsertFailed' event only to the client who sent the event
				if (studentId === '') {
					io.to(socket.id).emit('manualStudentInsertFailedEmpty', lectureid);
					return;
				}

				const token = await getToken();
				doFetch('http://localhost:3002/courses/attendance/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer ' + token,
					},
					body: JSON.stringify({
						status: '1',
						date: new Date().toISOString().slice(0, 19).replace('T', ' '),
						studentnumber: studentId,
						lectureid: lectureid,
					}),
				})
					.then(response => {
						if (response) {
							console.log('manualStudentInsert Success:', response);
						}
						const studentIndex = notYetPresentStudents[lectureid].findIndex(
							(student: Student) =>
								Number(student.studentnumber) === Number(studentId),
						);

						if (studentIndex !== -1) {
							const student = notYetPresentStudents[lectureid][studentIndex];
							presentStudents[lectureid].push(student);
							notYetPresentStudents[lectureid].splice(studentIndex, 1); // Remove the student from notYetPresentStudents
						} else {
							console.error('Student not found');
						}
						io
							.to(lectureid.toString())
							.emit('updateCourseStudents', notYetPresentStudents[lectureid]);
						io
							.to(lectureid.toString())
							.emit('updateAttendees', presentStudents[lectureid]);
						// Emit the 'manualstudentinsertSuccess' event only to the client who sent the event
						io.to(socket.id).emit('manualStudentInsertSuccess', lectureid);
						console.log(
							'manualStudentInsertSuccess ',
							lectureid + ' ' + new Date().toISOString(),
						);
					})
					.catch(error => {
						console.error(
							'manualStudentInsertError error: ' +
								error +
								' ' +
								new Date().toISOString(),
						);
						// Emit the 'manualstudentinsertError' event only to the client who sent the event
						io.to(socket.id).emit('manualStudentInsertError', lectureid);
					});
			},
		);

		socket.on(
			'manualStudentRemove',
			async (studentId: string, lectureid: number) => {
				console.log(
					'manualStudentRemove ' +
						' ' +
						studentId +
						' ' +
						lectureid +
						' ' +
						new Date().toISOString(),
				);
				// Emit the 'manualStudentRemoveFailed' event only to the client who sent the event
				if (studentId === '') {
					io.to(socket.id).emit('manualStudentRemoveFailedEmpty', lectureid);
					return;
				}

				const token = await getToken();
				doFetch('http://localhost:3002/courses/attendance/delete/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer ' + token,
					},
					body: JSON.stringify({
						studentnumber: studentId,
						lectureid: lectureid,
					}),
				})
					.then(response => {
						if (response) {
							const studentIndex = presentStudents[lectureid].findIndex(
								(student: Student) =>
									Number(student.studentnumber) === Number(studentId),
							);

							if (studentIndex !== -1) {
								const student = presentStudents[lectureid][studentIndex];
								notYetPresentStudents[lectureid].push(student);
								presentStudents[lectureid].splice(studentIndex, 1); // Remove the student from presentStudents
							} else {
								console.error('Student not found' + ' ' + new Date().toISOString());
							}
							io
								.to(lectureid.toString())
								.emit('updateCourseStudents', notYetPresentStudents[lectureid]);
							io
								.to(lectureid.toString())
								.emit('updateAttendees', presentStudents[lectureid]);
							// Emit the 'manualStudentRemoveSuccess' event only to the client who sent the event
							io.to(socket.id).emit('manualStudentRemoveSuccess', lectureid);
							console.log(
								'manualStudentRemoveSuccess ',
								lectureid + ' ' + new Date().toISOString(),
							);
						}
					})
					.catch(error => {
						console.error(
							'manualStudentRemoveError error: ' +
								error +
								' ' +
								new Date().toISOString(),
						);
						// Emit the 'manualStudentRemoveError' event only to the client who sent the event
						io.to(socket.id).emit('manualStudentRemoveError', lectureid);
					});
			},
		);

		// Handle the 'lecturecanceled' event
		socket.on('lectureCanceled', async lectureid => {
			const token = await getToken();
			try {
				await doFetch('http://localhost:3002/courses/attendance/deletelecture/', {
					method: 'POST', // or 'GET'
					headers: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer ' + token,
					},
					body: JSON.stringify({
						lectureid: lectureid,
					}),
				});

				io.to(lectureid).emit('lectureCanceledSuccess', lectureid);
				console.log(
					'lectureCanceledSuccess ' + lectureid + ' ' + new Date().toISOString(),
				);
				// Purge lectureid from notYetPresentStudents and presentStudents
				delete notYetPresentStudents[lectureid];
				delete presentStudents[lectureid];
				delete lectureData[lectureid];
				clearTimeout(lectureTimeoutIds.get(lectureid));
			} catch (error) {
				// Handle the error here
				console.error(error);
			}
		});
	});
};

export default setupSocketHandlers;
