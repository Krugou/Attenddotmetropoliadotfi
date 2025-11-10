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

// Build course groups from flat student rows
function buildCourseGroups(students: SQLStudentData[]) {
  const courseGroups: Record<
    number,
    { courseName: string; courseId: number; students: any[] }
  > = {};

  students.forEach((student) => {
    console.log("courseactivity.ts, processing student: ", student);

    if (!courseGroups[student.courseid]) {
      console.log("courseactivity.ts, creating new course group");
      courseGroups[student.courseid] = {
        courseName: student.course_name,
        courseId: student.courseid,
        students: []
      };
    }

    console.log("courseactivity.ts, adding student to course group");
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

  return Object.values(courseGroups);
}

const courseActivityController = {
  // Get all students from an instructor's courses
  async getStudentsFromInstructorCourses(instructorId: number) {
    try {
      const students = await courseStudentActivityModel.getStudentsFromInstructorCourses(instructorId) as SQLStudentData[];

      if (!students || !Array.isArray(students) || students.length === 0) {
        console.log("courseactivity.ts, no students found for instructor");
        return { success: true, data: [] };
      }

      const groups = buildCourseGroups(students);
      console.log("courseactivity.ts, returning course groups");
      return { success: true, data: groups };
    } catch (error) {
      console.log("courseactivity.ts, error: ", error);
      logger.error('Controller error:', error);
      return { success: false, data: [], error: 'Failed to fetch student data' };
    }
  },

  // Get students from all courses
  async getStudentsFromAllCourses() {
    try {
      const students = await courseStudentActivityModel.getStudentsFromAllCourses() as SQLStudentData[];

      if (!students || !Array.isArray(students) || students.length === 0) {
        console.log("courseactivity.ts, no students found for all courses");
        return { success: true, data: [] };
      }

      const groups = buildCourseGroups(students);
      console.log("courseactivity.ts, returning course groups");
      return { success: true, data: groups };
    } catch (error) {
      console.log("courseactivity.ts, error: ", error);
      logger.error('Controller error:', error);
      return { success: false, data: [], error: 'Failed to fetch student data' };
    }
  },
};

export default courseActivityController;
