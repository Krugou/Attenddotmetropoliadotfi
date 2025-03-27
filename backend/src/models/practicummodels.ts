import {ResultSetHeader, RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';
import logger from '../utils/logger.js';

const pool = createPool('ADMIN');


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

const formatDateForMySQL = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const practicum = {
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

      const [result] = await pool.promise().query<ResultSetHeader>(
        'INSERT INTO work_log_practicum (name, start_date, end_date, description, required_hours) VALUES (?, ?, ?, ?, ?)',
        [name, formattedStartDate, formattedEndDate, description, requiredHours],
      );
      return result;
    } catch (error) {
      logger.error('Error creating practicum:', error);
      throw error;
    }
  },

  async getPracticumById(practicumId: number): Promise<Practicum[]> {
    try {
      const [rows] = await pool.promise().query<Practicum[]>(
        `SELECT
        p.*,
        u.first_name,
        u.last_name,
        u.email
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

  async getAllPracticums(): Promise<Practicum[]> {
    try {
      const [rows] = await pool.promise().query<Practicum[]>(
        'SELECT * FROM work_log_practicum ORDER BY start_date DESC',
      );
      return rows;
    } catch (error) {
      logger.error('Error getting all practicums:', error);
      throw error;
    }
  },

  async updatePracticum(
    practicumId: number,
    updates: {
      name?: string;
      description?: string;
      start_date?: string;
      end_date?: string;
      required_hours?: number;
    },
  ): Promise<ResultSetHeader> {
    try {
      const updateFields: string[] = [];
      const values: PracticumUpdateValue[] = [];

      if (updates.name) {
        updateFields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.description) {
        updateFields.push('description = ?');
        values.push(updates.description);
      }
      if (updates.start_date) {
        updateFields.push('start_date = ?');
        values.push(updates.start_date);
      }
      if (updates.end_date) {
        updateFields.push('end_date = ?');
        values.push(updates.end_date);
      }
      if (updates.required_hours !== undefined) {
        updateFields.push('required_hours = ?');
        values.push(updates.required_hours);
      }

      values.push(practicumId);

      const [result] = await pool.promise().query<ResultSetHeader>(
        `UPDATE work_log_practicum SET ${updateFields.join(
          ', ',
        )} WHERE work_log_practicum_id = ?`,
        values,
      );

      return result;
    } catch (error) {
      logger.error('Error updating practicum:', error);
      throw error;
    }
  },

  async deletePracticum(practicumId: number): Promise<ResultSetHeader> {
    try {
      const [result] = await pool.promise().query<ResultSetHeader>(
        'DELETE FROM work_log_practicum WHERE work_log_practicum_id = ?',
        [practicumId],
      );
      return result;
    } catch (error) {
      logger.error('Error deleting practicum:', error);
      throw error;
    }
  },
  async assignStudentToPracticum(practicumId: number, userId: number): Promise<ResultSetHeader> {
    try {

      const [result] = await pool.promise().query<ResultSetHeader>(
        'UPDATE work_log_practicum SET userid = ? WHERE work_log_practicum_id = ?',
        [userId, practicumId]
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

  async getPracticumByStudentEmail(email: string): Promise<Practicum[]> {
    try {
      const [rows] = await pool.promise().query<Practicum[]>(
        `SELECT p.*, u.first_name, u.last_name, u.email
         FROM work_log_practicum p
         JOIN users u ON p.userid = u.userid
         WHERE u.email = ?
         AND p.end_date >= CURDATE()
         ORDER BY p.start_date DESC`,
        [email],
      );
      return rows;
    } catch (error) {
      logger.error('Error getting practicum by student:', error);
      throw error;
    }
  },
};

export default practicum;
