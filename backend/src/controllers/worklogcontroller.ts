import { ResultSetHeader, RowDataPacket } from 'mysql2';
import work_log_courses, { WorkLogCourse } from '../models/work_log_coursemodel.js';
import work_log_entries, { WorkLogEntry } from '../models/work_log_entrymodel.js';
import work_log_course_groups, { WorkLogCourseGroup } from '../models/work_log_groupmodel.js';
import work_log_courses_users, { WorkLogCourseUser } from '../models/work_log_usermodel.js';
import work_log_instructors from '../models/work_log_instructormodel.js';
import student_group_assignments from '../models/student_group_assigments.js';
import studentGroupModel from '../models/studentgroupmodel.js';
import userModel from '../models/usermodel.js';
import logger from '../utils/logger.js';
import practicummodels from '../models/practicummodels.js';
import courseModel from '../models/coursemodel.js';

// Types
export interface Student {
  email: string;
  first_name: string;
  last_name: string;
  studentnumber: string;
  arrivalgroup: string;
}

export interface Instructor {
  email: string;
}

export interface WorkLogCourseCreate {
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  code: string;
  description: string;
  requiredHours: number;
  instructors?: Instructor[];
  studentList?: Student[];
}

export interface WorkLogEntryCreate {
  userId: number;
  courseId: number;
  startTime: Date;
  endTime: Date;
  description: string;
  status: 0 | 1 | 2 | 3;
  work_log_practicum_id?: number;
  work_log_course_id?: number;
}

export interface WorkLogEntriesResponse {
  entries: WorkLogEntry[];
  courses: WorkLogCourseUser[];
  stats: RowDataPacket[];
}

export interface WorkLogCourseDetails {
  course: WorkLogCourse & { instructor_name: string };
  entries: WorkLogEntry[];
  groups: WorkLogCourseGroup[];
}

export interface WorkLogCourseUpdate {
  name?: string;
  code?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  required_hours?: number;
  instructors?: string[];
}

export interface WorkLogGroupDetails {
  group: WorkLogCourseGroup;
  course: WorkLogCourse;
  students: RowDataPacket[];
  entries: WorkLogEntry[];
}

export interface WorkLogController {
  createWorkLogCourse: (worklog: WorkLogCourseCreate) => Promise<ResultSetHeader>;
  getWorkLogCourseDetails: (courseId: number) => Promise<WorkLogCourseDetails>;
  createWorkLogEntry: (entryData: WorkLogEntryCreate) => Promise<ResultSetHeader>;
  createWorkLogEntryPracticum: (entryData: WorkLogEntryCreate) => Promise<ResultSetHeader>;
  getWorkLogEntriesByUser: (userId: number) => Promise<WorkLogEntriesResponse>;
  updateWorkLogEntryStatus: (entryId: number, status: 0 | 1 | 2 | 3) => Promise<ResultSetHeader>;
  checkWorklogCodeExists: (code: string) => Promise<boolean>;
  createWorkLogGroup: (courseId: number, groupName: string) => Promise<number>;
  assignStudentToGroup: (groupId: number, userId: number) => Promise<ResultSetHeader>;
  assignUserToCourse: (userId: number, courseId: number) => Promise<ResultSetHeader>;
  getWorkLogStats: (userId: number, courseId?: number) => Promise<RowDataPacket[]>;
  getWorkLogCoursesByInstructor: (email: string) => Promise<WorkLogCourse[]>;
  deleteWorkLog: (worklogId: number) => Promise<ResultSetHeader>;
  updateWorkLogCourse: (worklogId: number, updates: WorkLogCourseUpdate) => Promise<ResultSetHeader>;
  getWorkLogStudentsByCourse: (courseId: string) => Promise<{ students: RowDataPacket[] }>;
  getWorkLogGroupStudents: (groupId: number) => Promise<{ students: RowDataPacket[] }>;
  getWorkLogGroupsByCourse: (courseId: string) => Promise<{ groups: WorkLogCourseGroup[] }>;
  getWorkLogGroupDetails: (courseId: number, groupId: number) => Promise<WorkLogGroupDetails>;
  closeWorkLogEntry: (entryId: number) => Promise<ResultSetHeader>;
  deleteWorkLogEntry: (entryId: number) => Promise<ResultSetHeader>;
  getWorkLogEntriesByStudentUser: (userId: number) => Promise<{ entries: (WorkLogEntry & { course: { name: string; code: string } })[] }>;
  updateWorkLogEntry: (entryId: number, updatedData: any) => Promise<ResultSetHeader>;
  checkStudentExistingGroup: (userId: number, courseId: number) => Promise<{ group_id: number; group_name: string } | null>;
  addNewStudentToWorklog: (
    courseId: number,
    studentData: {
      email: string; first_name: string; last_name: string; studentnumber: string; studentGroupId: number | null;
    },
  ) => Promise<{ success: boolean; userId: number; courseId: number; result: ResultSetHeader }>;
  removeStudentFromGroup: (groupId: number, studentId: number) => Promise<ResultSetHeader>;
}

