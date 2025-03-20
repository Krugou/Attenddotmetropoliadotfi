import {ResultSetHeader, RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';
import logger from '../utils/logger.js';

const pool = createPool('ADMIN');

export interface PracticumEntry extends RowDataPacket {
  entry_id: number;
  userid: number;
  work_log_practicum_id: number;
  start_time: Date;
  end_time: Date;
  description: string;
  status: 0 | 1 | 2 | 3; // 0=pending, 1=approved, 2=rejected, 3=submitted
}


const practicumEntry = {
  async createPracticumEntry(
    practicumId: number,
    userId: number,
    startTime: Date | string,
    endTime: Date | string,
    description: string,
    status: 0 | 1 | 2 | 3,
  ): Promise<ResultSetHeader> {
    try {
      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'INSERT INTO work_log_entries (work_log_practicum_id, userid, start_time, end_time, description, status) VALUES (?, ?, ?, ?, ?, ?)',
          [practicumId, userId, startTime, endTime, description, status],
        );
      return result;
    } catch (error) {
      logger.error('Error creating practicum entry:', error);
      throw error;
    }
  },
  async getWorkLogEntriesByPracticum(practicumId: number): Promise<PracticumEntry[]> {
    try {
      const [rows] = await pool.promise().query<PracticumEntry[]>(
        'SELECT * FROM work_log_entries WHERE work_log_practicum_id = ? ORDER BY start_time DESC',
        [practicumId],
      );
      return rows;
    } catch (error) {
      logger.error('Error getting work log entries by practicum:', error);
      throw error;
    }
  },

};

export default practicumEntry;
