import crypto from 'crypto';
import {config} from 'dotenv';
import {Server} from 'socket.io';

import doFetch from '../utils/doFetch.js';
import getToken from '../utils/getToken.js';
import logger from '../utils/logger.js';
import fetchServerSettings from '../utils/fetchServerSettings.js';
import {
  authenticateSocket,
  type AuthenticatedSocket,
} from '../utils/authenticateSocket.js';
import {handleLectureCanceled} from './EmitMessages/handleLectureCanceled.js';
config();

logger.info('SocketHandlers.ts is loading correctly');
let speedOfHashChange = 6000;
let leewaytimes = 5;
let timeout = 3600000;
let howMuchLeeWay = 0;

interface LectureData {
  [lectureid: string]: {
    timestamps: Array<{start: number; end: number; hash: string}>;
    hash: string | null;
  };
}

// eslint-disable-next-line prefer-const
let lectureData: LectureData = {};

interface Student {
  studentnumber: number;
  GDPR: number;
  first_name: string;
  last_name: string;
  // add other properties as needed
}

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
        (student) => student.studentnumber,
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
          'Authorization': 'Bearer ' + token,
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
      logger.info('lecture finished success ' + lectureid);
    }
  } catch (error) {
    logger.error('lecture finished error: ' + error);
  }
};
// The lists of students who have arrived and who have not yet arrived
const presentStudents: {[lectureid: string]: any[]} = {};
const notYetPresentStudents: {[lectureid: string]: Student[]} = {};
// The timeout id for the lecture
const lectureTimeoutIds = new Map();

