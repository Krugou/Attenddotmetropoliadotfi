//model
import { RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');

// Types for lightweight student info
interface StudentAndTopics {
  first_name: string;
  last_name: string;
  userid: number;
}

// SQL
const SQL = {
  // Exists check for (userid, courseid)
  exists: 'SELECT * FROM usercourses WHERE userid = ? AND courseid = ?',

  // usercourseid by studentnumber (via users.userid) + courseid
  getId: `
    SELECT usercourseid
    FROM usercourses
    WHERE userid IN (SELECT userid FROM users WHERE studentnumber = ?)
      AND courseid = ?`,

  // Insert relation
  insert: 'INSERT INTO usercourses (userid, courseid) VALUES (?, ?)',

  // Delete by pair (userid, courseid)
  deleteByUserCoursePair: 'DELETE FROM usercourses WHERE userid = ? AND courseid = ?',

  // Fetch by usercourseid
  byUsercourseId: 'SELECT * FROM usercourses WHERE usercourseid = ?',

  // Delete by usercourseid
  deleteByUsercourseId: 'DELETE FROM usercourses WHERE usercourseid = ?',

  // Basic student info for a usercourse
  studentInfoByUsercourseId: `
    SELECT u.first_name, u.last_name, u.userid
    FROM users u
           JOIN usercourses uc ON u.userid = uc.userid
    WHERE uc.usercourseid = ?`,
} as const;

// model
const usercoursesModel = {
  // Check if (userid, courseid) exists
  async checkIfUserCourseExists(userId: number, courseId: number) {
    console.log('row 23, usercoursemodel.ts, checkIfUserCourseExists() called');
    const [existingUserCourse] = await pool.promise().query<RowDataPacket[]>(
      SQL.exists,
      [userId, courseId],
    );
    return existingUserCourse;
  },

  // Get usercourseid by studentnumber + courseid
  async getUserCourseId(studentnumber: string, courseid: number) {
    console.log('row 40, usercoursemodel.ts, getUserCourseId() called');
    const [usercourseResult] = await pool.promise().query<RowDataPacket[]>(
      SQL.getId,
      [studentnumber, courseid],
    );
    return usercourseResult;
  },

  // Insert (userid, courseid)
  async insertUserCourse(userId: number, courseId: number) {
    console.log('row 56, usercoursemodel.ts, insertUserCourse() called');
    const result = await pool.promise().query(SQL.insert, [userId, courseId]);
    return result;
  },

  // Delete by (userid, courseid)
  async deleteUserCourse(userId: number, courseId: number) {
    console.log('row 73, usercoursemodel.ts, deleteUserCourse() called');
    const result = await pool.promise().query(SQL.deleteByUserCoursePair, [userId, courseId]);
    return result;
  },

  // Fetch row by usercourseid
  async getUserCourseByUsercourseid(usercourseid: number) {
    console.log('row 89, usercoursemodel.ts, getUserCourseByUsercourseid() called');
    const [usercourseResult] = await pool.promise().query<RowDataPacket[]>(
      SQL.byUsercourseId,
      [usercourseid],
    );
    return usercourseResult;
  },

  // Delete row by usercourseid
  async deleteUserCourseByUsercourseid(usercourseid: number) {
    console.log('row 101, usercoursemodel.ts, deleteUserCourseByUsercourseid() called');
    const result = await pool.promise().query(SQL.deleteByUsercourseId, [usercourseid]);
    return result;
  },

  // Minimal student info for a given usercourseid
  async getStudentInfoByUsercourseid(usercourseid: number) {
    try {
      console.log('row 114, usercoursemodel.ts, getStudentInfoByUsercourseid() called');
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        SQL.studentInfoByUsercourseId,
        [usercourseid],
      );
      const data: StudentAndTopics[] = JSON.parse(JSON.stringify(rows));
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
};

export default usercoursesModel;
