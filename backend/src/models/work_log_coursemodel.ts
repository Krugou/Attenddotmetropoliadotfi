import {ResultSetHeader, RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN'); // Adjust the path to your pool file

// Interfaces for type safety
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

const formatDateForMySQL = (date: Date | string): string => {
  console.log("row 30, work_log_coursemodel.ts, calling formatDateForMySQL");
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const work_log_courses = {
  async createWorkLogCourse(
    name: string,
    startDate: Date | string,
    endDate: Date | string,
    code: string,
    description: string,
    required_hours: number,
  ): Promise<ResultSetHeader> {
    try {
      console.log("row 47, work_log_coursemodel.ts, calling createWrokLogCourse()");
      const formattedStartDate = formatDateForMySQL(startDate);
      const formattedEndDate = formatDateForMySQL(endDate);

      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'INSERT INTO work_log_courses (name, start_date, end_date, code, description, required_hours) VALUES (?, ?, ?, ?, ?, ?)',
          [
            name,
            formattedStartDate,
            formattedEndDate,
            code,
            description,
            required_hours,
          ],
        );
      return result;
    } catch (error) {
      console.error('Error creating work log course:', error);
      throw error;
    }
  },
  async getWorkLogCourseById(courseId: number): Promise<WorkLogCourse[]> {
    try {
      console.log("row 72, work_log_coursemodel.ts, calling getWorkLogCourseById()");
      const [rows] = await pool
        .promise()
        .query<WorkLogCourse[]>(
          'SELECT * FROM work_log_courses WHERE work_log_course_id = ?',
          [courseId],
        );
      return rows;
    } catch (error) {
      console.error('Error getting work log course:', error);
      throw error;
    }
  },
  async deleteWorkLogCourse(courseId: number): Promise<ResultSetHeader> {
    try {
      console.log("row 87, work_log_coursemodel.ts, calling deleteWorkLogCourse()");
      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'DELETE FROM work_log_courses WHERE work_log_course_id = ?',
          [courseId],
        );
      return result;
    } catch (error) {
      console.error('Error deleting work log course:', error);
      throw error;
    }
  },
  async updateWorkLogCourse(
    courseId: number,
    updates: WorkLogCourseUpdate,
  ): Promise<ResultSetHeader> {
    try {
      console.log("row 105, work_log_coursemodel.ts, calling updateWorkLogCourse()");
      // Build the update query dynamically based on provided fields
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

      // Add the courseId to values array
      values.push(courseId);

      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          `UPDATE work_log_courses SET ${updateFields.join(
            ', ',
          )} WHERE work_log_course_id = ?`,
          values,
        );

      return result;
    } catch (error) {
      console.error('Error updating work log course:', error);
      throw error;
    }
  },
  async getAllWorkLogCourses(): Promise<WorkLogCourse[]> {
    try {
      console.log("row 155, work_log_coursemodel.ts, calling getAllWorkLogCourses()");
      const [rows] = await pool
        .promise()
        .query<WorkLogCourse[]>(
          'SELECT * FROM work_log_courses ORDER BY start_date DESC',
        );
      return rows;
    } catch (error) {
      console.error('Error getting all work log courses:', error);
      throw error;
    }
  },
  async getWorkLogCoursesByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<WorkLogCourse[]> {
    try {
      console.log("row 172, work_log_coursemodel.ts, calling getWorkLogCoursesByDateRange()");
      const [rows] = await pool
        .promise()
        .query<WorkLogCourse[]>(
          'SELECT * FROM work_log_courses WHERE start_date >= ? AND end_date <= ? ORDER BY start_date',
          [startDate, endDate],
        );
      return rows;
    } catch (error) {
      console.error('Error getting work log courses by date range:', error);
      throw error;
    }
  },
  async searchWorkLogCourses(searchTerm: string): Promise<WorkLogCourse[]> {
    try {
      console.log("row 187, work_log_coursemodel.ts, calling searchWorkLogCourses()");
      const [rows] = await pool
        .promise()
        .query<WorkLogCourse[]>(
          'SELECT * FROM work_log_courses WHERE name LIKE ? OR code LIKE ?',
          [`%${searchTerm}%`, `%${searchTerm}%`],
        );
      return rows;
    } catch (error) {
      console.error('Error searching work log courses:', error);
      throw error;
    }
  },
  async getWorkLogStatsByUser(
    userId: number,
    courseId?: number,
  ): Promise<RowDataPacket[]> {
    try {
      console.log("row 205, work_log_coursemodel.ts, calling getWorkLogStatsByUser()");
      let query = `SELECT
                    wlc.name as course_name,
                    COUNT(wle.entry_id) as entry_count,
                    SUM(TIMESTAMPDIFF(MINUTE, wle.start_time, wle.end_time)) as total_minutes
                   FROM work_log_courses wlc
                   JOIN work_log_entries wle ON wlc.work_log_course_id = wle.work_log_course_id
                   WHERE wle.userid = ?`;

      const params: QueryValue[] = [userId];

      if (courseId !== undefined) {
        query += ` AND wlc.work_log_course_id = ?`;
        params.push(courseId);
      }

      query += ` GROUP BY wlc.work_log_course_id`;

      const [rows] = await pool.promise().query<RowDataPacket[]>(query, params);
      return rows;
    } catch (error) {
      console.error('Error getting work log stats:', error);
      throw error;
    }
  },
  async checkWorklogCodeExists(code: string): Promise<RowDataPacket[]> {
    try {
      console.log("row 232, work_log_coursemodel.ts, calling checkWorklogCodeExists()");
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>(
          'SELECT 1 FROM work_log_courses WHERE code = ?',
          [code],
        );
      return rows;
    } catch (error) {
      console.error('Error checking worklog code:', error);
      throw error;
    }
  },
  async getWorkLogCoursesByInstructor(email: string): Promise<WorkLogCourse[]> {
    try {
      console.log("row 247, work_log_coursemodel.ts, calling getWorkLogCoursesByInstructor()");
      const [rows] = await pool.promise().query<WorkLogCourse[]>(
        `SELECT wlc.*
                         FROM work_log_courses wlc
                         JOIN work_log_course_instructors wci ON wlc.work_log_course_id = wci.work_log_course_id
                         JOIN users u ON u.userid = wci.userid
                         WHERE u.email = ?
                         ORDER BY wlc.start_date DESC`,
        [email],
      );
      return rows;
    } catch (error) {
      console.error('Error getting instructor worklog courses:', error);
      throw error;
    }
  },
  async getActiveCoursesByStudentEmail(
    email: string,
  ): Promise<WorkLogCourse[]> {
    try {
      console.log("row 267, work_log_coursemodel.ts, calling getActiveCoursesByStudentEmail()");
      const [rows] = await pool.promise().query<WorkLogCourse[]>(
        `SELECT wlc.*
                          FROM work_log_courses wlc
                           JOIN work_log_course_users wlcu ON wlc.work_log_course_id = wlcu.work_log_course_id
                           JOIN users u ON wlcu.userid = u.userid
                           WHERE u.email = ? AND wlc.end_date >= CURDATE()
                           ORDER BY wlc.start_date DESC`,
        [email],
      );
      return rows;
    } catch (error) {
      console.error('Error getting active courses by student email:', error);
      throw error;
    }
  },
};

export default work_log_courses;
