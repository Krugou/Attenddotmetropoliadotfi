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
): Promise<void> => {
  try {
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

    io.to(socket.id).emit('youHaveBeenSavedIntoLecture', lectureid);
    logger.info(`Student ${studentId} saved into lecture ${lectureid}`);
  } catch (error) {
    logger.error(
      `Error processing student arrival for lecture ${lectureid}`,
      error,
    );
    throw new StudentArrivalError(
      (error as Error).message || 'Failed to process student arrival.',
    );
  }
};
