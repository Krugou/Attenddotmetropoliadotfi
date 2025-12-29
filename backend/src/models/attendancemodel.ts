import type { FieldPacket, RowDataPacket, ResultSetHeader } from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');

// Helpers

// For SELECT queries — returns rows
const queryRows = async <T extends RowDataPacket[]>(
  sql: string,
  params: any[] = [],
  logMsg?: string,
): Promise<[T, FieldPacket[]]> => {
  if (logMsg) console.log(logMsg);
  return pool.promise().query<T>(sql, params);
};

// For data-changing queries (INSERT/UPDATE/DELETE/DDL) — returns ResultSetHeader (affectedRows, insertId, etc.)
const exec = async (
  sql: string,
  params: any[] = [],
  logMsg?: string,
): Promise<ResultSetHeader> => {
  if (logMsg) console.log(logMsg);
  const [result] = await pool.promise().execute<ResultSetHeader>(sql, params);
  return result;
};

// Types

interface Attendance {
  attendanceid: number;
  studentid: number;
  courseid: number;
  attended: boolean;
}

interface AttendanceModel {
  // Read
  fetchAllAttendances(): Promise<[RowDataPacket[], FieldPacket[]]>;
  findByAttendanceId(id: number): Promise<Attendance | null>;
  findAllAttendancesByUserCourseId(usercourseId: number, userid: number): Promise<RowDataPacket[]>;
  getUserInfoByUserCourseId(usercourseid: number): Promise<RowDataPacket | null>;
  getAttendaceByCourseId(courseid: string): Promise<RowDataPacket[]>;
  getAttendanceById(insertid: number): Promise<RowDataPacket[]>;
  getAttendanceByUserCourseIdDateLectureId(usercourseid: number, lectureid: string): Promise<RowDataPacket[]>;
  checkAttendance(usercourseid: number, lectureid: number): Promise<RowDataPacket[]>;
  getLectureCountByTopic(courseid: string): Promise<RowDataPacket[]>;

  // Write
  insertAttendance(status: number, date: string, usercourseid: string, lectureid: string): Promise<ResultSetHeader>;
  updateAttendanceStatus(attendanceid: number, status: number): Promise<boolean>;
  deleteAttendance(usercourseid: number, lectureid: number): Promise<ResultSetHeader>;
  deleteAttendanceByAttendanceId(attendanceId: number): Promise<ResultSetHeader>;
}

// Model

