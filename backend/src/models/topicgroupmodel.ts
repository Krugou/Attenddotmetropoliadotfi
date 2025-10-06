import {FieldPacket, ResultSetHeader, RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');
/**
 * @method countTopics
 * @description Counts the number of topics in the database.
 * @returns {Promise<number>} A promise that resolves to the number of topics.
 */
interface TopicGroup {
  topicgroupid: number;
  topicgroupname: string;
  // other fields...
}
/**
 * @interface TopicGroupModel
 * @description Defines the structure of a TopicGroupModel object.
 */
interface TopicGroupModel {
  /**
   * Fetches all topic groups.
   * @returns A promise that resolves to an array of topic groups.
   */
  fetchAllTopicGroups(): Promise<[RowDataPacket[], FieldPacket[]]>;

  /**
   * Finds a topic group by its ID.
   * @param id - The ID of the topic group.
   * @returns A promise that resolves to the topic group, if found.
   */
  findByTopicGroupId(id: number): Promise<TopicGroup | null>;

  /**
   * Fetches all topic groups with their topics.
   * @returns A promise that resolves to an array of topic groups with their topics.
   */
  fetchAllTopicGroupsWithTopics(): Promise<RowDataPacket[]>;

  /**
   * Fetches all topic groups with their topics by user ID.
   * @param userid - The ID of the user.
   * @returns A promise that resolves to an array of topic groups with their topics for the user.
   */
  fetchAllTopicGroupsWithTopicsByUserId(
    userid: number,
  ): Promise<RowDataPacket[]>;

  /**
   * Inserts a new topic group.
   * @param topicgroup - The name of the topic group.
   * @param topicgroupowner - The ID of the owner of the topic group.
   * @returns A promise that resolves to the result of the insertion.
   */
  insertTopicGroup(
    topicgroup: string,
    topicgroupowner: number,
  ): Promise<ResultSetHeader>;

  /**
   * Checks if a topic group exists.
   * @param topicgroup - The name of the topic group.
   * @param userid - The ID of the user.
   * @returns A promise that resolves to the existing topic group, if found.
   */
  checkIfTopicGroupExists(
    topicgroup: string,
    userid: number,
  ): Promise<RowDataPacket[]>;

  /**
   * Deletes a topic group by its name.
   * @param topicgroup - The name of the topic group.
   * @param userid - The ID of the user.
   * @returns A promise that resolves when the deletion is complete.
   */
  deleteTopicGroupByName(
    topicgroup: string,
    userid: number | undefined,
  ): Promise<ResultSetHeader>;
}
/**
 * @description TopicGroupModel implementation.
 */
const topicGroupModel: TopicGroupModel = {
  /**
   * @method fetchAllTopicGroups
   * @description Fetches all topic groups from the database.
   * @returns {Promise<[RowDataPacket[], FieldPacket[]]>} A promise that resolves to an array of RowDataPacket and FieldPacket.
   */
  async fetchAllTopicGroups() {
    try {
      console.log("row 92, topicgroupmodel.ts, fetchAllTopicGroups()");
      return await pool
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM topicgroups');
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * @method fetchAllTopicGroupsWithTopics
   * @description Fetches all topic groups and their associated topics from the database.
   * @returns {Promise<[RowDataPacket[], FieldPacket[]]>} A promise that resolves to an array of RowDataPacket and FieldPacket.
   */
  async fetchAllTopicGroupsWithTopics() {
    try {
      console.log("row 108, topicgroupmodel.ts, fetchAllTopicGroupsWithTopics()");
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>(
          'SELECT topicgroups.topicgroupname, GROUP_CONCAT(topics.topicname) as topics FROM topicgroups LEFT JOIN topicsingroup ON topicgroups.topicgroupid = topicsingroup.topicgroupid LEFT JOIN topics ON topicsingroup.topicid = topics.topicid GROUP BY topicgroups.topicgroupid',
        );

      return rows;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  async fetchAllTopicGroupsWithTopicsByUserId(userid: number) {
    try {
      console.log("row 123, topicgroupmodel.ts, fetchAllTopicGroupsWithTopicsByUserId()");
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>(
          'SELECT topicgroups.topicgroupname, GROUP_CONCAT(topics.topicname) as topics FROM topicgroups LEFT JOIN topicsingroup ON topicgroups.topicgroupid = topicsingroup.topicgroupid LEFT JOIN topics ON topicsingroup.topicid = topics.topicid WHERE topicgroups.userid = ? GROUP BY topicgroups.topicgroupid',
          [userid],
        );

      return rows;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * @method findByTopicGroupId
   * @description Finds a topic group by its ID.
   * @param {number} id - The ID of the topic group to find.
   * @returns {Promise<TopicGroup | null>} A promise that resolves to a TopicGroup object or null if the topic group is not found.
   */
  async findByTopicGroupId(id) {
    try {
      console.log("row 145, topicgroupmodel.ts, findByTopicGroupId()");
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>(
          'SELECT * FROM topicgroups WHERE topicgroupid = ?',
          [id],
        );
      return (rows[0] as TopicGroup) || null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  async checkIfTopicGroupExists(topicgroup: string, userid: number) {
    console.log("row 160, topicgroupmodel.ts, checkIfTopicGroupExists()");
    const [existingTopic] = await pool
      .promise()
      .query<RowDataPacket[]>(
        'SELECT * FROM topicgroups WHERE topicgroupname = ? AND userid = ?',
        [topicgroup, userid],
      );

    return existingTopic;
  },
  async insertTopicGroup(topicgroup: string, topicgroupowner: number) {
    console.log("row 171, topicgroupmodel.ts, insertTopicGroup()");
    const [topicResult] = await pool
      .promise()
      .query<ResultSetHeader>(
        'INSERT INTO topicgroups (topicgroupname, userid) VALUES (?, ?)',
        [topicgroup, topicgroupowner],
      );

    return topicResult;
  },
  async deleteTopicGroupByName(topicgroup: string, userid: number | undefined) {
    console.log("row 182, topicgroupmodel.ts, deleteTopicGroupByName()");
    const [topicResult] = await pool
      .promise()
      .query<ResultSetHeader>(
        'DELETE FROM topicgroups WHERE topicgroupname = ? AND userid = ?',
        [topicgroup, userid],
      );

    return topicResult;
  },
  // other methods...
};

export default topicGroupModel;
