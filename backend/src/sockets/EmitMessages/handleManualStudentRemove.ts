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
 * Custom error type for manual student removal failures.
 */
export class ManualStudentRemoveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ManualStudentRemoveError';
  }
}

/**
 * Data structure representing stored student attendance.
 */
export interface AttendanceRecord {
  [lectureId: number]: Student[];
}

/**
 * Removes a specified student from a lecture's present list, placing them back into not-yet-present.
 *
 * @param socket - The socket instance representing the client connection
 * @param io - The root Socket.IO server instance
 * @param studentId - The ID of the student to remove
 * @param lectureId - The ID of the lecture
 * @param notYetPresentStudents - Reference to the global record of students not yet present
 * @param presentStudents - Reference to the global record of students currently present
 *
 * @example
 * ```typescript
 * socket.on('manualStudentRemove', async (studentId: string, lectureId: number) => {
 *   await handleManualStudentRemove(
 *     socket,
 *     io,
 *     studentId,
 *     lectureId,
 *     notYetPresentStudents,
 *     presentStudents
 *   );
 * });
 * ```
 *
 * @throws {ManualStudentRemoveError} When user roles are insufficient or removal fails
 */
export const handleManualStudentRemove = async (
  socket: AuthenticatedSocket,
  io: Server,
  studentId: string,
  lectureId: number,
  notYetPresentStudents: AttendanceRecord,
  presentStudents: AttendanceRecord,
): Promise<void> => {
  try {
    // Role Check
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
      `Manual removal initiated for student with ID: ${studentId} from lecture with ID: ${lectureId}`,
    );

    // Validate student ID
    if (!studentId) {
      io.to(socket.id).emit('manualStudentRemoveFailedEmpty', lectureId);
      return;
    }

    // Try to remove from DB
    const token = await getToken();
    await doFetch('http://localhost:3002/courses/attendance/delete/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({
        studentnumber: studentId,
        lectureid: lectureId,
      }),
    });

    // Move student from present to not-yet-present
    const presentList = presentStudents[lectureId] || [];
    const idx = presentList.findIndex(
      (student: Student) => Number(student.studentnumber) === Number(studentId),
    );

    if (idx !== -1) {
      const [removedStudent] = presentList.splice(idx, 1);
      notYetPresentStudents[lectureId].push(removedStudent);
    } else {
      logger.error(`Student with ID ${studentId} not found in present list.`);
    }

    // Emit updates to affected clients
    io.to(lectureId.toString()).emit(
      'updateCourseStudents',
      notYetPresentStudents[lectureId],
    );
    io.to(lectureId.toString()).emit(
      'updateAttendees',
      presentStudents[lectureId],
    );
    io.to(socket.id).emit('manualStudentRemoveSuccess', lectureId);

    // Log successful removal
    logger.info(
      `Manual removal of student with ID ${studentId} was successful for lecture with ID: ${lectureId}`,
    );
  } catch (error) {
    // Log error details
    logger.error(
      `Error occurred during manual removal of student with ID ${studentId}: ${error}`,
    );
    io.to(socket.id).emit('manualStudentRemoveError', lectureId);

    // Throw custom error for upper-level handling or logging
    throw new ManualStudentRemoveError(
      (error as Error).message || 'Failed to manually remove student',
    );
  }
};