const SocketHandlers = (io: Server) => {
  io.use(authenticateSocket);
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Authenticated user ${socket.user?.id} connected`);
    socket.on('disconnect', () => {});
    socket.on('createAttendanceCollection', async (lectureid) => {
      // Add user role check
      if (
        !['teacher', 'admin', 'counselor'].some((role) =>
          socket.user?.role.includes(role),
        )
      ) {
        socket.emit('error', {
          code: 'UNAUTHORIZED',
          message:
            'Only teachers, admins, or counselors can create attendance collections',
        });
        return;
      }
      logger.info(`Attendance collection created for Lecture ID: ${lectureid}`);
      // Initialize the lecture data if it doesn't exist
      if (!lectureData[lectureid]) {
        lectureData[lectureid] = {timestamps: [], hash: null};
      }
      // Fetch and update data when a new lecture is started
      fetchServerSettings()
        .then(async (response) => {
          speedOfHashChange = response.speedOfHashChange;
          leewaytimes = response.leewaytimes;
          timeout = response.timeout;
          howMuchLeeWay = speedOfHashChange * leewaytimes;
          socket.join(lectureid);
          // server logger info with lecture id

          // Emit the 'lecturestarted' event to the room with the lectureid
          io.to(lectureid).emit('lectureStarted', lectureid, timeout);
          logger.info(
            `Lecture with ID: ${lectureid} created, settings fetched and emited lectureStarted event`,
          );
          io.to(lectureid).emit('pingEvent', lectureid, Date.now());
          setInterval(() => {
            io.to(lectureid).emit('pingEvent', lectureid, Date.now());
          }, speedOfHashChange);
          socket.on('pongEvent', (lectureid: string, unixtime: number) => {
            socket.emit('pongEvent', lectureid, unixtime);
          });

          // Get the list of students who have arrived and who have not yet arrived
          const token = await getToken();
          if (presentStudents[lectureid] && notYetPresentStudents[lectureid]) {
            // If the lists already exist, emit them to the room with the lectureid
            io.to(lectureid).emit(
              'getallstudentsinlecture',
              notYetPresentStudents[lectureid],
            );
            io.to(lectureid).emit('timerResetSuccess', lectureid);

            logger.info('timerResetSuccess ' + lectureid);
          } else {
            // If the lists do not exist, fetch them from the server and emit them to the room with the lectureid
            doFetch(
              'http://localhost:3002/courses/attendance/getallstudentsinlecture/',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify({
                  lectureid: lectureid,
                }),
              },
            )
              .then((response) => {
                // Handle the response here
                notYetPresentStudents[lectureid] = response;
                presentStudents[lectureid] = [];
                // Emit the lists to the room with the lectureid
                io.to(lectureid).emit(
                  'getallstudentsinlecture',
                  notYetPresentStudents[lectureid],
                );
                logger.info(
                  `Fetching all students in lecture with ID: ${lectureid}`,
                );
              })
              .catch((error) => {
                logger.error('Error:', error + ' ' + new Date().toISOString());
              });
          }
          // Update the hash for this lecture
          updateHash(lectureid);
          // Create an object to store interval IDs
          const lectureUpdateHashIntervals: {
            [lectureid: string]: NodeJS.Timeout;
          } = {};

          // If an interval already exists for the lectureid, clear it
          if (lectureUpdateHashIntervals[lectureid]) {
            clearInterval(lectureUpdateHashIntervals[lectureid]);
          }

          // Set a new interval and store its ID in the intervals object
          lectureUpdateHashIntervals[lectureid] = setInterval(() => {
            updateHash(lectureid);
          }, speedOfHashChange);

          setTimeout(() => {
            io.to(lectureid).emit(
              'updateAttendanceCollectionData',
              lectureData[lectureid].hash,
              lectureid,
              presentStudents[lectureid],
              notYetPresentStudents[lectureid],
            );
          }, 1000);
          // Create an object to store interval IDs
          const lectureUpdateDataIntervals: {
            [lectureid: string]: NodeJS.Timeout;
          } = {};

          // If an interval already exists for the lectureid, clear it
          if (lectureUpdateDataIntervals[lectureid]) {
            clearInterval(lectureUpdateDataIntervals[lectureid]);
          }

          // Set a new interval and store its ID in the intervals object
          lectureUpdateDataIntervals[lectureid] = setInterval(() => {
            io.to(lectureid).emit(
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
            logger.info(`Lecture with ID: ${lectureid} finished with timeout`);
            finishLecture(lectureid, io);
          }, timeout);

          lectureTimeoutIds.set(lectureid, timeoutId);
          socket.on('lectureFinishedWithButton', async (lectureid: string) => {
            if (
              !['teacher', 'admin', 'counselor'].some((role) =>
                socket.user?.role.includes(role),
              )
            ) {
              socket.emit('error', {
                code: 'UNAUTHORIZED',
                message:
                  'Only teachers, admins, or counselors can finish lectures',
              });
              return;
            }
            logger.info(
              `Lecture with ID: ${lectureid} finished at ${new Date().toISOString()}`,
            );
            logger.info('lectureFinishedWithButton ' + lectureid);
            finishLecture(lectureid, io);
          });
          // Clear the interval when the socket disconnects
          socket.on('disconnect', () => {
            clearInterval(lectureUpdateDataIntervals[lectureid]);
            clearInterval(lectureUpdateHashIntervals[lectureid]);
            // logger.info('disconnect ' + lectureid);
          });
        })
        .catch((error) => {
          logger.error(error);
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
        if (
          studentId === '' ||
          !studentId ||
          !lectureid ||
          !secureHash ||
          !unixtime ||
          !lectureData[lectureid]
        ) {
          io.to(socket.id).emit('NoCorrectInputDetails', lectureid);
        }
        let timestamp;
        if (
          lectureData &&
          lectureData[lectureid] &&
          lectureData[lectureid].timestamps
        ) {
          // find the timestamp that matches the secureHash and unixtime
          timestamp = lectureData[lectureid].timestamps.find(
            (t) =>
              t.hash === secureHash && unixtime >= t.start && unixtime <= t.end,
          );
        }
        if (timestamp) {
          logger.info(`Timestamp found for Student ID: ${studentId}!`);
        } else {
          logger.info(`Lecture ID: ${lectureid}`);
          logger.info(
            `Secure Hash: ${secureHash}, Unix Time: ${unixtime}, ISO Time: ${new Date().toISOString()}`,
          );
          logger.info('Current Timestamps:');
          if (
            lectureData &&
            lectureData[lectureid] &&
            lectureData[lectureid].timestamps
          ) {
            logger.info(
              JSON.stringify(lectureData[lectureid].timestamps, null, 2),
            );
          }
          logger.info(`Timestamp not found for Student ID: ${studentId} !`);
        }

        if (timestamp) {
          const token = await getToken();
          doFetch('http://localhost:3002/courses/attendance/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
              status: '1',
              date: new Date().toISOString().slice(0, 19).replace('T', ' '),
              studentnumber: studentId,
              lectureid: lectureid,
            }),
          })
            .then(() => {
              const studentIndex = notYetPresentStudents[lectureid].findIndex(
                (student: Student) =>
                  Number(student.studentnumber) === Number(studentId),
              );

              if (studentIndex !== -1) {
                const student = notYetPresentStudents[lectureid][studentIndex];
                presentStudents[lectureid].push(student);
                notYetPresentStudents[lectureid].splice(studentIndex, 1);
                io.to(lectureid.toString()).emit(
                  'updateCourseStudents',
                  notYetPresentStudents[lectureid],
                );
                io.to(lectureid.toString()).emit(
                  'updateAttendees',
                  presentStudents[lectureid],
                );
              } else {
                io.to(socket.id).emit('studentNotFound', lectureid);
                logger.error('Student not found');
              }

              io.to(socket.id).emit('youHaveBeenSavedIntoLecture', lectureid);

              logger.info(
                `Student with ID: ${studentId} has been saved into lecture with ID: ${lectureid}`,
              );
            })
            .catch(() => {
              // Handle the error here

              io.to(socket.id).emit(
                'youHaveBeenSavedIntoLectureAlready',
                lectureid,
              );
              logger.info(
                `Student with ID: ${studentId} has been saved into lecture with ID: ${lectureid} already`,
              );
            });
        } else {
          io.to(socket.id).emit(
            'inputThatStudentHasArrivedToLectureTooSlow',
            lectureid,
          );
          logger.info(
            `Input for student with ID: ${studentId} arriving to lecture with ID: ${lectureid} was too slow`,
          );
        }
      },
    );
    // Handle the 'manualstudentinsert' event
    // This event is emitted when the teacher inputs the student id
    socket.on(
      'manualStudentInsert',
      async (studentId: string, lectureid: number) => {
        if (
          !['teacher', 'admin', 'counselor'].some((role) =>
            socket.user?.role.includes(role),
          )
        ) {
          socket.emit('error', {
            code: 'UNAUTHORIZED',
            message:
              'Only teachers, admins, or counselors can manually insert students',
          });
          return;
        }

        logger.info(
          `Manual insertion initiated for student with ID: ${studentId} into lecture with ID: ${lectureid}`,
        );
        if (studentId === '') {
          io.to(socket.id).emit('manualStudentInsertFailedEmpty', lectureid);
          return;
        }

        const token = await getToken();
        doFetch('http://localhost:3002/courses/attendance/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
          },
          body: JSON.stringify({
            status: '1',
            date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            studentnumber: studentId,
            lectureid: lectureid,
          }),
        })
          .then((response) => {
            if (response) {
              const studentIndex = notYetPresentStudents[lectureid].findIndex(
                (student: Student) =>
                  Number(student.studentnumber) === Number(studentId),
              );

              if (studentIndex !== -1) {
                const student = notYetPresentStudents[lectureid][studentIndex];
                presentStudents[lectureid].push(student);
                notYetPresentStudents[lectureid].splice(studentIndex, 1);
              } else {
                logger.error('Student not found');
              }
              io.to(lectureid.toString()).emit(
                'updateCourseStudents',
                notYetPresentStudents[lectureid],
              );
              io.to(lectureid.toString()).emit(
                'updateAttendees',
                presentStudents[lectureid],
              );
              io.to(socket.id).emit('manualStudentInsertSuccess', lectureid);

              logger.info(
                `Manual insertion of student was successful for lecture with ID: ${lectureid} for student with ID: ${studentId} at ${new Date().toISOString()}`,
              );
            }
          })
          .catch((error) => {
            logger.error(
              `Error occurred during manual insertion of student: ${error}`,
            );
            io.to(socket.id).emit('manualStudentInsertError', lectureid);
          });
      },
    );

    socket.on(
      'manualStudentRemove',
      async (studentId: string, lectureid: number) => {
        if (
          !['teacher', 'admin', 'counselor'].some((role) =>
            socket.user?.role.includes(role),
          )
        ) {
          socket.emit('error', {
            code: 'UNAUTHORIZED',
            message:
              'Only teachers, admins, or counselors can manually remove students',
          });
          return;
        }

        logger.info(
          `Manual removal initiated for student with ID: ${studentId} from lecture with ID: ${lectureid}`,
        );
        if (studentId === '') {
          io.to(socket.id).emit('manualStudentRemoveFailedEmpty', lectureid);
          return;
        }

        const token = await getToken();
        doFetch('http://localhost:3002/courses/attendance/delete/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
          },
          body: JSON.stringify({
            studentnumber: studentId,
            lectureid: lectureid,
          }),
        })
          .then((response) => {
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
                logger.error(
                  'Student not found' + ' ' + new Date().toISOString(),
                );
              }
              io.to(lectureid.toString()).emit(
                'updateCourseStudents',
                notYetPresentStudents[lectureid],
              );
              io.to(lectureid.toString()).emit(
                'updateAttendees',
                presentStudents[lectureid],
              );
              // Emit the 'manualStudentRemoveSuccess' event only to the client who sent the event
              io.to(socket.id).emit('manualStudentRemoveSuccess', lectureid);
              logger.info(
                `Manual removal of student was successful for lecture with ID: ${lectureid} at ${new Date().toISOString()}`,
              );
              logger.info(
                `Manual removal of student was successful for lecture with ID: ${lectureid} for student with ID: ${studentId}`,
              );
            }
          })
          .catch((error) => {
            logger.error(
              `Error occurred during manual removal of student: ${error} at ${new Date().toISOString()}`,
            );
            // Emit the 'manualStudentRemoveError' event only to the client who sent the event
            io.to(socket.id).emit('manualStudentRemoveError', lectureid);
          });
      },
    );

    // Handle the 'lecturecanceled' event
    socket.on('lectureCanceled', async (lectureid) => {
      handleLectureCanceled(
        socket,
        io,
        lectureid,
        notYetPresentStudents,
        presentStudents,
        lectureData,
        lectureTimeoutIds,
      );
    });
  });
};

export default SocketHandlers;
