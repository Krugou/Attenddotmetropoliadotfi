import {FieldPacket, ResultSetHeader, RowDataPacket} from 'mysql2';
import * as mysql from 'mysql2/promise';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN'); // Adjust the path to your pool file

/**
 * @interface UserInfo
 * @description Defines the structure of the UserInfo object.
 */
// Define the structure of the UserInfo object
interface UserInfo {
  username: string;
  email: string;
  staff: number;
  first_name: string;
  last_name: string;
  studentgroup?: string;
  group_name?: string | null;
  userid?: number;
  studentnumber?: string;
  role?: string;
  gdpr?: number;
  activeStatus: number;
  language: string;
  darkMode: number;
}

/**
 * @interface User
 * @description Defines the structure of the User object.
 */
interface User {
  username: string;
  email: string;
  staff: number;
  first_name: string;
  last_name: string;
  studentgroup?: string;
  group_name?: string | null;
  userid?: number;
  studentnumber?: string;
  roleid: number;
  activeStatus: number;
  language: string;
  darkMode: number;
}
interface UpdateUser {
  user: {
    userid: number;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    GDPR: number;
    roleid: number;
    staff: number;
    studentgroupid: number;
    studentnumber: string;
    activeStatus: number;
    language: string;
    darkMode: number;
  };
}

interface PaginatedStudentsResult {
  students: UserInfo[];
  total: number;
}

/**
 * @description Creates a User Model object literal.
 */
