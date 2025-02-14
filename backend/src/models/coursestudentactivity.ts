import logger from 'utils/logger.js';
import createPool from '../config/createPool.js';
const pool = createPool('ADMIN');

const courseStudentActivityModel = {
  /**
   * Gets all students with their attendance from courses where the specified user is an instructor
   * @param instructorId - The ID of the instructor
   * @returns Promise with array of students and their course and attendance details
   */
  async getStudentsFromInstructorCourses(instructorId) {
    try {
      const [rows] = await pool.promise().query(`
        SELECT
          u.userid,
          u.email,
          u.first_name,
          u.last_name,
          u.studentnumber,
          c.courseid,
          c.name as course_name,
          sg.group_name,
          COUNT(DISTINCT l.lectureid) as total_lectures,
          COUNT(DISTINCT CASE WHEN a.status = 1 THEN a.attendanceid END) as attended_lectures,
          ROUND(COUNT(DISTINCT CASE WHEN a.status = 1 THEN a.attendanceid END) * 100.0 /
            NULLIF(COUNT(DISTINCT l.lectureid), 0), 1) as attendance_percentage,
          MAX(l.start_date) as last_attendance_info
        FROM users u
        JOIN usercourses uc ON u.userid = uc.userid
        JOIN courses c ON uc.courseid = c.courseid
        LEFT JOIN studentgroups sg ON u.studentgroupid = sg.studentgroupid
        JOIN courseinstructors ci ON c.courseid = ci.courseid
        LEFT JOIN lecture l ON c.courseid = l.courseid
        LEFT JOIN attendance a ON l.lectureid = a.lectureid AND a.usercourseid = uc.usercourseid
        WHERE ci.userid = ?
        AND u.staff = 0
        GROUP BY u.userid, c.courseid
        ORDER BY c.name, u.last_name, u.first_name;
      `, [instructorId]);

      return rows;
    } catch (error) {
      logger.error('Database error:', error);
      throw error;
    }
  },
};

export default courseStudentActivityModel;
