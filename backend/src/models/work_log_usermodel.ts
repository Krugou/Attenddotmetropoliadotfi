import { ResultSetHeader, RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');

export interface WorkLogCourseUser extends RowDataPacket {
  user_course_id: number;
  userid: number;
  work_log_course_id: number;
}

// Allow typical parameter primitives
type QueryValue = string | number | Date | boolean;

// SQL statements
const SQL = {
  // Count distinct users enrolled in a course
  countDistinctUsersByCourse: `
    SELECT COUNT(DISTINCT userid) AS count
    FROM work_log_course_users
    WHERE work_log_course_id = ?
  `,

  // Insert a user into a course
  insertUserCourse:
    'INSERT INTO work_log_course_users (userid, work_log_course_id) VALUES (?, ?)',

  // List course-user rows for a given user
  selectUserCoursesByUser:
    'SELECT * FROM work_log_course_users WHERE userid = ?',

  // Find the group (if any) the student belongs to within a course
  checkStudentExistingGroup: `
    SELECT wlcg.group_id, wlcg.group_name
    FROM work_log_course_users wlcu
           JOIN work_log_course_groups wlcg
                ON wlcu.work_log_course_id = wlcg.work_log_course_id
           JOIN student_group_assignments sga
                ON sga.group_id = wlcg.group_id
    WHERE wlcu.userid = ?
      AND wlcu.work_log_course_id = ?
      AND sga.userid = ?
      LIMIT 1
  `,

  // Remove a user from a course
  deleteUserFromCourse:
    'DELETE FROM work_log_course_users WHERE userid = ? AND work_log_course_id = ?',

  // Check existence of a course-user relation
  checkUserCourseExists:
    'SELECT 1 FROM work_log_course_users WHERE userid = ? AND work_log_course_id = ?',

  // Look up userid by email
  selectUserIdByEmail:
    'SELECT userid FROM users WHERE email = ?',

  // List students (basic user info) in a course
  selectStudentsByCourse: `
    SELECT u.userid, u.email, u.first_name, u.last_name
    FROM users u
           JOIN work_log_course_users wcu ON u.userid = wcu.userid
    WHERE wcu.work_log_course_id = ?
  `,
} as const;

//helpers
const q = () => pool.promise();
const queryRows = async <T extends RowDataPacket[]>(
  sql: string,
  params: QueryValue[] = [],
): Promise<T> => {
  const [rows] = await q().query<T>(sql, params);
  return rows;
};
const exec = async (
  sql: string,
  params: QueryValue[] = [],
): Promise<ResultSetHeader> => {
  const [res] = await q().query<ResultSetHeader>(sql, params);
  return res;
};

//Model functions
const work_log_courses_users = {
  // Return number of distinct users enrolled in a course
  async getUserCountByCourse(courseId: number): Promise<number> {
    try {
      console.log('row 15, work_log_usermodel.ts, getUserCountByCourse');
      const rows = await queryRows<RowDataPacket[]>(
        SQL.countDistinctUsersByCourse,
        [courseId],
      );
      return (rows[0] as RowDataPacket & { count?: number })?.count || 0;
    } catch (error) {
      console.error('Error getting user count:', error);
      throw error;
    }
  },

  // Enroll a single user into a course
  async addUserToCourse(
    userId: number,
    courseId: number,
  ): Promise<ResultSetHeader> {
    try {
      console.log('row 34, work_log_usermodel.ts, addUserToCourse');
      return await exec(SQL.insertUserCourse, [userId, courseId]);
    } catch (error) {
      console.error('Error adding user to course:', error);
      throw error;
    }
  },

  // List all course memberships for a user
  async getUserCourses(userId: number): Promise<WorkLogCourseUser[]> {
    try {
      console.log('row 49, work_log_usermodel.ts, getUserCourses');
      return await queryRows<WorkLogCourseUser[]>(
        SQL.selectUserCoursesByUser,
        [userId],
      );
    } catch (error) {
      console.error('Error getting user courses:', error);
      throw error;
    }
  },

  // Check if a student already belongs to a group in the course; return group info or null
  async checkStudentExistingGroup(
    userId: number,
    courseId: number,
  ): Promise<{ group_id: number; group_name: string } | null> {
    try {
      console.log('row 67, work_log_usermodel.ts, checkStudentExistingGroup');
      const rows = await queryRows<RowDataPacket[]>(
        SQL.checkStudentExistingGroup,
        [userId, courseId, userId],
      );
      return (rows[0] as { group_id: number; group_name: string }) || null;
    } catch (error) {
      console.error('Error checking student existing group:', error);
      throw error;
    }
  },

  // Remove a user’s enrollment from a course
  async removeUserFromCourse(
    userId: number,
    courseId: number,
  ): Promise<ResultSetHeader> {
    try {
      console.log('row 93, work_log_usermodel.ts, removeUserFromCourse');
      return await exec(SQL.deleteUserFromCourse, [userId, courseId]);
    } catch (error) {
      console.error('Error removing user from course:', error);
      throw error;
    }
  },

  // True if user is enrolled in the course (useful for access checks)
  async validateUserCourseAccess(
    userId: number,
    courseId: number,
  ): Promise<boolean> {
    try {
      console.log('row 112, work_log_usermodel.ts, validateUserCourseAccess');
      const rows = await queryRows<RowDataPacket[]>(
        SQL.checkUserCourseExists,
        [userId, courseId],
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error validating user course access:', error);
      throw error;
    }
  },

  // Bulk-enroll students by email; skips emails not found as users
  async addStudentsToCourse(
    students: ({ email: string } | string)[],
    courseId: number,
  ): Promise<void> {
    try {
      console.log('row 129, work_log_usermodel.ts, addStudentsToCourse');
      for (const s of students) {
        const email = typeof s === 'string' ? s : s.email;

        const userRows = await queryRows<RowDataPacket[]>(
          SQL.selectUserIdByEmail,
          [email],
        );

        if (userRows.length > 0) {
          const userId = (userRows[0] as RowDataPacket & { userid: number })
            .userid;
          await exec(SQL.insertUserCourse, [userId, courseId]);
        } else {
          console.warn(`Student with email ${email} not found`);
        }
      }
    } catch (error) {
      console.error('Error adding students to course:', error);
      throw error;
    }
  },

  // List basic info for all students enrolled in a course
  async getStudentsByCourse(courseId: number): Promise<RowDataPacket[]> {
    try {
      console.log('row 161, work_log_usermodel.ts, getStudentsByCourse');
      return await queryRows<RowDataPacket[]>(
        SQL.selectStudentsByCourse,
        [courseId],
      );
    } catch (error) {
      console.error('Error getting course students:', error);
      throw error;
    }
  },
};

export default work_log_courses_users;
