/**
 * @file handleCreateAttendanceCollection.ts
 * @description Exports functionality to handle the "createAttendanceCollection" socket event.
 *              Initializes lecture data, fetches server settings, schedules updates, and manages
 *              student attendance references.
 */

import type {Server} from 'socket.io';
import logger from '../../utils/logger.js';
import getToken from '../../utils/getToken.js';
import doFetch from '../../utils/doFetch.js';
import fetchServerSettings from '../../utils/fetchServerSettings.js';
import crypto from 'crypto';
import {finalizeLecture} from './handleLectureFinish.js';
import type {AuthenticatedSocket} from 'utils/authenticateSocket.js';
/**
 * Represents a student record used for attendance.
 */
interface Student {
  studentnumber: string | number;
  [key: string]: any;
}

/**
 * Data structure representing stored student attendance, keyed by lecture ID.
 */
interface AttendanceRecord {
  [lectureId: string]: Student[];
}

/**
 * Data structure for storing lecture metadata, keyed by lecture ID.
 */
interface LectureData {
  [lectureId: string]: {
    timestamps: Array<{
      hash: string;
      start?: number;
      end?: number;
    }>;
    hash: string | null;
  };
}

/**
 * Represents a map of lecture IDs to their corresponding timeout references.
 */
type LectureTimeoutMap = Map<string, NodeJS.Timeout>;

/**
 * Stores interval references for updating lecture hash data.
 */
const lectureUpdateHashIntervals: Record<string, NodeJS.Timeout> = {};

/**
 * Stores interval references for updating lecture data.
 */
const lectureUpdateDataIntervals: Record<string, NodeJS.Timeout> = {};

/**
 * Custom error class for createAttendanceCollection failures.
 */
export class CreateAttendanceCollectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CreateAttendanceCollectionError';
  }
}

/**
 * Sets up attendance collection for a new lecture session:
 * 1. Validates user role.
 * 2. Initializes memory references for the lecture.
 * 3. Fetches server settings.
 * 4. Schedules periodic updates and timeouts.
 * 5. Retrieves or initializes student attendance lists.
 *
 * @async
 * @function handleCreateAttendanceCollection
 * @param socket - The Socket.IO client socket
 * @param io - The Socket.IO server instance
 * @param lectureid - Unique identifier for the lecture
 * @param lectureData - Shared store of lecture metadata
 * @param notYetPresentStudents - Shared store of students not yet present
 * @param presentStudents - Shared store of students currently present
 * @param lectureTimeoutIds - Map of lecture IDs to their timeout references
 */
