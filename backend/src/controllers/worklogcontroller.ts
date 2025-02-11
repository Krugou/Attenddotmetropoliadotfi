import {ResultSetHeader, RowDataPacket} from 'mysql2';
import work_log_courses from '../models/work_log_coursemodel.js';
import work_log_entries from '../models/work_log_entrymodel.js';
import work_log_course_groups from '../models/work_log_groupmodel.js';
import work_log_courses_users from '../models/work_log_usermodel.js';
import work_log_instructors from '../models/work_log_instructormodel.js';
import student_group_assignments from '../models/student_group_assigments.js';
import studentGroupModel from '../models/studentgroupmodel.js';
import userModel from '../models/usermodel.js';
import { WorkLogCourse } from '../models/work_log_coursemodel.js';
import { WorkLogEntry } from '../models/work_log_entrymodel.js';
import { WorkLogCourseGroup } from '../models/work_log_groupmodel.js';
import { WorkLogCourseUser } from '../models/work_log_usermodel.js';
import logger from '../utils/logger.js';

// Define interfaces for input data
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
}

export interface CreateGroupData {
  courseId: number;
  groupName: string;
}

export interface AssignStudentData {
  groupId: number;
  userId: number;
}

export interface AssignUserData {
  userId: number;
  courseId: number;
}

export interface WorkLogEntriesResponse {
  entries: WorkLogEntry[];
  courses: WorkLogCourseUser[];
  stats: RowDataPacket[];
}

export interface WorkLogCourseDetails {
  course: WorkLogCourse & {
    instructor_name: string;
  };
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

/**
 * WorkLogController interface represents the structure of the worklog controller.
 *
 * This interface provides methods for managing worklog courses and entries.
 */
export interface WorkLogController {
  /**
   * Creates a new worklog course with the given data
   * @param name Course name
   * @param startDate Course start date
   * @param endDate Course end date
   * @param code Course code
   * @param description Course description
   * @param requiredHours Required hours for the course
   * @param students List of students to enroll
   * @param instructors List of instructors to assign
   */
  createWorkLogCourse: (
    worklog: WorkLogCourseCreate,
  ) => Promise<ResultSetHeader>;

  /**
   * Gets details of a worklog course by ID
   */
  getWorkLogCourseDetails: (courseId: number) => Promise<WorkLogCourseDetails>;

  /**
   * Creates a new worklog entry
   */
  createWorkLogEntry: (
    entryData: WorkLogEntryCreate,
  ) => Promise<ResultSetHeader>;

  /**
   * Gets all worklog entries for a user
   * @param userId The user ID to get entries for
   * @returns Promise with entries, courses and stats
   */
  getWorkLogEntriesByUser: (userId: number) => Promise<WorkLogEntriesResponse>;

  /**
   * Updates the status of a worklog entry
   */
  updateWorkLogEntryStatus: (
    entryId: number,
    status: 0 | 1 | 2 | 3,
  ) => Promise<ResultSetHeader>;

  /**
   * Checks if a worklog code already exists
   */
  checkWorklogCodeExists: (code: string) => Promise<boolean>;

  createWorkLogGroup: (courseId: number, groupName: string) => Promise<number>;
  assignStudentToGroup: (
    groupId: number,
    userId: number,
  ) => Promise<ResultSetHeader>;
  assignUserToCourse: (
    userId: number,
    courseId: number,
  ) => Promise<ResultSetHeader>;
  getWorkLogStats: (userId: number) => Promise<RowDataPacket[]>;
  getWorkLogCoursesByInstructor: (email: string) => Promise<WorkLogCourse[]>;
  deleteWorkLog: (worklogId: number) => Promise<ResultSetHeader>;

  /**
   * Updates a worklog course
   * @param worklogId The ID of the worklog to update
   * @param updates The update data
   */
  updateWorkLogCourse: (
    worklogId: number,
    updates: WorkLogCourseUpdate,
  ) => Promise<ResultSetHeader>;

  /**
   * Gets all students enrolled in a worklog course
   * @param courseId The ID of the course
   * @returns Promise with student data including email and names
   * @throws Error if course not found or database error
   */
  getWorkLogStudentsByCourse: (
    courseId: string,
  ) => Promise<{students: RowDataPacket[]}>;

  /**
   * Gets all students assigned to a specific worklog group
   * @param groupId The ID of the worklog group
   * @returns Promise with array of student data
   * @throws Error if group not found
   */
  getWorkLogGroupStudents: (
    groupId: number,
  ) => Promise<{students: RowDataPacket[]}>;

