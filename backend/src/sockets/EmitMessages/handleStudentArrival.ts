import {Server} from 'socket.io';
import getToken from '../../utils/getToken.js';
import doFetch from '../../utils/doFetch.js';
import type {AuthenticatedSocket} from 'utils/authenticateSocket.js';
import logger from '../../utils/logger.js';

/**
 * Represents a student record used for attendance.
 */
export interface Student {
  studentnumber: string | number;
  [key: string]: any;
}

/**
 * Represents the structure of timestamps within lecture data.
 */
interface LectureTimestamp {
  hash: string;
  start: number;
  end: number;
}

/**
 * Represents the structure of lecture data stored in memory.
 */
interface LectureDetails {
  timestamps: LectureTimestamp[];
}

/**
 * Data store for lecture details, keyed by lecture ID.
 */
export interface LectureDataStore {
  [lectureId: number]: LectureDetails;
}

/**
 * Data structure representing stored student attendance.
 */
export interface AttendanceRecord {
  [lectureId: number]: Student[];
}

/**
 * Custom error class for student arrival-related failures.
 */
export class StudentArrivalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StudentArrivalError';
  }
}

/**
 * Data structure for tracking IP addresses and associated student IDs
 */
interface IpStudentRecord {
  ip: string;
  studentId: string;
  timestamp: number;
  isDuplicate?: boolean;
}

/**
 * Tracks attempted IP usages - including rejected duplicate attempts
 */
interface IpAttemptRecord extends Map<string, IpStudentRecord[]> {}

/**
 * Handles the event where a student arrives to a lecture with a given security hash.
 *
 * @param socket - The client's socket instance
 * @param io - The primary Socket.IO server instance
 * @param secureHash - The security hash used to validate arrival
 * @param studentId - The student's unique ID
 * @param unixtime - The time of arrival in UNIX format
 * @param lectureid - The ID of the lecture
 * @param lectureData - Shared reference to global lecture data
 * @param notYetPresentStudents - Shared reference to students not yet present in each lecture
 * @param presentStudents - Shared reference to currently present students in each lecture
 * @param listOfIpAlreadyUsedLecture - Map tracking used IPs for each lecture
 *
 * @throws {StudentArrivalError} If validation fails or insertion fails
 */
