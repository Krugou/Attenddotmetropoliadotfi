import { RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';
import logger from '../utils/logger.js';

const pool = createPool('ADMIN');

export interface Instructor extends RowDataPacket {
  userid: number;
  email: string;
  first_name: string;
  last_name: string;
}


const work_log_practicum_instructors = {
  async addInstructorsToPracticum(
    instructors: {email: string}[],
    practicumId: number,
  ): Promise<void> {
   try {
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
                'INSERT INTO work_log_practicum_instructors (userid, work_log_practicum_id) VALUES (?, ?)',
                [userId,practicumId],
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
    async getInstructorsByPracticum(practicumId: number): Promise<RowDataPacket[]> {
      try {
        const [rows] = await pool.promise().query<RowDataPacket[]>(
          `SELECT u.userid, u.email, u.first_name, u.last_name
           FROM work_log_practicum_instructors wpi
           JOIN users u ON wpi.userid = u.userid
           WHERE wpi.work_log_practicum_id = ?`,
          [practicumId],
        );
        return rows;
      } catch (error) {
        logger.error('Error getting practicum instructors:', error);
        throw error;
      }
    },

  async removeAllPracticumInstructors(practicumId: number): Promise<void> {
    try {
        await pool.promise().query(
        'DELETE FROM work_log_practicum_instructors WHERE work_log_practicum_id = ?',
        [practicumId],
      );
    } catch (error) {
      logger.error('Error removing practicum instructors:', error);
      throw error;
    }
  },

  async getPracticumsByInstructor(userId: number): Promise<RowDataPacket[]> {
    try {
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        `SELECT wp.*
         FROM work_log_practicum wp
         JOIN work_log_practicum_instructors wpi ON wp.work_log_practicum_id = wpi.work_log_practicum_id
         WHERE wpi.userid = ?`,
        [userId],
      );
      return rows;
    } catch (error) {
      logger.error('Error getting practicums by instructor:', error);
      throw error;
    }
  },
};

export default work_log_practicum_instructors;
