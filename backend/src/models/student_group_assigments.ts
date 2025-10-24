import { ResultSetHeader, RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');

// Model
const student_group_assignments = {
  // Add a student to a group (join-table insert)
  async assignStudentToGroup(groupId: number, userId: number): Promise<ResultSetHeader> {
    try {
      console.log('row 13, student_group_assignments.ts, assignStudentToGroup');
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

  // Remove a student from a group
  async removeStudentFromGroup(groupId: number, userId: number): Promise<ResultSetHeader> {
    try {
      console.log('row 32, student_group_assignments.ts, removeStudentFromGroup');
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

  // Get all members of a given group
  async getGroupMembers(groupId: number): Promise<RowDataPacket[]> {
    try {
      console.log('row 47, student_group_assignments.ts, getGroupMembers');
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        `SELECT u.*
         FROM users u
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
};

export default student_group_assignments;