export const handleStudentArrival = async (
  socket: AuthenticatedSocket,
  io: Server,
  secureHash: string,
  studentId: string,
  unixtime: number,
  lectureid: number,
  lectureData: LectureDataStore,
  notYetPresentStudents: AttendanceRecord,
  presentStudents: AttendanceRecord,
  listOfIpAlreadyUsedLecture: Map<number, IpAttemptRecord>,
): Promise<void> => {
  try {
    const ip =
      (socket.handshake.headers['x-forwarded-for'] as string) ||
      socket.handshake.address ||
      'unknown';

    logger.info(
      `Student ${studentId} from IP ${ip} attempting to mark attendance for lecture ${lectureid}`,
    );

    // Basic input validation
    if (
      !secureHash ||
      !studentId ||
      !lectureid ||
      !unixtime ||
      !lectureData[lectureid]
    ) {
      io.to(socket.id).emit('NoCorrectInputDetails', lectureid);
      logger.error(
        `Missing or invalid input details for student ${studentId} in lecture ${lectureid}`,
      );
      throw new StudentArrivalError('Missing or invalid input details.');
    }


    if (!listOfIpAlreadyUsedLecture.has(lectureid)) {
      listOfIpAlreadyUsedLecture.set(lectureid, new Map<string, IpStudentRecord[]>());
    }

    const ipRecord: IpStudentRecord = {
      ip,
      studentId,
      timestamp: Date.now(),
      isDuplicate: false
    };


    const lectureIpRecords = listOfIpAlreadyUsedLecture.get(lectureid) as IpAttemptRecord;


    const isDuplicateAttempt = lectureIpRecords.has(ip);

    if (isDuplicateAttempt) {

      ipRecord.isDuplicate = true;


      const existingRecords = lectureIpRecords.get(ip) || [];
      lectureIpRecords.set(ip, [...existingRecords, ipRecord]);


      sendIpTrackingData(io, lectureid, lectureIpRecords);


      io.to(socket.id).emit('youHaveBeenSavedIntoLectureAlready', lectureid);
      logger.error(
        `IP ${ip} already used for student ${studentId} in lecture ${lectureid}`,
      );
      return;
    }

    // Check if the student is already present
    if (
      presentStudents[lectureid]?.some(
        (student) => student.studentnumber === studentId,
      )
    ) {
      io.to(socket.id).emit('youHaveBeenSavedIntoLectureAlready', lectureid);
      return;
    }

    // Find matching timestamp
    const timestamps = lectureData[lectureid].timestamps;
    const timestamp = timestamps.find(
      (t: LectureTimestamp) =>
        t.hash === secureHash && unixtime >= t.start && unixtime <= t.end,
    );

    if (!timestamp) {
      // No valid timestamp found, emit too slow event
      io.to(socket.id).emit(
        'inputThatStudentHasArrivedToLectureTooSlow',
        lectureid,
      );
      logger.info(
        `Input too slow or invalid for student ${studentId} in lecture ${lectureid}`,
      );
      return;
    }

    logger.info(
      `Valid timestamp found for student ${studentId} in lecture ${lectureid}`,
    );

    // Attempt to write attendance to the database
    const token = await getToken();
    try {
      await doFetch('http://localhost:3002/courses/attendance/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          status: '1',
          date: new Date().toISOString().slice(0, 19).replace('T', ' '),
          studentnumber: studentId,
          lectureid,
        }),
      });
    } catch (fetchError) {
      // If insertion fails, handle gracefully
      io.to(socket.id).emit('youHaveBeenSavedIntoLectureAlready', lectureid);
      logger.info(
        `Student ${studentId} had already been saved into lecture ${lectureid}`,
      );
      return;
    }

    // Move student from not yet present to present
    const studentIndex = notYetPresentStudents[lectureid].findIndex(
      (student: Student) => Number(student.studentnumber) === Number(studentId),
    );

    if (studentIndex !== -1) {
      const [arrivedStudent] = notYetPresentStudents[lectureid].splice(
        studentIndex,
        1,
      );
      presentStudents[lectureid].push(arrivedStudent);

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
      logger.error(`Student ${studentId} not found in notYetPresentStudents`);
      return;
    }


    lectureIpRecords.set(ip, [ipRecord]);


    sendIpTrackingData(io, lectureid, lectureIpRecords);

    console.log(
      `ATTENDANCE RECORDED - IP: ${ip}, Student: ${studentId}, Lecture: ${lectureid}`,
    );
    io.to(socket.id).emit('youHaveBeenSavedIntoLecture', lectureid);

    logger.info(
      `Student ${studentId} from IP ${ip} successfully saved into lecture ${lectureid}`,
    );
  } catch (error) {
    console.error('Student arrival error:', error);
    logger.error(
      `Error processing student arrival for lecture ${lectureid}`,
      error,
    );
    throw new StudentArrivalError(
      (error as Error).message || 'Failed to process student arrival.',
    );
  }
};

/**
 * Helper function to prepare and send IP tracking data to the frontend
 */
function sendIpTrackingData(
  io: Server,
  lectureid: number,
  ipRecords: IpAttemptRecord
): void {

  const ipList = Array.from(ipRecords.entries()).flatMap(([ip, records]) => {
    return records.map(record => ({
      ip: record.ip,
      timestamp: record.timestamp,
      studentnumber: record.studentId,
      duplicate: record.isDuplicate || false
    }));
  });


  const ipCounts = new Map<string, string[]>();


  Array.from(ipRecords.entries()).forEach(([ip, records]) => {

    const uniqueStudentIds = Array.from(new Set(
      records.map(record => record.studentId)
    ));

    ipCounts.set(ip, uniqueStudentIds);
  });


  const suspiciousIps = Array.from(ipCounts.entries())
    .filter(([_, studentIds]) => studentIds.length > 1)
    .map(([ip]) => ip);

  const enrichedIpList = ipList.map(record => ({
    ...record,
    suspicious: suspiciousIps.includes(record.ip)
  }));


  logger.info(
    `IP tracking - Lecture ${lectureid}: ${ipList.length} records, ${suspiciousIps.length} suspicious IPs`
  );


  io.to(lectureid.toString()).emit('usedIpChecking', enrichedIpList);
}
