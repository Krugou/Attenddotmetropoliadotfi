//model
import { FieldPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN'); // DB pool for ADMIN connection

// Types
export interface TopicGroup {
  topicgroupid: number;
  topicgroupname: string;
}

export interface TopicGroupModel {
  fetchAllTopicGroups(): Promise<[RowDataPacket[], FieldPacket[]]>;
  findByTopicGroupId(id: number): Promise<TopicGroup | null>;
  fetchAllTopicGroupsWithTopics(): Promise<RowDataPacket[]>;
  fetchAllTopicGroupsWithTopicsByUserId(userid: number): Promise<RowDataPacket[]>;
  insertTopicGroup(topicgroup: string, topicgroupowner: number): Promise<ResultSetHeader>;
  checkIfTopicGroupExists(topicgroup: string, userid: number): Promise<RowDataPacket[]>;
  deleteTopicGroupByName(topicgroup: string, userid: number | undefined): Promise<ResultSetHeader>;
}

// SQL statements (centralized for reuse)
const SQL = {
  allTopicGroups: 'SELECT * FROM topicgroups',

  // Groups + aggregated topic names
  groupsWithTopics: `
    SELECT tg.topicgroupname, GROUP_CONCAT(t.topicname) AS topics FROM topicgroups tg
        LEFT JOIN topicsingroup tig ON tg.topicgroupid = tig.topicgroupid
        LEFT JOIN topics t ON tig.topicid = t.topicid
    GROUP BY tg.topicgroupid`,

  // Same aggregation but scoped to owner
  groupsWithTopicsByUser: `
    SELECT tg.topicgroupname, GROUP_CONCAT(t.topicname) AS topics FROM topicgroups tg
        LEFT JOIN topicsingroup tig ON tg.topicgroupid = tig.topicgroupid
        LEFT JOIN topics t ON tig.topicid = t.topicid
    WHERE tg.userid = ?
    GROUP BY tg.topicgroupid`,

  byId: 'SELECT * FROM topicgroups WHERE topicgroupid = ? LIMIT 1',
  existsByNameAndUser: 'SELECT * FROM topicgroups WHERE topicgroupname = ? AND userid = ?',
  insert: 'INSERT INTO topicgroups (topicgroupname, userid) VALUES (?, ?)',
  deleteByNameAndUser: 'DELETE FROM topicgroups WHERE topicgroupname = ? AND userid = ?',
} as const;

// Query helpers
const queryRows = async <T extends RowDataPacket[]>(sql: string, params: unknown[] = []): Promise<T> => {
  const [rows] = await pool.promise().query<T>(sql, params);
  return rows; // rows only (no field packets)
};

// For APIs that need field metadata too
const queryWithFields = (sql: string): Promise<[RowDataPacket[], FieldPacket[]]> =>
  pool.promise().query<RowDataPacket[]>(sql);

// Model implementation
const topicGroupModel: TopicGroupModel = {
  // Return all topic groups (rows + field packets)
  async fetchAllTopicGroups() {
    console.log('row 62, topicgroupmodel.ts, fetchAllTopicGroups() called');
    return queryWithFields(SQL.allTopicGroups);
  },

  // Return all topic groups with aggregated topic names
  async fetchAllTopicGroupsWithTopics() {
    console.log('row 68, topicgroupmodel.ts, fetchAllTopicGroupsWithTopics() called');
    return queryRows<RowDataPacket[]>(SQL.groupsWithTopics);
  },

  // Return topic groups (owned by user) with aggregated topic names
  async fetchAllTopicGroupsWithTopicsByUserId(userid: number) {
    console.log('row 74, topicgroupmodel.ts, fetchAllTopicGroupsWithTopicsByUserId() called');
    return queryRows<RowDataPacket[]>(SQL.groupsWithTopicsByUser, [userid]);
  },

  // Find a single topic group by id
  async findByTopicGroupId(id: number) {
    console.log('row 80, topicgroupmodel.ts, findByTopicGroupId() called');
    const rows = await queryRows<RowDataPacket[]>(SQL.byId, [id]);
    return (rows[0] as TopicGroup) || null;
  },

  // Check if a group name exists for a given user (owner)
  async checkIfTopicGroupExists(topicgroup: string, userid: number) {
    console.log('row 86, topicgroupmodel.ts, checkIfTopicGroupExists() called');
    return queryRows<RowDataPacket[]>(SQL.existsByNameAndUser, [topicgroup, userid]);
  },

  // Create a new topic group
  async insertTopicGroup(topicgroup: string, topicgroupowner: number) {
    console.log('row 92, topicgroupmodel.ts, insertTopicGroup() called');
    const [result] = await pool.promise().query<ResultSetHeader>(SQL.insert, [topicgroup, topicgroupowner]);
    return result;
  },

  // Delete a topic group by name for a specific user
  async deleteTopicGroupByName(topicgroup: string, userid: number | undefined) {
    console.log('row 100, topicgroupmodel.ts, deleteTopicGroupByName() called');
    const [result] = await pool.promise().query<ResultSetHeader>(SQL.deleteByNameAndUser, [topicgroup, userid]);
    return result;
  },
};

export default topicGroupModel;
