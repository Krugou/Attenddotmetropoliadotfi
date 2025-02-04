import {ResultSetHeader, RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN'); // Adjust the path to your pool file

export interface WorkLogCourseUser extends RowDataPacket {
  user_course_id: number;
  userid: number;
  work_log_course_id: number;
}

const work_log_courses_users = {
  async getUserCountByCourse(courseId: number): Promise<number> {
    try {
      const [countRows] = await pool.promise().query<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT userid) as count
           FROM work_log_course_users
           WHERE work_log_course_id = ?`,
        [courseId],
      );
      return countRows[0]?.count || 0;
    } catch (error) {
      console.error('Error getting user count:', error);
      throw error;
    }
  },
  // Course user operations
  async addUserToCourse(
    userId: number,
    courseId: number,
  ): Promise<ResultSetHeader> {
    try {
      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'INSERT INTO work_log_course_users (userid, work_log_course_id) VALUES (?, ?)',
          [userId, courseId],
        );
      return result;
    } catch (error) {
      console.error('Error adding user to course:', error);
      throw error;
    }
  },
  async getUserCourses(userId: number): Promise<WorkLogCourseUser[]> {
    try {
      const [rows] = await pool
        .promise()
        .query<
          WorkLogCourseUser[]
        >('SELECT * FROM work_log_course_users WHERE userid = ?', [userId]);
      return rows;
    } catch (error) {
      console.error('Error getting user courses:', error);
      throw error;
    }
  },

  async checkStudentExistingGroup(
    userId: number,
    courseId: number,
  ): Promise<{group_id: number; group_name: string} | null> {
    try {
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        `SELECT wlcg.group_id, wlcg.group_name
           FROM work_log_course_users wlcu
           JOIN work_log_course_groups wlcg
             ON wlcu.work_log_course_id = wlcg.work_log_course_id
           JOIN student_group_assignments sga
             ON sga.group_id = wlcg.group_id
           WHERE wlcu.userid = ?
           AND wlcu.work_log_course_id = ?
           AND sga.userid = ?
           LIMIT 1`,
        [userId, courseId, userId],
      );
      return rows[0] as {group_id: number; group_name: string} | null;
    } catch (error) {
      console.error('Error checking student existing group:', error);
      throw error;
    }
  },

  async removeUserFromCourse(
    userId: number,
    courseId: number,
  ): Promise<ResultSetHeader> {
    try {
      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'DELETE FROM work_log_course_users WHERE userid = ? AND work_log_course_id = ?',
          [userId, courseId],
        );
      return result;
    } catch (error) {
      console.error('Error removing user from course:', error);
      throw error;
    }
  },

  async validateUserCourseAccess(
    userId: number,
    courseId: number,
  ): Promise<boolean> {
    try {
      const [rows] = await pool
        .promise()
        .query<
          RowDataPacket[]
        >('SELECT 1 FROM work_log_course_users WHERE userid = ? AND work_log_course_id = ?', [userId, courseId]);
      return rows.length > 0;
    } catch (error) {
      console.error('Error validating user course access:', error);
      throw error;
    }
  },
  async addStudentsToCourse(
    students: ({email: string} | string)[],
    courseId: number,
  ): Promise<void> {
    try {
      for (const studentEmail of students) {
        const email =
          typeof studentEmail === 'string'
            ? studentEmail
            : (studentEmail as {email: string}).email || studentEmail;

        const [userRows] = await pool
          .promise()
          .query<
            RowDataPacket[]
          >('SELECT userid FROM users WHERE email = ?', [email]);

        if (userRows.length > 0) {
          const userId = userRows[0].userid;
          await pool
            .promise()
            .query(
              'INSERT INTO work_log_course_users (userid, work_log_course_id) VALUES (?, ?)',
              [userId, courseId],
            );
        } else {
          console.warn(`Student with email ${email} not found`);
        }
      }
    } catch (error) {
      console.error('Error adding students to course:', error);
      throw error;
    }
  },
  async getStudentsByCourse(courseId: number): Promise<RowDataPacket[]> {
    try {
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        `SELECT u.userid, u.email, u.first_name, u.last_name
             FROM users u
             JOIN work_log_course_users wcu ON u.userid = wcu.userid
             WHERE wcu.work_log_course_id = ?`,
        [courseId],
      );
      return rows;
    } catch (error) {
      console.error('Error getting course students:', error);
      throw error;
    }
  },
};

export default work_log_courses_users;
