import courseStudentActivityModel from '../models/coursestudentactivity.js';



interface SQLStudentData {
  userid: number;
  email: string;
  first_name: string;
  last_name: string;
  studentnumber: string;
  courseid: number;
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
        return {
          success: true,
          data: []
        };
      }

      const courseGroups = {};

      // Transform SQL data to response format
      students.forEach(student => {
        if (!courseGroups[student.courseid]) {
          courseGroups[student.courseid] = {
            courseName: student.course_name,
            courseId: student.courseid,
            students: []
          };
        }

        courseGroups[student.courseid].students.push({
          userId: student.userid,
          email: student.email,
          firstName: student.first_name,
          lastName: student.last_name,
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

      return {
        success: true,
        data: Object.values(courseGroups)
      };

    } catch (error) {
      console.error('Controller error:', error);
      return {
        success: false,
        data: [],
        error: 'Failed to fetch student data'
      };
    }
  },
};

export default courseActivityController;
