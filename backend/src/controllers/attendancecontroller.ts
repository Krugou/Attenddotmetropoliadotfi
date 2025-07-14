import {RowDataPacket} from 'mysql2';
import attendanceModel from '../models/attendancemodel.js';
import lectureModel from '../models/lecturemodel.js';
import usercoursesModel from '../models/usercoursemodel.js';
/**
 * AttendanceController interface represents the structure of the attendance controller.
 *
 * This interface provides the following methods:
 *
 * @method insertIntoAttendance - Inserts a new attendance record.
 * @method checkAndInsertStatusNotPresentAttendance - Checks and inserts attendance records for students not present.
 * @method getLecturesAndAttendancesByCourseId - Gets lectures and attendances by course ID.
 * @method updateAttendanceStatus - Updates the attendance status.
 * @method deleteAttendance - Deletes an attendance record.
 * @method markStudentAsNotPresentInPastLectures - Marks late enrolling students as not present in past lectures.
 */
export interface AttendanceController {
  /**
   * Inserts a new attendance record.
   *
   * @param {string} status - The attendance status.
   * @param {string} date - The date of the lecture.
   * @param {string} studentnumber - The student number.
   * @param {string} lectureid - The lecture ID.
   * @returns {Promise<unknown>} A promise that resolves when the attendance record has been inserted.
   */
  insertIntoAttendance: (
    status: string,
    date: string,
    studentnumber: string,
    lectureid: string,
  ) => Promise<unknown>;
  /**
   * Checks and inserts attendance records for students not present.
   *
   * @param {string} date - The date of the lecture.
   * @param {string[]} studentnumbers - The student numbers.
   * @param {string} lectureid - The lecture ID.
   * @returns {Promise<unknown>} A promise that resolves when the attendance records have been inserted.
   */
  checkAndInsertStatusNotPresentAttendance: (
    date: string,
    studentnumbers: string[],
    lectureid: string,
  ) => Promise<unknown>;

  /**
   * Gets lectures and attendances by course ID.
   *
   * @param {string} courseid - The course ID.
   * @returns {Promise<unknown>} A promise that resolves to the lectures and attendances.
   */
  getLecturesAndAttendancesByCourseId: (courseid: string) => Promise<unknown>;
  /**
   * Updates the attendance status.
   *
   * @param {number} attendanceid - The attendance ID.
   * @param {number} status - The new attendance status.
   * @returns {Promise<unknown>} A promise that resolves when the attendance status has been updated.
   */
  updateAttendanceStatus: (
    attendanceid: number,
    status: number,
  ) => Promise<unknown>;
  /**
   * Deletes an attendance record.
   *
   * @param {string} studentnumber - The student number.
   * @param {string} lectureid - The lecture ID.
   * @returns {Promise<unknown>} A promise that resolves when the attendance record has been deleted.
   */
  deleteAttendance: (
    studentnumber: string,
    lectureid: string,
  ) => Promise<unknown>;
  /**
   * Marks late enrolling students as not present in past lectures.
   *
   * @param {string | number} studentnumber - The student number.
   * @param {number} courseid - The course ID.
   * @returns {Promise<void>} A promise that resolves when the student is marked as not present in past lectures.
   */
  markStudentAsNotPresentInPastLectures: (
    studentnumber: string | number,
    courseid: number,
  ) => Promise<void>;
}

/**
 * `attendanceController` is an object that implements the AttendanceController interface.
 * It provides methods to manage attendance records.
 *
 * @type {AttendanceController}
 */