// Helpers

// Ensure a student group exists; create and return its ID if missing
async function ensureStudentGroupId(groupName: string) {
  const existing = await studentGroupModel.checkIfGroupNameExists(groupName);
  if (existing?.length) return existing[0].studentgroupid as number;
  const created = await studentGroupModel.insertIntoStudentGroup(groupName);
  console.log(`worklogcontroller.ts created student group '${groupName}'`);
  return created.insertId as number;
}

// Create or update a student user and return its userId
async function upsertStudentUser(s: Student) {
  const existing = await userModel.checkIfUserExistsByEmail(s.email);
  if (existing.length > 0) {
    await userModel.updateUserStudentNumber(s.studentnumber, s.email);
    return existing[0].userid as number;
  }
  const groupId = await ensureStudentGroupId(s.arrivalgroup || 'default');
  const res = await userModel.insertStudentUser(s.email, s.first_name, s.last_name, s.studentnumber, groupId);
  console.log(`worklogcontroller.ts created student user ${s.email}`);
  return res.insertId as number;
}

// Guard: throw if the course doesn't exist; return course row if it does
async function ensureCourseExistsOrThrow(courseId: number) {
  const rows = await work_log_courses.getWorkLogCourseById(courseId);
  if (!rows?.length) throw new Error(`Course ${courseId} not found`);
  return rows[0] as WorkLogCourse;
}

