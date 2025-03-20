import {ResultSetHeader} from 'mysql2';
import createPool from '../config/createPool.js';
import logger from '../utils/logger.js';

const pool = createPool('ADMIN');


const practiumusers = {
  async addUsertoPracticum(
    userId: number,
    practicumId: number,
  ): Promise<ResultSetHeader> {
    try {
      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'INSERT INTO work_log_practicum_users (userid, work_log_practicum_id) VALUES (?, ?)',
          [userId, practicumId],
        );
      return result;
    } catch (error) {
      logger.error('Error adding user to practicum:', error);
      throw error;
    }
  }
};

export default practiumusers;
