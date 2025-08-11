import {ResultSetHeader, RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');
interface StudentGroup {
  studentgroupid: number;
  studentgroupname: string;
  // other fields...
}

interface StudentGroupModel {
  /**
   * Finds a student group by its ID.
   * @param id - The ID of the student group.
   * @returns A promise that resolves to the student group, if found.
   */
  findByStudentGroupId(id: number): Promise<StudentGroup | null>;

  /**
   * Inserts a new student group.
   * @param studentgroupname - The name of the student group.
   * @returns A promise that resolves to the result of the insertion.
   */
  insertIntoStudentGroup(studentgroupname: string): Promise<{insertId: number}>;

  /**
   * Checks if a group name exists.
   * @param group_name - The name of the group.
   * @returns A promise that resolves to the existing group, if found.
   */
  checkIfGroupNameExists(group_name: string): Promise<RowDataPacket[] | null>;

  /**
   * Fetches all student groups.
   * @returns A promise that resolves to an array of student groups.
   */
  fetchAllStudentGroups(): Promise<RowDataPacket[]>;

  // other methods...
}

/**
 * Represents a model for managing student groups.
 */
const studentGroupModel: StudentGroupModel = {
  /**
   * Fetches all student groups.
   * @returns A promise that resolves to an array of student groups.
   */
  async fetchAllStudentGroups() {
    try {
      console.log("row 52, studentgroupmodel.ts, fetchAllStudentGroups()");
      const [results] = await pool
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM studentgroups');
      return results;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Checks if a group name exists.
   * @param group_name - The name of the group.
   * @returns A promise that resolves to the existing group, if found.
   */
  async checkIfGroupNameExists(group_name: string) {
    console.log("row 68, studentgroupmodel.ts, checkIfGroupNameExists()");
    const [existingGroup] = await pool
      .promise()
      .query<RowDataPacket[]>(
        'SELECT * FROM studentgroups WHERE group_name = ?',
        [group_name],
      );

    return existingGroup;
  },
  /**
   * Finds a student group by its ID.
   * @param id - The ID of the student group.
   * @returns A promise that resolves to the student group, if found.
   */
  async findByStudentGroupId(id) {
    try {
      console.log("row 85, studentgroupmodel.ts, findByStudentGroupId()");
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>(
          'SELECT * FROM studentgroups WHERE studentgroupid = ?',
          [id],
        );
      return (rows[0] as StudentGroup) || null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Inserts a new student group.
   * @param studentgroupname - The name of the student group.
   * @returns A promise that resolves to the result of the insertion.
   */
  async insertIntoStudentGroup(
    studentgroupname: string,
  ): Promise<{insertId: number}> {
    try {
      console.log("row 107, studentgroupmodel.ts, insertIntoStudentGroup()");
      const [fields] = await pool
        .promise()
        .query('INSERT INTO studentgroups (group_name) VALUES (?)', [
          studentgroupname,
        ]);
      return {insertId: (fields as ResultSetHeader).insertId};
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // other methods...
};

export default studentGroupModel;
