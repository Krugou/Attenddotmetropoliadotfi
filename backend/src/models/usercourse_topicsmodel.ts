//model
import { RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');

// SQL statements
const SQL = {
  // Does a relation exist for this usercourse + topic?
  exists: 'SELECT * FROM usercourse_topics WHERE usercourseid = ? AND topicid = ?',

  // Remove all topic relations for a usercourse
  deleteByUsercourse: 'DELETE FROM usercourse_topics WHERE usercourseid = ?',

  // Create a new usercourse ↔ topic relation
  insert: 'INSERT INTO usercourse_topics (usercourseid, topicid) VALUES (?, ?)',

  // List topics (id + name) linked to a usercourse
  findByUsercourse: `
    SELECT t.topicname, t.topicid
    FROM topics t
           JOIN usercourse_topics uct ON uct.topicid = t.topicid
    WHERE uct.usercourseid = ?`,
} as const;

// Helpers
// Use provided transaction connection if present, otherwise the pool
const useConn = (connection?: any) => (connection ? connection : pool.promise());

// model
const usercourse_topicsModel = {
  // Check if a specific usercourse-topic relation exists
  async checkIfUserCourseTopicExists(usercourseid: number, topicId: number) {
    console.log('row 25, usercourse_topicsmodel.ts, checkIfUserCourseTopicExists() called');
    const [rows] = await pool.promise().query<RowDataPacket[]>(SQL.exists, [usercourseid, topicId]);
    return rows;
  },

  // Delete all topic relations for a usercourse (optionally within a tx)
  async deleteUserCourseTopic(usercourseid: number, connection?: any) {
    console.log('row 32, usercourse_topicsmodel.ts, deleteUserCourseTopic() called');
    return useConn(connection).query(SQL.deleteByUsercourse, [usercourseid]);
  },

  // Insert a usercourse-topic relation (optionally within a tx)
  async insertUserCourseTopic(usercourseid: number, topicId: number, connection?: any) {
    console.log('row 45, usercourse_topicsmodel.ts, insertUserCourseTopic() called');
    return useConn(connection).query(SQL.insert, [usercourseid, topicId]);
  },

  // Fetch topics linked to a given usercourse
  async findUserCourseTopicByUserCourseId(usercourseid: number) {
    console.log('row 52, usercourse_topicsmodel.ts, findUserCourseTopicByUserCourseId() called');
    const [rows] = await pool.promise().query<RowDataPacket[]>(SQL.findByUsercourse, [usercourseid]);
    return rows;
  },
};

export default usercourse_topicsModel;
