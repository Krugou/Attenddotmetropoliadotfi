import {ResultSetHeader, RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';

// Create pool with admin privileges since we need full access
const pool = createPool('ADMIN');

// Helper function to format dates for MySQL
const formatDateForMySQL = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

// Interfaces for type safety
interface WorkLogCourse extends RowDataPacket {
  work_log_course_id: number;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  code: string;
  created_at: Date;
  required_hours: number;
}

interface WorkLogEntry extends RowDataPacket {
  entry_id: number;
  userid: number;
  work_log_course_id: number;
  start_time: Date;
  end_time: Date;
  description: string;
  status: 0 | 1 | 2 | 3; // 0=pending, 1=approved, 2=rejected, 3=submitted
}

interface WorkLogCourseUser extends RowDataPacket {
  user_course_id: number;
  userid: number;
  work_log_course_id: number;
}

interface WorkLogCourseGroup extends RowDataPacket {
  group_id: number;
  work_log_course_id: number;
  group_name: string;
}

const workLogModel = {
  async createWorkLogCourse(
    name: string,
    startDate: Date | string,
    endDate: Date | string,
    code: string,
    description: string,
    required_hours: number,
  ): Promise<ResultSetHeader> {
    try {
      const formattedStartDate = formatDateForMySQL(startDate);
      const formattedEndDate = formatDateForMySQL(endDate);

      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'INSERT INTO work_log_courses (name, start_date, end_date, code, description, required_hours) VALUES (?, ?, ?, ?, ?, ?)',
          [name, formattedStartDate, formattedEndDate, code, description, required_hours],
        );
      return result;
    } catch (error) {
      console.error('Error creating work log course:', error);
      throw error;
    }
  },

  async getWorkLogCourseById(courseId: number): Promise<WorkLogCourse[]> {
    try {
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

  // Entry operations
  async createWorkLogEntry(
    userId: number,
    courseId: number,
    startTime: Date,
    endTime: Date,
    description: string,
    status: 0 | 1 | 2 | 3 = 0,
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
        .query<WorkLogEntry[]>(
          'SELECT * FROM work_log_entries WHERE userid = ?',
          [userId],
        );
      return rows;
    } catch (error) {
      console.error('Error getting work log entries:', error);
      throw error;
    }
  },

  // Course user operations
  async addUserToCourse(
    userId: number,
    courseId: number,
  ): Promise<ResultSetHeader> {
    try {
      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'INSERT INTO work_log_course_users (userid, work_log_course_id) VALUES (?, ?)',
          [userId, courseId],
        );
      return result;
    } catch (error) {
      console.error('Error adding user to course:', error);
      throw error;
    }
  },

  async getUserCourses(userId: number): Promise<WorkLogCourseUser[]> {
    try {
      const [rows] = await pool
        .promise()
        .query<WorkLogCourseUser[]>(
          'SELECT * FROM work_log_course_users WHERE userid = ?',
          [userId],
        );
      return rows;
    } catch (error) {
      console.error('Error getting user courses:', error);
      throw error;
    }
  },

  // Group operations
  async createWorkLogGroup(
    courseId: number,
    groupName: string,
  ): Promise<ResultSetHeader> {
    try {
      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'INSERT INTO work_log_course_groups (work_log_course_id, group_name) VALUES (?, ?)',
          [courseId, groupName],
        );
      return result;
    } catch (error) {
      console.error('Error creating work log group:', error);
      throw error;
    }
  },

  async assignStudentToGroup(
    groupId: number,
    userId: number,
  ): Promise<ResultSetHeader> {
    try {
      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'INSERT INTO student_group_assignments (group_id, userid) VALUES (?, ?)',
          [groupId, userId],
        );
      return result;
    } catch (error) {
      console.error('Error assigning student to group:', error);
      throw error;
    }
  },

  async getGroupMembers(groupId: number): Promise<RowDataPacket[]> {
    try {
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        `SELECT u.* FROM users u
         JOIN student_group_assignments sga ON u.userid = sga.userid
         WHERE sga.group_id = ?`,
        [groupId],
      );
      return rows;
    } catch (error) {
      console.error('Error getting group members:', error);
      throw error;
    }
  },

  // Delete operations
  async deleteWorkLogCourse(courseId: number): Promise<ResultSetHeader> {
    try {
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

  async removeUserFromCourse(
    userId: number,
    courseId: number,
  ): Promise<ResultSetHeader> {
    try {
      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'DELETE FROM work_log_course_users WHERE userid = ? AND work_log_course_id = ?',
          [userId, courseId],
        );
      return result;
    } catch (error) {
      console.error('Error removing user from course:', error);
      throw error;
    }
  },

  async deleteWorkLogGroup(groupId: number): Promise<ResultSetHeader> {
    try {
      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'DELETE FROM work_log_course_groups WHERE group_id = ?',
          [groupId],
        );
      return result;
    } catch (error) {
      console.error('Error deleting work log group:', error);
      throw error;
    }
  },

  async removeStudentFromGroup(
    groupId: number,
    userId: number,
  ): Promise<ResultSetHeader> {
    try {
      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'DELETE FROM student_group_assignments WHERE group_id = ? AND userid = ?',
          [groupId, userId],
        );
      return result;
    } catch (error) {
      console.error('Error removing student from group:', error);
      throw error;
    }
  },

  // Update operations
  async updateWorkLogCourse(
    courseId: number,
    updates: Partial<
      Pick<
        WorkLogCourse,
        'name' | 'start_date' | 'end_date' | 'code' | 'description'
      >
    >,
  ): Promise<ResultSetHeader> {
    try {
      const updateFields = Object.entries(updates)
        .map(([key]) => `${key} = ?`)
        .join(', ');
      const values = [...Object.values(updates), courseId];

      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          `UPDATE work_log_courses SET ${updateFields} WHERE work_log_course_id = ?`,
          values,
        );
      return result;
    } catch (error) {
      console.error('Error updating work log course:', error);
      throw error;
    }
  },

  async updateWorkLogEntry(
    entryId: number,
    updates: Partial<
      Pick<WorkLogEntry, 'start_time' | 'end_time' | 'description'>
    >,
  ): Promise<ResultSetHeader> {
    try {
      const updateFields = Object.entries(updates)
        .map(([key]) => `${key} = ?`)
        .join(', ');
      const values = [...Object.values(updates), entryId];

      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          `UPDATE work_log_entries SET ${updateFields} WHERE entry_id = ?`,
          values,
        );
      return result;
    } catch (error) {
      console.error('Error updating work log entry:', error);
      throw error;
    }
  },

  /**
   * Updates only the status of a work log entry
   * @param entryId The ID of the work log entry
   * @param status The new status (0=pending, 1=approved, 2=rejected, 3=submitted)
   * @returns Promise<ResultSetHeader>
   * @throws Error if entry not found
   */
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

  async updateWorkLogGroup(
    groupId: number,
    groupName: string,
  ): Promise<ResultSetHeader> {
    try {
      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'UPDATE work_log_course_groups SET group_name = ? WHERE group_id = ?',
          [groupName, groupId],
        );
      return result;
    } catch (error) {
      console.error('Error updating work log group:', error);
      throw error;
    }
  },

  // Additional list/search operations
  async getAllWorkLogCourses(): Promise<WorkLogCourse[]> {
    try {
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

  async getWorkLogEntriesByCourse(courseId: number): Promise<WorkLogEntry[]> {
    try {
      const [rows] = await pool
        .promise()
        .query<WorkLogEntry[]>(
          'SELECT * FROM work_log_entries WHERE work_log_course_id = ? ORDER BY start_time DESC',
          [courseId],
        );
      return rows;
    } catch (error) {
      console.error('Error getting work log entries by course:', error);
      throw error;
    }
  },

  async getWorkLogGroupsByCourse(
    courseId: number,
  ): Promise<WorkLogCourseGroup[]> {
    try {
      const [rows] = await pool
        .promise()
        .query<WorkLogCourseGroup[]>(
          'SELECT * FROM work_log_course_groups WHERE work_log_course_id = ?',
          [courseId],
        );
      return rows;
    } catch (error) {
      console.error('Error getting work log groups by course:', error);
      throw error;
    }
  },

  async getUserGroups(userId: number): Promise<WorkLogCourseGroup[]> {
    try {
      const [rows] = await pool.promise().query<WorkLogCourseGroup[]>(
        `SELECT g.* FROM work_log_course_groups g
         JOIN student_group_assignments sga ON g.group_id = sga.group_id
         WHERE sga.userid = ?`,
        [userId],
      );
      return rows;
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw error;
    }
  },

  async searchWorkLogCourses(searchTerm: string): Promise<WorkLogCourse[]> {
    try {
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

  async getWorkLogStatsByUser(userId: number): Promise<RowDataPacket[]> {
    try {
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        `SELECT
          wlc.name as course_name,
          COUNT(wle.entry_id) as entry_count,
          SUM(TIMESTAMPDIFF(MINUTE, wle.start_time, wle.end_time)) as total_minutes
         FROM work_log_courses wlc
         JOIN work_log_entries wle ON wlc.work_log_course_id = wle.work_log_course_id
         WHERE wle.userid = ?
         GROUP BY wlc.work_log_course_id`,
        [userId],
      );
      return rows;
    } catch (error) {
      console.error('Error getting work log stats:', error);
      throw error;
    }
  },

  async validateUserCourseAccess(
    userId: number,
    courseId: number,
  ): Promise<boolean> {
    try {
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>(
          'SELECT 1 FROM work_log_course_users WHERE userid = ? AND work_log_course_id = ?',
          [userId, courseId],
        );
      return rows.length > 0;
    } catch (error) {
      console.error('Error validating user course access:', error);
      throw error;
    }
  },

  // Add these new methods for instructor and user management
  async addInstructorsToCourse(instructors: { email: string }[], courseId: number): Promise<void> {
    try {
      for (const instructor of instructors) {
        // First get userid from email
        const [userRows] = await pool.promise().query<RowDataPacket[]>(
          'SELECT userid FROM users WHERE email = ?',
          [instructor.email]
        );

        if (userRows.length > 0) {
          const userId = userRows[0].userid;
          // Insert into work_log_course_instructors
          await pool.promise().query(
            'INSERT INTO work_log_course_instructors (userid, work_log_course_id) VALUES (?, ?)',
            [userId, courseId]
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

  async addStudentsToCourse(students: string[], courseId: number): Promise<void> {
    try {
      for (const studentEmail of students) {
        // Extract just the email if it's a string or an object
        const email = typeof studentEmail === 'string' ? 
          studentEmail : 
          (studentEmail as any).email || studentEmail;

        // Query for user ID using just the email
        const [userRows] = await pool.promise().query<RowDataPacket[]>(
          'SELECT userid FROM users WHERE email = ?',
          [email]
        );

        if (userRows.length > 0) {
          const userId = userRows[0].userid;
          // Insert into work_log_course_users
          await pool.promise().query(
            'INSERT INTO work_log_course_users (userid, work_log_course_id) VALUES (?, ?)',
            [userId, courseId]
          );
        } else {
          console.warn(`Student with email ${email} not found`);
        }
      }
    } catch (error) {
      console.error('Error adding students to course:', error);
      throw error;
    }
  },

  async getInstructorsByCourse(courseId: number): Promise<RowDataPacket[]> {
    try {
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        `SELECT u.userid, u.email, u.first_name, u.last_name 
         FROM users u
         JOIN work_log_course_instructors wci ON u.userid = wci.userid
         WHERE wci.work_log_course_id = ?`,
        [courseId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting course instructors:', error);
      throw error;
    }
  },

  async getStudentsByCourse(courseId: number): Promise<RowDataPacket[]> {
    try {
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        `SELECT u.userid, u.email, u.first_name, u.last_name 
         FROM users u
         JOIN work_log_course_users wcu ON u.userid = wcu.userid
         WHERE wcu.work_log_course_id = ?`,
        [courseId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting course students:', error);
      throw error;
    }
  },

  async checkWorklogCodeExists(code: string): Promise<RowDataPacket[]> {
    try {
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        'SELECT 1 FROM work_log_courses WHERE code = ?',
        [code]
      );
      return rows;
    } catch (error) {
      console.error('Error checking worklog code:', error);
      throw error;
    }
  },
};
export default workLogModel;
