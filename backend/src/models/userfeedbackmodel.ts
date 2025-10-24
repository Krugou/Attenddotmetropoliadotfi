//model
import { RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');

const userFeedBackModel = {
  // Fetch all feedback entries with the author's email
  async getUserFeedback() {
    console.log('row 16, userfeedbackmodel.ts, getUserFeedback() called');
    const [rows] = await pool.promise().query<RowDataPacket[]>(
      `SELECT uf.*, u.email
       FROM user_feedback uf
              INNER JOIN users u ON uf.userid = u.userid`,
      [],
    );
    return rows;
  },

  // Insert a new feedback entry for a given user
  async insertUserFeedback(userId: number, topic: string, text: string) {
    console.log('row 36, userfeedbackmodel.ts, insertUserFeedback() called');
    const result = await pool
      .promise()
      .query(
        'INSERT INTO user_feedback (userid, topic, text) VALUES (?, ?, ?)',
        [userId, topic, text],
      );
    return result;
  },

  // Delete a feedback entry by its primary key
  async deleteUserFeedback(feedbackId: number) {
    console.log('row 46, userfeedbackmodel.ts, deleteUserFeedback() called');
    const result = await pool
      .promise()
      .query('DELETE FROM user_feedback WHERE feedbackId = ?', [feedbackId]);
    return result;
  },

  // Return total number of feedback entries
  async countUserFeedback() {
    console.log('row 59, userfeedbackmodel.ts, countUserFeedback() called');
    const [rows] = await pool
      .promise()
      .query<RowDataPacket[]>('SELECT COUNT(*) as count FROM user_feedback', []);
    return (rows[0] as RowDataPacket & { count: number }).count;
  },
};

export default userFeedBackModel;
