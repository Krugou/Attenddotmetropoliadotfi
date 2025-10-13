import {RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');
const coursetopicsModel = {
  /**
   * Checks if a course-topic relation exists.
   * @param courseId - The ID of the course.
   * @param topicId - The ID of the topic.
   * @returns A promise that resolves to the existing course-topic relation, if found.
   */
  async checkIfCourseTopicRelationExists(courseId: number, topicId: number) {
    console.log("row 13, coursetopicmodel.ts, checkIfCourseTopicRelationExists() called");
    const [existingCourseTopicRelation] = await pool
      .promise()
      .query<RowDataPacket[]>(
        'SELECT * FROM coursetopics WHERE courseid = ? AND topicid = ?',
        [courseId, topicId],
      );

    return existingCourseTopicRelation;
  },
  /**
   * Inserts a new course-topic relation.
   * @param courseId - The ID of the course.
   * @param topicId - The ID of the topic.
   * @returns A promise that resolves to the result of the insertion.
   */
  async insertCourseTopic(courseId: number, topicId: number) {
    console.log("row 30, coursetopicmodel.ts, insertCourseTopic() called");
    const result = await pool
      .promise()
      .query('INSERT INTO coursetopics (courseid, topicid) VALUES (?, ?)', [
        courseId,
        topicId,
      ]);

    return result;
  },
};

export default coursetopicsModel;
