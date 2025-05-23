import {RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');
/**
 * Model for managing topics in groups.
 */
const topicsingroupModel = {
  /**
   * Checks if a topic is already in a group.
   * @param topicGroupId - The ID of the topic group.
   * @param topicId - The ID of the topic.
   * @returns A promise that resolves to the existing topic in the group, if any.
   */
  async checkIfTopicInGroupExists(topicGroupId: number, topicId: number) {
    const [existingTopicInGroup] = await pool
      .promise()
      .query<RowDataPacket[]>(
        'SELECT * FROM topicsingroup WHERE topicgroupid = ? AND topicid = ?',
        [topicGroupId, topicId],
      );

    // console.log(
    // 	'🚀 ~ file: topicingroupmodel.ts:14 ~ checkIfTopicInGroupExists ~ existingTopicInGroup:',
    // 	existingTopicInGroup,
    // );
    return existingTopicInGroup;
  },
  /**
   * Inserts a topic into a group.
   * @param topicGroupId - The ID of the topic group.
   * @param topicId - The ID of the topic.
   * @returns A promise that resolves when the insertion is complete.
   */
  async insertTopicInGroup(topicGroupId: number, topicId: number) {
    // console.log('inserting topic in group');
    // console.log(topicGroupId, topicId);
    const [result] = await pool
      .promise()
      .query(
        'INSERT INTO topicsingroup (topicgroupid, topicid) VALUES (?, ?)',
        [topicGroupId, topicId],
      );

    return result;
  },
};

export default topicsingroupModel;