const attendanceController: AttendanceController = {
  /**
   * Inserts a new attendance record.
   *
   * @param {string} status - The attendance status.
   * @param {string} date - The date of the lecture.
   * @param {string} studentnumber - The student number.
   * @param {string} lectureid - The lecture ID.
   * @returns {Promise<unknown>} A promise that resolves when the attendance record has been inserted.
   */
  async insertIntoAttendance(
    status: string,
    date: string,
    studentnumber: string,
    lectureid: string,
  ): Promise<unknown> {
    try {
      if (!status || !date || !studentnumber || !lectureid) {
        console.log("row 113, attendanceController.ts, Invalid parameters: ", status, date, studentnumber, lectureid, "");
        throw new Error('Invalid parameters');
      }
      const courseId = await lectureModel.getCourseIDByLectureID(lectureid);

      if (courseId === null) {
        console.log("row 119, attendanceController.ts, courseId is null: ",courseId);
        throw new Error('Course ID is null');
      }
      const usercourseResult = await usercoursesModel.getUserCourseId(
        studentnumber,
        courseId,
      );

      if (!Array.isArray(usercourseResult) || usercourseResult.length === 0) {
        console.log("row 128, attendanceController.ts, usercourseResult is empty: ",usercourseResult);
        throw new Error(
          `Usercourse not found for the studentnumber: ${studentnumber}`,
        );
      }

      if ('usercourseid' in usercourseResult[0]) {
        console.log("row 135, attendanceController.ts, usercourseid is in usercourseResult: ",usercourseResult[0].usercourseid);
        const usercourseid = usercourseResult[0].usercourseid;
        const attendanceResultCheck = await attendanceModel.checkAttendance(
          usercourseid,
          Number(lectureid),
        );

        if (!attendanceResultCheck || attendanceResultCheck.length > 0) {
          console.log("row 143, attendanceController.ts, attendanceResultCheck is empty: ",attendanceResultCheck);
          throw new Error(
            `Attendance already exists for the usercourseid: ${usercourseid}`,
          );
        }

        const insertResult = await attendanceModel.insertAttendance(
          Number(status),
          date,
          usercourseid,
          lectureid,
        );

        if (!insertResult || !insertResult[0] || !insertResult[0].insertId) {
          console.log("row 157, attendanceController.ts, insertResult is empty: ",insertResult);
          throw new Error('Failed to insert attendance');
        }

        const attendanceResult = await attendanceModel.getAttendanceById(
          insertResult[0].insertId,
        );

        if (!attendanceResult || attendanceResult.length === 0) {
          console.log("row 166, attendanceController.ts, attendanceResult is empty: ",attendanceResult);
          throw new Error(
            `Failed to get attendance by id: ${insertResult.insertId}`,
          );
        }


        return attendanceResult[0];
      } else {
        console.log("row 175, attendanceController.ts, Invalid result: usercourseid property not found ");
        throw new Error('Invalid result: usercourseid property not found');
      }
    } catch (error) {
      console.log("row 179, attendanceController.ts, error: ",error);
      console.error(error);
      throw error;
    }
  },
  /**
   * Checks and inserts attendance records for students not present.
   *
   * @param {string} date - The date of the lecture.
   * @param {string[]} studentnumbers - The student numbers.
   * @param {string} lectureid - The lecture ID.
   * @returns {Promise<unknown>} A promise that resolves when the attendance records have been inserted.
   */
  async checkAndInsertStatusNotPresentAttendance(
    date: string,
    studentnumbers: string[],
    lectureid: string,
  ): Promise<void> {
    try {
      for (const studentnumber of studentnumbers) {
        console.log("row 199, attendanceController.ts, studentnumber: ",studentnumber);
        const courseId = await lectureModel.getCourseIDByLectureID(lectureid);
        if (courseId === null) {
          console.log("row 202, attendanceController.ts, courseId is null: ",courseId);
          console.error('Course ID is null');
          continue;
        }

        const usercourseResult = (await usercoursesModel.getUserCourseId(
          studentnumber,
          courseId,
        )) as RowDataPacket[];

        if (usercourseResult.length === 0) {
          console.log("row 213, attendanceController.ts, usercourseResult is empty: ",usercourseResult);
          console.error(
            'Usercourse not found for the studentnumber:',
            studentnumber,
          );
          continue;
        }

        const usercourseid = usercourseResult[0].usercourseid;

        const attendanceResult =
          await attendanceModel.getAttendanceByUserCourseIdDateLectureId(
            usercourseid,
            lectureid,
          );

        if (attendanceResult.length === 0) {
          console.log("row 230, attendanceController.ts, attendanceResult is empty: ",attendanceResult);
          const status = 0;
          await attendanceModel.insertAttendance(
            status,
            date,
            usercourseid,
            lectureid,
          );
        }
      }
      return Promise.resolve();
    } catch (error) {
      console.log("row 242, attendanceController.ts, error: ",error);
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Updates the attendance status.
   *
   * @param {number} attendanceid - The attendance ID.
   * @param {number} status - The new attendance status.
   * @returns {Promise<unknown>} A promise that resolves when the attendance status has been updated.
   */
  async updateAttendanceStatus(attendanceid: number, status: number) {
    try {
      await attendanceModel.updateAttendanceStatus(attendanceid, status);
      console.log("row 257, attendanceController.ts, attendanceid: ",attendanceid, " and returning true");
      return true;
    } catch (error) {
      console.log("row 260, attendanceController.ts, error: ",error, " and returning false");
      console.error(error);
      return false;
    }
  },
  /**
   * Gets lectures and attendances by course ID.
   *
   * @param {string} courseid - The course ID.
   * @returns {Promise<unknown>} A promise that resolves to the lectures and attendances.
   */
  async getLecturesAndAttendancesByCourseId(courseid: string) {
    try {
      console.log("row 273, attendanceController.ts, courseid: ",courseid);
      const lectures = await attendanceModel.getAttendaceByCourseId(courseid);
      return lectures;
    } catch (error) {
      console.log("row 277, attendanceController.ts, error: ",error);
      console.error(error);
      console.log("row 279, attendanceController.ts, returning error");
      return Promise.reject(error);
    }
  },
  /**
   * Deletes an attendance record.
   *
   * @param {string} studentnumber - The student number.
   * @param {string} lectureid - The lecture ID.
   * @returns {Promise<unknown>} A promise that resolves when the attendance record has been deleted.
   */
  async deleteAttendance(
    studentnumber: string,
    lectureid: string,
  ): Promise<boolean> {
    try {
      const courseId = await lectureModel.getCourseIDByLectureID(lectureid);
      console.log("row 296, attendanceController.ts, courseId: ",courseId);
      if (courseId === null) {
        console.log("row 298, attendanceController.ts, courseId is null: ",courseId);
        throw new Error('Course ID is null');
      }
      const usercourseResult = await usercoursesModel.getUserCourseId(
        studentnumber,
        courseId,
      );

      if (!Array.isArray(usercourseResult) || usercourseResult.length === 0) {
        console.log("row 307, attendanceController.ts, usercourseResult is empty: ",usercourseResult);
        throw new Error(
          `Usercourse not found for the studentnumber: ${studentnumber}`,
        );
      }
      if ('usercourseid' in usercourseResult[0]) {
        console.log("row 313, attendanceController.ts, usercourseid is in usercourseResult: ",usercourseResult[0].usercourseid);
        const usercourseid = usercourseResult[0].usercourseid;

        const deleteResult = await attendanceModel.deleteAttendance(
          usercourseid,
          Number(lectureid),
        );

        if (!deleteResult || deleteResult.affectedRows === 0) {
          console.log("row 322, attendanceController.ts, deleteResult is empty: ",deleteResult);
          throw new Error('Failed to delete attendance');
        }

        console.log("row 326, attendanceController.ts, returning true");
        return true;
      } else {
        console.log("row 329, attendanceController.ts, Invalid result: usercourseid property not found ");
        throw new Error('Invalid result: usercourseid property not found');
      }
    } catch (error) {
      console.log("row 333, attendanceController.ts, error: ",error);
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Marks late enrolling students as not present in past lectures.
   *
   * @param {string | number} studentnumber - The student number.
   * @param {number} courseid - The course ID.
   * @returns {Promise<void>} A promise that resolves when the student is marked as not present in past lectures.
   */
  async markStudentAsNotPresentInPastLectures(
    studentnumber: string | number,
    courseid: number,
  ): Promise<void> {
    try {
      const studentNumberString = studentnumber.toString();

      if (courseid === null) {
        console.log("row 353, attendanceController.ts, courseid is null: ",courseid);
        throw new Error('Course ID is null');
      }

      const courseId = courseid;
      if (courseId === null) {
        console.log("row 359, attendanceController.ts, courseId is null: ",courseId);
        throw new Error('Course ID is null');
      }
      const usercourseResult = await usercoursesModel.getUserCourseId(
        studentNumberString,
        courseId,
      );

      if (!Array.isArray(usercourseResult) || usercourseResult.length === 0) {
        console.log("row 368, attendanceController.ts, usercourseResult is empty: ",usercourseResult);
        throw new Error(
          `Usercourse not found for the studentnumber: ${studentNumberString}`,
        );
      }

      if ('usercourseid' in usercourseResult[0]) {
        console.log("row 375, attendanceController.ts, usercourseid is in usercourseResult: ",usercourseResult[0].usercourseid);
        const usercourseid = usercourseResult[0].usercourseid;
        const pastLectures = await lectureModel.getPastLecturesByCourseId(
          courseId,
        );

        for (const lecture of pastLectures) {
          console.log("row 382, attendanceController.ts, lecture: ",lecture);
          const attendanceResultCheck = await attendanceModel.checkAttendance(
            usercourseid,
            lecture.lectureid,
          );

          if (!attendanceResultCheck || attendanceResultCheck.length > 0) {
            console.log("row 389, attendanceController.ts, attendanceResultCheck is empty: ",attendanceResultCheck);
            continue;
          }
          await attendanceModel.insertAttendance(
            0,
            lecture.start_date,
            usercourseid,
            lecture.lectureid.toString(),
          );
        }
      } else {
        console.log("row 400, attendanceController.ts, Invalid result: usercourseid property not found ");
        throw new Error('Invalid result: usercourseid property not found');
      }
    } catch (error) {
      console.log("row 404, attendanceController.ts, error: ",error);
      console.error(error);
      throw error;
    }
  },
};

export default attendanceController;
