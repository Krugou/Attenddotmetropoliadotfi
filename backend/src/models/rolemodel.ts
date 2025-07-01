import {RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');
/**
 * Role interface.
 */
interface Role {
  roleid: number;
  rolename: string;
  // other fields...
}

/**
 * RoleModel interface.
 */
interface RoleModel {
  /**
   * Finds a role by its ID.
   * @param id - The ID of the role.
   * @returns A promise that resolves to the role or null if not found.
   */
  findByRoleId(id: number): Promise<Role | null>;

  /**
   * Inserts a new role.
   * @param rolename - The name of the role.
   * @returns A promise that resolves when the insertion is complete.
   */
  insertIntoRole(rolename: string): Promise<void>;

  /**
   * Fetches roles for teachers and counselors.
   * @returns A promise that resolves to an array of roles.
   */
  fetchTeacherAndCounselorRoles(): Promise<RowDataPacket[]>;

  /**
   * Fetches all roles.
   * @returns A promise that resolves to an array of all roles.
   */
  fetchAllRoles(): Promise<RowDataPacket[]>;

  // other methods...
}
const roleModel: RoleModel = {
  /**
   * Fetches all roles.
   * @returns A promise that resolves to an array of all roles.
   */
  async fetchAllRoles() {
    try {
      console.log("row 53, rolemodel.ts, fetchAllRoles()");
      const [results] = await pool
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM roles');
      return results;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Fetches roles for teachers and counselors.
   * @returns A promise that resolves to an array of roles.
   */
  async fetchTeacherAndCounselorRoles() {
    try {
      console.log("row 69, rolemodel.ts, fetchTeacherAndCounselorRoles()");
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>(
          "SELECT * FROM roles WHERE name IN ('teacher', 'counselor')",
        );
      return rows;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Finds a role by its ID.
   * @param id - The ID of the role.
   * @returns A promise that resolves to the role or null if not found.
   */
  async findByRoleId(id) {
    try {
      console.log("row 88, rolemodel.ts, findByRoleId()");
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM roles WHERE roleid = ?', [id]);
      return (rows[0] as Role) || null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Inserts a new role.
   * @param rolename - The name of the role.
   * @returns A promise that resolves when the insertion is complete.
   */
  async insertIntoRole(rolename) {
    try {
      console.log("row 105, rolemodel.ts, insertIntoRole()");
      await pool
        .promise()
        .query('INSERT INTO roles (rolename) VALUES (?)', [rolename]);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // other methods...
};

export default roleModel;
