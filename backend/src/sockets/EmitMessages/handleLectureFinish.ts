/**
 * @file handleLectureFinish.ts
 * @description Exports a function that finalizes a lecture, marks remaining students as absent,
 * and cleans up any in-memory references to the lecture.
 */

import {Server} from 'socket.io';
import getToken from '../../utils/getToken.js';
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
 * Represents the shape of our "not yet present" and "present" records, keyed by lecture ID.
 */
export interface AttendanceRecord {
  [lectureId: string]: Student[];
}

/**
 * Data structure that may store additional lecture-related metadata.
 */
export interface LectureMetaRecord {
  [lectureId: string]: any;
}

/**
 * Contains the set of lecture timeouts, keyed by lecture ID.
 */
export type LectureTimeoutIds = Map<string, NodeJS.Timeout>;

/**
 * Custom error class for finishing lecture errors.
 */
export class FinishLectureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FinishLectureError';
  }
}

/**
 * Finalizes a lecture by marking remaining students as absent and cleaning up resources.
 * This function can be used without socket authentication checks.
 *
 * @async
 * @function finalizeLecture
 * @param {string} lectureid - The unique identifier of the lecture being completed
 * @param {Server} io - The Socket.IO server instance
 * @param {AttendanceRecord} notYetPresentStudents - Record of students who haven't confirmed presence
 * @param {AttendanceRecord} presentStudents - Record of students who are present
 * @param {LectureMetaRecord} lectureData - Additional lecture data
 * @param {LectureTimeoutIds} lectureTimeoutIds - Map of lecture timeouts
 * @param {Record<string, Record<string, boolean>>} [ipTracker] - Optional IP tracking object
 * @throws {FinishLectureError} If the finalize operation fails
 */
export const finalizeLecture = async (
  lectureid: string,
  io: Server,
  notYetPresentStudents: AttendanceRecord,
  presentStudents: AttendanceRecord,
  lectureData: LectureMetaRecord,
  lectureTimeoutIds: LectureTimeoutIds,
  ipTracker?: Record<string, Record<string, boolean>>, // Added parameter
): Promise<void> => {
  try {
    if (!lectureid) {
      throw new FinishLectureError('No valid lecture ID provided.');
    }

    const data = {
      date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      studentnumbers: (notYetPresentStudents[lectureid] || []).map(
        (student: Student) => student.studentnumber,
      ),
      lectureid,
    };

    const token = await getToken();
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
      throw new FinishLectureError(
        `Failed to finalize lecture. HTTP status: ${response.status}`,
      );
    }

    // Notify all connected clients
    io.to(lectureid).emit('lectureFinished', lectureid);

    // Cleanup resources
    delete notYetPresentStudents[lectureid];
    delete presentStudents[lectureid];
    delete lectureData[lectureid];

    const lectureTimeout = lectureTimeoutIds.get(lectureid);
    if (lectureTimeout) {
      clearTimeout(lectureTimeout);
    }
    lectureTimeoutIds.delete(lectureid);

    // Also cleanup IP tracking if provided
    if (ipTracker && ipTracker[lectureid]) {
      console.log(`Cleaning up IP tracking for lecture ${lectureid} in finalizeLecture`);
      delete ipTracker[lectureid];
    }

    logger.info(`Lecture with ID ${lectureid} finished successfully.`);
  } catch (error) {
    logger.error('Error finishing lecture:', error);
    throw new FinishLectureError(
      (error as Error).message || 'Unknown error during lecture finalization',
    );
  }
};

/**
 * Finalizes a lecture session by marking remaining students absent, deleting in-memory references,
 * and notifying all connected clients via Socket.IO.
 *
 * @async
 * @function handleLectureFinish
 * @param socket
 * @param lectureid - The unique identifier of the lecture being completed
 * @param io - The Socket.IO server instance
 * @param notYetPresentStudents - Record of students who haven't confirmed presence yet
 * @param presentStudents - Record of students who are currently present
 * @param lectureData - Ancillary data stored for each lecture
 * @param lectureTimeoutIds - Map of lecture timeouts for automatic finishing
 * @param ipTracker - Optional IP tracking object
 * @throws {FinishLectureError} If the finalize operation fails
 *
 * @example
 * ```typescript
 * import { handleLectureFinish } from './handleLectureFinish'
 *
 * socket.on('lectureFinishedWithButton', async (lectureid: string) => {
 *   if (!['teacher', 'admin', 'counselor'].some(role => socket.user?.role.includes(role))) {
 *     socket.emit('error', {
 *       code: 'UNAUTHORIZED',
 *       message: 'Only teachers, admins, or counselors can finish lectures',
 *     });
 *     return;
 *   }
 *   try {
 *     logger.info(`Lecture ${lectureid} finishing...`);
 *     await handleLectureFinish(
 *       lectureid,
 *       io,
 *       notYetPresentStudents,
 *       presentStudents,
 *       lectureData,
 *       lectureTimeoutIds
 *     );
 *   } catch (err) {
 *     logger.error('Error finalizing lecture:', err);
 *   }
 * });
 * ```
 */
export const handleLectureFinish = async (
  socket: AuthenticatedSocket,
  lectureid: string,
  io: Server,
  notYetPresentStudents: AttendanceRecord,
  presentStudents: AttendanceRecord,
  lectureData: LectureMetaRecord,
  lectureTimeoutIds: LectureTimeoutIds,
  ipTracker?: Record<string, Record<string, boolean>>, // Added parameter
): Promise<void> => {
  const ip = socket.handshake.headers['x-forwarded-for'] as string ||
             socket.handshake.address ||
             'unknown';
  const username = socket.user?.username || 'unknown';

  logger.info(`User ${username} from IP ${ip} finishing lecture ${lectureid}`);

  // Check for required role
  if (
    !['teacher', 'admin', 'counselor'].some((role) =>
      socket.user?.role.includes(role),
    )
  ) {
    socket.emit('error', {
      code: 'UNAUTHORIZED',
      message: 'Only teachers, admins, or counselors can finish lectures',
    });
    logger.warn(`Unauthorized access attempt from IP ${ip} (user: ${username}) to finish lecture ${lectureid}`);
    return;
  }

  await finalizeLecture(
    lectureid,
    io,
    notYetPresentStudents,
    presentStudents,
    lectureData,
    lectureTimeoutIds,
    ipTracker, // Pass to finalizeLecture
  );
};
