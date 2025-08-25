import {FieldPacket, ResultSetHeader, RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';
const pool = createPool('ADMIN');
/**
 * @interface Topic
 * @description Defines the structure of a Topic object.
 */
interface Topic {
  topicid: number;
  topicname: string;
  // other fields...
}
/**
 * @interface TopicModel
 * @description Defines the structure of a TopicModel object.
 */
interface TopicModel {
  fetchAllTopics(): Promise<[RowDataPacket[], FieldPacket[]]>;
  findByTopicId(id: number): Promise<Topic | null>;
  insertIntoTopic(topicname: string): Promise<void>;
  updateTopicName(id: number, topicname: string): Promise<void>;
  deleteByTopicId(id: number): Promise<void>;
  countTopics(): Promise<number>;
  findTopicIdUsingTopicName(topic: string): Promise<RowDataPacket[] | null>;
  insertTopic(topic: string): Promise<ResultSetHeader>;
  checkIfTopicExists(topic: string): Promise<RowDataPacket[] | null>;

  getTopicNamesByUsercourseid(usercourseid: number): Promise<RowDataPacket[]>;

  // other methods...
}

/**
 * @description TopicModel implementation.
 */
const topicModel: TopicModel = {
  /**
   * @method fetchAllTopics
   * @description Fetches all topics from the database.
   * @returns {Promise<[RowDataPacket[], FieldPacket[]]>} A promise that resolves to an array of RowDataPacket and FieldPacket.
   */
  async fetchAllTopics() {
    try {
      console.log("row 44, topicmodel.ts, fetchAllTopics()");
      return await pool
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM topics');
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * @method findByTopicId
   * @description Finds a topic by its ID.
   * @param {number} id - The ID of the topic to find.
   * @returns {Promise<Topic | null>} A promise that resolves to a Topic object or null if the topic is not found.
   */
  async findByTopicId(id) {
    try {
      console.log("row 61, topicmodel.ts, findByTopicId()");
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM topics WHERE topicid = ?', [id]);
      return (rows[0] as Topic) || null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * @method insertIntoTopic
   * @description Inserts a new topic into the database.
   * @param {string} topicname - The name of the topic to insert.
   * @returns {Promise<void>} A promise that resolves when the insertion is complete.
   */
  async insertIntoTopic(topicname) {
    try {
      console.log("row 79, topicmodel.ts, insertIntoTopic()");
      await pool
        .promise()
        .query('INSERT INTO topics (topicname) VALUES (?)', [topicname]);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  /**
   * @method updateTopicName
   * @description Updates the name of a topic.
   * @param {number} id - The ID of the topic to update.
   * @param {string} topicname - The new name of the topic.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  async updateTopicName(id, topicname) {
    try {
      console.log("row 98, topicmodel.ts, updateTopicName()");
      await pool
        .promise()
        .query('UPDATE topics SET topicname = ? WHERE topicid = ?', [
          topicname,
          id,
        ]);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * @method deleteByTopicId
   * @description Deletes a topic by its ID.
   * @param {number} id - The ID of the topic to delete.
   * @returns {Promise<void>} A promise that resolves when the deletion is complete.
   */
  async deleteByTopicId(id) {
    try {
      console.log("row 118, topicmodel.ts, deleteByTopicId()");
      await pool.promise().query('DELETE FROM topics WHERE topicid = ?', [id]);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * @method countTopics
   * @description Counts the number of topics in the database.
   * @returns {Promise<number>} A promise that resolves to the number of topics.
   */
  async countTopics() {
    try {
      console.log("row 132, topicmodel.ts, countTopics()");
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>('SELECT COUNT(*) as count FROM topics');
      return rows[0].count;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Checks if a topic exists.
   * @param topic - The name of the topic.
   * @returns A promise that resolves to the existing topic, if any.
   */
  async checkIfTopicExists(topic: string) {
    console.log("row 148, topicmodel.ts, checkIfTopicExists()");
    const [existingCourseTopic] = await pool
      .promise()
      .query<RowDataPacket[]>('SELECT * FROM topics WHERE topicname = ?', [
        topic,
      ]);
    return existingCourseTopic;
  },
  /**
   * Inserts a topic.
   * @param topic - The name of the topic.
   * @returns A promise that resolves when the insertion is complete.
   */
  async insertTopic(topic: string) {
    console.log("row 162, topicmodel.ts, insertTopic()");
    const [topicResult] = await pool
      .promise()
      .query<ResultSetHeader>('INSERT INTO topics (topicname) VALUES (?)', [
        topic,
      ]);

    return topicResult;
  },
  /**
   * Finds a topic ID using the topic name.
   * @param topic - The name of the topic.
   * @returns A promise that resolves to the topic ID.
   */
  async findTopicIdUsingTopicName(topic: string) {
    console.log("row 177, topicmodel.ts, findTopicIdUsingTopicName()");
    const [topicResult] = await pool
      .promise()
      .query<RowDataPacket[]>(
        'SELECT topicid FROM topics WHERE topicname = ?',
        [topic],
      );
    return topicResult;
  },
  /**
   * Gets topic names by user course ID.
   * @param usercourseid - The ID of the user course.
   * @returns A promise that resolves to the topic names.
   */
  async getTopicNamesByUsercourseid(usercourseid: number) {
    console.log("row 192, topicmodel.ts, getTopicNamesByUsercourseid()");
    const [topicResult] = await pool.promise().query<RowDataPacket[]>(
      `SELECT
				topics.topicid,
				topics.topicname
			FROM
				usercourses
			JOIN
				courses ON usercourses.courseid = courses.courseid
			JOIN
				coursetopics ON coursetopics.courseid = courses.courseid
			JOIN
				topics ON coursetopics.topicid = topics.topicid
			WHERE
				usercourses.usercourseid = ?;`,
      [usercourseid],
    );
    return topicResult;
  },
  // other methods...
};

export default topicModel;
