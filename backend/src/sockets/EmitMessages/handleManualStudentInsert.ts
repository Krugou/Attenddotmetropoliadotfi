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
 * Data structure representing stored student attendance.
 */
export interface AttendanceRecord {
  [lectureId: number]: Student[];
}

/**
 * Custom error type for manual student insertion failures.
 */
export class ManualStudentInsertError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ManualStudentInsertError';
  }
}

/**
 * Manually adds a student to the lecture attendance, with role checking, input validation,
 * async fetch calls, and error handling.
 *
 * @param socket - The socket instance representing the client
 * @param io - The root Socket.IO server instance
 * @param studentId - The ID of the student to insert
 * @param lectureid - The ID of the lecture
 * @param notYetPresentStudents - Reference to the global record of students not yet present
 * @param presentStudents - Reference to the global record of students currently present
 * @throws {ManualStudentInsertError} When student insertion fails
 */
export const handleManualStudentInsert = async (
  socket: AuthenticatedSocket,
  io: Server,
  studentId: string,
  lectureid: number,
  notYetPresentStudents: AttendanceRecord,
  presentStudents: AttendanceRecord,
): Promise<void> => {
  try {
    console.log("row 53, handleManualStudentInsert.ts, handleManualStudentInsert()")
    // Role validation
    if (
      !['teacher', 'admin', 'counselor'].some((role) =>
        socket.user?.role.includes(role),
        console.log("row 58, handleManualStudentInsert.ts, if teacher, admin or counselor")
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

    // Validate studentId input
    if (!studentId) {
      io.to(socket.id).emit('manualStudentInsertFailedEmpty', lectureid);
      console.log("row 76, handleManualStudentInsert.ts, if studentId")
      return;
    }

    // Retrieve a valid token for the request
    const token = await getToken();

    // Perform an async POST request to the attendance endpoint
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
    console.log("row 97, handleManualStudentInsert.ts, api call");

    // Transfer the student from not-yet-present to present
    const notPresentList = notYetPresentStudents[lectureid] || [];
    const idx = notPresentList.findIndex(
      (student: Student) => Number(student.studentnumber) === Number(studentId),
    );

    if (idx !== -1) {
      const [insertedStudent] = notPresentList.splice(idx, 1);
      presentStudents[lectureid].push(insertedStudent);
    } else {
      logger.error('Student not found in not-yet-present list');
    }

    // Emit updated attendance info to all listeners
    io.to(lectureid.toString()).emit(
      'updateCourseStudents',
      notYetPresentStudents[lectureid],
    );
    io.to(lectureid.toString()).emit(
      'updateAttendees',
      presentStudents[lectureid],
    );
    io.to(socket.id).emit('manualStudentInsertSuccess', lectureid);

    console.log("row 123, handleManualStudentInsert.ts, Emit updated attendance info");
    logger.info(
      `Manual insertion of student ID ${studentId} was successful for lecture ID ${lectureid}`,
    );
  } catch (error) {
    logger.error(
      `Error occurred during manual insertion of student ID ${studentId}:`,
      error,
    );
    io.to(socket.id).emit('manualStudentInsertError', lectureid);

    // Rethrow to allow higher-level handling or logging
    throw new ManualStudentInsertError(
      (error as Error).message || 'Failed to manually insert student',
    );
  }
};