  /**
   * Gets all worklog groups for a specific course
   * @param courseId The ID of the course to get groups for
   * @returns Promise with array of worklog groups
   * @throws Error if course not found or database error occurs
   */
  getWorkLogGroupsByCourse: (
    courseId: string,
  ) => Promise<{groups: WorkLogCourseGroup[]}>;

  getWorkLogGroupDetails: (
    courseId: number,
    groupId: number,
  ) => Promise<WorkLogGroupDetails>;

  closeWorkLogEntry: (entryId: number) => Promise<ResultSetHeader>;

  /**
   * Deletes a worklog entry
   * @param entryId The ID of the entry to delete
   * @returns Promise with delete result
   * @throws Error if entry not found or deletion fails
   */
  deleteWorkLogEntry: (entryId: number) => Promise<ResultSetHeader>;

  /**
   * Gets work log entries with course details for a student user
   * @param userId The ID of the student user
   * @returns Promise with entries and their associated course details
   */
  getWorkLogEntriesByStudentUser: (userId: number) => Promise<{
    entries: (WorkLogEntry & {
      course: {
        name: string;
        code: string;
      };
    })[];
  }>;

  /**
   * Updates a worklog entry
   * @param entryId The ID of the entry to update
   * @param updatedData The updated data
   * @returns Promise with update result
   * @throws Error if entry not found or update fails
   */
  updateWorkLogEntry: (
    entryId: number,
    updatedData: any,
  ) => Promise<ResultSetHeader>;

  checkStudentExistingGroup: (
    userId: number,
    courseId: number
  ) => Promise<{group_id: number; group_name: string} | null>;

