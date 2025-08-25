import {RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');
/**
 * Model for managing user course topics.
 */
const usercourse_topicsModel = {
  /**
   * Checks if a user course topic exists.
   * @param usercourseid - The ID of the user course.
   * @param topicId - The ID of the topic.
   * @returns A promise that resolves to the existing user course topic, if any.
   */
  async checkIfUserCourseTopicExists(usercourseid: number, topicId: number) {
    console.log("row 16, usercourse_topicsmodel.ts, checkIfUserCourseTopicExists() called");
    const [existingUserCourseTopic] = await pool
      .promise()
      .query<RowDataPacket[]>(
        'SELECT * FROM usercourse_topics WHERE usercourseid = ? AND topicid = ?',
        [usercourseid, topicId],
      );

    return existingUserCourseTopic;
  },
  /**
   * Deletes a user course topic.
   * @param usercourseid - The ID of the user course.
   * @param connection - The database connection.
   * @returns A promise that resolves when the deletion is complete.
   */
  async deleteUserCourseTopic(usercourseid: number, connection: any) {
    console.log("row 33, usercourse_topicsmodel.ts, deleteUserCourseTopic() called");
    let result;

    if (connection) {
      result = await connection.query(
        'DELETE FROM usercourse_topics WHERE usercourseid = ?',
        [usercourseid],
      );
    } else {
      result = await pool
        .promise()
        .query('DELETE FROM usercourse_topics WHERE usercourseid = ?', [
          usercourseid,
        ]);
    }

    return result;
  },
  /**
   * Inserts a user course topic.
   * @param usercourseid - The ID of the user course.
   * @param topicId - The ID of the topic.
   * @param connection - The database connection.
   * @returns A promise that resolves when the insertion is complete.
   */

  async insertUserCourseTopic(
    usercourseid: number,
    topicId: number,
    connection: any,
  ) {
    console.log("row 64, usercourse_topicsmodel.ts, insertUserCourseTopic() called");
    let result;

    if (connection) {
      result = await connection.query(
        'INSERT INTO usercourse_topics (usercourseid, topicid) VALUES (?, ?)',
        [usercourseid, topicId],
      );
    } else {
      result = await pool
        .promise()
        .query(
          'INSERT INTO usercourse_topics (usercourseid, topicid) VALUES (?, ?)',
          [usercourseid, topicId],
        );
    }

    return result;
  },
  /**
   * Finds a user course topic by user course ID.
   * @param usercourseid - The ID of the user course.
   * @returns A promise that resolves to the user course topic, if found.
   */
  async findUserCourseTopicByUserCourseId(usercourseid: number) {
    console.log("row 89, usercourse_topicsmodel.ts, findUserCourseTopicByUserCourseId() called");
    const [rows] = await pool
      .promise()
      .query<RowDataPacket[]>(
        'SELECT topics.topicname, topics.topicid from topics JOIN usercourse_topics ON usercourse_topics.topicid = topics.topicid WHERE usercourseid = ?',
        [usercourseid],
      );

    return rows;
  },
};

export default usercourse_topicsModel;
