import { ResultSetHeader, RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');

// Types for Work Log Courses
export interface WorkLogCourse extends RowDataPacket {
  work_log_course_id: number;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  code: string;
  created_at: Date;
  required_hours: number;
}

export type QueryValue = string | number | Date | boolean;

interface WorkLogCourseUpdate {
  name?: string;
  code?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  required_hours?: number;
}

// Format JS Date/string to MySQL DATETIME
const formatDateForMySQL = (date: Date | string): string => {
  console.log('row 30, work_log_coursemodel.ts, calling formatDateForMySQL');
  if (typeof date === 'string') date = new Date(date);
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

// SQL statements
const SQL = {
  // Create
  insertCourse:
    'INSERT INTO work_log_courses (name, start_date, end_date, code, description, required_hours) VALUES (?, ?, ?, ?, ?, ?)',

  // Read (by id)
  selectById: 'SELECT * FROM work_log_courses WHERE work_log_course_id = ?',

  // Delete (by id)
  deleteById: 'DELETE FROM work_log_courses WHERE work_log_course_id = ?',

  // List all (newest first)
  selectAllOrdered: 'SELECT * FROM work_log_courses ORDER BY start_date DESC',

  // List by date window
  selectByDateRange:
    'SELECT * FROM work_log_courses WHERE start_date >= ? AND end_date <= ? ORDER BY start_date',

  // Fuzzy search on name/code
  searchByNameOrCode:
    'SELECT * FROM work_log_courses WHERE name LIKE ? OR code LIKE ?',

  // Existence check by code
  codeExists: 'SELECT 1 FROM work_log_courses WHERE code = ?',

  // Courses by instructor email
  selectByInstructor: `
    SELECT wlc.* FROM work_log_courses wlc
        JOIN work_log_course_instructors wci ON wlc.work_log_course_id = wci.work_log_course_id
        JOIN users u ON u.userid = wci.userid
    WHERE u.email = ?
    ORDER BY wlc.start_date DESC`,

  // Active (not ended) courses by student email
  selectActiveByStudentEmail: `
    SELECT wlc.* FROM work_log_courses wlc
        JOIN work_log_course_users wlcu ON wlc.work_log_course_id = wlcu.work_log_course_id
        JOIN users u ON wlcu.userid = u.userid
    WHERE u.email = ? AND wlc.end_date >= CURDATE()
    ORDER BY wlc.start_date DESC`,

  // Stats per user (all courses)
  statsByUser: `
    SELECT wlc.name AS course_name, COUNT(wle.entry_id) AS entry_count,
           SUM(TIMESTAMPDIFF(MINUTE, wle.start_time, wle.end_time)) AS total_minutes
    FROM work_log_courses wlc
           JOIN work_log_entries wle ON wlc.work_log_course_id = wle.work_log_course_id
    WHERE wle.userid = ?
    GROUP BY wlc.work_log_course_id`,

  // Stats per user filtered by one course
  statsByUserAndCourse: `
    SELECT wlc.name AS course_name, COUNT(wle.entry_id) AS entry_count,
           SUM(TIMESTAMPDIFF(MINUTE, wle.start_time, wle.end_time)) AS total_minutes
    FROM work_log_courses wlc
           JOIN work_log_entries wle ON wlc.work_log_course_id = wle.work_log_course_id
    WHERE wle.userid = ? AND wlc.work_log_course_id = ?
    GROUP BY wlc.work_log_course_id`,

  // Dynamic UPDATE pieces
  updatePrefix: 'UPDATE work_log_courses SET ',
  updateWhereById: ' WHERE work_log_course_id = ?',
} as const;

// Helpers
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
const work_log_courses = {
  // Create course
  async createWorkLogCourse(
    name: string,
    startDate: Date | string,
    endDate: Date | string,
    code: string,
    description: string,
    required_hours: number,
  ): Promise<ResultSetHeader> {
    try {
      console.log('row 47, work_log_coursemodel.ts, calling createWrokLogCourse()');
      const formattedStartDate = formatDateForMySQL(startDate);
      const formattedEndDate = formatDateForMySQL(endDate);
      return await exec(SQL.insertCourse, [
        name,
        formattedStartDate,
        formattedEndDate,
        code,
        description,
        required_hours,
      ]);
    } catch (error) {
      console.error('Error creating work log course:', error);
      throw error;
    }
  },

  // Read course by id
  async getWorkLogCourseById(courseId: number): Promise<WorkLogCourse[]> {
    try {
      console.log('row 72, work_log_coursemodel.ts, calling getWorkLogCourseById()');
      return await queryRows<WorkLogCourse[]>(SQL.selectById, [courseId]);
    } catch (error) {
      console.error('Error getting work log course:', error);
      throw error;
    }
  },

  // Delete course by id
  async deleteWorkLogCourse(courseId: number): Promise<ResultSetHeader> {
    try {
      console.log('row 87, work_log_coursemodel.ts, calling deleteWorkLogCourse()');
      return await exec(SQL.deleteById, [courseId]);
    } catch (error) {
      console.error('Error deleting work log course:', error);
      throw error;
    }
  },

  // Update course (dynamic fields)
  async updateWorkLogCourse(
    courseId: number,
    updates: WorkLogCourseUpdate,
  ): Promise<ResultSetHeader> {
    try {
      console.log('row 105, work_log_coursemodel.ts, calling updateWorkLogCourse()');
      const updateFields: string[] = [];
      const values: QueryValue[] = [];

      if (updates.name) {
        updateFields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.code) {
        updateFields.push('code = ?');
        values.push(updates.code);
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

      values.push(courseId); // WHERE id

      const sql = `${SQL.updatePrefix}${updateFields.join(', ')}${SQL.updateWhereById}`;
      return await exec(sql, values);
    } catch (error) {
      console.error('Error updating work log course:', error);
      throw error;
    }
  },

  // List all courses (desc by start_date)
  async getAllWorkLogCourses(): Promise<WorkLogCourse[]> {
    try {
      console.log('row 155, work_log_coursemodel.ts, calling getAllWorkLogCourses()');
      return await queryRows<WorkLogCourse[]>(SQL.selectAllOrdered);
    } catch (error) {
      console.error('Error getting all work log courses:', error);
      throw error;
    }
  },

  // List courses inside date range
  async getWorkLogCoursesByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<WorkLogCourse[]> {
    try {
      console.log('row 172, work_log_coursemodel.ts, calling getWorkLogCoursesByDateRange()');
      return await queryRows<WorkLogCourse[]>(SQL.selectByDateRange, [startDate, endDate]);
    } catch (error) {
      console.error('Error getting work log courses by date range:', error);
      throw error;
    }
  },

  // Search courses by name/code
  async searchWorkLogCourses(searchTerm: string): Promise<WorkLogCourse[]> {
    try {
      console.log('row 187, work_log_coursemodel.ts, calling searchWorkLogCourses()');
      const like = `%${searchTerm}%`;
      return await queryRows<WorkLogCourse[]>(SQL.searchByNameOrCode, [like, like]);
    } catch (error) {
      console.error('Error searching work log courses:', error);
      throw error;
    }
  },

  // Stats per user (optionally filtered by course)
  async getWorkLogStatsByUser(
    userId: number,
    courseId?: number,
  ): Promise<RowDataPacket[]> {
    try {
      console.log('row 205, work_log_coursemodel.ts, calling getWorkLogStatsByUser()');
      const sql = courseId !== undefined ? SQL.statsByUserAndCourse : SQL.statsByUser;
      const params: QueryValue[] = courseId !== undefined ? [userId, courseId] : [userId];
      return await queryRows<RowDataPacket[]>(sql, params);
    } catch (error) {
      console.error('Error getting work log stats:', error);
      throw error;
    }
  },

  // Existence check by course code
  async checkWorklogCodeExists(code: string): Promise<RowDataPacket[]> {
    try {
      console.log('row 232, work_log_coursemodel.ts, calling checkWorklogCodeExists()');
      return await queryRows<RowDataPacket[]>(SQL.codeExists, [code]);
    } catch (error) {
      console.error('Error checking worklog code:', error);
      throw error;
    }
  },

  // Courses taught by instructor (by email)
  async getWorkLogCoursesByInstructor(email: string): Promise<WorkLogCourse[]> {
    try {
      console.log('row 247, work_log_coursemodel.ts, calling getWorkLogCoursesByInstructor()');
      return await queryRows<WorkLogCourse[]>(SQL.selectByInstructor, [email]);
    } catch (error) {
      console.error('Error getting instructor worklog courses:', error);
      throw error;
    }
  },

  // Active courses for student (by email)
  async getActiveCoursesByStudentEmail(email: string): Promise<WorkLogCourse[]> {
    try {
      console.log('row 267, work_log_coursemodel.ts, calling getActiveCoursesByStudentEmail()');
      return await queryRows<WorkLogCourse[]>(SQL.selectActiveByStudentEmail, [email]);
    } catch (error) {
      console.error('Error getting active courses by student email:', error);
      throw error;
    }
  },
};

export default work_log_courses;