const attendanceModel: AttendanceModel = {
  // Return all attendance rows (admin/staff use)
  async fetchAllAttendances() {
    console.log('row 52, attendancemodel.ts, calling fetchAllAttendances');
    return queryRows('SELECT * FROM attendance', [], 'fetchAllAttendances()');
  },

  // Find a single attendance by its ID (or null if not found)
  async findByAttendanceId(id) {
    console.log('row 56, attendancemodel.ts, calling findByAttendanceId');
    const [rows] = await queryRows(
      'SELECT * FROM attendance WHERE attendanceid = ?',
      [id],
      'findByAttendanceId()',
    );
    return (rows[0] as Attendance) || null;
  },

  // Attendance records for a specific usercourse + user (joins metadata)
  async findAllAttendancesByUserCourseId(usercourseId, userid) {
    console.log('row 65, attendancemodel.ts, calling findAllAttendancesByUserCourseId');
    const [rows] = await queryRows(
      `SELECT
         attendance.status,
         attendance.attendanceid,
         lecture.start_date,
         lecture.timeofday,
         topics.topicname,
         courses.name,
         courses.code,
         teachers.email AS teacher
       FROM attendance
              JOIN lecture   ON attendance.lectureid = lecture.lectureid
              JOIN topics    ON lecture.topicid     = topics.topicid
              JOIN courses   ON lecture.courseid    = courses.courseid
              JOIN usercourses ON attendance.usercourseid = usercourses.usercourseid
              JOIN users AS teachers ON lecture.teacherid = teachers.userid
       WHERE attendance.usercourseid = ? AND usercourses.userid = ?;`,
      [usercourseId, userid],
      'findAllAttendancesByUserCourseId()',
    );
    return rows;
  },

  // Update the status (e.g., present/absent) for a single attendance row
  async updateAttendanceStatus(attendanceid, status) {
    console.log('row 89, attendancemodel.ts, calling updateAttendanceStatus');
    if (!attendanceid) return false;
    try {
      const result = await exec(
        'UPDATE attendance SET status = ? WHERE attendanceid = ?',
        [status, attendanceid],
        'updateAttendanceStatus()',
      );
      console.log('updateAttendanceStatus() success');
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error updating attendance status:', err);
      return false;
    }
  },

  // Get attendance row by usercourse + lecture (used to check duplicates)
  async getAttendanceByUserCourseIdDateLectureId(usercourseid, lectureid) {
    console.log('row 107, attendancemodel.ts, calling getAttendanceByUserCourseIdDateLectureId');
    const [rows] = await queryRows(
      'SELECT * FROM attendance WHERE usercourseid = ? AND lectureid = ?',
      [usercourseid, lectureid],
      'getAttendanceByUserCourseIdDateLectureId()',
    );
    return rows;
  },

  // Insert a new attendance row (returns ResultSetHeader with insertId)
  async insertAttendance(status, date, usercourseid, lectureid) {
    console.log('row 116, attendancemodel.ts, calling insertAttendance');
    if (!date || !usercourseid || !lectureid) {
      throw new Error('Invalid parameters');
    }
    const result = await exec(
      'INSERT INTO attendance (status, date, usercourseid, lectureid) VALUES (?, ?, ?, ?)',
      [status, date, usercourseid, lectureid],
      'insertAttendance()',
    );
    return [result] as any;
  },

  // Lightweight existence check for a given (usercourse, lecture) pair
  async checkAttendance(usercourseid, lectureid) {
    console.log('row 128, attendancemodel.ts, calling checkAttendance');
    const [rows] = await queryRows(
      'SELECT * FROM attendance WHERE usercourseid = ? AND lectureid = ?',
      [usercourseid, lectureid],
      'checkAttendance()',
    );
    return rows;
  },

  // Fetch one attendance row by its ID (often used right after insertion)
  async getAttendanceById(insertid) {
    console.log('row 137, attendancemodel.ts, calling getAttendanceById');
    const [rows] = await queryRows(
      'SELECT * FROM attendance WHERE attendanceid = ?',
      [insertid],
      'getAttendanceById()',
    );
    return rows;
  },

  // Resolve user info for a given usercourse ID
  async getUserInfoByUserCourseId(usercourseid) {
    console.log('row 146, attendancemodel.ts, calling getUserInfoByUserCourseId');
    const [rows] = await queryRows(
      'SELECT * FROM users WHERE userid IN (SELECT userid FROM usercourses WHERE usercourseid = ?)',
      [usercourseid],
      'getUserInfoByUserCourseId()',
    );
    return rows[0] ?? null;
  },

  // Attendance view for an entire course (rich join with lecture/topic/course/user data)
  async getAttendaceByCourseId(courseid) {
    console.log('row 155, attendancemodel.ts, calling getAttendaceByCourseId');
    const [rows] = await queryRows(
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
       FROM attendance
              JOIN lecture   ON attendance.lectureid = lecture.lectureid
              JOIN topics    ON lecture.topicid     = topics.topicid
              JOIN courses   ON lecture.courseid    = courses.courseid
              JOIN usercourses ON attendance.usercourseid = usercourses.usercourseid
              JOIN users AS teachers   ON lecture.teacherid = teachers.userid
              JOIN users AS attendingUsers ON usercourses.userid = attendingUsers.userid
       WHERE lecture.courseid = ?;`,
      [courseid],
      'getAttendaceByCourseId()',
    );
    return rows;
  },

  // Count number of TeacherLectures per topic for a course (used for summaries/dashboards)
  async getLectureCountByTopic(courseid) {
    console.log('row 185, attendancemodel.ts, calling getLectureCountByTopic');
    const [rows] = await queryRows(
      `SELECT topics.topicname, COUNT(lecture.lectureid) AS lecture_count
       FROM coursetopics
              JOIN topics ON coursetopics.topicid = topics.topicid
              LEFT JOIN lecture
                        ON lecture.topicid = topics.topicid
                          AND lecture.courseid = coursetopics.courseid
       WHERE coursetopics.courseid = ?
       GROUP BY topics.topicname;`,
      [courseid],
      'getLectureCountByTopic()',
    );
    return rows;
  },

  // Delete attendance by composite key (usercourse + lecture)
  async deleteAttendance(usercourseid, lectureid) {
    console.log('row 201, attendancemodel.ts, calling deleteAttendance');
    const result = await exec(
      'DELETE FROM attendance WHERE usercourseid = ? AND lectureid = ?',
      [usercourseid, lectureid],
      'deleteAttendance()',
    );
    return result;
  },

  // Delete attendance by primary key (attendanceid)
  async deleteAttendanceByAttendanceId(attendanceId) {
    console.log('row 210, attendancemodel.ts, calling deleteAttendanceByAttendanceId');
    const result = await exec(
      'DELETE FROM attendance WHERE attendanceid = ?',
      [attendanceId],
      'deleteAttendanceByAttendanceId()',
    );
    return result;
  },
};

export default attendanceModel;
