import { FieldPacket, ResultSetHeader, RowDataPacket } from 'mysql2'
import * as mysql from 'mysql2/promise'
import createPool from '../config/createPool.js'

const pool = createPool('ADMIN')

// Types
interface UserInfo {
  username: string
  email: string
  staff: number
  first_name: string
  last_name: string
  studentgroup?: string
  group_name?: string | null
  userid?: number
  studentnumber?: string
  role?: string
  gdpr?: number
  activeStatus: number
  language: string
  darkMode: number
}

interface User {
  username: string
  email: string
  staff: number
  first_name: string
  last_name: string
  studentgroup?: string
  group_name?: string | null
  userid?: number
  studentnumber?: string
  roleid: number
  activeStatus: number
  language: string
  darkMode: number
}

interface UpdateUser {
  user: {
    userid: number
    first_name: string
    last_name: string
    email: string
    username: string
    GDPR: number
    roleid: number
    staff: number
    studentgroupid: number
    studentnumber: string
    activeStatus: number
    language: string
    darkMode: number
  }
}

interface PaginatedStudentsResult {
  students: UserInfo[]
  total: number
}

// SQL
const SQL = {
  // Update a user's username by matching on email
  updateUsernameByEmail: 'UPDATE users SET username = ? WHERE email = ?',

  // Fetch core user fields + role name by email
  getAllUserInfo:
    `SELECT users.userid, users.username, users.email, users.first_name, users.last_name, users.created_at,
        users.studentnumber, users.activeStatus, users.language, users.darkMode, users.gdpr AS gdpr,
        roles.name AS role
     FROM users JOIN roles ON users.roleid = roles.roleid WHERE users.email = ?`,

  // Fetch the student's group name by user ID (via users.studentgroupid)
  getGroupNameByUserId:
    `SELECT studentgroups.group_name
     FROM studentgroups JOIN users ON users.studentgroupid = studentgroups.studentgroupid
     WHERE users.userid = ?`,

  // Update a user's email by user ID (uses schema-specific column casing)
  updateUserInfo: 'UPDATE users SET Useremail = ? WHERE Userid = ?',

  // Insert a staff user with basic profile + language/darkMode/activeStatus
  insertStaffUser:
    `INSERT INTO users (username, email, staff, first_name, last_name, roleid, language, darkMode, activeStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

  // Fetch a single user (selected fields) including role name by user ID
  selectUserById:
    `SELECT users.userid, users.username, users.email, users.first_name, users.last_name, users.created_at,
        users.studentnumber, users.gdpr, users.darkMode, users.language, users.activeStatus,
        roles.name AS role
     FROM users JOIN roles ON users.roleid = roles.roleid
     WHERE users.userid = ?`,

  // Delete a user by user ID
  deleteUser: 'DELETE FROM users WHERE Userid = ?',

  // List users filtered by staff flag (0/1)
  findUsersByStaff: 'SELECT * FROM users WHERE staff = ?',

  // Check if a username already exists
  usernameExists: 'SELECT * FROM users WHERE username = ?',

  // Check if an email belongs to a staff user
  emailMatchesStaff: 'SELECT * FROM users WHERE email = ? AND staff = 1',

  // Find user(s) by student number
  userByStudentNumber: 'SELECT * FROM users WHERE studentnumber = ?',

  // Find user(s) by email
  userByEmail: 'SELECT * FROM users WHERE email = ?',

  // Find staff user(s) by email
  userByEmailAndStaff: 'SELECT * FROM users WHERE email = ? AND staff = 1',

  // Update student number for a user identified by email
  updateStudentNumber: 'UPDATE users SET studentnumber = ? WHERE email = ?',

  // Insert a student user with group, language, darkMode, activeStatus
  insertStudentUser:
    `INSERT INTO users (email, first_name, last_name, studentnumber, studentgroupid, language, darkMode, activeStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

  // Insert a staff user (no username) with role, language, darkMode, activeStatus
  insertStaffOnly:
    `INSERT INTO users (email, first_name, last_name, staff, roleid, language, darkMode, activeStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

  // List distinct students (roleid=1) taught by the given instructor, include group name
  studentsByInstructor:
    `SELECT DISTINCT u.*, studentgroups.group_name
     FROM users u
     JOIN studentgroups ON u.studentgroupid = studentgroups.studentgroupid
     JOIN usercourses uc ON u.userid = uc.userid
     JOIN courses c ON uc.courseid = c.courseid
     JOIN courseinstructors ci ON c.courseid = ci.courseid
     WHERE ci.userid = ? AND u.roleid = 1`,

  // Same as above, but ordered and paginated
  studentsByInstructorPaged:
    `SELECT DISTINCT u.*, studentgroups.group_name
     FROM users u
     JOIN studentgroups ON u.studentgroupid = studentgroups.studentgroupid
     JOIN usercourses uc ON u.userid = uc.userid
     JOIN courses c ON uc.courseid = c.courseid
     JOIN courseinstructors ci ON c.courseid = ci.courseid
     WHERE ci.userid = ? AND u.roleid = 1
     ORDER BY u.userid
     LIMIT ? OFFSET ?`,

  // Count distinct students for a given instructor
  studentsByInstructorCount:
    `SELECT COUNT(DISTINCT u.userid) as total
     FROM users u
     JOIN usercourses uc ON u.userid = uc.userid
     JOIN courses c ON uc.courseid = c.courseid
     JOIN courseinstructors ci ON c.courseid = ci.courseid
     WHERE ci.userid = ? AND u.roleid = 1`,

  // Change a user's role by email
  changeRoleId: 'UPDATE users SET roleid = ? WHERE email = ?',

  // Insert a generic user with all fields including GDPR
  insertUser:
    `INSERT INTO users (username, email, staff, first_name, last_name, studentnumber, studentgroupid, roleid, GDPR, language, darkMode, activeStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

  // Fetch all users joined with role name
  fetchUsers: `
    SELECT u.userid, u.username, u.email, u.first_name, u.last_name, u.studentnumber, u.staff, u.activeStatus,
      u.roleid, r.name AS role, u.created_at FROM users u JOIN roles r ON u.roleid = r.roleid`,

  // Fetch a single user by ID with role name
  fetchUserById: 'SELECT u.*, r.name AS role FROM users u JOIN roles r ON u.roleid = r.roleid WHERE u.userid = ?',

  // Set GDPR=1 for a given user ID
  updateUserGDPRStatus: 'UPDATE users SET gdpr = 1 WHERE userid = ?',

  // Get a user's GDPR value by ID
  getUserGDPRStatus: 'SELECT gdpr FROM users WHERE userid = ?',

  // Fetch all students (roleid=1) with role name
  fetchAllStudents:
    'SELECT u.userid, u.username, u.email, u.first_name, u.last_name, u.studentnumber, u.staff, u.roleid, r.name AS role FROM users u JOIN roles r ON u.roleid = r.roleid WHERE u.roleid = 1',

  // Paginated list of students (roleid=1), ordered by userid
  fetchNumberOfStudents: `
      SELECT u.userid, u.username, u.email, u.first_name, u.last_name, u.studentnumber, u.staff, u.roleid, r.name AS role FROM users u JOIN roles r ON u.roleid = r.roleid
      WHERE u.roleid = 1 ORDER BY u.userid LIMIT ? OFFSET ?`,

  // Count all students (roleid=1)
  fetchStudentsCount: 'SELECT COUNT(*) as total FROM users WHERE roleid = 1',

  // Update multiple editable fields for a user by ID
  updateUser: `
    UPDATE users SET first_name = ?, last_name = ?, email = ?, username = ?, GDPR = ?, roleid = ?, staff = ?, studentgroupid = ?, studentnumber = ?
    WHERE userid = ?`,

  // Check existence by student number
  studentNumberExists: 'SELECT * FROM users WHERE studentnumber = ?',

  // Check existence by email
  studentEmailExists: 'SELECT * FROM users WHERE email = ?',

  // Aggregate number of users per role name
  roleCounts: `SELECT r.name AS role_name, COUNT(*) AS user_count FROM users u JOIN roles r ON u.roleid = r.roleid GROUP BY r.name`,

  // Count users that have a non-empty username (logged-in heuristic)
  userLoggedCount: `SELECT COUNT(*) AS user_logged FROM users WHERE username IS NOT NULL AND username != ''`,

  // Get a user's language by email
  getUsersLanguage: 'SELECT language FROM users WHERE email = ?',

  // Update a user's language by email
  updateUserLanguage: 'UPDATE users SET language = ? WHERE email = ?',
} as const

// Small helpers
const q = () => UserModel.pool.promise()
const queryRows = async <T extends RowDataPacket[]>(sql: string, params: any[] = []) => {
  const [rows] = await q().query<T>(sql, params)
  return rows
}
const execAffect = async (sql: string, params: any[] = []) => {
  const [res] = await q().execute<ResultSetHeader>(sql, params)
  return res
}

const UserModel = {
  pool,

  // Updates the username of a user based on their email.
  updateUsernameByEmail: async (email: string, newUsername: string): Promise<boolean> => {
    try {
      console.log('row 88, usermodel.ts, calling updateUsernameByEmail()')
      const rows = await execAffect(SQL.updateUsernameByEmail, [newUsername, email])
      return rows.affectedRows > 0
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },

  // A method to retrieve user information based on a username.
  getAllUserInfo: async (email: string): Promise<UserInfo | null> => {
    let userData: UserInfo | null = null
    try {
      console.log('row 112, usermodel.ts, calling getAllUserInfo()')
      const userRows = await queryRows<RowDataPacket[]>(SQL.getAllUserInfo, [email])

      if (userRows.length > 0) {
        userData = userRows.pop() as UserInfo

        const groupRows = await queryRows<RowDataPacket[]>(SQL.getGroupNameByUserId, [userData.userid])
        console.log('row 129, usermodel.ts, getting all user info from database studentgroups table')
        if (groupRows.length > 0) {
          userData.group_name = groupRows[0].group_name as string
        } else {
          userData.group_name = 'not assigned'
        }
      }
      return userData || null
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },

  // Updates the email of a user.
  updateUserInfo: async (userId: number, newEmail: string): Promise<boolean> => {
    try {
      console.log('row 153, usermodel.ts, calling updateUserInfo()')
      const [rows] = (await UserModel.pool.execute(SQL.updateUserInfo, [newEmail, userId])) as unknown as [ResultSetHeader, FieldPacket[]]
      return rows.affectedRows > 0
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },

  // Adds a new user to the database.
  addStaffUser: async (user: User): Promise<User | null> => {
    try {
      console.log('row 172, usermodel.ts, calling addStaffUser()')
      const { username, email, staff, first_name, last_name, roleid } = user
      const language = 'en'
      const darkMode = 0
      const activeStatus = 1

      const result = await q().query(SQL.insertStaffUser, [
        username,
        email,
        staff,
        first_name,
        last_name,
        roleid,
        language,
        darkMode,
        activeStatus,
      ])

      const insertId = (result[0] as mysql.OkPacket).insertId
      const [rows] = await q().query(SQL.selectUserById, [insertId])
      if ((rows as mysql.RowDataPacket[]).length > 0) {
        return (rows as mysql.RowDataPacket[])[0] as User
      } else {
        return null
      }
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },

  // Deletes a user by their ID.
  async deleteUser(userId: number): Promise<boolean> {
    try {
      console.log('row 232, usermodel.ts, calling deleteUser()')
      const [rows] = (await UserModel.pool.execute(SQL.deleteUser, [userId])) as unknown as [ResultSetHeader, FieldPacket[]]
      return rows.affectedRows > 0
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },

  // Finds all users with a certain staff status.
  async findUsersByStaffStatus(staff: number): Promise<UserInfo[]> {
    try {
      console.log('row 251, usermodel.ts, calling findUsersByStaffStatus()')
      const rows = await queryRows<RowDataPacket[]>(SQL.findUsersByStaff, [staff])
      return rows as UserInfo[]
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },

  // Checks if a username already exists in the database.
  async checkUsernameExists(username: string): Promise<boolean> {
    try {
      console.log('row 269, usermodel.ts, calling checkUsernameExists()')
      const rows = await queryRows<RowDataPacket[]>(SQL.usernameExists, [username])
      return rows.length > 0
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },

  // Checks if an email matches a staff member.
  async checkIfEmailMatchesStaff(instructoremail: string) {
    console.log('row 288, usermodel.ts, calling checkIfEmailMatchesStaff()')
    const rows = await queryRows<RowDataPacket[]>(SQL.emailMatchesStaff, [instructoremail])
    return rows
  },

  // Checks if a user exists by their student number.
  async checkIfUserExistsByStudentNumber(studentnumber: string) {
    console.log('row 304, usermodel.ts, calling checkIfUserExistsByStudentNumber()')
    const rows = await queryRows<RowDataPacket[]>(SQL.userByStudentNumber, [studentnumber])
    return rows
  },

  // Checks if a user exists by their email.
  async checkIfUserExistsByEmail(email: string) {
    console.log('row 319, usermodel.ts, calling checkIfUserExistsByEmail()')
    const rows = await queryRows<RowDataPacket[]>(SQL.userByEmail, [email])
    return rows
  },

  // Checks if a user exists by their email and if they are staff.
  async checkIfUserExistsByEmailAndisStaff(email: string) {
    console.log('row 332, usermodel.ts, calling checkIfUserExistsByEmailAndisStaff()')
    const rows = await queryRows<RowDataPacket[]>(SQL.userByEmailAndStaff, [email])
    return rows
  },

  // Updates a user's student number.
  async updateUserStudentNumber(studentnumber: string, email: string) {
    console.log('row 349, usermodel.ts, calling updateUserStudentNumber()')
    const result = await q().query(SQL.updateStudentNumber, [studentnumber, email])
    return result
  },

  // Inserts a new student user.
  async insertStudentUser(
    email: string,
    first_name: string,
    last_name: string,
    studentnumber: string,
    studentGroupId: number,
  ) {
    const language = 'en'
    const darkMode = 0
    const activeStatus = 1
    console.log('row 379, usermodel.ts, calling insertStudentUser()')
    const [userResult] = await q().query<ResultSetHeader>(SQL.insertStudentUser, [
      email,
      first_name,
      last_name,
      studentnumber,
      studentGroupId,
      language,
      darkMode,
      activeStatus,
    ])
    return userResult
  },

  async insertStaffUser(
    email: string,
    first_name: string,
    last_name: string,
    roleid: number,
    staff: number,
  ) {
    const language = 'en'
    const darkMode = 0
    console.log('row 408, usermodel.ts, calling insertStaffUser()')
    const activeStatus = 1
    const [userResult] = await q().query<ResultSetHeader>(SQL.insertStaffOnly, [
      email,
      first_name,
      last_name,
      staff,
      roleid,
      language,
      darkMode,
      activeStatus,
    ])
    return userResult
  },

  // Gets students by their instructor's ID.
  getStudentsByInstructorId: async (userid: number): Promise<UserInfo[]> => {
    try {
      console.log('row 435, usermodel.ts, calling getStudentsByInstructorId()')
      const rows = await queryRows<RowDataPacket[]>(SQL.studentsByInstructor, [userid])
      return rows as UserInfo[]
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },

  // get students by instructor id with pagination
  fetchStudentsPaginationByInstructorId: async (
    userid: number,
    limit: number,
    offset: number,
  ): Promise<PaginatedStudentsResult> => {
    try {
      console.log('row 474, usermodel.ts, calling fetchStudentsPaginationByInstructorId()')
      const rows = await queryRows<RowDataPacket[]>(SQL.studentsByInstructorPaged, [userid, limit, offset])
      const countResult = await queryRows<RowDataPacket[]>(SQL.studentsByInstructorCount, [userid])
      return {
        students: rows as UserInfo[],
        total: (countResult[0] as RowDataPacket & { total: number }).total,
      }
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },

  // Changes the role ID of a user.
  changeRoleId: async (email: string, roleId: number) => {
    try {
      console.log('row 512, usermodel.ts, calling changeRoleId()')
      const [result] = await q().query<ResultSetHeader>(SQL.changeRoleId, [roleId, email])
      return result
    } catch (error) {
      console.error(error)
      return Promise.reject(error)
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
    const language = 'en'
    const darkMode = 0
    const activeStatus = 1
    try {
      console.log('row 540, usermodel.ts, calling insertUser()')
      const [userResult] = await q().query<ResultSetHeader>(SQL.insertUser, [
        username,
        email,
        staff,
        first_name,
        last_name,
        studentnumber,
        studentgroupid,
        roleid,
        GDPR,
        language,
        darkMode,
        activeStatus,
      ])
      return userResult
    } catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  },

  // Fetches all users.
  fetchUsers: async () => {
    try {
      console.log('row 573, usermodel.ts, calling fetchUsers()')
      const rows = await queryRows<RowDataPacket[]>(SQL.fetchUsers)
      return rows
    } catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  },

  // Fetches a user by their ID.
  fetchUserById: async (userid: number) => {
    try {
      console.log('row 592, usermodel.ts, calling fetchUserById()')
      const rows = await queryRows<RowDataPacket[]>(SQL.fetchUserById, [userid])
      return rows
    } catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  },

  // Updates the GDPR status of a user based on their user ID.
  updateUserGDPRStatus: async (userId: number | undefined): Promise<boolean> => {
    try {
      console.log('row 615, usermodel.ts, calling updateUserGDPRStatus()')
      const [rows] = (await UserModel.pool
        .promise()
        .execute(SQL.updateUserGDPRStatus, [userId])) as unknown as [ResultSetHeader, FieldPacket[]]
      return rows.affectedRows > 0
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },

  // Gets the GDPR status of a user based on their user ID.
  getUserGDPRStatus: async (userId: number): Promise<number> => {
    try {
      console.log('row 636, usermodel.ts, calling getUserGDPRStatus()')
      const rows = await queryRows<RowDataPacket[]>(SQL.getUserGDPRStatus, [userId])
      if (rows.length > 0) {
        return (rows[0] as RowDataPacket & { gdpr: number }).gdpr
      } else {
        throw new Error('User not found')
      }
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },

  // Fetches all students.
  fetchAllStudents: async () => {
    try {
      console.log('row 659, usermodel.ts, calling fetchAllStudents()')
      const rows = await queryRows<RowDataPacket[]>(SQL.fetchAllStudents)
      return rows
    } catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  },

  // Fetches a paginated list of students.
  fetchNumberOfStudents: async (limit: number, offset: number) => {
    try {
      console.log('row 680, usermodel.ts, calling fetchNumberOfStudents()')
      const students = await queryRows<RowDataPacket[]>(SQL.fetchNumberOfStudents, [limit, offset])
      const countResult = await queryRows<RowDataPacket[]>(SQL.fetchStudentsCount)
      return {
        students: students as UserInfo[],
        total: (countResult[0] as RowDataPacket & { total: number }).total,
      }
    } catch (error) {
      console.error('Error fetching paginated students:', error)
      throw new Error('Database error while fetching students')
    }
  },

  // Updates a user.
  updateUser: async (user: UpdateUser) => {
    const { userid, first_name, last_name, email, username, GDPR, roleid, staff, studentgroupid, studentnumber } = user.user
    try {
      console.log('row 737, usermodel.ts, calling updateUser()')
      const [result] = await q().query<RowDataPacket[]>(SQL.updateUser, [
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
      ])
      return result
    } catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  },

  // Checks if a student number exists.
  checkIfStudentNumberExists: async (studentnumber: string) => {
    console.log('row 767, usermodel.ts, calling checkIfStudentNumberExists()')
    const rows = await queryRows<RowDataPacket[]>(SQL.studentNumberExists, [studentnumber])
    return rows
  },

  // Checks if a student email exists.
  checkIfStudentEmailExists: async (email: string) => {
    console.log('row 783, usermodel.ts, calling checkIfStudentEmailExists()')
    const rows = await queryRows<RowDataPacket[]>(SQL.studentEmailExists, [email])
    return rows
  },

  // Gets the counts of each role.
  getRoleCounts: async () => {
    console.log('row 796, usermodel.ts, calling getRoleCounts()')
    const rows = await queryRows<RowDataPacket[]>(SQL.roleCounts)
    return rows
  },

  // Gets the count of logged in users.
  getUserLoggedCount: async () => {
    console.log('row 811, usermodel.ts, calling getUserLoggedCount()')
    const rows = await queryRows<RowDataPacket[]>(SQL.userLoggedCount)
    return (rows[0] as RowDataPacket & { user_logged: number }).user_logged || 0
  },

  // Gets user's language
  getUsersLanguage: async (email: string) => {
    try {
      console.log('row 823, usermodel.ts, calling getUsersLanguage()')
      const rows = await queryRows<RowDataPacket[]>(SQL.getUsersLanguage, [email])
      return rows
    } catch (error) {
      console.error('Error fetching user language:', error)
      throw new Error('Database error while fetching language')
    }
  },

  // Updates user's language
  updateUserLanguage: async (email: string, language: string) => {
    try {
      console.log('row 837, usermodel.ts, calling updateUserLanguage()')
      const [result] = await q().query<RowDataPacket[]>(SQL.updateUserLanguage, [language, email])
      return result
    } catch (error) {
      console.error('Error updating user language:', error)
      throw new Error('Database error while updating language')
    }
  },
}

export default UserModel
