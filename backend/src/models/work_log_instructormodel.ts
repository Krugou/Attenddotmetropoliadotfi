import { RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN'); // admin pool for full access

// Allow typical parameter primitives
type QueryValue = string | number | Date | boolean;

const SQL = {
  // Find user id by email
  selectUserIdByEmail: 'SELECT userid FROM users WHERE email = ?',

  // Link an instructor (userid) to a work log course
  insertInstructor: 'INSERT INTO work_log_course_instructors (userid, work_log_course_id) VALUES (?, ?)',

  // List instructors (basic user fields) for a course
  selectInstructorsByCourse: `
    SELECT u.userid, u.email, u.first_name, u.last_name FROM users u
    JOIN work_log_course_instructors wci ON u.userid = wci.userid
    WHERE wci.work_log_course_id = ?`,

  // Remove all instructor links for a course
  deleteInstructorsByCourse: 'DELETE FROM work_log_course_instructors WHERE work_log_course_id = ?',
} as const;

//helpers
const q = () => pool.promise();
const queryRows = async <T extends RowDataPacket[]>(
  sql: string,
  params: QueryValue[] = [],
): Promise<T> => {
  const [rows] = await q().query<T>(sql, params); // run SELECT and return rows
  return rows;
};
const exec = async (sql: string, params: QueryValue[] = []): Promise<void> => {
  await q().query(sql, params); // run INSERT/UPDATE/DELETE without returning rows
};

//Model functions
const work_log_instructors = {
  // Add each instructor (by email) to a course; skips unknown emails with a warning
  async addInstructorsToCourse(
    instructors: { email: string }[],
    courseId: number,
  ): Promise<void> {
    try {
      console.log('row 13, work_log_instructormodel.ts, addInstructorsToCourse');
      for (const instructor of instructors) {
        const userRows = await queryRows<RowDataPacket[]>(SQL.selectUserIdByEmail, [instructor.email]);

        if (userRows.length > 0) {
          const userId = (userRows[0] as RowDataPacket & { userid: number }).userid;
          await exec(SQL.insertInstructor, [userId, courseId]); // link user to course
        } else {
          console.warn(`Instructor with email ${instructor.email} not found`);
        }
      }
    } catch (error) {
      console.error('Error adding instructors to course:', error);
      throw error;
    }
  },

  // Return all instructors linked to a course
  async getInstructorsByCourse(courseId: number): Promise<RowDataPacket[]> {
    try {
      console.log('row 40, work_log_instructormodel.ts, getInstructorsByCourse');
      const rows = await queryRows<RowDataPacket[]>(SQL.selectInstructorsByCourse, [courseId]);
      return rows;
    } catch (error) {
      console.error('Error getting course instructors:', error);
      throw error;
    }
  },

  // Remove every instructor mapping for a given course
  async removeAllInstructors(courseId: number): Promise<void> {
    try {
      console.log('row 56, work_log_instructormodel.ts, removeAllInstructors');
      await exec(SQL.deleteInstructorsByCourse, [courseId]);
    } catch (error) {
      console.error('Error removing course instructors:', error);
      throw error;
    }
  },
};

export default work_log_instructors;