  addNewStudentToWorklog: (
    courseId: number,
    studentData: {
      email: string;
      first_name: string;
      last_name: string;
      studentnumber: string;
      studentGroupId: number | null;
    }
  ) => Promise<{
    success: boolean;
    userId: number;
    courseId: number;
    result: ResultSetHeader;
  }>;
}

const workLogController: WorkLogController = {
  async createWorkLogCourse(worklog: WorkLogCourseCreate) {
    try {
      const result = await work_log_courses.createWorkLogCourse(
        worklog.name,
        worklog.startDate,
        worklog.endDate,
        worklog.code,
        worklog.description,
        worklog.requiredHours,
      );

      const courseId = result.insertId;

      if (worklog.instructors?.length) {
        await work_log_instructors.addInstructorsToCourse(
          worklog.instructors,
          courseId,
        );
      }

      if (worklog.studentList?.length) {
        for (const student of worklog.studentList) {
          const groupName = student.arrivalgroup || 'default';

          let studentGroupId;
          const existingGroup = await studentGroupModel.checkIfGroupNameExists(
            groupName,
          );

          if (existingGroup && existingGroup?.length > 0) {
            studentGroupId = existingGroup[0].studentgroupid;
          } else {
            const newGroup = await studentGroupModel.insertIntoStudentGroup(
              groupName,
            );
            studentGroupId = newGroup.insertId;
          }

          const existingUser = await userModel.checkIfUserExistsByEmail(
            student.email,
          );

          if (existingUser.length > 0) {
            await userModel.updateUserStudentNumber(
              student.studentnumber,
              student.email,
            );
          } else {
            await userModel.insertStudentUser(
              student.email,
              student.first_name,
              student.last_name,
              student.studentnumber,
              studentGroupId,
            );
          }
        }

        await work_log_courses_users.addStudentsToCourse(
          worklog.studentList.map((s) => s.email),
          courseId,
        );
      }

      return result;
    } catch (error) {
      console.error('Error in createWorkLogCourse:', error);
      throw error;
    }
  },

  /**
   * Creates a new work log entry
   * @param entryData The entry data to create
   */
  async createWorkLogEntry(entryData: WorkLogEntryCreate) {
    try {
      // Validate user has access to the course
      const hasAccess = await work_log_courses_users.validateUserCourseAccess(
        entryData.userId,
        entryData.courseId,
      );

      if (!hasAccess) {
        throw new Error('User does not have access to this course');
      }

      const result = await work_log_entries.createWorkLogEntry(
        entryData.userId,
        entryData.courseId,
        entryData.startTime,
        entryData.endTime,
        entryData.description,
        entryData.status,
      );
      return result;
    } catch (error) {
      console.error('Error in createWorkLogEntry:', error);
      throw error;
    }
  },

  /**
   * Gets all work log entries for a user
   * @param userId The user ID to get entries for
   * @returns Promise with entries, courses and stats
   */
  async getWorkLogEntriesByUser(
    userId: number,
  ): Promise<WorkLogEntriesResponse> {
    try {
      const entries = await work_log_entries.getWorkLogEntriesByUserId(userId);
      const courses = await work_log_courses_users.getUserCourses(userId);
      const stats = await work_log_courses.getWorkLogStatsByUser(userId);

      return {
        entries,
        courses,
        stats,
      };
    } catch (error) {
      console.error('Error in getWorkLogEntriesByUser:', error);
      throw error;
    }
  },

  /**
   * Updates the status of a work log entry
   * @param entryId The entry ID to update
   * @param status The new status
   */
  async updateWorkLogEntryStatus(entryId: number, status: 0 | 1 | 2 | 3) {
    try {
      const result = await work_log_entries.updateWorkLogEntryStatus(
        entryId,
        status,
      );
      return result;
    } catch (error) {
      console.error('Error in updateWorkLogEntryStatus:', error);
      throw error;
    }
  },

  /**
   * Gets detailed information about a work log course
   * @param courseId The course ID to get details for
   */
  async getWorkLogCourseDetails(
    courseId: number,
  ): Promise<WorkLogCourseDetails> {
    try {
      const course = await work_log_courses.getWorkLogCourseById(courseId);
      const entries = await work_log_entries.getWorkLogEntriesByCourse(courseId);
      const groups = await work_log_course_groups.getWorkLogGroupsByCourse(courseId);
      const instructors = await work_log_instructors.getInstructorsByCourse(courseId);
      const userCount = await work_log_courses_users.getUserCountByCourse(courseId);
      return {
        course: {
          ...course[0],
          user_count: userCount,
          instructor_name: instructors.map((i) => i.email).join(','),
        },
        entries,
        groups,
      };
    } catch (error) {
      console.error('Error in getWorkLogCourseDetails:', error);
      throw error;
    }
  },

  /**
   * Assigns a user to a course
   * @param userId The user ID to assign
   * @param courseId The course ID to assign to
   */
  async assignUserToCourse(userId, courseId) {
    try {
      const result = await work_log_courses_users.addUserToCourse(userId, courseId);
      return result;
    } catch (error) {
      console.error('Error in assignUserToCourse:', error);
      throw error;
    }
  },

  /**
   * Creates a new work log group
   * @param courseId The course ID to create the group for
   * @param groupName The name of the group
   */
  async createWorkLogGroup(courseId: number, groupName: string) {
    try {
      // First verify the course exists
      const course = await work_log_courses.getWorkLogCourseById(courseId);
      if (!course?.length) {
        throw new Error(`Course ${courseId} not found`);
      }

      // Verify group name doesn't already exist for this course
      const existingGroups = await work_log_course_groups.getWorkLogGroupsByCourse(courseId);
      if (existingGroups.some(g => g.group_name === groupName)) {
        throw new Error('Group name already exists for this course');
      }

      const result = await work_log_course_groups.createWorkLogGroup(courseId, groupName);
      if (!result?.insertId) {
        throw new Error('Failed to create group - no ID returned');
      }

      return result.insertId;
    } catch (error) {
      logger.error('Error in createWorkLogGroup:', error);
      throw error;
    }
  },

  /**
   * Assigns a student to a group
   * @param groupId The group ID to assign to
   * @param userId The user ID to assign
   */
  async assignStudentToGroup(groupId, userId) {
    try {
      const result = await student_group_assignments.assignStudentToGroup(groupId, userId);
      console.log('🚀 ~ assignStudentToGroup ~ result:', result);
      return result;
    } catch (error) {
      console.error('Error in assignStudentToGroup:', error);
      throw error;
    }
  },

  /**
   * Gets work log statistics for a user
   * @param userId The user ID to get stats for
   */
  async getWorkLogStats(userId: number) {
      try {
        const stats = await work_log_courses.getWorkLogStatsByUser(userId);
        return stats;
      } catch (error) {
        console.error('Error in getWorkLogStats:', error);
        throw error;
      }
    },
  /**
   * Checks if a worklog course with the given code already exists
   * @param code The code to check
   * @returns Promise<boolean> True if code exists, false otherwise
   */
  async checkWorklogCodeExists(code: string): Promise<boolean> {
    if (!code) {
      throw new Error('Worklog code is required');
    }
    try {
      const records = await work_log_courses.checkWorklogCodeExists(code);
      return records.length > 0;
    } catch (error) {
      console.error('Error checking worklog code:', error);
      throw error;
    }
  },
  async getWorkLogCoursesByInstructor(email: string): Promise<WorkLogCourse[]> {
    try {
      return await work_log_courses.getWorkLogCoursesByInstructor(email);
    } catch (error) {
      console.error('Error in getWorkLogCoursesByInstructor:', error);
      throw error;
    }
  },

  async deleteWorkLog(worklogId: number) {
    try {
      const result = await work_log_courses.deleteWorkLogCourse(worklogId);
      if (result.affectedRows === 0) {
        throw new Error('Worklog not found');
      }
      return result;
    } catch (error) {
      console.error('Error in deleteWorkLog:', error);
      throw error;
    }
  },

  async updateWorkLogCourse(worklogId: number, updates: WorkLogCourseUpdate) {
    try {
      // First validate the worklog exists
      const existingWorklog = await work_log_courses.getWorkLogCourseById(
        worklogId,
      );
      if (!existingWorklog?.length) {
        throw new Error('Worklog course not found');
      }

      // Update basic course details
      const courseUpdateResult = await work_log_courses.updateWorkLogCourse(
        worklogId,
        {
          name: updates.name,
          code: updates.code,
          description: updates.description,
          start_date: updates.start_date,
          end_date: updates.end_date,
          required_hours: updates.required_hours,
        },
      );

      // Handle instructor updates if provided
      if (updates.instructors && updates.instructors.length > 0) {
        await work_log_instructors.removeAllInstructors(worklogId);
        await work_log_instructors.addInstructorsToCourse(
          updates.instructors.map((email) => ({email})),
          worklogId,
        );
      }

      return courseUpdateResult;
    } catch (error) {
      console.error('Error in updateWorkLogCourse:', error);
      throw error;
    }
  },


  async getWorkLogStudentsByCourse(
    courseId: string,
  ): Promise<{students: RowDataPacket[]}> {
    try {
      const course = await work_log_courses.getWorkLogCourseById(Number(courseId));
      if (!course?.length) {
        throw new Error('Worklog course not found');
      }

      const students = await work_log_courses_users.getStudentsByCourse(Number(courseId));
      return {
        students: students || [],
      };
    } catch (error) {
      console.error('Error getting worklog course students:', error);
      throw error;
    }
  },

  async getWorkLogGroupStudents(
    groupId: number,
  ): Promise<{students: RowDataPacket[]}> {
    try {
      const students = await student_group_assignments.getGroupMembers(groupId);
      return {
        students: students || [],
      };
    } catch (error) {
      console.error('Error getting worklog group students:', error);
      throw error;
    }
  },

  async getWorkLogGroupsByCourse(
    courseId: string,
  ): Promise<{groups: WorkLogCourseGroup[]}> {
    try {
      // First validate the course exists
      const course = await work_log_courses.getWorkLogCourseById(Number(courseId));
      if (!course?.length) {
        throw new Error('Worklog course not found');
      }

      // Get groups for the course
      const groups = await work_log_course_groups.getWorkLogGroupsByCourse(
        Number(courseId),
      );
      return {
        groups: groups || [],
      };
    } catch (error) {
      console.error('Error getting worklog course groups:', error);
      throw error;
    }
  },

  async getWorkLogGroupDetails(
    courseId: number,
    groupId: number,
  ): Promise<WorkLogGroupDetails> {
    try {
      // Input validation
      if (!courseId || !groupId) {
        throw new Error('Invalid courseId or groupId');
      }

      // Get group details and validate against work_log_course_groups schema
      const groups = await work_log_course_groups.getWorkLogGroupsByCourse(courseId);
      const group = groups.find((g) => g.group_id === groupId);

      if (!group) {
        throw new Error(`Group ${groupId} not found in course ${courseId}`);
      }

      // Verify course exists in work_log_courses
      const course = await work_log_courses.getWorkLogCourseById(courseId);

      if (!course?.length) {
        throw new Error(`Course ${courseId} not found`);
      }

      // Get students from student_group_assignments join with users
      const students = await student_group_assignments.getGroupMembers(groupId);
      console.log('🚀 ~ students:', students);
      console.log('Students in group:', {
        groupId,
        studentCount: students?.length,
        studentIds: students?.map((s) => s.userid),
      });

      // Get entries from work_log_entries for these students
      const studentIds = students.map((s) => s.userid);
      const entries = await work_log_entries.getWorkLogEntriesByGroupStudents(
        courseId,
        studentIds,
      );

      // Validate response shape matches tables
      const response = {
        group: group,
        course: course[0],
        students: students || [],
        entries: entries || [],
      };

      return response;
    } catch (error) {
      console.error('Error in getWorkLogGroupDetails:', error);
      throw error;
    }
  },

  async closeWorkLogEntry(entryId: number): Promise<ResultSetHeader> {
    try {
      // Validate entry exists and is active
      const result = await work_log_entries.closeWorkLogEntry(entryId);
      return result;
    } catch (error) {
      console.error('Error in closeWorkLogEntry:', error);
      throw error;
    }
  },

  async deleteWorkLogEntry(entryId: number): Promise<ResultSetHeader> {
    try {
      // First verify the entry exists
      const entry = await work_log_entries.getWorkLogEntryById(entryId);
      console.log('🚀 ~ deleteWorkLogEntry ~ entry:', entry);

      if (!entry) {
        throw new Error('Worklog entry not found');
      }

      const result = await work_log_entries.deleteWorkLogEntry(entryId);

      if (result.affectedRows === 0) {
        throw new Error('Failed to delete worklog entry');
      }

      return result;
    } catch (error) {
      console.error('Error in deleteWorkLogEntry:', error);
      throw error;
    }
  },

  async getWorkLogEntriesByStudentUser(userId: number) {
    try {

      const entries = await work_log_entries.getWorkLogEntriesByUserId(userId);


      const entriesWithCourses = await Promise.all(
        entries.map(async (entry) => {
          const courseDetails = await work_log_courses.getWorkLogCourseById(
            entry.work_log_course_id,
          );

          return {
            ...entry,
            course: {
              name: courseDetails[0]?.name || '',
              code: courseDetails[0]?.code || '',
            },
          };
        }),
      );

      return {
        entries: entriesWithCourses,
      };
    } catch (error) {
      console.error('Error in getWorkLogEntriesByStudentUser:', error);
      throw error;
    }
  },

  async updateWorkLogEntry(entryId: number, updatedData: any) {
    try {

      const entry = await work_log_entries.getWorkLogEntryById(entryId);
      if (!entry) {
        throw new Error('Worklog entry not found');
      }


      const updates = {
        description: updatedData.description,
        start_time: updatedData.startTime || updatedData.start_time,
        end_time: updatedData.endTime || updatedData.end_time,
        status: updatedData.status
      };


      const result = await work_log_entries.updateWorkLogEntry(entryId, updates);

      if (result.affectedRows === 0) {
        throw new Error('Failed to update worklog entry');
      }

      return result;
    } catch (error) {
      console.error('Error in updateWorkLogEntry:', error);
      throw error;
    }
  },

  async checkStudentExistingGroup(
    userId: number,
    courseId: number
  ): Promise<{group_id: number; group_name: string} | null> {
    try {
      return await work_log_courses_users.checkStudentExistingGroup(userId, courseId);
    } catch (error) {
      console.error('Error checking student existing group:', error);
      throw error;
    }
  },

  async addNewStudentToWorklog(courseId: number, studentData: {
    email: string;
    first_name: string;
    last_name: string;
    studentnumber: string;
    studentGroupId: number | null;
  }) {
    try {
      // First check if user exists
      let userId: number;
      const existingUser = await userModel.checkIfUserExistsByEmail(studentData.email);

      if (existingUser.length > 0) {
        userId = existingUser[0].userid;
        await userModel.updateUserStudentNumber(studentData.studentnumber, studentData.email);
      } else {
        const userResult = await userModel.insertStudentUser(
          studentData.email,
          studentData.first_name,
          studentData.last_name,
          studentData.studentnumber,
          studentData.studentGroupId || 0,
        );
        userId = userResult.insertId;
      }

      // Add user to worklog course
      const result = await work_log_courses_users.addUserToCourse(userId, courseId);

      return {
        success: true,
        userId,
        courseId,
        result
      };
    } catch (error) {
      console.error('Error adding student to worklog:', error);
      throw error;
    }
  }
};

export default workLogController;
