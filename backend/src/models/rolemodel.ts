import { RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';

// DB pool (ADMIN connection)
const pool = createPool('ADMIN');

// Types
interface Role {
  roleid: number;
  rolename: string;
}

// Public API for role model
interface RoleModel {
  // Find a role by its numeric ID
  findByRoleId(id: number): Promise<Role | null>;

  // Insert a new role (by name)
  insertIntoRole(rolename: string): Promise<void>;

  // Get only teacher & counselor roles
  fetchTeacherAndCounselorRoles(): Promise<RowDataPacket[]>;

  // Get all roles
  fetchAllRoles(): Promise<RowDataPacket[]>;
}

const roleModel: RoleModel = {
  // Get all roles
  async fetchAllRoles() {
    try {
      console.log('row 53, rolemodel.ts, fetchAllRoles()');
      const [results] = await pool.promise().query<RowDataPacket[]>('SELECT * FROM roles');
      return results;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Get only teacher and counselor roles
  // NOTE: This query uses column "name". If your schema uses "rolename", update accordingly.
  async fetchTeacherAndCounselorRoles() {
    try {
      console.log('row 69, rolemodel.ts, fetchTeacherAndCounselorRoles()');
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>("SELECT * FROM roles WHERE name IN ('teacher', 'counselor')");
      return rows;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Find a single role by roleid
  async findByRoleId(id: number) {
    try {
      console.log('row 88, rolemodel.ts, findByRoleId()');
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM roles WHERE roleid = ?', [id]);
      return (rows[0] as Role) || null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Insert a new role row
  async insertIntoRole(rolename: string) {
    try {
      console.log('row 105, rolemodel.ts, insertIntoRole()');
      await pool.promise().query('INSERT INTO roles (rolename) VALUES (?)', [rolename]);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
};

export default roleModel;
