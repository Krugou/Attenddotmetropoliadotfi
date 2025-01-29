import {ResultSetHeader, RowDataPacket} from 'mysql2';
import workLogModel, {
  WorkLogCourse,
  WorkLogEntry,
  WorkLogCourseUser,
  WorkLogCourseGroup,
} from '../models/worklogmodel.js';
import studentGroupModel from '../models/studentgroupmodel.js';
import userModel from '../models/usermodel.js';

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
  getWorkLogStats: (userId: number) => Promise<ResultSetHeader>;
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
}

const workLogController: WorkLogController = {
  async createWorkLogCourse(worklog: WorkLogCourseCreate) {
    try {
      const result = await workLogModel.createWorkLogCourse(
        worklog.name,
        worklog.startDate,
        worklog.endDate,
        worklog.code,
        worklog.description,
        worklog.requiredHours,
      );

      const courseId = result.insertId;

      if (worklog.instructors?.length) {
        await workLogModel.addInstructorsToCourse(
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

        await workLogModel.addStudentsToCourse(
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
      const hasAccess = await workLogModel.validateUserCourseAccess(
        entryData.userId,
        entryData.courseId,
      );

      if (!hasAccess) {
        throw new Error('User does not have access to this course');
      }

      const result = await workLogModel.createWorkLogEntry(
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
      const entries = await workLogModel.getWorkLogEntriesByUserId(userId);
      const courses = await workLogModel.getUserCourses(userId);
      const stats = await workLogModel.getWorkLogStatsByUser(userId);

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
      const result = await workLogModel.updateWorkLogEntryStatus(
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
      const course = await workLogModel.getWorkLogCourseById(courseId);
      const entries = await workLogModel.getWorkLogEntriesByCourse(courseId);
      const groups = await workLogModel.getWorkLogGroupsByCourse(courseId);
      const instructors = await workLogModel.getInstructorsByCourse(courseId);
      const userCount = await workLogModel.getUserCountByCourse(courseId);
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
      const result = await workLogModel.addUserToCourse(userId, courseId);
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
  async createWorkLogGroup(courseId, groupName) {
    try {
      const result = await workLogModel.createWorkLogGroup(courseId, groupName);

      return result.insertId;
    } catch (error) {
      console.error('Error in createWorkLogGroup:', error);
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
      const result = await workLogModel.assignStudentToGroup(groupId, userId);
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
  /*   async getWorkLogStats(userId: number) {
      try {
        const stats = await workLogModel.getWorkLogStatsByUser(userId);
        return stats;
      } catch (error) {
        console.error('Error in getWorkLogStats:', error);
        throw error;
      }
    }, */
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
      const records = await workLogModel.checkWorklogCodeExists(code);
      return records.length > 0;
    } catch (error) {
      console.error('Error checking worklog code:', error);
      throw error;
    }
  },
  async getWorkLogCoursesByInstructor(email: string): Promise<WorkLogCourse[]> {
    try {
      return await workLogModel.getWorkLogCoursesByInstructor(email);
    } catch (error) {
      console.error('Error in getWorkLogCoursesByInstructor:', error);
      throw error;
    }
  },

  async deleteWorkLog(worklogId: number) {
    try {
      const result = await workLogModel.deleteWorkLogCourse(worklogId);
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
      const existingWorklog = await workLogModel.getWorkLogCourseById(
        worklogId,
      );
      if (!existingWorklog?.length) {
        throw new Error('Worklog course not found');
      }

      // Update basic course details
      const courseUpdateResult = await workLogModel.updateWorkLogCourse(
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
        await workLogModel.removeAllInstructors(worklogId);
        await workLogModel.addInstructorsToCourse(
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
  getWorkLogStats: function (userId: number): Promise<ResultSetHeader> {
    throw new Error('Function not implemented.');
  },

  async getWorkLogStudentsByCourse(
    courseId: string,
  ): Promise<{students: RowDataPacket[]}> {
    try {
      const course = await workLogModel.getWorkLogCourseById(Number(courseId));
      if (!course?.length) {
        throw new Error('Worklog course not found');
      }

      const students = await workLogModel.getStudentsByCourse(Number(courseId));
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
      const students = await workLogModel.checkStudentsInWorklogGroup(groupId);
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
      const course = await workLogModel.getWorkLogCourseById(Number(courseId));
      if (!course?.length) {
        throw new Error('Worklog course not found');
      }

      // Get groups for the course
      const groups = await workLogModel.getWorkLogGroupsByCourse(
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
      const groups = await workLogModel.getWorkLogGroupsByCourse(courseId);
      const group = groups.find((g) => g.group_id === groupId);

      if (!group) {
        throw new Error(`Group ${groupId} not found in course ${courseId}`);
      }

      // Verify course exists in work_log_courses
      const course = await workLogModel.getWorkLogCourseById(courseId);

      if (!course?.length) {
        throw new Error(`Course ${courseId} not found`);
      }

      // Get students from student_group_assignments join with users
      const students = await workLogModel.checkStudentsInWorklogGroup(groupId);
      console.log('🚀 ~ students:', students);
      console.log('Students in group:', {
        groupId,
        studentCount: students?.length,
        studentIds: students?.map((s) => s.userid),
      });

      // Get entries from work_log_entries for these students
      const studentIds = students.map((s) => s.userid);
      const entries = await workLogModel.getWorkLogEntriesByGroupStudents(
        courseId,
        studentIds,
      );

      // Validate response shape matches tables
      const response = {
        group: {
          group_id: group.group_id,
          work_log_course_id: group.work_log_course_id,
          group_name: group.group_name,
        },
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
      const result = await workLogModel.closeWorkLogEntry(entryId);
      return result;
    } catch (error) {
      console.error('Error in closeWorkLogEntry:', error);
      throw error;
    }
  },
};

export default workLogController;
