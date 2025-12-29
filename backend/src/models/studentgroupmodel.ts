import { ResultSetHeader, RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN'); // DB connection (ADMIN pool)

//Types
interface StudentGroup {
  studentgroupid: number;
  // Note: DB column is `group_name`; this interface uses `studentgroupname` for legacy compatibility
  studentgroupname: string;
}

// Public API
interface StudentGroupModel {
  findByStudentGroupId(id: number): Promise<StudentGroup | null>;
  insertIntoStudentGroup(studentgroupname: string): Promise<{ insertId: number }>;
  checkIfGroupNameExists(group_name: string): Promise<RowDataPacket[] | null>;
  fetchAllStudentGroups(): Promise<RowDataPacket[]>;
}

// Model: studentgroups
const studentGroupModel: StudentGroupModel = {
  // Get all student groups
  async fetchAllStudentGroups() {
    try {
      console.log('row 52, studentgroupmodel.ts, fetchAllStudentGroups()');
      const [results] = await pool.promise().query<RowDataPacket[]>(
        'SELECT * FROM studentgroups',
      );
      return results;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Check if a group with the given name already exists
  async checkIfGroupNameExists(group_name: string) {
    console.log('row 68, studentgroupmodel.ts, checkIfGroupNameExists()');
    const [existingGroup] = await pool
      .promise()
      .query<RowDataPacket[]>(
        'SELECT * FROM studentgroups WHERE group_name = ?',
        [group_name],
      );

    return existingGroup;
  },

  // Find a student group by its ID
  async findByStudentGroupId(id) {
    try {
      console.log('row 85, studentgroupmodel.ts, findByStudentGroupId()');
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        'SELECT * FROM studentgroups WHERE studentgroupid = ?',
        [id],
      );
      return (rows[0] as StudentGroup) || null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Insert a new student group and return the new group's ID
  async insertIntoStudentGroup(
    studentgroupname: string,
  ): Promise<{ insertId: number }> {
    try {
      console.log('row 107, studentgroupmodel.ts, insertIntoStudentGroup()');
      const [fields] = await pool
        .promise()
        .query('INSERT INTO studentgroups (group_name) VALUES (?)', [
          studentgroupname,
        ]);
      return { insertId: (fields as ResultSetHeader).insertId };
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
};

export default studentGroupModel;
