import {config} from 'dotenv';
import {Server} from 'socket.io';

import logger from '../utils/logger.js';
import {
  authenticateSocket,
  type AuthenticatedSocket,
} from '../utils/authenticateSocket.js';
import {handleLectureCanceled} from './EmitMessages/handleLectureCanceled.js';
import {handleManualStudentRemove} from './EmitMessages/handleManualStudentRemove.js';
import {handleManualStudentInsert} from './EmitMessages/handleManualStudentInsert.js';
import {handleStudentArrival} from './EmitMessages/handleStudentArrival.js';
import {handleLectureFinish} from './EmitMessages/handleLectureFinish.js';
import {handleCreateAttendanceCollection} from './EmitMessages/handleCreateAttendanceCollection.js';
config();

logger.info('SocketHandlers.ts is loading correctly');

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

// The lists of students who have arrived and who have not yet arrived
const presentStudents: {[lectureid: string]: any[]} = {};
const notYetPresentStudents: {[lectureid: string]: Student[]} = {};
// The timeout id for the lecture
const lectureTimeoutIds = new Map();

// Simple IP tracking: { lectureId: { ip: true } }
const listofipsalreadtyused: Record<string, Record<string, boolean>> = {};

const SocketHandlers = (io: Server) => {
  io.use(authenticateSocket);
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(
      `Authenticated user ${socket.user?.username} connected via websocket connection `,
    );
    socket.on('disconnect', () => {});

    socket.on('createAttendanceCollection', async (lectureid: string) => {
      try {
        await handleCreateAttendanceCollection(
          socket,
          io,
          lectureid,
          lectureData,
          notYetPresentStudents,
          presentStudents,
          lectureTimeoutIds,
        );
      } catch (err) {
        logger.error('Error creating attendance collection:', err);
      }
    });

    socket.on('lectureFinishedWithButton', async (lectureid: string) => {
      try {
        const ip = socket.handshake.headers['x-forwarded-for'] as string ||
                   socket.handshake.address ||
                   'unknown';
        const username = socket.user?.username || 'unknown';

        // Check if IP has been used for this lecture
        if (listofipsalreadtyused[lectureid]?.[ip]) {
          socket.emit('error', {
            code: 'DUPLICATE_ACTION',
            message: 'You have already finished this lecture today'
          });
          logger.info(`IP check failed: User ${username} from IP ${ip} attempted to finish lecture ${lectureid} again`);
          logger.warn(`Duplicate lecture finish attempt from IP ${ip}`);
          return;
        }

        // Record this IP for this lecture
        if (!listofipsalreadtyused[lectureid]) {
          listofipsalreadtyused[lectureid] = {};
        }
        listofipsalreadtyused[lectureid][ip] = true;
        logger.info(`IP ${ip} recorded for lecture ${lectureid} by user ${username}`);

        await handleLectureFinish(
          socket,
          lectureid,
          io,
          notYetPresentStudents,
          presentStudents,
          lectureData,
          lectureTimeoutIds,
          listofipsalreadtyused, // Pass the IP tracker object
        );

        // Also delete locally as a backup
        delete listofipsalreadtyused[lectureid];

      } catch (err) {
        logger.error('Error finalizing lecture:', err);
      }
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
        try {
          const ip = socket.handshake.headers['x-forwarded-for'] as string ||
                     socket.handshake.address ||
                     'unknown';
          const lectureIdStr = String(lectureid);

          // Add debug logging to diagnose the issue
          console.log(`Student arriving - IP: ${ip}, StudentID: ${studentId}, Lecture: ${lectureid}`);
          console.log(`Current IP tracking state for lecture ${lectureid}:`,
                      listofipsalreadtyused[lectureIdStr] ?
                      Object.keys(listofipsalreadtyused[lectureIdStr]) :
                      'No IPs registered');

          // Check if IP has been used for this lecture
          if (listofipsalreadtyused[lectureIdStr]?.[ip]) {
            socket.emit('error', {
              code: 'DUPLICATE_ATTENDANCE',
              message: 'You have already marked attendance for this lecture today'
            });
            // Enhanced logging for debug
            console.log(`DUPLICATE ATTEMPT - IP ${ip} already used for lecture ${lectureid}`);
            logger.info(`IP check failed: Student ${studentId} from IP ${ip} attempted to mark attendance for lecture ${lectureid} again`);
            // Fix: Use logger.info instead of logger.warn to avoid the TypeError
            logger.info(`Duplicate attendance attempt from IP ${ip}`);
            return;
          }

          // Record this IP for this lecture
          if (!listofipsalreadtyused[lectureIdStr]) {
            listofipsalreadtyused[lectureIdStr] = {};
          }
          listofipsalreadtyused[lectureIdStr][ip] = true;

          // Add detailed logging
          console.log(`IP ${ip} registered for lecture ${lectureIdStr} - Student ${studentId}`);
          logger.info(`IP ${ip} recorded for lecture ${lectureIdStr} by student ${studentId}`);

          await handleStudentArrival(
            socket,
            io,
            secureHash,
            studentId,
            unixtime,
            lectureid,
            lectureData,
            notYetPresentStudents,
            presentStudents,
          );
        } catch (error) {
          console.error('Error in student arrival handler:', error);
          logger.error('Error in handleStudentArrival:', error);
        }
      },
    );

    // Handle the 'manualstudentinsert' event
    // This event is emitted when the teacher inputs the student id
    socket.on(
      'manualStudentInsert',
      async (studentId: string, lectureid: number) => {
        try {
          await handleManualStudentInsert(
            socket,
            io,
            studentId,
            lectureid,
            notYetPresentStudents,
            presentStudents,
          );
        } catch (error) {
          logger.error('Manual student insertion failed:', error);
        }
      },
    );

    socket.on(
      'manualStudentRemove',
      async (studentId: string, lectureId: number) => {
        try {
          await handleManualStudentRemove(
            socket,
            io,
            studentId,
            lectureId,
            notYetPresentStudents,
            presentStudents,
          );
        } catch (error) {
          logger.error('Manual student removal failed:', error);
        }
      },
    );

    // Handle the 'lecturecanceled' event
    socket.on('lectureCanceled', async (lectureid) => {
      try {
        const ip = socket.handshake.headers['x-forwarded-for'] as string ||
                   socket.handshake.address ||
                   'unknown';
        const username = socket.user?.username || 'unknown';

        // Check if IP has been used for this lecture
        if (listofipsalreadtyused[lectureid]?.[ip]) {
          socket.emit('error', {
            code: 'DUPLICATE_ACTION',
            message: 'You have already canceled this lecture today'
          });
          logger.info(`IP check failed: User ${username} from IP ${ip} attempted to cancel lecture ${lectureid} again`);
          logger.warn(`Duplicate lecture cancellation attempt from IP ${ip}`);
          return;
        }

        // Record this IP for this lecture
        if (!listofipsalreadtyused[lectureid]) {
          listofipsalreadtyused[lectureid] = {};
        }
        listofipsalreadtyused[lectureid][ip] = true;
        logger.info(`IP ${ip} recorded for lecture ${lectureid} by user ${username}`);

        await handleLectureCanceled(
          socket,
          io,
          lectureid,
          notYetPresentStudents,
          presentStudents,
          lectureData,
          lectureTimeoutIds,
          listofipsalreadtyused, // Pass the IP tracker object
        );

        // Also delete locally as a backup
        delete listofipsalreadtyused[lectureid];

      } catch (error) {
        logger.error('Error canceling lecture:', error);
      }
    });
  });
};

export default SocketHandlers;
