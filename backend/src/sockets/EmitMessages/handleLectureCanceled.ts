import {Server} from 'socket.io';
import getToken from '../../utils/getToken.js';
import doFetch from '../../utils/doFetch.js';
import type {AuthenticatedSocket} from 'utils/authenticateSocket.js';
import logger from '../../utils/logger.js';
import * as ipActivityTracker from '../../utils/ipActivityTracker.js';

/**
 * Shared data references can be injected or imported here:
 * (Prefer dependency injection for testability)
 */
// import { notYetPresentStudents, presentStudents, lectureData, lectureTimeoutIds } from '../socketHandlers';

/**
 * Custom error type for lecture cancelation failures.
 */
class LectureCancellationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LectureCancellationError';
  }
}

/**
 * Cancels a lecture if the user has sufficient permissions.
 * @param socket - The Socket.IO socket initiating the call
 * @param io - The Socket.IO server instance
 * @param lectureid - The unique lecture identifier
 * @param notYetPresentStudents - Reference to stored missing students
 * @param presentStudents - Reference to stored present students
 * @param lectureData - Reference to lecture data
 * @param lectureTimeoutIds - Reference to stored timeouts
 * @param ipTracker - Optional reference to IP tracking data
 */
export const handleLectureCanceled = async (
  socket: AuthenticatedSocket,
  io: Server,
  lectureid: string,
  notYetPresentStudents: Record<string, unknown[]>,
  presentStudents: Record<string, unknown[]>,
  lectureData: Record<string, unknown>,
  lectureTimeoutIds: Map<string, NodeJS.Timeout>,
  ipTracker?: Record<string, Record<string, boolean>>, // Added parameter
): Promise<void> => {
  try {
    const ip = socket.handshake.headers['x-forwarded-for'] as string ||
              socket.handshake.address ||
              'unknown';
    const username = socket.user?.username || 'unknown';

    logger.info(`User ${username} from IP ${ip} canceling lecture ${lectureid}`);

    // Defensive check: ensure the lectureid is a non-empty string
    if (!lectureid || typeof lectureid !== 'string') {
      throw new LectureCancellationError('Invalid lecture ID');
    }

    // Role validation
    if (
      !['teacher', 'admin', 'counselor'].some((role) =>
        socket.user?.role.includes(role),
      )
    ) {
      socket.emit('error', {
        code: 'UNAUTHORIZED',
        message: 'Only teachers, admins, or counselors can cancel lectures',
      });
      logger.warn(`Unauthorized access attempt from IP ${ip} (user: ${username}) to cancel lecture ${lectureid}`);
      return;
    }

    const token = await getToken();

    // Make the API call to delete the lecture
    await doFetch('http://localhost:3002/courses/attendance/deletelecture/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({lectureid}),
    });

    // Notify clients that the lecture has been canceled
    io.to(lectureid).emit('lectureCanceledSuccess', lectureid);

    // Log success with IP address
    logger.info(
      `Lecture with ID: ${lectureid} was successfully canceled by IP ${ip} (user: ${username}) at ${new Date().toISOString()}`,
    );

    // Clean up references to avoid memory leaks
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
      console.log(`Cleaning up IP tracking for lecture ${lectureid} in handleLectureCanceled`);
      delete ipTracker[lectureid];
    }

    logger.info(
      `Lecture with ID: ${lectureid} was successfully removed from memory by IP ${ip} (user: ${username})`,
    );
  } catch (error) {
    logger.error('Error canceling lecture:', error);
    socket.emit('error', {
      code: 'LECTURE_CANCELLATION_FAILED',
      message: (error as Error).message || 'Failed to cancel the lecture',
    });
  }
};
