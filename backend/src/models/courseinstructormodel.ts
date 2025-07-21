import {ResultSetHeader} from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');
const courseinstructorsModel = {
  /**
   * Inserts a new course instructor.
   *
   * @param {number} instructoruserid - The ID of the instructor.
   * @param {number} courseId - The ID of the course.
   * @returns {Promise<ResultSetHeader>} A promise that resolves with the result of the insertion.
   */
  async insertCourseInstructor(instructoruserid: number, courseId: number) {
    console.log("row 14, courseinstructorsmodel.ts, insertCourseInstructor() called");
    const [instructorResult] = await pool
      .promise()
      .query<ResultSetHeader>(
        'INSERT INTO courseinstructors (userid, courseid) VALUES (?, ?)',
        [instructoruserid, courseId],
      );

    return instructorResult;
  },
};

export default courseinstructorsModel;
