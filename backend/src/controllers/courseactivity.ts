import logger from '../utils/logger.js';
import courseStudentActivityModel from '../models/coursestudentactivity.js';



interface SQLStudentData {
  userid: number;
  email: string;
  first_name: string;
  last_name: string;
  studentnumber: string;
  courseid: number;
  code: string;
  course_name: string;
  group_name: string | null;
  total_lectures: number;
  attended_lectures: number;
  attendance_percentage: number;
  last_attendance_info: string;
}

const courseActivityController = {
  /**
   * Gets all students and their attendance from an instructor's courses
   * @param instructorId - The ID of the instructor
   * @returns Promise with student data and attendance details
   */
  async getStudentsFromInstructorCourses(instructorId: number) {
    try {
      const students = await courseStudentActivityModel.getStudentsFromInstructorCourses(instructorId) as SQLStudentData[];

      if (!students || !Array.isArray(students) || students.length === 0) {
        console.log("row 33, courseactivity.ts, no students found");
        return {
          success: true,
          data: []
        };
      }

      const courseGroups = {};


      students.forEach(student => {
        console.log("row 44, courseactivity.ts, student: ", student);
        if (!courseGroups[student.courseid]) {
          console.log("row 46, courseactivity.ts, no course found, creating new course group");
          courseGroups[student.courseid] = {
            courseName: student.course_name,
            courseId: student.courseid,
            students: []
          };
        }
        console.log("row 53, courseactivity.ts, adding student to course group");
        courseGroups[student.courseid].students.push({
          userId: student.userid,
          email: student.email,
          firstName: student.first_name,
          lastName: student.last_name,
          code: student.code,
          studentNumber: student.studentnumber,
          groupName: student.group_name || '',
          attendance: {
            total: Number(student.total_lectures),
            attended: Number(student.attended_lectures),
            percentage: Number(student.attendance_percentage || 0),
            lastAttendance: student.last_attendance_info || ''
          }
        });
      });

      console.log("row 71, courseactivity.ts, returning course groups")
      return {
        success: true,
        data: Object.values(courseGroups)
      };

    } catch (error) {
      console.log("row 78, courseactivity.ts, error: ", error);
      logger.error('Controller error:', error);
      return {
        success: false,
        data: [],
        error: 'Failed to fetch student data'
      };
    }
  },

  async getStudentsFromAllCourses() {
    try {
      const students = await courseStudentActivityModel.getStudentsFromAllCourses() as SQLStudentData[];

      if (!students || !Array.isArray(students) || students.length === 0) {
        console.log("row 93, courseactivity.ts, no students found");
        return {
          success: true,
          data: []
        };
      }

      const courseGroups = {};

      students.forEach(student => {
        console.log("row 103, courseactivity.ts, looping through students: ", student, "");
        if (!courseGroups[student.courseid]) {
          console.log("row 105, courseactivity.ts, no course found, creating new course group");
          courseGroups[student.courseid] = {
            courseName: student.course_name,
            courseId: student.courseid,
            students: []
          };
        }

        console.log("row 113, courseactivity.ts, adding student to course group");
        courseGroups[student.courseid].students.push({
          userId: student.userid,
          email: student.email,
          firstName: student.first_name,
          lastName: student.last_name,
          code: student.code,
          studentNumber: student.studentnumber,
          groupName: student.group_name || '',
          attendance: {
            total: Number(student.total_lectures),
            attended: Number(student.attended_lectures),
            percentage: Number(student.attendance_percentage || 0),
            lastAttendance: student.last_attendance_info || ''
          }
        });
      });

      console.log("row 131, courseactivity.ts, returning course groups");
      return {
        success: true,
        data: Object.values(courseGroups)
      };

    } catch (error) {
      console.log("row 138, courseactivity.ts, error: ", error);
      logger.error('Controller error:', error);
      return {
        success: false,
        data: [],
        error: 'Failed to fetch student data'
      };
    }
  },
};

export default courseActivityController;
