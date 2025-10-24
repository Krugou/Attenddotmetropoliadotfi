import { ResultSetHeader, RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';
import logger from '../utils/logger.js';

const pool = createPool('ADMIN');

//Types
export type WorkLogStatus = 0 | 1 | 2 | 3; // 0=pending, 1=approved, 2=rejected, 3=submitted

export interface WorkLogEntry extends RowDataPacket {
  entry_id: number;
  userid: number;
  work_log_course_id: number;
  start_time: Date;
  end_time: Date;
  description: string;
  status: WorkLogStatus;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface PracticumEntry extends WorkLogEntry {
  work_log_practicum_id: number;
}

export interface WorkLogEntryUpdate {
  description?: string;
  start_time?: string | Date;
  end_time?: string | Date;
  status?: WorkLogStatus;
}

// Allow arrays in params for IN (?) clauses
type Primitive = string | number | Date | boolean;
export type QueryValue = Primitive | Primitive[];

//SQL statements
const SQL = {
  // Insert a new work log entry for a course
  insertEntry:
    'INSERT INTO work_log_entries (userid, work_log_course_id, start_time, end_time, description, status) VALUES (?, ?, ?, ?, ?, ?)',

  // Get entries by user id (most recent first)
  selectByUserId:
    'SELECT * FROM work_log_entries WHERE userid = ? ORDER BY start_time DESC',

  // Get active entries (status = '1') for a user; either course or practicum linked
  selectActiveByUserId: `
    SELECT * FROM work_log_entries WHERE userid = ? AND status = '1'
                                     AND (work_log_course_id IS NOT NULL OR work_log_practicum_id IS NOT NULL)
    ORDER BY start_time DESC`,

  // Get a single entry by id
  selectById: 'SELECT * FROM work_log_entries WHERE entry_id = ?',

  // Delete a single entry by id
  deleteById: 'DELETE FROM work_log_entries WHERE entry_id = ?',

  // Update only the status for an entry
  updateStatusById: 'UPDATE work_log_entries SET status = ? WHERE entry_id = ?',

  // Close an entry: set status='2' and end_time to now
  closeById:
    "UPDATE work_log_entries SET status = '2', end_time = CURRENT_TIMESTAMP WHERE entry_id = ?",

  // Get entries for a specific course (most recent first)
  selectByCourseId: `
    SELECT * FROM work_log_entries WHERE work_log_course_id = ?
    ORDER BY start_time DESC`,

  // Get entries for a course for a set of students (includes user names)
  selectByGroupStudents: `
    SELECT wle.*, u.first_name, u.last_name FROM work_log_entries wle
                                                   JOIN users u ON wle.userid = u.userid
    WHERE wle.work_log_course_id = ?
      AND wle.userid IN (?)
    ORDER BY wle.start_time DESC`,

  // Insert a new practicum entry
  insertPracticum: `
    INSERT INTO work_log_entries (work_log_practicum_id, userid, start_time, end_time, description, status)
    VALUES (?, ?, ?, ?, ?, ?)`,

  // Get practicum entries with student info by practicum id
  selectByPracticumId: `
    SELECT e.*, u.first_name, u.last_name, u.email FROM work_log_entries e
                                                          JOIN users u ON e.userid = u.userid
    WHERE e.work_log_practicum_id = ?
    ORDER BY e.start_time DESC`,

  // Dynamic update builder pieces for SET ... WHERE entry_id = ?
  updatePrefix: 'UPDATE work_log_entries SET ',
  updateWhereById: ' WHERE entry_id = ?',
} as const;

//Helpers
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

//model functions
const work_log_entries = {
  // Create course-linked entry
  async createWorkLogEntry(
    userId: number,
    courseId: number,
    startTime: Date,
    endTime: Date,
    description: string,
    status: WorkLogStatus,
  ): Promise<ResultSetHeader> {
    try {
      console.log('row 45, work_log_entrymodel.ts, calling createWorkLogEntry()');
      return await exec(SQL.insertEntry, [userId, courseId, startTime, endTime, description, status]);
    } catch (error) {
      logger.error('Error creating work log entry:', error);
      throw error;
    }
  },

  // List entries for a user
  async getWorkLogEntriesByUserId(userId: number): Promise<WorkLogEntry[]> {
    try {
      console.log('row 61, work_log_entrymodel.ts, getting work log entries by user id');
      return await queryRows<WorkLogEntry[]>(SQL.selectByUserId, [userId]);
    } catch (error) {
      logger.error('Error getting work log entries by user id:', error);
      throw error;
    }
  },

  // List active entries for a user
  async getActiveEntriesByUserId(userId: number): Promise<WorkLogEntry[]> {
    try {
      console.log('row 78, work_log_entrymodel.ts, getting active work log entries by user id');
      return await queryRows<WorkLogEntry[]>(SQL.selectActiveByUserId, [userId]);
    } catch (error) {
      logger.error('Error getting active work log entries by user id:', error);
      throw error;
    }
  },

  // Read single entry
  async getWorkLogEntryById(entryId: number): Promise<WorkLogEntry | null> {
    try {
      console.log('row 96, work_log_entrymodel.ts, getting work log entry by id');
      const rows = await queryRows<WorkLogEntry[]>(SQL.selectById, [entryId]);
      return rows[0] || null;
    } catch (error) {
      logger.error('Error getting work log entry by ID:', error);
      throw error;
    }
  },

  // Delete single entry
  async deleteWorkLogEntry(entryId: number): Promise<ResultSetHeader> {
    try {
      console.log('row 112, work_log_entrymodel.ts, deleting work log entry by id');
      return await exec(SQL.deleteById, [entryId]);
    } catch (error) {
      logger.error('Error deleting work log entry:', error);
      throw error;
    }
  },

  // Partial update (description/times/status)
  async updateWorkLogEntry(
    entryId: number,
    updates: WorkLogEntryUpdate,
  ): Promise<ResultSetHeader> {
    try {
      console.log('row 131, work_log_entrymodel.ts, updating work log entry by id');
      // Ensure the entry exists
      const entry = await queryRows<WorkLogEntry[]>(SQL.selectById, [entryId]);
      if (!entry || !entry[0]) throw new Error('Work log entry not found');

      const updateFields: string[] = [];
      const values: QueryValue[] = [];

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

      // Add WHERE id param
      values.push(entryId);

      const sql = `${SQL.updatePrefix}${updateFields.join(', ')}${SQL.updateWhereById}`;
      return await exec(sql, values);
    } catch (error) {
      logger.error('Error updating work log entry:', error);
      throw error;
    }
  },

  // Update only status
  async updateWorkLogEntryStatus(
    entryId: number,
    status: WorkLogStatus,
  ): Promise<ResultSetHeader> {
    try {
      console.log('row 188, work_log_entrymodel.ts, updating work log entry status by id');
      const result = await exec(SQL.updateStatusById, [status, entryId]);
      if (result.affectedRows === 0) throw new Error('Work log entry not found');
      return result;
    } catch (error) {
      logger.error('Error updating work log entry status:', error);
      throw error;
    }
  },

  // Close (end now + status=2)
  async closeWorkLogEntry(entryId: number): Promise<ResultSetHeader> {
    try {
      console.log('row 209, work_log_entrymodel.ts, closing work log entry by id');
      const result = await exec(SQL.closeById, [entryId]);
      if (result.affectedRows === 0) throw new Error('Entry not found or already closed');
      return result;
    } catch (error) {
      logger.error('Error closing work log entry:', error);
      throw error;
    }
  },

  // List entries for a course
  async getWorkLogEntriesByCourse(courseId: number): Promise<WorkLogEntry[]> {
    try {
      console.log('row 230, work_log_entrymodel.ts, getting work log entries by course id');
      return await queryRows<WorkLogEntry[]>(SQL.selectByCourseId, [courseId]);
    } catch (error) {
      logger.error('Error getting work log entries by course:', error);
      throw error;
    }
  },

  // List entries for given course + list of student IDs
  async getWorkLogEntriesByGroupStudents(
    courseId: number,
    studentIds: number[],
  ): Promise<WorkLogEntry[]> {
    try {
      console.log('row 249, work_log_entrymodel.ts, getting work log entries by group students');
      if (!studentIds.length) return [];
      return await queryRows<WorkLogEntry[]>(SQL.selectByGroupStudents, [courseId, studentIds]);
    } catch (error) {
      logger.error('Error getting work log entries by group students:', error);
      throw error;
    }
  },

  // Create practicum-linked entry
  async createPracticumEntry(
    userId: number,
    practicumId: number,
    startTime: Date | string,
    endTime: Date | string,
    description: string,
    status: WorkLogStatus,
  ): Promise<ResultSetHeader> {
    try {
      console.log('row 278, work_log_entrymodel.ts, calling createPracticumEntry()');
      return await exec(SQL.insertPracticum, [practicumId, userId, startTime, endTime, description, status]);
    } catch (error) {
      logger.error('Error creating practicum entry:', error);
      throw error;
    }
  },

  // List practicum entries for practicum id
  async getWorkLogEntriesByPracticum(
    practicumId: number,
  ): Promise<PracticumEntry[]> {
    try {
      console.log('row 296, work_log_entrymodel.ts, getting work log entries by practicum id');
      return await queryRows<PracticumEntry[]>(SQL.selectByPracticumId, [practicumId]);
    } catch (error) {
      logger.error('Error getting work log entries by practicum id:', error);
      throw error;
    }
  },
};

export default work_log_entries;
