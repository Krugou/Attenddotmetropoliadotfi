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

// Update the IpStudentRecord interface to support multiple students
interface IpStudentRecord {
  ip: string;
  studentId: string;
  studentId2?: string; // Keep for backward compatibility
  studentIds: string[]; // Array to track all students using this IP
  duplicateFound?: boolean;
  timestamp: number;
  userAgent: string;
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
  listOfIpAlreadyUsedLecture: Map<number, Map<string, IpStudentRecord>>,
): Promise<void> => {
  try {
    const ip =
      (socket.handshake.headers['x-forwarded-for'] as string) ||
      socket.handshake.address ||
      'unknown';
    const userAgent =
      (socket.handshake.headers['user-agent'] as string) || 'unknown';

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

    // Check if lecture IP tracking map exists, create if not
    if (!listOfIpAlreadyUsedLecture.has(lectureid)) {
      listOfIpAlreadyUsedLecture.set(
        lectureid,
        new Map<string, IpStudentRecord>(),
      );
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

    // Check if ip is already used and if its used update the listOfIpAlreadyUsedLecture
    // with incoming studentid as studentId2 and add duplicateFound as true
    const existingRecord = listOfIpAlreadyUsedLecture.get(lectureid)?.get(ip);
    if (existingRecord) {
      // Update existing record with duplicate information
      existingRecord.studentId2 = studentId; // Keep for backward compatibility
      existingRecord.duplicateFound = true;
      existingRecord.timestamp = Date.now();
      existingRecord.userAgent = userAgent;

      // Add to studentIds array if not already present
      if (!existingRecord.studentIds) {
        existingRecord.studentIds = [existingRecord.studentId];
      }

      if (!existingRecord.studentIds.includes(studentId)) {
        existingRecord.studentIds.push(studentId);
      }

      listOfIpAlreadyUsedLecture.get(lectureid)?.set(ip, existingRecord);
      // studentids length is greater than 1  then log it
      // as suspicious activity
      if (existingRecord.studentIds.length > 1) {
        logger.info(
          `Multiple students using same IP: ${ip} has ${existingRecord.studentIds.length} students in lecture ${lectureid}`,
        );
      }
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

    // Store the IP directly in the used IPs map for this lecture - only when successfully saved
    if (listOfIpAlreadyUsedLecture.has(lectureid)) {
      // Initialize the new record with extended tracking capability
      const newRecord = {
        ip,
        studentId,
        timestamp: Date.now(),
        userAgent,
        studentIds: existingRecord?.studentIds || [studentId],
        // Preserve duplicate information if it exists or create new if needed
        duplicateFound: existingRecord?.studentIds
          ? existingRecord.studentIds.length > 1
          : false,
        ...(existingRecord?.duplicateFound
          ? {
              studentId2: existingRecord.studentId2,
            }
          : {}),
      };

      listOfIpAlreadyUsedLecture.get(lectureid)?.set(ip, newRecord);

      // Log suspicious activity if multiple students using same IP
      if (newRecord.studentIds.length > 1) {
        logger.error(
          `IP ${ip} is being used by ${
            newRecord.studentIds.length
          } students in lecture ${lectureid}: ${newRecord.studentIds.join(
            ', ',
          )}`,
        );
      }
    }

    // Emit the IP tracking information directly to everyone in the lecture room
    io.to(lectureid.toString()).emit(
      'usedIpChecking',
      listOfIpAlreadyUsedLecture.get(lectureid),
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