export const handleCreateAttendanceCollection = async (
  socket: AuthenticatedSocket,
  io: Server,
  lectureid: string,
  lectureData: LectureData,
  notYetPresentStudents: AttendanceRecord,
  presentStudents: AttendanceRecord,
  lectureTimeoutIds: LectureTimeoutMap,
  listOfIpAlreadyUsedLecture,
): Promise<void> => {
  try {
    // Validate user's role
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

    // Initialize lecture data if nonexistent
    if (!lectureData[lectureid]) {
      lectureData[lectureid] = {
        timestamps: [],
        hash: null,
      };
    }

    // Fetch server settings (async/await style)
    const response = await fetchServerSettings();
    const speedOfHashChange = response.speedOfHashChange;
    const leewaytimes = response.leewaytimes;
    const timeout = response.timeout;
    const howMuchLeeWay = speedOfHashChange * leewaytimes;

    // Join lecture-specific room
    socket.join(lectureid);

    // Notify clients that the lecture started
    io.to(lectureid).emit('lectureStarted', lectureid, timeout);
    logger.info(
      `Lecture with ID: ${lectureid} created, settings fetched and 'lectureStarted' event emitted`,
    );

    // Send initial ping event
    io.to(lectureid).emit('pingEvent', lectureid, Date.now());
    const pingInterval = setInterval(() => {
      io.to(lectureid).emit('pingEvent', lectureid, Date.now());
    }, speedOfHashChange);

    socket.on('pongEvent', (pongLectureId: string, unixtime: number) => {
      socket.emit('pongEvent', pongLectureId, unixtime);
    });

    // Ensure we have a valid token for attendance data fetching
    const token = await getToken();

    // If student arrays are already loaded in memory, just emit them
    if (presentStudents[lectureid] && notYetPresentStudents[lectureid]) {
      io.to(lectureid).emit(
        'getallstudentsinlecture',
        notYetPresentStudents[lectureid],
      );
      io.to(lectureid).emit('timerResetSuccess', lectureid);
      logger.info(`timerResetSuccess ${lectureid}`);
    } else {
      // Otherwise, fetch from server
      try {
        const result = await doFetch(
          'http://localhost:3002/courses/attendance/getallstudentsinlecture/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({lectureid}),
          },
        );
        notYetPresentStudents[lectureid] = result;
        presentStudents[lectureid] = [];

        io.to(lectureid).emit(
          'getallstudentsinlecture',
          notYetPresentStudents[lectureid],
        );
        logger.info(`Fetching all students in lecture with ID: ${lectureid}`);
      } catch (fetchErr) {
        logger.error(
          `Error fetching initial attendance data for lecture ${lectureid}:`,
          fetchErr,
        );
      }
    }

    // Update hash for this lecture
    updateHash(lectureid, lectureData, speedOfHashChange, howMuchLeeWay);

    // Clear existing intervals if any
    if (lectureUpdateHashIntervals[lectureid]) {
      clearInterval(lectureUpdateHashIntervals[lectureid]);
    }
    if (lectureUpdateDataIntervals[lectureid]) {
      clearInterval(lectureUpdateDataIntervals[lectureid]);
    }

    // Set new intervals
    lectureUpdateHashIntervals[lectureid] = setInterval(() => {
      updateHash(lectureid, lectureData, speedOfHashChange, howMuchLeeWay);
    }, speedOfHashChange);

    // Small delay to emit updated attendance data
    setTimeout(() => {
      io.to(lectureid).emit(
        'updateAttendanceCollectionData',
        lectureData[lectureid].hash,
        lectureid,
        presentStudents[lectureid],
        notYetPresentStudents[lectureid],
      );
    }, 1000);

    lectureUpdateDataIntervals[lectureid] = setInterval(() => {
      io.to(lectureid).emit(
        'updateAttendanceCollectionData',
        lectureData[lectureid].hash,
        lectureid,
        presentStudents[lectureid],
        notYetPresentStudents[lectureid],
      );
    }, speedOfHashChange);

    // Clear existing timeout if any
    if (lectureTimeoutIds.has(lectureid)) {
      clearTimeout(lectureTimeoutIds.get(lectureid));
    }

    // Schedule a timeout to finalize the lecture automatically
    const timeoutId = setTimeout(() => {
      logger.info(`Lecture with ID: ${lectureid} finished with timeout`);
      finalizeLecture(
        lectureid,
        io,
        notYetPresentStudents,
        presentStudents,
        lectureData,
        lectureTimeoutIds,
        listOfIpAlreadyUsedLecture,
      );
    }, timeout);

    lectureTimeoutIds.set(lectureid, timeoutId);

    // Cleanup intervals on socket disconnect
    socket.on('disconnect', () => {
      clearInterval(pingInterval);
      clearInterval(lectureUpdateHashIntervals[lectureid]);
      clearInterval(lectureUpdateDataIntervals[lectureid]);
    });
  } catch (error) {
    logger.error(
      `Error in createAttendanceCollection for lecture ${lectureid}`,
      error,
    );
    throw new CreateAttendanceCollectionError(
      (error as Error).message || 'Failed to create attendance collection.',
    );
  }
};

/**
 * Updates the hash for a given lecture and manages its timestamp history
 * @param lectureid - The ID of the lecture to update
 * @param lectureData - Shared store of lecture metadata
 * @param speedOfHashChange - Time interval between hash updates in milliseconds
 * @param howMuchLeeWay - Total time window for valid hashes
 */
const updateHash = (
  lectureid: string,
  lectureData: LectureData = {},
  speedOfHashChange: number = 10000,
  howMuchLeeWay: number = 30000,
): void => {
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
