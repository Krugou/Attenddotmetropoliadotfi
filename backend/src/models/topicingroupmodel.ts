//model
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN'); // DB pool (ADMIN connection)

const topicsingroupModel = {
  // Check if a topic is already linked to a topic group
  async checkIfTopicInGroupExists(topicGroupId: number, topicId: number) {
    console.log('row 16, topicingroupmodel.ts, checkIfTopicInGroupExists() called');
    const [existingTopicInGroup] = await pool
      .promise()
      .query<RowDataPacket[]>(
        'SELECT * FROM topicsingroup WHERE topicgroupid = ? AND topicid = ?',
        [topicGroupId, topicId],
      );
    return existingTopicInGroup; // rows (empty if not linked)
  },

  // Link a topic to a topic group
  async insertTopicInGroup(topicGroupId: number, topicId: number) {
    console.log('row 33, topicingroupmodel.ts, insertTopicInGroup() called');
    const [result] = await pool
      .promise()
      .query<ResultSetHeader>(
        'INSERT INTO topicsingroup (topicgroupid, topicid) VALUES (?, ?)',
        [topicGroupId, topicId],
      );
    return result; // insert result (insertId, affectedRows, etc.)
  },
};

export default topicsingroupModel;
