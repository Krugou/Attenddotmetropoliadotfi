import { ResultSetHeader, RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';
import logger from '../utils/logger.js';

// DB pool (ADMIN connection)
const pool = createPool('ADMIN');

// Types
export interface Practicum extends RowDataPacket {
  work_log_practicum_id: number;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  created_at: Date;
  required_hours: number;
  userid: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

type PracticumUpdateValue = string | number | Date;

// Helpers

// Generic query helper (returns typed rows / headers)
type QueryResult = RowDataPacket[] | RowDataPacket[][] | ResultSetHeader;
async function q<T extends QueryResult>(sql: string, params: any[] = []): Promise<T> {
  const [rows] = await pool.promise().query<T>(sql, params);
  return rows;
}

// Query helper for multiple rows
async function qRows<R extends RowDataPacket[]>(sql: string, params: any[] = []): Promise<R> {
  return q<R>(sql, params);
}

// Format JS Date (or ISO string) -> MySQL DATETIME (YYYY-MM-DD HH:mm:ss)
function formatDateForMySQL(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Model functions

const practicum = {
  // Create a new practicum
  async createPracticum(
    name: string,
    startDate: Date | string,
    endDate: Date | string,
    description: string,
    requiredHours: number,
  ): Promise<ResultSetHeader> {
    try {
      const formattedStartDate = formatDateForMySQL(startDate);
      const formattedEndDate = formatDateForMySQL(endDate);

      console.log(
        'row 42, practicummodels.ts, inserting into work_log_practicum table: name, start_date, end_date, description, required_hours: ',
        name, formattedStartDate, formattedEndDate, description, requiredHours, '',
      );

      const result = await q<ResultSetHeader>(
        'INSERT INTO work_log_practicum (name, start_date, end_date, description, required_hours) VALUES (?, ?, ?, ?, ?)',
        [name, formattedStartDate, formattedEndDate, description, requiredHours],
      );
      return result;
    } catch (error) {
      logger.error('Error creating practicum:', error);
      throw error;
    }
  },

  // Get a single practicum with optional instructor info
  async getPracticumById(practicumId: number): Promise<Practicum[]> {
    try {
      console.log('row 64, practicummodels.ts, getting practicum by id: ', practicumId, '');
      const rows = await qRows<Practicum[]>(
        `SELECT p.*, u.first_name, u.last_name, u.email
         FROM work_log_practicum p
                LEFT JOIN users u ON p.userid = u.userid
         WHERE p.work_log_practicum_id = ?`,
        [practicumId],
      );
      return rows;
    } catch (error) {
      logger.error('Error getting practicum:', error);
      throw error;
    }
  },

  // List all practicums (newest first)
  async getAllPracticums(): Promise<Practicum[]> {
    try {
      console.log('row 85, practicummodels.ts, getting all practicums');
      const rows = await qRows<Practicum[]>(
        'SELECT * FROM work_log_practicum ORDER BY start_date DESC',
      );
      return rows;
    } catch (error) {
      logger.error('Error getting all practicums:', error);
      throw error;
    }
  },

  // Patch-like update for a practicum (only provided fields are updated)
  async updatePracticum(
    practicumId: number,
    updates: {
      name?: string;
      description?: string;
      start_date?: string | Date;
      end_date?: string | Date;
      required_hours?: number;
    },
  ): Promise<ResultSetHeader> {
    try {
      console.log('row 109, practicummodels.ts, updatingPraticum()');

      // Build dynamic SET clause safely
      const updateFields: string[] = [];
      const values: PracticumUpdateValue[] = [];

      if (updates.name !== undefined) {
        updateFields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        updateFields.push('description = ?');
        values.push(updates.description);
      }
      if (updates.start_date !== undefined) {
        updateFields.push('start_date = ?');
        values.push(formatDateForMySQL(updates.start_date));
      }
      if (updates.end_date !== undefined) {
        updateFields.push('end_date = ?');
        values.push(formatDateForMySQL(updates.end_date));
      }
      if (updates.required_hours !== undefined) {
        updateFields.push('required_hours = ?');
        values.push(updates.required_hours);
      }

      if (updateFields.length === 0) {
        throw new Error('No updatable fields provided');
      }

      // WHERE id at the end of params
      values.push(practicumId);

      console.log('row 136, practicummodels.ts, pushing values to table and pushing that table to database (work_log_practicum)');

      const result = await q<ResultSetHeader>(
        `UPDATE work_log_practicum SET ${updateFields.join(', ')} WHERE work_log_practicum_id = ?`,
        values,
      );

      return result;
    } catch (error) {
      logger.error('Error updating practicum:', error);
      throw error;
    }
  },

  // Delete a practicum by id
  async deletePracticum(practicumId: number): Promise<ResultSetHeader> {
    try {
      console.log('row 155, practicummodels.ts, deleting practicum by id');
      const result = await q<ResultSetHeader>(
        'DELETE FROM work_log_practicum WHERE work_log_practicum_id = ?',
        [practicumId],
      );
      return result;
    } catch (error) {
      logger.error('Error deleting practicum:', error);
      throw error;
    }
  },

  // Assign a student (user) to a practicum
  async assignStudentToPracticum(
    practicumId: number,
    userId: number,
  ): Promise<ResultSetHeader> {
    try {
      const result = await q<ResultSetHeader>(
        'UPDATE work_log_practicum SET userid = ? WHERE work_log_practicum_id = ?',
        [userId, practicumId],
      );
      if (result.affectedRows === 0) {
        throw new Error('Practicum not found or student assignment failed');
      }
      return result;
    } catch (error) {
      logger.error('Error assigning student to practicum:', error);
      throw error;
    }
  },

  // Get ongoing practicums for a given student (by email)
  async getPracticumByStudentEmail(email: string): Promise<Practicum[]> {
    try {
      console.log('row 192, practicummodels.ts, getting practicum by student email');

      // Resolve user id by email
      const userRows = await qRows<RowDataPacket[]>(
        'SELECT userid FROM users WHERE email = ?',
        [email],
      );

      if (userRows.length === 0) {
        logger.info(`No user found with email: ${email}`);
        return [];
      }

      const userId = (userRows[0] as any).userid as number;

      // Fetch active/future practicums for that user
      const rows = await qRows<Practicum[]>(
        `SELECT p.*, u.first_name, u.last_name, u.email
         FROM work_log_practicum p
                JOIN users u ON p.userid = u.userid
         WHERE p.userid = ? AND p.end_date >= CURDATE()
         ORDER BY p.start_date DESC`,
        [userId],
      );

      return rows;
    } catch (error) {
      logger.error(`Error getting practicum by student email ${email}:`, error);
      throw error;
    }
  },
};

export default practicum;
