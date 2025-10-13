import {ResultSetHeader, RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN'); // Adjust the path to your pool file

export interface WorkLogCourseGroup extends RowDataPacket {
  group_id: number;
  work_log_course_id: number;
  group_name: string;
  member_count: number;
}

const work_log_course_groups = {
  async createWorkLogGroup(
    courseId: number,
    groupName: string,
  ): Promise<ResultSetHeader> {
    try {
      console.log("row 19, work_log_groupmodel.ts, createWorkLogGroup");
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

  async checkStudentsInWorklogGroup(groupId: number): Promise<RowDataPacket[]> {
    try {
      console.log("row 35, work_log_groupmodel.ts, checkStudentsInWorklogGroup");
      // First verify the group exists
      const [groupCheck] = await pool
        .promise()
        .query<
          RowDataPacket[]
        >('SELECT * FROM work_log_course_groups WHERE group_id = ?', [groupId]);

      if (!groupCheck.length) {
        console.log('Group not found:', groupId);
        return [];
      }

      // Get students with role check
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        `SELECT DISTINCT u.userid, u.email, u.first_name, u.last_name
          FROM users u
          INNER JOIN student_group_assignments sga ON u.userid = sga.userid
          INNER JOIN roles r ON u.roleid = r.roleid
          WHERE sga.group_id = ?
          ORDER BY u.last_name, u.first_name`,
        [groupId],
      );

      return rows;
    } catch (error) {
      console.error('Error checking students in worklog group:', error);
      throw error;
    }
  },

  async deleteWorkLogGroup(groupId: number): Promise<ResultSetHeader> {
    try {
      console.log("row 68, work_log_groupmodel.ts, deleteWorkLogGroup");
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

  async updateWorkLogGroup(
    groupId: number,
    groupName: string,
  ): Promise<ResultSetHeader> {
    try {
      console.log("row 87, work_log_groupmodel.ts, updateWorkLogGroup");
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

  async getWorkLogGroupsByCourse(
    courseId: number,
  ): Promise<WorkLogCourseGroup[]> {
    try {
      console.log("row 105, work_log_groupmodel.ts, getWorkLogGroupsByCourse");
      const [rows] = await pool.promise().query<WorkLogCourseGroup[]>(
        `SELECT
          wcg.*,
          COALESCE(COUNT(sga.userid), 0) as member_count
         FROM work_log_course_groups wcg
         LEFT JOIN student_group_assignments sga ON wcg.group_id = sga.group_id
         WHERE wcg.work_log_course_id = ?
         GROUP BY wcg.group_id, wcg.work_log_course_id, wcg.group_name`,
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
      console.log("row 125, work_log_groupmodel.ts, getUserGroups");
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
};

export default work_log_course_groups;
