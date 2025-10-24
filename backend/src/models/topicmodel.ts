//model
import { FieldPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN'); // DB pool (ADMIN connection)

// Types
interface Topic {
  topicid: number;
  topicname: string;
}

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
}

// SQL statements
const SQL = {
  all: 'SELECT * FROM topics',
  byId: 'SELECT * FROM topics WHERE topicid = ? LIMIT 1',
  insert: 'INSERT INTO topics (topicname) VALUES (?)',
  updateName: 'UPDATE topics SET topicname = ? WHERE topicid = ?',
  deleteById: 'DELETE FROM topics WHERE topicid = ?',
  count: 'SELECT COUNT(*) AS count FROM topics',
  existsByName: 'SELECT * FROM topics WHERE topicname = ?',
  idByName: 'SELECT topicid FROM topics WHERE topicname = ?',
  byUserCourseId: `
    SELECT t.topicid, t.topicname FROM usercourses uc
                                         JOIN courses c ON uc.courseid = c.courseid
                                         JOIN coursetopics ct ON ct.courseid = c.courseid
                                         JOIN topics t ON ct.topicid = t.topicid
    WHERE uc.usercourseid = ?`,
} as const;

// Helpers
const queryRows = async <T extends RowDataPacket[]>(
  sql: string,
  params: unknown[] = [],
): Promise<T> => {
  const [rows] = await pool.promise().query<T>(sql, params);
  return rows; // rows only
};

const exec = async (sql: string, params: unknown[] = []): Promise<void> => {
  await pool.promise().query(sql, params); // fire-and-forget (no result needed)
};

// For calls that must return [rows, fields]
const queryWithFields = (
  sql: string,
): Promise<[RowDataPacket[], FieldPacket[]]> =>
  pool.promise().query<RowDataPacket[]>(sql);

// Implementation
const topicModel: TopicModel = {
  // List all topics (returns rows + field metadata)
  fetchAllTopics() {
    console.log('row 76, topicmodel.ts, fetchAllTopics() called');
    return queryWithFields(SQL.all);
  },

  // Get a single topic by id (or null)
  async findByTopicId(id: number) {
    console.log('row 82, topicmodel.ts, findByTopicId() called');
    const rows = await queryRows<RowDataPacket[]>(SQL.byId, [id]);
    return (rows[0] as Topic) || null;
  },

  // Simple insert by name (no return)
  async insertIntoTopic(topicname: string) {
    console.log('row 88, topicmodel.ts, insertIntoTopic() called');
    await exec(SQL.insert, [topicname]);
  },

  // Update topic name
  async updateTopicName(id: number, topicname: string) {
    console.log('row 94, topicmodel.ts, updateTopicName() called');
    await exec(SQL.updateName, [topicname, id]);
  },

  // Delete topic by id
  async deleteByTopicId(id: number) {
    console.log('row 100, topicmodel.ts, deleteByTopicId() called');
    await exec(SQL.deleteById, [id]);
  },

  // Count all topics
  async countTopics() {
    console.log('row 106, topicmodel.ts, countTopics() called');
    const rows = await queryRows<RowDataPacket[]>(SQL.count);
    return (rows[0] as RowDataPacket & { count: number }).count;
  },

  // Check if topic exists by name
  async checkIfTopicExists(topic: string) {
    console.log('row 112, topicmodel.ts, checkIfTopicExists() called');
    return queryRows<RowDataPacket[]>(SQL.existsByName, [topic]);
  },

  // Insert topic and return ResultSetHeader
  async insertTopic(topic: string) {
    console.log('row 118, topicmodel.ts, insertTopic() called');
    const [result] = await pool.promise().query<ResultSetHeader>(SQL.insert, [topic]);
    return result;
  },

  // Get topic id using topic name
  async findTopicIdUsingTopicName(topic: string) {
    console.log('row 124, topicmodel.ts, findTopicIdUsingTopicName() called');
    return queryRows<RowDataPacket[]>(SQL.idByName, [topic]);
  },

  // List topics for a usercourse (derived via course -> coursetopics)
  async getTopicNamesByUsercourseid(usercourseid: number) {
    console.log('row 130, topicmodel.ts, getTopicNamesByUsercourseid() called');
    return queryRows<RowDataPacket[]>(SQL.byUserCourseId, [usercourseid]);
  },
};

export default topicModel;
