import logger from '../utils/logger.js';
import createPool from '../config/createPool.js';

// DB pool (ADMIN connection)
const pool = createPool('ADMIN');

// Model
const courseStudentActivityModel = {

  // Get students from all courses taught by a specific instructor, with attendance stats
  async getStudentsFromInstructorCourses(instructorId) {
    try {
      console.log('Row 13, coursestudentactivity.ts - Getting students from instructor courses');
      const [rows] = await pool.promise().query(
        `
          SELECT
            u.userid,
            u.email,
            u.first_name,
            u.last_name,
            u.studentnumber,
            c.courseid,
            c.code,
            c.name AS course_name,
            sg.group_name,
            COUNT(DISTINCT l.lectureid) AS total_lectures,
            COUNT(DISTINCT CASE WHEN a.status = 1 THEN a.attendanceid END) AS attended_lectures,
            ROUND(
              COUNT(DISTINCT CASE WHEN a.status = 1 THEN a.attendanceid END) * 100.0 /
              NULLIF(COUNT(DISTINCT l.lectureid), 0),
              1
            ) AS attendance_percentage,
            MAX(l.start_date) AS last_attendance_info
          FROM users u
                 JOIN usercourses uc ON u.userid = uc.userid
                 JOIN courses c ON uc.courseid = c.courseid
                 LEFT JOIN studentgroups sg ON u.studentgroupid = sg.studentgroupid
                 JOIN courseinstructors ci ON c.courseid = ci.courseid
                 LEFT JOIN lecture l ON c.courseid = l.courseid
                 LEFT JOIN attendance a ON l.lectureid = a.lectureid AND a.usercourseid = uc.usercourseid
          WHERE ci.userid = ?
            AND u.staff = 0
            -- include current, future (<= 1 month), and recent (start within last 5 months if no end_date)
            AND c.start_date <= DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
            AND (
            (c.end_date IS NOT NULL AND c.end_date >= CURDATE())
              OR
            (c.end_date IS NULL AND c.start_date >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH))
            )
          GROUP BY u.userid, c.courseid
          ORDER BY c.name, u.last_name, u.first_name;
        `,
        [instructorId],
      );

      return rows;
    } catch (error) {
      logger.error('Database error:', error);
      throw error;
    }
  },

  // Get students from all courses (any instructor), with attendance stats
  async getStudentsFromAllCourses() {
    try {
      console.log('Row 57, coursestudentactivity.ts - Getting students from all courses');
      const [rows] = await pool.promise().query(
        `
          SELECT
            u.userid,
            u.email,
            u.first_name,
            u.last_name,
            u.studentnumber,
            c.courseid,
            c.code,
            c.name AS course_name,
            sg.group_name,
            COUNT(DISTINCT l.lectureid) AS total_lectures,
            COUNT(DISTINCT CASE WHEN a.status = 1 THEN a.attendanceid END) AS attended_lectures,
            ROUND(
              COUNT(DISTINCT CASE WHEN a.status = 1 THEN a.attendanceid END) * 100.0 /
              NULLIF(COUNT(DISTINCT l.lectureid), 0),
              1
            ) AS attendance_percentage,
            MAX(l.start_date) AS last_attendance_info
          FROM users u
                 JOIN usercourses uc ON u.userid = uc.userid
                 JOIN courses c ON uc.courseid = c.courseid
                 LEFT JOIN studentgroups sg ON u.studentgroupid = sg.studentgroupid
                 JOIN courseinstructors ci ON c.courseid = ci.courseid
                 LEFT JOIN lecture l ON c.courseid = l.courseid
                 LEFT JOIN attendance a ON l.lectureid = a.lectureid AND a.usercourseid = uc.usercourseid
          WHERE u.staff = 0
            -- include current, future (<= 1 month), and recent (start within last 5 months if no end_date)
            AND c.start_date <= DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
            AND (
            (c.end_date IS NOT NULL AND c.end_date >= CURDATE())
              OR
            (c.end_date IS NULL AND c.start_date >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH))
            )
          GROUP BY u.userid, c.courseid
          ORDER BY c.name, u.last_name, u.first_name;
        `,
      );

      return rows;
    } catch (error) {
      logger.error('Database error:', error);
      throw error;
    }
  },
};

export default courseStudentActivityModel;
