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
  roleid?: number
  studentgroupid?: number
  created_at?: string
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
  updateUsernameByEmail: 'UPDATE users SET username = ? WHERE email = ?',

  getAllUserInfo:
    `SELECT users.userid, users.username, users.email, users.first_name, users.last_name, users.created_at,
            users.studentnumber, users.activeStatus, users.language, users.darkMode, users.gdpr AS gdpr,
            roles.name AS role
     FROM users JOIN roles ON users.roleid = roles.roleid WHERE users.email = ?`,

  getGroupNameByUserId:
    `SELECT studentgroups.group_name
     FROM studentgroups JOIN users ON users.studentgroupid = studentgroups.studentgroupid
     WHERE users.userid = ?`,

  updateUserInfo: 'UPDATE users SET Useremail = ? WHERE Userid = ?',

  insertStaffUser:
    `INSERT INTO users (username, email, staff, first_name, last_name, roleid, language, darkMode, activeStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

  selectUserById:
    `SELECT users.userid, users.username, users.email, users.first_name, users.last_name, users.created_at,
            users.studentnumber, users.gdpr, users.darkMode, users.language, users.activeStatus,
            roles.name AS role
     FROM users JOIN roles ON users.roleid = roles.roleid
     WHERE users.userid = ?`,

  deleteUser: 'DELETE FROM users WHERE Userid = ?',

  findUsersByStaff: 'SELECT * FROM users WHERE staff = ?',

  usernameExists: 'SELECT * FROM users WHERE username = ?',

  emailMatchesStaff: 'SELECT * FROM users WHERE email = ? AND staff = 1',

  userByStudentNumber: 'SELECT * FROM users WHERE studentnumber = ?',

  userByEmail: 'SELECT * FROM users WHERE email = ?',

  userByEmailAndStaff: 'SELECT * FROM users WHERE email = ? AND staff = 1',

  updateStudentNumber: 'UPDATE users SET studentnumber = ? WHERE email = ?',

  insertStudentUser:
    `INSERT INTO users (email, first_name, last_name, studentnumber, studentgroupid, language, darkMode, activeStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

  insertStaffOnly:
    `INSERT INTO users (email, first_name, last_name, staff, roleid, language, darkMode, activeStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

  studentsByInstructor:
    `SELECT DISTINCT u.*, studentgroups.group_name
     FROM users u
            JOIN studentgroups ON u.studentgroupid = studentgroups.studentgroupid
            JOIN usercourses uc ON u.userid = uc.userid
            JOIN courses c ON uc.courseid = c.courseid
            JOIN courseinstructors ci ON c.courseid = ci.courseid
     WHERE ci.userid = ? AND u.roleid = 1`,

  // Prefix-search students taught by instructor by name or studentnumber
  searchStudentsByInstructor:
    `SELECT DISTINCT u.*, studentgroups.group_name
     FROM users u
     JOIN studentgroups ON u.studentgroupid = studentgroups.studentgroupid
     JOIN usercourses uc ON u.userid = uc.userid
     JOIN courses c ON uc.courseid = c.courseid
     JOIN courseinstructors ci ON c.courseid = ci.courseid
     WHERE ci.userid = ?
       AND u.roleid = 1
       AND (
         LOWER(u.first_name) LIKE ?
         OR LOWER(u.last_name) LIKE ?
         OR LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE ?
         OR CAST(u.studentnumber AS CHAR) LIKE ?
       )`,

  // Search students by name prefix OR studentnumber prefix (also matches without leading zeros)
  searchStudents:
    `SELECT u.userid, u.first_name, u.last_name, u.email, u.username,
          u.studentnumber, u.roleid, u.studentgroupid, u.created_at,
          sg.group_name
   FROM users u
   LEFT JOIN studentgroups sg ON u.studentgroupid = sg.studentgroupid
   WHERE u.roleid = 1
     AND (
       LOWER(u.first_name) LIKE ?
       OR LOWER(u.last_name) LIKE ?
       OR LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE ?
       OR CAST(u.studentnumber AS CHAR) LIKE ?
       OR TRIM(LEADING '0' FROM CAST(u.studentnumber AS CHAR)) LIKE ?
     )
   ORDER BY u.last_name, u.first_name
   LIMIT 200`,

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

  studentsByInstructorCount:
    `SELECT COUNT(DISTINCT u.userid) as total
     FROM users u
            JOIN usercourses uc ON u.userid = uc.userid
            JOIN courses c ON uc.courseid = c.courseid
            JOIN courseinstructors ci ON c.courseid = ci.courseid
     WHERE ci.userid = ? AND u.roleid = 1`,

  changeRoleId: 'UPDATE users SET roleid = ? WHERE email = ?',

  insertUser:
    `INSERT INTO users (username, email, staff, first_name, last_name, studentnumber, studentgroupid, roleid, GDPR, language, darkMode, activeStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

  fetchUsers: `
    SELECT u.userid, u.username, u.email, u.first_name, u.last_name, u.studentnumber, u.staff, u.activeStatus,
           u.roleid, r.name AS role, u.created_at FROM users u JOIN roles r ON u.roleid = r.roleid`,

  fetchUserById: 'SELECT u.*, r.name AS role FROM users u JOIN roles r ON u.roleid = r.roleid WHERE u.userid = ?',

  updateUserGDPRStatus: 'UPDATE users SET gdpr = 1 WHERE userid = ?',

  getUserGDPRStatus: 'SELECT gdpr FROM users WHERE userid = ?',

  fetchAllStudents:
    'SELECT u.userid, u.username, u.email, u.first_name, u.last_name, u.studentnumber, u.staff, u.roleid, r.name AS role FROM users u JOIN roles r ON u.roleid = r.roleid WHERE u.roleid = 1',

  // All students with group_name (used by counselor/admin listing)
  fetchAllStudentsWithGroupName: `
    SELECT u.userid, u.username, u.email, u.first_name, u.last_name, u.studentnumber,
           u.staff, u.roleid, r.name AS role, u.created_at, u.studentgroupid,
           sg.group_name
    FROM users u
    JOIN roles r ON u.roleid = r.roleid
    LEFT JOIN studentgroups sg ON u.studentgroupid = sg.studentgroupid
    WHERE u.roleid = 1
    ORDER BY u.userid
  `,

  // Prefix search for all students (roleid=1), includes group_name
  searchAllStudents: `
    SELECT u.userid, u.username, u.email, u.first_name, u.last_name, u.studentnumber,
           u.staff, u.roleid, r.name AS role, u.created_at, u.studentgroupid,
           sg.group_name
    FROM users u
    JOIN roles r ON u.roleid = r.roleid
    LEFT JOIN studentgroups sg ON u.studentgroupid = sg.studentgroupid
    WHERE u.roleid = 1
      AND (
        LOWER(u.first_name) LIKE ?
        OR LOWER(u.last_name) LIKE ?
        OR LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE ?
        OR CAST(u.studentnumber AS CHAR) LIKE ?
      )
    ORDER BY u.userid
  `,

  fetchNumberOfStudents: `
    SELECT u.userid, u.username, u.email, u.first_name, u.last_name, u.studentnumber, u.staff, u.roleid, r.name AS role FROM users u JOIN roles r ON u.roleid = r.roleid
    WHERE u.roleid = 1 ORDER BY u.userid LIMIT ? OFFSET ?`,

  fetchStudentsCount: 'SELECT COUNT(*) as total FROM users WHERE roleid = 1',

  updateUser: `
    UPDATE users SET first_name = ?, last_name = ?, email = ?, username = ?, GDPR = ?, roleid = ?, staff = ?, studentgroupid = ?, studentnumber = ?
    WHERE userid = ?`,

  studentNumberExists: 'SELECT * FROM users WHERE studentnumber = ?',

  studentEmailExists: 'SELECT * FROM users WHERE email = ?',

  roleCounts: `SELECT r.name AS role_name, COUNT(*) AS user_count FROM users u JOIN roles r ON u.roleid = r.roleid GROUP BY r.name`,

  userLoggedCount: `SELECT COUNT(*) AS user_logged FROM users WHERE username IS NOT NULL AND username != ''`,

  getUsersLanguage: 'SELECT language FROM users WHERE email = ?',

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
      }
      return null
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },

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

  async checkIfEmailMatchesStaff(instructoremail: string) {
    console.log('row 288, usermodel.ts, calling checkIfEmailMatchesStaff()')
    const rows = await queryRows<RowDataPacket[]>(SQL.emailMatchesStaff, [instructoremail])
    return rows
  },

  async checkIfUserExistsByStudentNumber(studentnumber: string) {
    console.log('row 304, usermodel.ts, calling checkIfUserExistsByStudentNumber()')
    const rows = await queryRows<RowDataPacket[]>(SQL.userByStudentNumber, [studentnumber])
    return rows
  },

  async checkIfUserExistsByEmail(email: string) {
    console.log('row 319, usermodel.ts, calling checkIfUserExistsByEmail()')
    const rows = await queryRows<RowDataPacket[]>(SQL.userByEmail, [email])
    return rows
  },

  async checkIfUserExistsByEmailAndisStaff(email: string) {
    console.log('row 332, usermodel.ts, calling checkIfUserExistsByEmailAndisStaff()')
    const rows = await queryRows<RowDataPacket[]>(SQL.userByEmailAndStaff, [email])
    return rows
  },

  async updateUserStudentNumber(studentnumber: string, email: string) {
    console.log('row 349, usermodel.ts, calling updateUserStudentNumber()')
    const result = await q().query(SQL.updateStudentNumber, [studentnumber, email])
    return result
  },

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

  // Search students by name prefix OR studentnumber prefix
  searchStudents: async (searchQuery: string): Promise<UserInfo[]> => {
    try {
      console.log('row XXX, usermodel.ts, calling searchStudents()')

      const raw = String(searchQuery ?? '').trim()
      const qLower = raw.toLowerCase()

      // Prefix match for names
      const namePrefix = `${qLower}%`

      // Prefix match for studentnumber (digits only)
      const digits = raw.replace(/\D/g, '')
      const numPrefix = `${digits}%`

      // If user typed no digits, avoid matching studentnumber broadly
      const safeNumPrefix = digits ? numPrefix : '###%'

      const rows = await queryRows<RowDataPacket[]>(SQL.searchStudents, [
        namePrefix,
        namePrefix,
        namePrefix,
        safeNumPrefix,
        safeNumPrefix,
      ])

      return rows as UserInfo[]
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },



  // Prefix search for instructor's students (name/studentnumber)
  searchStudentsByInstructor: async (userid: number, searchQuery: string): Promise<UserInfo[]> => {
    try {
      console.log('row 449, usermodel.ts, calling searchStudentsByInstructor()')

      const qTrim = String(searchQuery).trim()
      const qLower = `${qTrim.toLowerCase()}%`

      const isNumeric = /^\d+$/.test(qTrim)
      const allowStudentNumber = isNumeric && qTrim.length >= 5
      const qNum = allowStudentNumber ? `${qTrim}%` : '__NO_MATCH__'

      const rows = await queryRows<RowDataPacket[]>(SQL.searchStudentsByInstructor, [
        userid,
        qLower,
        qLower,
        qLower,
        qNum,
      ])
      return rows as UserInfo[]
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },

  // All students for counselor/admin list (with group_name)
  fetchAllStudentsWithGroupName: async (): Promise<UserInfo[]> => {
    try {
      console.log('row 470, usermodel.ts, calling fetchAllStudentsWithGroupName()')
      const rows = await queryRows<RowDataPacket[]>(SQL.fetchAllStudentsWithGroupName)
      return rows as UserInfo[]
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },

  // Prefix search for all students (roleid=1), includes group_name
  searchAllStudents: async (searchQuery: string): Promise<UserInfo[]> => {
    try {
      console.log('row 488, usermodel.ts, calling searchAllStudents()')

      const qTrim = String(searchQuery).trim()
      const qLower = `${qTrim.toLowerCase()}%`

      const isNumeric = /^\d+$/.test(qTrim)
      const allowStudentNumber = isNumeric && qTrim.length >= 5
      const qNum = allowStudentNumber ? `${qTrim}%` : '__NO_MATCH__'

      const rows = await queryRows<RowDataPacket[]>(SQL.searchAllStudents, [
        qLower,
        qLower,
        qLower,
        qNum,
      ])
      return rows as UserInfo[]
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },

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

  getUserGDPRStatus: async (userId: number): Promise<number> => {
    try {
      console.log('row 636, usermodel.ts, calling getUserGDPRStatus()')
      const rows = await queryRows<RowDataPacket[]>(SQL.getUserGDPRStatus, [userId])
      if (rows.length > 0) {
        return (rows[0] as RowDataPacket & { gdpr: number }).gdpr
      }
      throw new Error('User not found')
    } catch (error) {
      console.error(error)
      throw new Error('Database error')
    }
  },

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

  checkIfStudentNumberExists: async (studentnumber: string) => {
    console.log('row 767, usermodel.ts, calling checkIfStudentNumberExists()')
    const rows = await queryRows<RowDataPacket[]>(SQL.studentNumberExists, [studentnumber])
    return rows
  },

  checkIfStudentEmailExists: async (email: string) => {
    console.log('row 783, usermodel.ts, calling checkIfStudentEmailExists()')
    const rows = await queryRows<RowDataPacket[]>(SQL.studentEmailExists, [email])
    return rows
  },

  getRoleCounts: async () => {
    console.log('row 796, usermodel.ts, calling getRoleCounts()')
    const rows = await queryRows<RowDataPacket[]>(SQL.roleCounts)
    return rows
  },

  getUserLoggedCount: async () => {
    console.log('row 811, usermodel.ts, calling getUserLoggedCount()')
    const rows = await queryRows<RowDataPacket[]>(SQL.userLoggedCount)
    return (rows[0] as RowDataPacket & { user_logged: number }).user_logged || 0
  },

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
