import { ResultSetHeader } from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');

// Model
const courseinstructorsModel = {
  // Insert a row linking an instructor (userid) to a course (courseid)
  async insertCourseInstructor(instructoruserid: number, courseId: number) {
    console.log('row 14, courseinstructorsmodel.ts, insertCourseInstructor() called');

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
