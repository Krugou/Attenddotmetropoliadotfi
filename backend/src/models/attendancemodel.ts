import {FieldPacket, RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');
/**
 * Interface for Attendance
 */
interface Attendance {
  attendanceid: number;
  studentid: number;
  courseid: number;
  attended: boolean;
}
/**
 * Interface for AttendanceModel
 */
interface AttendanceModel {
  /**
   * Fetch all attendances
   */
  fetchAllAttendances(): Promise<[RowDataPacket[], FieldPacket[]]>;
  /**
   * Find attendance by attendance id
   * @param id - The id of the attendance
   */
  findByAttendanceId(id: number): Promise<Attendance | null>;
  /**
   * Find all attendances by user course id
   * @param usercourseId - The id of the user course
   * @param userid - The id of the user
   */
  findAllAttendancesByUserCourseId(
    usercourseId: number,
    userid: number,
  ): Promise<any>;

  /**
   * Updates the attendance status for a user course.
   *
   * @param {number} usercourseid - The ID of the user course.
   * @param {number} status - The new attendance status.
   * @returns {Promise<any>} A promise that resolves when the update is complete.
   */
  updateAttendanceStatus: (
    usercourseid: number,
    status: number,
  ) => Promise<any>;
  /**
   * Gets the user info for a user course.
   *
   * @param {number} usercourseid - The ID of the user course.
   * @returns {Promise<any>} A promise that resolves with the user info.
   */
  getUserInfoByUserCourseId: (usercourseid: number) => Promise<any>;
  /**
   * Gets the attendance by course ID.
   *
   * @param {string} courseid - The ID of the course.
   * @returns {Promise<any>} The attendance details for the course.
   */
  getAttendaceByCourseId: (courseid: string) => Promise<any>;
  /**
   * Gets the attendance by its ID.
   *
   * @param {number} insertid - The ID of the attendance.
   * @returns {Promise<any>} The attendance details.
   */
  getAttendanceById: (insertid: number) => Promise<any>;
  /**
   * Gets the attendance by user course ID, date, and lecture ID.
   *
   * @param {number} usercourseid - The ID of the user course.
   * @param {string} lectureid - The ID of the lecture.
   * @returns {Promise<any>} The attendance details.
   */
  getAttendanceByUserCourseIdDateLectureId: (
    usercourseid: number,
    lectureid: string,
  ) => Promise<any>;

  /**
   * Checks if an attendance record exists for a specific user course and lecture.
   * @param usercourseid - The ID of the user course.
   * @param lectureid - The ID of the lecture.
   * @returns A promise that resolves to the attendance record if it exists, null otherwise.
   */
  checkAttendance: (usercourseid: number, lectureid: number) => Promise<any>;

  /**
   * Retrieves the count of lectures for each topic in a specific course.
   * @param courseid - The ID of the course.
   * @returns A promise that resolves to the count of lectures for each topic.
   */
  getLectureCountByTopic: (courseid: string) => Promise<any>;

  /**
   * Deletes an attendance record for a specific user course and lecture.
   * @param usercourseid - The ID of the user course.
   * @param lectureid - The ID of the lecture.
   * @returns A promise that resolves when the deletion is complete.
   */
  deleteAttendance: (usercourseid: number, lectureid: number) => Promise<any>;

  /**
   * Inserts a new attendance record.
   * @param status - The status of the attendance.
   * @param date - The date of the attendance.
   * @param usercourseid - The ID of the user course.
   * @param lectureid - The ID of the lecture.
   * @returns A promise that resolves when the insertion is complete.
   */
  insertAttendance: (
    status: number,
    date: string,
    usercourseid: string,
    lectureid: string,
  ) => Promise<any>;
  deleteAttendanceByAttendanceId: (attendanceId: number) => Promise<any>;
}

/**
 * The implementation of the AttendanceModel interface.
 */
const attendanceModel: AttendanceModel = {
  async updateAttendanceStatus(attendanceid: number, status: number) {
    try {
      if (attendanceid === 0) {
        throw new Error('Invalid usercourseid');
      }

      const result = await pool
        .promise()
        .query(
          'UPDATE attendance SET status = ? WHERE attendanceid = ? ORDER BY date DESC LIMIT 1',
          [status, attendanceid],
        );

      // console.log('Update result:', result);

      return true;
    } catch (error) {
      console.error('Error updating attendance status:', error);
      return false;
    }
  },

  async fetchAllAttendances() {
    try {
      return await pool
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM attendance');
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  async findByAttendanceId(id) {
    try {
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>(
          'SELECT * FROM attendance WHERE attendanceid = ?',
          [id],
        );
      return (rows[0] as Attendance) || null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  async findAllAttendancesByUserCourseId(usercourseId, userid) {
    try {
      //console.log(userid, 'USERIDDD');
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        `SELECT
				attendance.status,
				attendance.attendanceid,
				lecture.start_date,
				lecture.timeofday,
				topics.topicname,
				courses.name,
        courses.code,
				teachers.email AS teacher
			FROM
				attendance
			JOIN
				lecture ON attendance.lectureid = lecture.lectureid
			JOIN
				topics ON lecture.topicid = topics.topicid
			JOIN
				courses ON lecture.courseid = courses.courseid
			JOIN
				usercourses ON attendance.usercourseid = usercourses.usercourseid
			JOIN
				users AS teachers ON lecture.teacherid = teachers.userid
			WHERE
				attendance.usercourseid = ? AND usercourses.userid = ?;`,
        [usercourseId, userid],
      );
      return rows;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  async getAttendanceByUserCourseIdDateLectureId(
    usercourseid: number,
    lectureid: string,
  ) {
    const [attendanceResult] = await pool
      .promise()
      .query(
        'SELECT * FROM attendance WHERE usercourseid = ? AND lectureid = ?',
        [usercourseid, lectureid],
      );
    return attendanceResult;
  },

  async insertAttendance(
    status: number,
    date: string,
    usercourseid: string,
    lectureid: string,
  ) {
    if (!date || !usercourseid || !lectureid) {
      throw new Error('Invalid parameters');
    }

    try {
      return await pool
        .promise()
        .query(
          'INSERT INTO attendance (status, date, usercourseid, lectureid) VALUES (?, ?, ?, ?)',
          [status, date, usercourseid, lectureid],
        );
    } catch (error) {
      console.error(error);
      throw new Error('Failed to insert attendance');
    }
  },

  async checkAttendance(usercourseid: number, lectureid: number) {
    const [attendanceResultCheck] = await pool
      .promise()
      .query(
        'SELECT * FROM attendance WHERE usercourseid = ? AND lectureid = ?',
        [usercourseid, lectureid],
      );
    return attendanceResultCheck;
  },

  async getAttendanceById(insertid: number) {
    const [attendanceResult] = await pool
      .promise()
      .query('SELECT * FROM attendance WHERE attendanceid = ?', [insertid]);
    return attendanceResult;
  },

  async getUserInfoByUserCourseId(usercourseid: number) {
    const [userResult] = (await pool
      .promise()
      .query(
        'SELECT * FROM users WHERE userid IN (SELECT userid FROM usercourses WHERE usercourseid = ?)',
        [usercourseid],
      )) as RowDataPacket[];
    return userResult[0];
  },

  async getAttendaceByCourseId(courseid: string) {
    const [attendanceResult] = await pool.promise().query(
      `SELECT
			attendance.status,
			attendance.attendanceid,
			usercourses.usercourseid,
			lecture.start_date,
			lecture.timeofday,
			topics.topicname,
			courses.name,
			teachers.email AS teacher,
			attendingUsers.first_name,
			attendingUsers.last_name,
			attendingUsers.studentnumber,
			attendingUsers.email,
			attendingUsers.userid
		FROM
			attendance
		JOIN
			lecture ON attendance.lectureid = lecture.lectureid
		JOIN
			topics ON lecture.topicid = topics.topicid
		JOIN
			courses ON lecture.courseid = courses.courseid
		JOIN
			usercourses ON attendance.usercourseid = usercourses.usercourseid
		JOIN
			users AS teachers ON lecture.teacherid = teachers.userid
		JOIN
			users AS attendingUsers ON usercourses.userid = attendingUsers.userid
		WHERE
			lecture.courseid = ?;`,
      [courseid],
    );
    return attendanceResult;
  },

  async getLectureCountByTopic(courseid: string) {
    const [result] = await pool.promise().query(
      `SELECT topics.topicname, COUNT(lecture.lectureid) AS lecture_count
			FROM coursetopics
			JOIN topics ON coursetopics.topicid = topics.topicid
			LEFT JOIN lecture ON lecture.topicid = topics.topicid AND lecture.courseid = coursetopics.courseid
			WHERE coursetopics.courseid = ?
			GROUP BY topics.topicname;`,
      [courseid],
    );
    return result;
  },

  async deleteAttendance(usercourseid: number, lectureid: number) {
    const [result] = await pool
      .promise()
      .query(
        'DELETE FROM attendance WHERE usercourseid = ? AND lectureid = ?',
        [usercourseid, lectureid],
      );

    return result;
  },
  async deleteAttendanceByAttendanceId(attendanceId: number) {
    const [result] = await pool
      .promise()
      .query('DELETE FROM attendance WHERE attendanceid = ?', [attendanceId]);

    return result;
  },
};

export default attendanceModel;
