import { RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';

// Create pool with admin privileges since we need full access
const pool = createPool('ADMIN');

const work_log_instructors = {
  async addInstructorsToCourse(
    instructors: {email: string}[],
    courseId: number,
  ): Promise<void> {
    try {
      console.log("row 13, work_log_instructormodel.ts, addInstructorsToCourse");
      for (const instructor of instructors) {
        const [userRows] = await pool
          .promise()
          .query<
            RowDataPacket[]
          >('SELECT userid FROM users WHERE email = ?', [instructor.email]);

        if (userRows.length > 0) {
          const userId = userRows[0].userid;
          await pool
            .promise()
            .query(
              'INSERT INTO work_log_course_instructors (userid, work_log_course_id) VALUES (?, ?)',
              [userId, courseId],
            );
        } else {
          console.warn(`Instructor with email ${instructor.email} not found`);
        }
      }
    } catch (error) {
      console.error('Error adding instructors to course:', error);
      throw error;
    }
  },
  async getInstructorsByCourse(courseId: number): Promise<RowDataPacket[]> {
    try {
      console.log("row 40, work_log_instructormodel.ts, getInstructorsByCourse");
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        `SELECT u.userid, u.email, u.first_name, u.last_name
             FROM users u
             JOIN work_log_course_instructors wci ON u.userid = wci.userid
             WHERE wci.work_log_course_id = ?`,
        [courseId],
      );
      return rows;
    } catch (error) {
      console.error('Error getting course instructors:', error);
      throw error;
    }
  },
  async removeAllInstructors(courseId: number): Promise<void> {
    try {
      console.log("row 56, work_log_instructormodel.ts, removeAllInstructors");
      await pool
        .promise()
        .query(
          'DELETE FROM work_log_course_instructors WHERE work_log_course_id = ?',
          [courseId],
        );
    } catch (error) {
      console.error('Error removing course instructors:', error);
      throw error;
    }
  },
};

export default work_log_instructors;
