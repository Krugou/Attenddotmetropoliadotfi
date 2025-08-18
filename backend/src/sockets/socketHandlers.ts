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

interface IpStudentRecord {
  ip: string;
  studentId: string;
  timestamp: number;
  userAgent: string;
  studentIds: string[];
  studentId2?: string;
}

// The lists of students who have arrived and who have not yet arrived
const presentStudents: {[lectureid: string]: any[]} = {};
const notYetPresentStudents: {[lectureid: string]: Student[]} = {};
// The timeout id for the lecture
const lectureTimeoutIds = new Map();
// Map to track used IP addresses per lecture: Map<lectureId, Set<IP>>
const listOfIpAlreadyUsedLecture = new Map<
  number,
  Map<string, IpStudentRecord>
>();

const SocketHandlers = (io: Server) => {
  io.use(authenticateSocket);
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(
      `Authenticated user ${socket.user?.username} connected via websocket connection `,
    );
    socket.on('disconnect', () => {});
    socket.on('createAttendanceCollection', async (lectureid: string) => {
      try {
        console.log("row 66, socketHandlers.ts, socketHandlers")
        await handleCreateAttendanceCollection(
          socket,
          io,
          lectureid,
          lectureData,
          notYetPresentStudents,
          presentStudents,
          lectureTimeoutIds,
          listOfIpAlreadyUsedLecture,
        );
      } catch (err) {
        logger.error('Error creating attendance collection:', err);
      }
    });
    socket.on('lectureFinishedWithButton', async (lectureid: string) => {
      try {
        console.log("row 83, socketHandlers.ts, handleLectureFinish()")
        await handleLectureFinish(
          socket,
          lectureid,
          io,
          notYetPresentStudents,
          presentStudents,
          lectureData,
          lectureTimeoutIds,
          listOfIpAlreadyUsedLecture,
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
          console.log("row 110, socketHandlers.ts, handleStudentArrival()")
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
            listOfIpAlreadyUsedLecture,
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
          console.log("row 133, socketHandlers.ts, handleManualStudentInsert()")
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
          console.log("row 152, socketHandlers.ts, handleManualStudentRemove()")
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
      console.log("row 169, socketHandlers.ts, handleLectureCanceled()");
      handleLectureCanceled(
        socket,
        io,
        lectureid,
        notYetPresentStudents,
        presentStudents,
        lectureData,
        lectureTimeoutIds,
        listOfIpAlreadyUsedLecture,
      );
    });
  });
};

export default SocketHandlers;