// Controller
const workLogController: WorkLogController = {
  // Create a worklog course, attach instructors, and optionally enroll students
  async createWorkLogCourse(worklog) {
    try {
      console.log(`worklogcontroller.ts create course '${worklog.name}'`);
      const result = await work_log_courses.createWorkLogCourse(
        worklog.name, worklog.startDate, worklog.endDate, worklog.code, worklog.description, worklog.requiredHours,
      );
      const courseId = result.insertId;

      // Add instructors
      if (worklog.instructors?.length) {
        await work_log_instructors.addInstructorsToCourse(worklog.instructors, courseId);
        console.log(`worklogcontroller.ts added ${worklog.instructors.length} instructors`);
      }

      // Upsert student users and enroll them to the course
      if (worklog.studentList?.length) {
        await Promise.all(worklog.studentList.map(upsertStudentUser));
        const emails = worklog.studentList.map((s) => s.email);
        await work_log_courses_users.addStudentsToCourse(emails, courseId);
        console.log(`worklogcontroller.ts added ${emails.length} students to course ${courseId}`);
      }

      return result;
    } catch (error) {
      console.error('worklogcontroller.ts Error in createWorkLogCourse:', error);
      throw error;
    }
  },

  // Create a worklog entry for a course (validates user access)
  async createWorkLogEntry(entryData) {
    try {
      const hasAccess = await work_log_courses_users.validateUserCourseAccess(entryData.userId, entryData.courseId);
      if (!hasAccess) throw new Error('User does not have access to this course');

      const result = await work_log_entries.createWorkLogEntry(
        entryData.userId, entryData.courseId, entryData.startTime, entryData.endTime, entryData.description, entryData.status,
      );
      return result;
    } catch (error) {
      console.error('worklogcontroller.ts Error in createWorkLogEntry:', error);
      throw error;
    }
  },

  // Create a worklog entry for a practicum context
  async createWorkLogEntryPracticum(params: WorkLogEntryCreate) {
    if (!params.userId) throw new Error('User ID is required');
    if (!params.work_log_practicum_id) throw new Error('Practicum ID is required');
    return await work_log_entries.createPracticumEntry(
      params.userId, params.work_log_practicum_id, params.startTime, params.endTime, params.description, params.status,
    );
  },

  // Aggregate entries, enrolled courses, and stats for a user
  async getWorkLogEntriesByUser(userId) {
    try {
      const entries = await work_log_entries.getWorkLogEntriesByUserId(userId);
      const courses = await work_log_courses_users.getUserCourses(userId);
      const stats = await work_log_courses.getWorkLogStatsByUser(userId);
      console.log(`worklogcontroller.ts fetched entries for user ${userId}`);
      return { entries, courses, stats };
    } catch (error) {
      console.error('worklogcontroller.ts Error in getWorkLogEntriesByUser:', error);
      throw error;
    }
  },

  // Update a single worklog entry's status
  async updateWorkLogEntryStatus(entryId, status) {
    try {
      return await work_log_entries.updateWorkLogEntryStatus(entryId, status);
    } catch (error) {
      console.error('worklogcontroller.ts Error in updateWorkLogEntryStatus:', error);
      throw error;
    }
  },

  // Get course details with entries, groups, instructors summary and user count
  async getWorkLogCourseDetails(courseId) {
    try {
      const [course, entries, groups, instructors, userCount] = await Promise.all([
        work_log_courses.getWorkLogCourseById(courseId),
        work_log_entries.getWorkLogEntriesByCourse(courseId),
        work_log_course_groups.getWorkLogGroupsByCourse(courseId),
        work_log_instructors.getInstructorsByCourse(courseId),
        work_log_courses_users.getUserCountByCourse(courseId),
      ]);
      if (!course?.length) throw new Error('Worklog course not found');

      console.log(`worklogcontroller.ts fetched course details ${courseId}`);
      return {
        course: { ...course[0], user_count: userCount, instructor_name: instructors.map((i) => i.email).join(',') },
        entries,
        groups,
      };
    } catch (error) {
      console.error('worklogcontroller.ts Error in getWorkLogCourseDetails:', error);
      throw error;
    }
  },

  // Enroll an existing user directly to a worklog course
  async assignUserToCourse(userId: number, courseId: number) {
    try {
      const result = await work_log_courses_users.addUserToCourse(userId, courseId);
      console.log(`worklogcontroller.ts assigned user ${userId} to course ${courseId}`);
      return result;
    } catch (error) {
      console.error('worklogcontroller.ts Error in assignUserToCourse:', error);
      throw error;
    }
  },

  // Create a unique group inside a course
  async createWorkLogGroup(courseId, groupName) {
    try {
      await ensureCourseExistsOrThrow(courseId);

      const existingGroups = await work_log_course_groups.getWorkLogGroupsByCourse(courseId);
      if (existingGroups.some((g) => g.group_name === groupName)) {
        throw new Error('Group name already exists for this course');
      }

      const result = await work_log_course_groups.createWorkLogGroup(courseId, groupName);
      if (!result?.insertId) throw new Error('Failed to create group - no ID returned');

      console.log(`worklogcontroller.ts created group '${groupName}' for course ${courseId}`);
      return result.insertId;
    } catch (error) {
      logger.error('Error in createWorkLogGroup:', error);
      throw error;
    }
  },

  // Add a student to a specific group
  async assignStudentToGroup(groupId: number, userId: number) {
    try {
      const result = await student_group_assignments.assignStudentToGroup(groupId, userId);
      console.log(`worklogcontroller.ts assigned student ${userId} to group ${groupId}`);
      return result;
    } catch (error) {
      console.error('worklogcontroller.ts Error in assignStudentToGroup:', error);
      throw error;
    }
  },

  // Time/quantity stats for a user (optionally narrowed by course)
  async getWorkLogStats(userId: number, courseId?: number) {
    try {
      const stats = await work_log_courses.getWorkLogStatsByUser(userId, courseId);
      return stats;
    } catch (error) {
      console.error('worklogcontroller.ts Error in getWorkLogStats:', error);
      throw error;
    }
  },

  // Check if a code already exists (checks both work_log_courses and courses)
  async checkWorklogCodeExists(code: string) {
    if (!code) throw new Error('Worklog code is required');
    try {
      const [worklogRecords, courseRecords] = await Promise.all([
        work_log_courses.checkWorklogCodeExists(code),
        courseModel.findByCode(code),
      ]);

      const existsInWorklogs = worklogRecords?.length > 0;
      const existsInCourses = Array.isArray(courseRecords) ? courseRecords.length > 0 : Boolean(courseRecords);

      return existsInWorklogs || existsInCourses;
    } catch (error) {
      console.error('worklogcontroller.ts Error checking worklog code:', error);
      throw error;
    }
  },

  // List worklog courses where the email is an instructor
  async getWorkLogCoursesByInstructor(email: string) {
    try {
      return await work_log_courses.getWorkLogCoursesByInstructor(email);
    } catch (error) {
      console.error('worklogcontroller.ts Error in getWorkLogCoursesByInstructor:', error);
      throw error;
    }
  },

  // Delete a worklog course by ID
  async deleteWorkLog(worklogId: number) {
    try {
      const result = await work_log_courses.deleteWorkLogCourse(worklogId);
      if (result.affectedRows === 0) throw new Error('Worklog not found');
      console.log(`worklogcontroller.ts deleted worklog ${worklogId}`);
      return result;
    } catch (error) {
      console.error('worklogcontroller.ts Error in deleteWorkLog:', error);
      throw error;
    }
  },

  // Update worklog course fields and optionally replace instructors
  async updateWorkLogCourse(worklogId: number, updates: WorkLogCourseUpdate) {
    try {
      const existing = await work_log_courses.getWorkLogCourseById(worklogId);
      if (!existing?.length) throw new Error('Worklog course not found');

      const courseUpdateResult = await work_log_courses.updateWorkLogCourse(worklogId, {
        name: updates.name,
        code: updates.code,
        description: updates.description,
        start_date: updates.start_date,
        end_date: updates.end_date,
        required_hours: updates.required_hours,
      });

      if (updates.instructors?.length) {
        await work_log_instructors.removeAllInstructors(worklogId);
        await work_log_instructors.addInstructorsToCourse(
          updates.instructors.map((email) => ({ email })), worklogId,
        );
        console.log(`worklogcontroller.ts updated instructors for worklog ${worklogId}`);
      } else {
        console.log(`worklogcontroller.ts updated worklog ${worklogId}`);
      }

      return courseUpdateResult;
    } catch (error) {
      console.error('worklogcontroller.ts Error in updateWorkLogCourse:', error);
      throw error;
    }
  },

  // Get all students enrolled in a given worklog course
  async getWorkLogStudentsByCourse(courseId: string) {
    try {
      await ensureCourseExistsOrThrow(Number(courseId));
      const students = await work_log_courses_users.getStudentsByCourse(Number(courseId));
      return { students: students || [] };
    } catch (error) {
      console.error('worklogcontroller.ts Error getting worklog course students:', error);
      throw error;
    }
  },

  // Get students belonging to a specific group
  async getWorkLogGroupStudents(groupId: number) {
    try {
      const students = await student_group_assignments.getGroupMembers(groupId);
      return { students: students || [] };
    } catch (error) {
      console.error('worklogcontroller.ts Error getting worklog group students:', error);
      throw error;
    }
  },

  // Get all groups under a course
  async getWorkLogGroupsByCourse(courseId: string) {
    try {
      await ensureCourseExistsOrThrow(Number(courseId));
      const groups = await work_log_course_groups.getWorkLogGroupsByCourse(Number(courseId));
      return { groups: groups || [] };
    } catch (error) {
      console.error('worklogcontroller.ts Error getting worklog course groups:', error);
      throw error;
    }
  },

  // Group details: group + course header + members + their entries
  async getWorkLogGroupDetails(courseId: number, groupId: number) {
    try {
      if (!courseId || !groupId) throw new Error('Invalid courseId or groupId');

      const [groups, course, students] = await Promise.all([
        work_log_course_groups.getWorkLogGroupsByCourse(courseId),
        work_log_courses.getWorkLogCourseById(courseId),
        student_group_assignments.getGroupMembers(groupId),
      ]);

      const group = groups.find((g) => g.group_id === groupId);
      if (!group) throw new Error(`Group ${groupId} not found in course ${courseId}`);
      if (!course?.length) throw new Error(`Course ${courseId} not found`);

      const studentIds = students.map((s) => s.userid);
      const entries = await work_log_entries.getWorkLogEntriesByGroupStudents(courseId, studentIds);

      console.log(`worklogcontroller.ts fetched group details for ${groupId} (course ${courseId})`);
      return { group, course: course[0], students: students || [], entries: entries || [] };
    } catch (error) {
      console.error('worklogcontroller.ts Error in getWorkLogGroupDetails:', error);
      throw error;
    }
  },

  // Close an open worklog entry by ID
  async closeWorkLogEntry(entryId: number) {
    try {
      const result = await work_log_entries.closeWorkLogEntry(entryId);
      return result;
    } catch (error) {
      console.error('worklogcontroller.ts Error in closeWorkLogEntry:', error);
      throw error;
    }
  },

  // Delete a worklog entry by ID
  async deleteWorkLogEntry(entryId: number) {
    try {
      const entry = await work_log_entries.getWorkLogEntryById(entryId);
      if (!entry) throw new Error('Worklog entry not found');

      const result = await work_log_entries.deleteWorkLogEntry(entryId);
      if (result.affectedRows === 0) throw new Error('Failed to delete worklog entry');

      console.log(`worklogcontroller.ts deleted worklog entry ${entryId}`);
      return result;
    } catch (error) {
      console.error('worklogcontroller.ts Error in deleteWorkLogEntry:', error);
      throw error;
    }
  },

  // Entries for a student, each augmented with its course/practicum name + code
  async getWorkLogEntriesByStudentUser(userId: number) {
    try {
      const entries = await work_log_entries.getWorkLogEntriesByUserId(userId);
      const entriesWithCourses = await Promise.all(
        entries.map(async (entry) => {
          if (entry.work_log_practicum_id) {
            const practicumDetails = await practicummodels.getPracticumById(entry.work_log_practicum_id);
            return {
              ...entry,
              isPracticum: true,
              course: {
                name: practicumDetails[0]?.name || 'Practicum',
                code: practicumDetails[0]?.code || '',
              },
            };
          }
          const courseDetails = await work_log_courses.getWorkLogCourseById(entry.work_log_course_id);
          return {
            ...entry,
            isPracticum: false,
            course: { name: courseDetails[0]?.name || '', code: courseDetails[0]?.code || '' },
          };
        }),
      );
      console.log(`worklogcontroller.ts fetched entries (student view) for user ${userId}`);
      return { entries: entriesWithCourses };
    } catch (error) {
      console.error('worklogcontroller.ts Error in getWorkLogEntriesByStudentUser:', error);
      throw error;
    }
  },

  // Update entry fields (description/times/status)
  async updateWorkLogEntry(entryId: number, updatedData: any) {
    try {
      const updates = {
        description: updatedData.description,
        start_time: updatedData.startTime || updatedData.start_time,
        end_time: updatedData.endTime || updatedData.end_time,
        status: updatedData.status,
      };
      const result = await work_log_entries.updateWorkLogEntry(entryId, updates);
      if (result.affectedRows === 0) throw new Error('Failed to update worklog entry');
      console.log(`worklogcontroller.ts updated worklog entry ${entryId}`);
      return result;
    } catch (error) {
      console.error('worklogcontroller.ts Error in updateWorkLogEntry:', error);
      throw error;
    }
  },

  // Return the group (if any) a student belongs to within a course
  async checkStudentExistingGroup(userId: number, courseId: number) {
    try {
      return await work_log_courses_users.checkStudentExistingGroup(userId, courseId);
    } catch (error) {
      console.error('worklogcontroller.ts Error checking student existing group:', error);
      throw error;
    }
  },

  // Create (or reuse) a student user and enroll them into the course
  async addNewStudentToWorklog(courseId: number, studentData: {
    email: string; first_name: string; last_name: string; studentnumber: string; studentGroupId: number | null;
  }) {
    try {
      let userId: number;
      const existing = await userModel.checkIfUserExistsByEmail(studentData.email);

      if (existing.length > 0) {
        userId = existing[0].userid;
        await userModel.updateUserStudentNumber(studentData.studentnumber, studentData.email);
      } else {
        const res = await userModel.insertStudentUser(
          studentData.email, studentData.first_name, studentData.last_name, studentData.studentnumber, studentData.studentGroupId || 0,
        );
        userId = res.insertId;
        console.log(`worklogcontroller.ts created student user ${studentData.email}`);
      }

      const result = await work_log_courses_users.addUserToCourse(userId, courseId);
      console.log(`worklogcontroller.ts added user ${userId} to course ${courseId}`);

      return { success: true, userId, courseId, result };
    } catch (error) {
      console.error('worklogcontroller.ts Error adding student to worklog:', error);
      throw error;
    }
  },

  // Remove a student from a specific group (with guards)
  async removeStudentFromGroup(groupId: number, studentId: number) {
    try {
      const members = await student_group_assignments.getGroupMembers(groupId);
      const exists = members.some((m) => m.userid === studentId);
      if (!exists) throw new Error('Student not found in group');

      const result = await student_group_assignments.removeStudentFromGroup(groupId, studentId);
      if (result.affectedRows === 0) throw new Error('Failed to remove student from group');

      console.log(`worklogcontroller.ts removed student ${studentId} from group ${groupId}`);
      return result;
    } catch (error) {
      logger.error('Error removing student from group:', error);
      throw error;
    }
  },
};

export default workLogController;
