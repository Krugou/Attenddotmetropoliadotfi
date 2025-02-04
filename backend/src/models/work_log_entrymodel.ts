import {ResultSetHeader, RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN'); // Adjust the path to your pool file

export interface WorkLogEntry extends RowDataPacket {
  entry_id: number;
  userid: number;
  work_log_course_id: number;
  start_time: Date;
  end_time: Date;
  description: string;
  status: 0 | 1 | 2 | 3; // 0=pending, 1=approved, 2=rejected, 3=submitted
}


const work_log_entries = {
  async createWorkLogEntry(
    userId: number,
    courseId: number,
    startTime: Date,
    endTime: Date,
    description: string,
    status: 0 | 1 | 2 | 3,
  ): Promise<ResultSetHeader> {
    try {
      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'INSERT INTO work_log_entries (userid, work_log_course_id, start_time, end_time, description, status) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, courseId, startTime, endTime, description, status],
        );
      return result;
    } catch (error) {
      console.error('Error creating work log entry:', error);
      throw error;
    }
  },

  async getWorkLogEntriesByUserId(userId: number): Promise<WorkLogEntry[]> {
    try {
      const [rows] = await pool
        .promise()
        .query<
          WorkLogEntry[]
        >('SELECT * FROM work_log_entries WHERE userid = ?', [userId]);
      return rows;
    } catch (error) {
      console.error('Error getting work log entries:', error);
      throw error;
    }
  },

  async getActiveEntriesByUserId(userId: number): Promise<WorkLogEntry[]> {
    try {
      const [rows] = await pool.promise().query<WorkLogEntry[]>(
        `SELECT * FROM work_log_entries
             WHERE userid = ?
             AND status = '1'
             ORDER BY start_time DESC`,
        [userId],
      );
      return rows;
    } catch (error) {
      console.error('Error getting active work log entries:', error);
      throw error;
    }
  },

    async getWorkLogEntryById(entryId: number): Promise<WorkLogEntry | null> {
      try {
        const [rows] = await pool.promise().query<WorkLogEntry[]>(
          'SELECT * FROM work_log_entries WHERE entry_id = ?',
          [entryId]
        );
        return rows[0] || null;
      } catch (error) {
        console.error('Error getting work log entry by ID:', error);
        throw error;
      }
    },

  async deleteWorkLogEntry(entryId: number): Promise<ResultSetHeader> {
    try {
      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'DELETE FROM work_log_entries WHERE entry_id = ?',
          [entryId],
        );
      return result;
    } catch (error) {
      console.error('Error deleting work log entry:', error);
      throw error;
    }
  },

  async updateWorkLogEntry(
    entryId: number,
    updates: Partial<{
      description: string;
      start_time: string | Date;
      end_time: string | Date;
      status: 0 | 1 | 2 | 3;
    }>,
  ): Promise<ResultSetHeader> {
    try {
      // Validate entry exists first
      const [entry] = await pool
        .promise()
        .query<
          WorkLogEntry[]
        >('SELECT * FROM work_log_entries WHERE entry_id = ?', [entryId]);

      if (!entry || !entry[0]) {
        throw new Error('Work log entry not found');
      }

      const updateFields: string[] = [];
      const values: any[] = [];

      if (updates.description !== undefined) {
        updateFields.push('description = ?');
        values.push(updates.description);
      }
      if (updates.start_time !== undefined) {
        updateFields.push('start_time = ?');
        values.push(new Date(updates.start_time));
      }
      if (updates.end_time !== undefined) {
        updateFields.push('end_time = ?');
        values.push(new Date(updates.end_time));
      }
      if (updates.status !== undefined) {
        updateFields.push('status = ?');
        values.push(updates.status);
      }

      // Add entry ID as last parameter
      values.push(entryId);

      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          `UPDATE work_log_entries SET ${updateFields.join(', ')} WHERE entry_id = ?`,
          values,
        );

      return result;
    } catch (error) {
      console.error('Error updating work log entry:', error);
      throw error;
    }
  },

  async updateWorkLogEntryStatus(
    entryId: number,
    status: 0 | 1 | 2 | 3,
  ): Promise<ResultSetHeader> {
    try {
      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'UPDATE work_log_entries SET status = ? WHERE entry_id = ?',
          [status, entryId],
        );

      if (result.affectedRows === 0) {
        throw new Error('Work log entry not found');
      }

      return result;
    } catch (error) {
      console.error('Error updating work log entry status:', error);
      throw error;
    }
  },

  async closeWorkLogEntry(entryId: number): Promise<ResultSetHeader> {
    try {
      const [result] = await pool.promise().query<ResultSetHeader>(
        `UPDATE work_log_entries
           SET status = '2', end_time = CURRENT_TIMESTAMP
           WHERE entry_id = ? `,
        [entryId],
      );

      if (result.affectedRows === 0) {
        throw new Error('Entry not found or already closed');
      }

      return result;
    } catch (error) {
      console.error('Error closing work log entry:', error);
      throw error;
    }
  },

  async getWorkLogEntriesByCourse(courseId: number): Promise<WorkLogEntry[]> {
    try {
      const [rows] = await pool
        .promise()
        .query<
          WorkLogEntry[]
        >('SELECT * FROM work_log_entries WHERE work_log_course_id = ? ORDER BY start_time DESC', [courseId]);
      return rows;
    } catch (error) {
      console.error('Error getting work log entries by course:', error);
      throw error;
    }
  },
  async getWorkLogEntriesByGroupStudents(
    courseId: number,
    studentIds: number[],
  ): Promise<WorkLogEntry[]> {
    try {
      if (!studentIds.length) return [];

      const [rows] = await pool.promise().query<WorkLogEntry[]>(
        `SELECT wle.*
         FROM work_log_entries wle
         WHERE wle.work_log_course_id = ?
         AND wle.userid IN (?)
         ORDER BY wle.start_time DESC`,
        [courseId, studentIds],
      );

      return rows;
    } catch (error) {
      console.error('Error getting work log entries by group students:', error);
      throw error;
    }
  },

};

export default work_log_entries;
