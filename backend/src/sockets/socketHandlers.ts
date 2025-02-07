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

const SocketHandlers = (io: Server) => {
  io.use(authenticateSocket);
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Authenticated user ${socket.user?.username} connected`);
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
        await handleLectureFinish(
          socket,
          lectureid,
          io,
          notYetPresentStudents,
          presentStudents,
          lectureData,
          lectureTimeoutIds,
        );
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
