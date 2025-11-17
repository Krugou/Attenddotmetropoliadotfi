import { RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';

// DB pool (ADMIN connection)
const pool = createPool('ADMIN');

// Model
const coursetopicsModel = {

  // Check if a course-topic relation already exists
  async checkIfCourseTopicRelationExists(courseId: number, topicId: number) {
    console.log('row 13, coursetopicmodel.ts, checkIfCourseTopicRelationExists() called');
    const [existingCourseTopicRelation] = await pool
      .promise()
      .query<RowDataPacket[]>(
        'SELECT * FROM coursetopics WHERE courseid = ? AND topicid = ?',
        [courseId, topicId],
      );

    return existingCourseTopicRelation; // empty array if not found
  },

  // Create a course-topic relation
  async insertCourseTopic(courseId: number, topicId: number) {
    console.log('row 30, coursetopicmodel.ts, insertCourseTopic() called');
    const result = await pool
      .promise()
      .query(
        'INSERT INTO coursetopics (courseid, topicid) VALUES (?, ?)',
        [courseId, topicId],
      );

    return result; // contains insert metadata
  },
};

export default coursetopicsModel;
