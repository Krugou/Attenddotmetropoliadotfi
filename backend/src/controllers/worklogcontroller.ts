import {ResultSetHeader} from 'mysql2';
import workLogModel from '../models/worklogmodel.js';

// Define interfaces for input data
export interface Student {
  email: string;
  first_name: string;
  last_name: string;
  studentnumber: string;
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
    worklog: WorkLogCourseCreate
  ) => Promise<ResultSetHeader>;

  /**
   * Gets details of a worklog course by ID
   */
  getWorkLogCourseDetails: (courseId: number) => Promise<any>;

  /**
   * Creates a new worklog entry
   */
  createWorkLogEntry: (entryData: WorkLogEntryCreate) => Promise<ResultSetHeader>;

  /**
   * Gets all worklog entries for a user
   */
  getWorkLogEntriesByUser: (userId: number) => Promise<any>;

  /**
   * Updates the status of a worklog entry
   */
  updateWorkLogEntryStatus: (entryId: number, status: 0 | 1 | 2 | 3 ) => Promise<ResultSetHeader>;

  /**
   * Checks if a worklog code already exists
   */
  checkWorklogCodeExists: (code: string) => Promise<boolean>;

  createWorkLogGroup: (courseId: number, groupName:string ) => Promise<ResultSetHeader>;
  assignStudentToGroup: (groupId:number ,userId: number) => Promise<ResultSetHeader>;
  assignUserToCourse: (userId: number, courseId:number ) => Promise<ResultSetHeader>;
  getWorkLogStats: (userId: number) => Promise<any>;

  // ... other methods remain the same
}

const workLogController: WorkLogController = {
  async createWorkLogCourse(
   worklog: WorkLogCourseCreate
  ) {
    try {
      // Create the course
      const result = await workLogModel.createWorkLogCourse(
        worklog.name,
        worklog.startDate,
        worklog.endDate,
        worklog.code, 
        worklog.description,
        worklog.requiredHours
      );

      const courseId = result.insertId;

      // Add instructors if any
      if (worklog.instructors?.length) {
        await workLogModel.addInstructorsToCourse(worklog.instructors, courseId);
      }

      // Add students if any
      if (worklog.studentList?.length) {
        await workLogModel.addStudentsToCourse(
          worklog.studentList.map(s => s.email),
          courseId
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
        entryData.courseId
      );
      
      if (!hasAccess) {
        throw new Error('User does not have access to this course');
      }

      const result = await workLogModel.createWorkLogEntry(
        entryData.userId,
        entryData.courseId,
        entryData.startTime,
        entryData.endTime,
        entryData.description
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
   */
  async getWorkLogEntriesByUser(userId: number) {
    try {
      const entries = await workLogModel.getWorkLogEntriesByUserId(userId);
      const courses = await workLogModel.getUserCourses(userId);
      const stats = await workLogModel.getWorkLogStatsByUser(userId);

      return {
        entries,
        courses,
        stats
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
  async updateWorkLogEntryStatus(entryId: number , status: 0 | 1 | 2 | 3 ) {

    try {
      const result = await workLogModel.updateWorkLogEntryStatus(entryId, status);
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
  async getWorkLogCourseDetails(courseId: number) {
    try {
      const course = await workLogModel.getWorkLogCourseById(courseId);
      const entries = await workLogModel.getWorkLogEntriesByCourse(courseId);
      const groups = await workLogModel.getWorkLogGroupsByCourse(courseId);

      return {
        course: course[0],
        entries,
        groups
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
  async assignUserToCourse( userId, courseId ) {
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
  async createWorkLogGroup( courseId, groupName ) {
    try {
      const result = await workLogModel.createWorkLogGroup(courseId, groupName);
      return result;
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
  async assignStudentToGroup( groupId, userId ) {
    try {
      const result = await workLogModel.assignStudentToGroup(groupId, userId);
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
      const stats = await workLogModel.getWorkLogStatsByUser(userId);
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
    try {
      const exits = await workLogModel.checkWorklogCodeExists(code);
      if ( exits.length > 0 ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error in checkWorklogCodeExists:', error);
      throw error;
    }
  }
};

export default workLogController;
