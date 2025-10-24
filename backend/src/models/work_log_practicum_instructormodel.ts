import { RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';
import logger from '../utils/logger.js';

// Create pool with admin privileges since we need full access
const pool = createPool('ADMIN');

export interface Instructor extends RowDataPacket {
  userid: number;
  email: string;
  first_name: string;
  last_name: string;
}

// Allow typical parameter primitives
type QueryValue = string | number | Date | boolean;

// SQL statements
const SQL = {
  // Get user id by email
  selectUserIdByEmail: 'SELECT userid FROM users WHERE email = ?',

  // Insert mapping: instructor -> practicum
  insertPracticumInstructor:
    'INSERT INTO work_log_practicum_instructors (userid, work_log_practicum_id) VALUES (?, ?)',

  // List instructors (basic user info) for a given practicum
  selectInstructorsByPracticum: `
    SELECT u.userid, u.email, u.first_name, u.last_name
    FROM work_log_practicum_instructors wpi
           JOIN users u ON wpi.userid = u.userid
    WHERE wpi.work_log_practicum_id = ?
  `,

  // Remove all instructor mappings for a practicum
  deleteInstructorsByPracticum:
    'DELETE FROM work_log_practicum_instructors WHERE work_log_practicum_id = ?',

  // List practicums taught by a given instructor
  selectPracticumsByInstructor: `
    SELECT wp.*, u.first_name, u.last_name, u.email
    FROM work_log_practicum wp
           JOIN work_log_practicum_instructors wpi ON wp.work_log_practicum_id = wpi.work_log_practicum_id
           LEFT JOIN users u ON wp.userid = u.userid
    WHERE wpi.userid = ?
    ORDER BY wp.start_date DESC`,
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
const exec = async (sql: string, params: QueryValue[] = []): Promise<void> => {
  await q().query(sql, params);
};

//Model functions
// Add one or more instructors to a practicum (resolve emails -> userids and insert mappings)
const work_log_practicum_instructors = {
  async addInstructorsToPracticum(
    instructors: { email: string }[],
    practicumId: number,
  ): Promise<void> {
    try {
      console.log('row 21, work_log_practicum_instructormodel.ts, addInstructorsToPracticum');
      for (const { email } of instructors) {
        const userRows = await queryRows<RowDataPacket[]>(SQL.selectUserIdByEmail, [email]);

        if (userRows.length > 0) {
          const userId = (userRows[0] as RowDataPacket & { userid: number }).userid;
          await exec(SQL.insertPracticumInstructor, [userId, practicumId]);
        } else {
          console.warn(`Instructor with email ${email} not found`);
        }
      }
    } catch (error) {
      console.error('Error adding instructors to course:', error);
      throw error;
    }
  },

  // Return all instructors (basic info) linked to a practicum
  async getInstructorsByPracticum(practicumId: number): Promise<RowDataPacket[]> {
    try {
      console.log('row 48, work_log_practicum_instructormodel.ts, getInstructorsByPracticum');
      const rows = await queryRows<RowDataPacket[]>(SQL.selectInstructorsByPracticum, [practicumId]);
      return rows;
    } catch (error) {
      logger.error('Error getting practicum instructors:', error);
      throw error;
    }
  },

  // Remove every instructor mapping for a given practicum
  async removeAllPracticumInstructors(practicumId: number): Promise<void> {
    try {
      console.log('row 65, work_log_practicum_instructormodel.ts, removeAllPracticumInstructors');
      await exec(SQL.deleteInstructorsByPracticum, [practicumId]);
    } catch (error) {
      logger.error('Error removing practicum instructors:', error);
      throw error;
    }
  },

  // List practicums where the given user is an instructor
  async getPracticumsByInstructor(userId: number): Promise<RowDataPacket[]> {
    try {
      console.log('row 78, work_log_practicum_instructormodel.ts, getPracticumsByInstructor');
      const rows = await queryRows<RowDataPacket[]>(SQL.selectPracticumsByInstructor, [userId]);
      return rows;
    } catch (error) {
      logger.error('Error getting practicums by instructor:', error);
      throw error;
    }
  },
};

export default work_log_practicum_instructors;
