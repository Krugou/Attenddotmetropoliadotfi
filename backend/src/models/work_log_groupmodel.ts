import { ResultSetHeader, RowDataPacket } from 'mysql2'
import createPool from '../config/createPool.js'

const pool = createPool('ADMIN')

// Shape of a row in work_log_course_groups (plus computed member_count)
export interface WorkLogCourseGroup extends RowDataPacket {
  group_id: number
  work_log_course_id: number
  group_name: string
  member_count: number
}

// Allowed parameter types for prepared statements
type QueryValue = string | number | Date | boolean

// SQL statements
const SQL = {
  // Insert a new group for a work log course
  insertGroup: 'INSERT INTO work_log_course_groups (work_log_course_id, group_name) VALUES (?, ?)',

  // Verify a group exists by id
  selectGroupById: 'SELECT * FROM work_log_course_groups WHERE group_id = ?',

  // List distinct students (with basic info) assigned to a group
  selectStudentsByGroup: `
    SELECT DISTINCT u.userid, u.email, u.first_name, u.last_name FROM users u
                                                                        INNER JOIN student_group_assignments sga ON u.userid = sga.userid
                                                                        INNER JOIN roles r ON u.roleid = r.roleid
    WHERE sga.group_id = ?
    ORDER BY u.last_name, u.first_name`,

  // Delete a group by id
  deleteGroup: 'DELETE FROM work_log_course_groups WHERE group_id = ?',

  // Update a group's name by id
  updateGroupNameById: 'UPDATE work_log_course_groups SET group_name = ? WHERE group_id = ?',

  // List groups for a course with member counts
  selectGroupsByCourse: `
    SELECT wcg.*, COALESCE(COUNT(sga.userid), 0) AS member_count FROM work_log_course_groups wcg
                                                                        LEFT JOIN student_group_assignments sga ON wcg.group_id = sga.group_id
    WHERE wcg.work_log_course_id = ?
    GROUP BY wcg.group_id, wcg.work_log_course_id, wcg.group_name`,

  // List groups the user belongs to
  selectUserGroups: `
    SELECT g.* FROM work_log_course_groups g JOIN student_group_assignments sga ON g.group_id = sga.group_id
    WHERE sga.userid = ?`,
} as const

// Helpers

// Get a promise-based connection
const q = () => pool.promise()

// Query rows helper (SELECT)
const queryRows = async <T extends RowDataPacket[]>(sql: string, params: QueryValue[] = []): Promise<T> => {
  const [rows] = await q().query<T>(sql, params)
  return rows
}

// Exec helper (INSERT/UPDATE/DELETE)
const exec = async (sql: string, params: QueryValue[] = []): Promise<ResultSetHeader> => {
  const [res] = await q().query<ResultSetHeader>(sql, params)
  return res
}

//Model functions
const work_log_course_groups = {
  // Create a new group under a course
  async createWorkLogGroup(courseId: number, groupName: string): Promise<ResultSetHeader> {
    try {
      console.log('row 19, work_log_groupmodel.ts, createWorkLogGroup')
      return await exec(SQL.insertGroup, [courseId, groupName])
    } catch (error) {
      console.error('Error creating work log group:', error)
      throw error
    }
  },

  // Return students in a group (empty if group not found)
  async checkStudentsInWorklogGroup(groupId: number): Promise<RowDataPacket[]> {
    try {
      console.log('row 35, work_log_groupmodel.ts, checkStudentsInWorklogGroup')
      // Guard: ensure group exists before listing members
      const groupCheck = await queryRows<RowDataPacket[]>(SQL.selectGroupById, [groupId])
      if (!groupCheck.length) {
        console.log('Group not found:', groupId)
        return []
      }
      // Fetch distinct members of the group
      const rows = await queryRows<RowDataPacket[]>(SQL.selectStudentsByGroup, [groupId])
      return rows
    } catch (error) {
      console.error('Error checking students in worklog group:', error)
      throw error
    }
  },

  // Delete a group
  async deleteWorkLogGroup(groupId: number): Promise<ResultSetHeader> {
    try {
      console.log('row 68, work_log_groupmodel.ts, deleteWorkLogGroup')
      return await exec(SQL.deleteGroup, [groupId])
    } catch (error) {
      console.error('Error deleting work log group:', error)
      throw error
    }
  },

  // Rename a group
  async updateWorkLogGroup(groupId: number, groupName: string): Promise<ResultSetHeader> {
    try {
      console.log('row 87, work_log_groupmodel.ts, updateWorkLogGroup')
      return await exec(SQL.updateGroupNameById, [groupName, groupId])
    } catch (error) {
      console.error('Error updating work log group:', error)
      throw error
    }
  },

  // List groups for a course (with computed member_count)
  async getWorkLogGroupsByCourse(courseId: number): Promise<WorkLogCourseGroup[]> {
    try {
      console.log('row 105, work_log_groupmodel.ts, getWorkLogGroupsByCourse')
      return await queryRows<WorkLogCourseGroup[]>(SQL.selectGroupsByCourse, [courseId])
    } catch (error) {
      console.error('Error getting work log groups by course:', error)
      throw error
    }
  },

  // List groups a user belongs to
  async getUserGroups(userId: number): Promise<WorkLogCourseGroup[]> {
    try {
      console.log('row 125, work_log_groupmodel.ts, getUserGroups')
      return await queryRows<WorkLogCourseGroup[]>(SQL.selectUserGroups, [userId])
    } catch (error) {
      console.error('Error getting user groups:', error)
      throw error
    }
  },
}

export default work_log_course_groups