const UserModel = {
  pool: pool,

  /**
   * Updates the username of a user based on their email.
   * @param {string} email - The email of the user to update.
   * @param {string} newUsername - The new username to set for the user.
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the update was successful.
   */
  updateUsernameByEmail: async (
    email: string,
    newUsername: string,
  ): Promise<boolean> => {
    try {
      const [rows] = (await UserModel.pool
        .promise()
        .execute('UPDATE users SET username = ? WHERE email = ?', [
          newUsername,
          email,
        ])) as unknown as [ResultSetHeader, FieldPacket[]];

      return rows.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw new Error('Database error');
    }
  },

  /**
   * @method getAllUserInfo
   * @description A method to retrieve user information based on a username.
   * @param {string} username - The username of the user.
   * @returns {Promise<UserInfo | null>} A promise that resolves to the user's information or null if the user is not found.
   */
  getAllUserInfo: async (email: string): Promise<UserInfo | null> => {
    let userData: UserInfo | null = null;
    try {
      const [userRows] = await UserModel.pool
        .promise()
        .query<RowDataPacket[]>(
          `SELECT users.userid, users.username, users.email, users.first_name, users.last_name, users.created_at, users.studentnumber, users.activeStatus, users.language, users.darkMode, users.gdpr AS gdpr, roles.name AS role FROM users JOIN roles ON users.roleid = roles.roleid WHERE users.email = ?;`,
          [email],
        );

      if (userRows.length > 0) {
        userData = userRows.pop() as UserInfo;

        const [groupRows] = await UserModel.pool
          .promise()
          .query<RowDataPacket[]>(
            `SELECT studentgroups.group_name FROM studentgroups JOIN users ON users.studentgroupid = studentgroups.studentgroupid WHERE users.userid = ?;`,
            [userData.userid],
          );

        if (groupRows.length > 0) {
          userData.group_name = groupRows[0].group_name;
        } else {
          userData.group_name = 'not assigned';
        }
      }
      return userData || null;
    } catch (error) {
      console.error(error);
      throw new Error('Database error');
    }
  },
  /**
   * Updates the email of a user.
   * @param {number} userId - The ID of the user to update.
   * @param {string} newEmail - The new email to set for the user.
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the update was successful.
   */
  updateUserInfo: async (
    userId: number,
    newEmail: string,
  ): Promise<boolean> => {
    try {
      const [rows] = (await UserModel.pool.execute(
        'UPDATE users SET Useremail = ? WHERE Userid = ?',
        [newEmail, userId],
      )) as unknown as [ResultSetHeader, FieldPacket[]];

      return rows.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw new Error('Database error');
    }
  },
  /**
   * Adds a new user to the database.
   * @param {User} user - The user to add.
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the addition was successful.
   */
  addStaffUser: async (user: User): Promise<User | null> => {
    try {
      const { username, email, staff, first_name, last_name, roleid } = user;
      const language = 'en';
      const darkMode = 0;
      const activeStatus = 1;
      const result = await pool
        .promise()
        .query(
          `INSERT INTO users (
        username, email, staff, first_name, last_name, roleid,
        language, darkMode, activeStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username, email, staff, first_name, last_name, roleid,
        language, darkMode, activeStatus
      ]
        );

      const insertId = (result[0] as mysql.OkPacket).insertId;
      const [rows] = await pool.promise().query(
        `SELECT
        users.userid,
        users.username,
        users.email,
        users.first_name,
        users.last_name,
        users.created_at,
        users.studentnumber,
        users.gdpr,
        users.darkMode,
        users.language,
        users.activeStatus,
        roles.name AS role
      FROM users
      JOIN roles ON users.roleid = roles.roleid
      WHERE users.userid = ?`,
        [insertId],
      );
      if ((rows as mysql.RowDataPacket[]).length > 0) {
        return (rows as mysql.RowDataPacket[])[0] as User;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      throw new Error('Database error');
    }
  },
  /**
   * Deletes a user by their ID.
   * @param userId The ID of the user to delete.
   * @returns A promise that resolves to a boolean indicating whether the deletion was successful.
   */
  async deleteUser(userId: number): Promise<boolean> {
    try {
      const [rows] = (await UserModel.pool.execute(
        'DELETE FROM users WHERE Userid = ?',
        [userId],
      )) as unknown as [ResultSetHeader, FieldPacket[]];

      return rows.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw new Error('Database error');
    }
  },
  /**
   * Finds all users with a certain staff status.
   * @param staff The staff status to search for.
   * @returns A promise that resolves to an array of users with the given staff status.
   */
  async findUsersByStaffStatus(staff: number): Promise<UserInfo[]> {
    try {
      const [rows] = await UserModel.pool
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM users WHERE staff = ?', [staff]);

      return rows as UserInfo[];
    } catch (error) {
      console.error(error);
      throw new Error('Database error');
    }
  },
  /**
   * Checks if a username already exists in the database.
   * @param username The username to check.
   * @returns A promise that resolves to a boolean indicating whether the username exists.
   */
  async checkUsernameExists(username: string): Promise<boolean> {
    try {
      const [rows] = await UserModel.pool
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM users WHERE username = ?', [
          username,
        ]);

      return rows.length > 0;
    } catch (error) {
      console.error(error);
      throw new Error('Database error');
    }
  },
  /**
   * Checks if an email matches a staff member.
   * @param instructoremail - The email to check.
   * @returns A promise that resolves to the staff member, if found.
   */
  async checkIfEmailMatchesStaff(instructoremail: string) {
    const [existingInstructor] = await pool
      .promise()
      .query<RowDataPacket[]>(
        'SELECT * FROM users WHERE email = ? AND staff = 1',
        [instructoremail],
      );

    return existingInstructor;
  },
  /**
   * Checks if a user exists by their student number.
   * @param studentnumber - The student number to check.
   * @returns A promise that resolves to the user, if found.
   */
  async checkIfUserExistsByStudentNumber(studentnumber: string) {
    const [existingUserByNumber] = await this.pool
      .promise()
      .query<RowDataPacket[]>('SELECT * FROM users WHERE studentnumber = ?', [
        studentnumber,
      ]);

    return existingUserByNumber;
  },
  /**
   * Checks if a user exists by their email.
   * @param email - The email to check.
   * @returns A promise that resolves to the user, if found.
   */
  async checkIfUserExistsByEmail(email: string) {
    const [existingUserByEmail] = await this.pool
      .promise()
      .query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);

    return existingUserByEmail;
  },
  /**
   * Checks if a user exists by their email and if they are staff.
   * @param email - The email of the user.
   * @returns A promise that resolves to the user, if found.
   */
  async checkIfUserExistsByEmailAndisStaff(email: string) {
    const [existingUserByEmail] = await pool
      .promise()
      .query<RowDataPacket[]>(
        'SELECT * FROM users WHERE email = ? AND staff = 1',
        [email],
      );

    return existingUserByEmail;
  },
  /**
   * Updates a user's student number.
   * @param studentnumber - The new student number.
   * @param email - The email of the user.
   * @returns A promise that resolves to the result of the update.
   */
  async updateUserStudentNumber(studentnumber: string, email: string) {
    const result = await this.pool
      .promise()
      .query('UPDATE users SET studentnumber = ? WHERE email = ?', [
        studentnumber,
        email,
      ]);

    return result;
  },
  /**
   * Inserts a new student user.
   * @param email - The email of the user.
   * @param first_name - The first name of the user.
   * @param last_name - The last name of the user.
   * @param studentnumber - The student number of the user.
   * @param studentGroupId - The student group ID of the user.
   * @returns A promise that resolves to the result of the insertion.
   */
  async insertStudentUser(
    email: string,
    first_name: string,
    last_name: string,
    studentnumber: string,
    studentGroupId: number,
  ) {
    const [userResult] = await this.pool
      .promise()
      .query<ResultSetHeader>(
        'INSERT INTO users (email, first_name, last_name, studentnumber, studentgroupid) VALUES (?, ?, ?, ?, ?)',
        [email, first_name, last_name, studentnumber, studentGroupId],
      );

    return userResult;
  },

  async insertStaffUser(
    email: string,
    first_name: string,
    last_name: string,
    roleid: number,
    staff: number,
  ) {
    const [userResult] = await this.pool
      .promise()
      .query<ResultSetHeader>(
        'INSERT INTO users (email, first_name, last_name, staff, roleid) VALUES (?, ?, ?, ?, ?)',
        [email, first_name, last_name, staff, roleid],
      );

    return userResult;
  },
  /**
   * Gets students by their instructor's ID.
   * @param userid - The ID of the instructor.
   * @returns A promise that resolves to an array of students.
   */
  getStudentsByInstructorId: async (userid: number): Promise<UserInfo[]> => {
    try {
      const [rows] = await UserModel.pool.promise().query<RowDataPacket[]>(
        `SELECT DISTINCT u.*, studentgroups.group_name
          FROM users u
					JOIN studentgroups ON u.studentgroupid = studentgroups.studentgroupid
          JOIN usercourses uc ON u.userid = uc.userid
          JOIN courses c ON uc.courseid = c.courseid
          JOIN courseinstructors ci ON c.courseid = ci.courseid
          WHERE ci.userid = ? AND u.roleid = 1;`,
        [userid],
      );

      return rows as UserInfo[];
    } catch (error) {
      console.error(error);
      throw new Error('Database error');
    }
  },
  /**
 *
get students by instructor id with pagination
@param userid - The ID of the instructor.
@param limit - The number of students to fetch.
@param offset - The offset to start fetching students.
@returns A promise that resolves to an array of students.
 */

  fetchStudentsPaginationByInstructorId: async (
    userid: number,
    limit: number,
    offset: number,
  ): Promise<PaginatedStudentsResult> => {
    try {
      const [rows] = await UserModel.pool.promise().query<RowDataPacket[]>(
        `SELECT DISTINCT u.*, studentgroups.group_name
          FROM users u
					JOIN studentgroups ON u.studentgroupid = studentgroups.studentgroupid
          JOIN usercourses uc ON u.userid = uc.userid
          JOIN courses c ON uc.courseid = c.courseid
          JOIN courseinstructors ci ON c.courseid = ci.courseid
          WHERE ci.userid = ? AND u.roleid = 1
          ORDER BY u.userid
          LIMIT ? OFFSET ?;`,
        [userid, limit, offset],
      );

      const [countResult] = await UserModel.pool
        .promise()
        .query<RowDataPacket[]>(
          `SELECT COUNT(DISTINCT u.userid) as total
          FROM users u
          JOIN usercourses uc ON u.userid = uc.userid
          JOIN courses c ON uc.courseid = c.courseid
          JOIN courseinstructors ci ON c.courseid = ci.courseid
          WHERE ci.userid = ? AND u.roleid = 1;`,
          [userid],
        );

      return {
        students: rows as UserInfo[],
        total: countResult[0].total,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Database error');
    }
  },

  /**
   * Changes the role ID of a user.
   * @param email - The email of the user.
   * @param roleId - The new role ID.
   * @returns A promise that resolves to the result of the update.
   */
  changeRoleId: async (email: string, roleId: number) => {
    try {
      const [result] = await pool
        .promise()
        .query<ResultSetHeader>('UPDATE users SET roleid = ? WHERE email = ?', [
          roleId,
          email,
        ]);
      // console.log('🚀 ~ file: usermodel.ts:276 ~ changeRoleId: ~ result:', result);
      return result;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  insertUser: async (
    username: string,
    email: string,
    staff: number,
    first_name: string,
    last_name: string,
    studentnumber: number,
    studentgroupid: number,
    roleid: number,
    GDPR: number,
  ) => {
    try {
      const [userResult] = await pool
        .promise()
        .query<ResultSetHeader>(
          'INSERT INTO users (username, email, staff, first_name, last_name, studentnumber, studentgroupid, roleid, GDPR) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            username,
            email,
            staff,
            first_name,
            last_name,
            studentnumber,
            studentgroupid,
            roleid,
            GDPR,
          ],
        );

      return userResult;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Fetches all users.
   * @returns A promise that resolves to an array of users.
   */
  fetchUsers: async () => {
    try {
      const [result] = await pool
        .promise()
        .query<RowDataPacket[]>(
          `SELECT u.userid, u.username, u.email, u.first_name, u.last_name, u.studentnumber, u.staff,u.activeStatus, u.roleid, r.name AS role, u.created_at FROM users u JOIN roles r ON u.roleid = r.roleid;`,
        );
      return result;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Fetches a user by their ID.
   * @param userid - The ID of the user.
   * @returns A promise that resolves to the user, if found.
   */
  fetchUserById: async (userid: number) => {
    try {
      const [result] = await pool
        .promise()
        .query<RowDataPacket[]>(
          `SELECT u.*, r.name AS role FROM users u JOIN roles r ON u.roleid = r.roleid WHERE u.userid = ?;`,
          [userid],
        );
      return result;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Updates the GDPR status of a user based on their user ID.
   * @param {number} userId - The ID of the user to update.
   * @param {number} gdprStatus - The new GDPR status to set for the user (0 or 1).
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the update was successful.
   */
  updateUserGDPRStatus: async (
    userId: number | undefined,
  ): Promise<boolean> => {
    try {
      const [rows] = (await UserModel.pool
        .promise()
        .execute('UPDATE users SET gdpr = 1 WHERE userid = ?', [
          userId,
        ])) as unknown as [ResultSetHeader, FieldPacket[]];

      return rows.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw new Error('Database error');
    }
  },

  /**
   * Gets the GDPR status of a user based on their user ID.
   * @param {number} userId - The ID of the user to check.
   * @returns {Promise<number>} A promise that resolves to the user's GDPR status (0 or 1).
   */
  getUserGDPRStatus: async (userId: number): Promise<number> => {
    try {
      const [rows] = await UserModel.pool
        .promise()
        .query<RowDataPacket[]>('SELECT gdpr FROM users WHERE userid = ?', [
          userId,
        ]);

      if (rows.length > 0) {
        return rows[0].gdpr;
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error(error);
      throw new Error('Database error');
    }
  },
  /**
   * Fetches all students.
   * @returns A promise that resolves to an array of students.
   */
  fetchAllStudents: async () => {
    try {
      const [result] = await pool
        .promise()
        .query<RowDataPacket[]>(
          `SELECT u.userid, u.username, u.email, u.first_name, u.last_name, u.studentnumber, u.staff, u.roleid, r.name AS role FROM users u JOIN roles r ON u.roleid = r.roleid WHERE u.roleid = 1;`,
        );
      return result;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  /**
   * Fetches a paginated list of students.
   * @param limit - The number of students to fetch.
   * @param offset - The offset to start fetching students.
   * @returns A promise that resolves to an object containing the students and the total count of students.
   */
  fetchNumberOfStudents: async (limit: number, offset: number) => {
    try {
      // Get paginated students
      const [students] = await pool.promise().query<RowDataPacket[]>(
        `SELECT
          u.userid,
          u.username,
          u.email,
          u.first_name,
          u.last_name,
          u.studentnumber,
          u.staff,
          u.roleid,
          r.name AS role
        FROM users u
        JOIN roles r ON u.roleid = r.roleid
        WHERE u.roleid = 1
        ORDER BY u.userid
        LIMIT ? OFFSET ?`,
        [limit, offset],
      );

      // Get total count of students
      const [countResult] = await pool
        .promise()
        .query<RowDataPacket[]>(
          'SELECT COUNT(*) as total FROM users WHERE roleid = 1',
        );

      return {
        students: students as UserInfo[],
        total: countResult[0].total,
      };
    } catch (error) {
      console.error('Error fetching paginated students:', error);
      throw new Error('Database error while fetching students');
    }
  },
  /**
   * Updates a user.
   * @param user - The user to update.
   * @returns A promise that resolves to the result of the update.
   */
  updateUser: async (user: UpdateUser) => {
    const {
      userid,
      first_name,
      last_name,
      email,
      username,
      GDPR,
      roleid,
      staff,
      studentgroupid,
      studentnumber,
    } = user.user;

    try {
      const [result] = await pool.promise().query<RowDataPacket[]>(
        `UPDATE users
                SET first_name = ?, last_name = ?, email = ?, username = ?, GDPR = ?, roleid = ?, staff = ?, studentgroupid = ?, studentnumber = ?
                WHERE userid = ?`,
        [
          first_name,
          last_name,
          email,
          username,
          GDPR,
          roleid,
          staff,
          studentgroupid,
          studentnumber,
          userid,
        ],
      );
      // console.log('🚀 ~ updateUser: ~ result:', result);
      return result;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Checks if a student number exists.
   * @param studentnumber - The student number to check.
   * @returns A promise that resolves to the existing student number, if found.
   */
  checkIfStudentNumberExists: async (studentnumber: string) => {
    const [existingStudentNumber] = await pool
      .promise()
      .query<RowDataPacket[]>('SELECT * FROM users WHERE studentnumber = ?', [
        studentnumber,
      ]);

    return existingStudentNumber;
  },

  /**
   * Checks if a student number exists.
   * @param email - The student email to check.
   * @returns A promise that resolves to the existing student email, if found.
   */
  checkIfStudentEmailExists: async (email: string) => {
    const [existingStudentEmail] = await pool
      .promise()
      .query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);

    return existingStudentEmail;
  },

  /**
   * Gets the counts of each role.
   * @returns A promise that resolves to an array of role counts.
   */
  getRoleCounts: async () => {
    const [rows] = await pool.promise().query<RowDataPacket[]>(
      `SELECT r.name AS role_name, COUNT(*) AS user_count
       FROM users u
       JOIN roles r ON u.roleid = r.roleid
       GROUP BY r.name`,
    );

    return rows;
  },
  /**
   * Gets the count of logged in users.
   * @returns A promise that resolves to the count of logged in users.
   */
  getUserLoggedCount: async () => {
    const [rows] = await pool.promise().query<RowDataPacket[]>(
      `SELECT COUNT(*) AS user_logged
     FROM users
     WHERE username IS NOT NULL AND username != ''`,
    );

    return rows[0]?.user_logged || 0;
  },

  getUsersLanguage: async (email: string) => {
    try {
      const [result] = await pool
        .promise()
        .query<RowDataPacket[]>(`SELECT language FROM users WHERE email = ?`, [
          email,
        ]);
      return result;
    } catch (error) {
      console.error('Error fetching user language:', error);
      throw new Error('Database error while fetching language');
    }
  },
  updateUserLanguage: async (email: string, language: string) => {
    try {
      const [result] = await pool
        .promise()
        .query<RowDataPacket[]>(
          `UPDATE users SET language = ? WHERE email = ?`,
          [language, email],
        );
      return result;
    } catch (error) {
      console.error('Error updating user language:', error);
      throw new Error('Database error while updating language');
    }
  },
};

export default UserModel;
