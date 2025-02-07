import express, {Request, Response, Router} from 'express';
import {body, param} from 'express-validator';
import {RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';
import adminController from '../controllers/admincontroller.js';
import lectureController from '../controllers/lecturecontroller.js';
import AttendanceModel from '../models/attendancemodel.js';
import course from '../models/coursemodel.js';
import lectureModel from '../models/lecturemodel.js';
import rolemodel from '../models/rolemodel.js';
import userFeedBackModel from '../models/userfeedbackmodel.js';
import usermodel from '../models/usermodel.js';
import checkUserRole from '../utils/checkRole.js';
import logger from '../utils/logger.js';
import readLogFile from '../utils/readLogFile.js';
import validate from '../utils/validate.js';
const pool = createPool('ADMIN');
const router: Router = express.Router();

/**
 * Route that fetches the server settings.
 *
 * @returns {Promise<ServerSettings>} A promise that resolves with the server settings.
 */
router.get(
  '/',
  checkUserRole(['admin']),
  async (_req: Request, res: Response) => {
    try {
      const serverSettings = await adminController.getServerSettings();

      res.status(200).json(serverSettings[0][0]);
    } catch (error) {
      console.error(error);
      logger.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);
/**
 * Route that updates the server settings.
 *
 * @param {number} speedofhash - The speed of hash.
 * @param {number} leewayspeed - The leeway speed.
 * @param {number} timeouttime - The timeout time.
 * @param {number} attendancethreshold - The attendance threshold.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
router.post(
  '/',
  checkUserRole(['admin']),
  [
    body('speedofhash')
      .isNumeric()
      .withMessage('Speed of hash must be a number'),
    body('leewayspeed')
      .isNumeric()
      .withMessage('Leeway speed must be a number'),
    body('timeouttime')
      .isNumeric()
      .withMessage('Timeout time must be a number'),
    body('attendancethreshold')
      .isNumeric()
      .withMessage('Attendance threshold must be a number'),
  ],
  validate,
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info({useremail: req.user.email}, ' admin / update / ');
    }
    const {speedofhash, leewayspeed, timeouttime, attendancethreshold} =
      req.body;
    try {
      await adminController.updateServerSettings(
        speedofhash,
        leewayspeed,
        timeouttime,
        attendancethreshold,
      );
      res.status(200).json({message: 'Server settings updated successfully'});
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);
/**
 * Route that fetches the teacher and counselor roles.
 *
 * @returns {Promise<Role[]>} A promise that resolves with the teacher and counselor roles.
 */
router.get(
  '/rolesspecial',
  checkUserRole(['admin', 'teacher', 'counselor']),
  validate,
  async (_req: Request, res: Response) => {
    try {
      const roles = await rolemodel.fetchTeacherAndCounselorRoles();
      res.send(roles);
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);
/**
 * Route that fetches all roles.
 *
 * @returns {Promise<Role[]>} A promise that resolves with all roles.
 */
router.get(
  '/roles',
  checkUserRole(['admin', 'teacher', 'counselor']),
  async (_req: Request, res: Response) => {
    try {
      const roles = await rolemodel.fetchAllRoles();
      res.send(roles);
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);
/**
 * Route that changes the role of a user.
 *
 * @param {string} email - The email of the user.
 * @param {number} roleId - The new role ID.
 * @returns {Promise<void>} A promise that resolves when the role change is complete.
 */
router.post(
  '/change-role',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('roleId').isNumeric().withMessage('Role ID must be a number'),
  ],
  validate,
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info({useremail: req.user.email}, ' admin / change-role / ');
    }
    const {email, roleId} = req.body;
    try {
      await usermodel.changeRoleId(email, roleId);
      res.send({message: 'Role changed successfully'});
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);
/**
 * Route that fetches all users.
 *
 * @returns {Promise<User[]>} A promise that resolves with all users.
 */
router.get(
  '/getusers',
  checkUserRole(['admin']),
  async (_req: Request, res: Response) => {
    try {
      const users = await usermodel.fetchUsers();
      res.send(users);
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);
/**
 * Route that fetches a user by their ID.
 *
 * @param {number} userid - The ID of the user.
 * @returns {Promise<User>} A promise that resolves with the user.
 */
router.get(
  '/getuser/:userid',
  checkUserRole(['admin']),
  [param('userid').isNumeric().withMessage('User ID must be a number')],
  validate,
  async (req: Request, res: Response) => {
    try {
      const {userid} = req.params;
      const user = await usermodel.fetchUserById(Number(userid));
      res.send(user);
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);
/**
 * Route that inserts a new student user.
 *
 * @param {string} email - The email of the user.
 * @param {string} first_name - The first name of the user.
 * @param {string} last_name - The last name of the user.
 * @param {string} studentnumber - The student number of the user.
 * @param {number} studentGroupId - The student group id of the user.
 * @returns {Promise<ResultSetHeader>} A promise that resolves when the insertion is complete.
 */
router.post(
  '/insert-student-user/',
  checkUserRole(['admin']),
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('first_name').isString().withMessage('First name must be a string'),
    body('last_name').isString().withMessage('Last name must be a string'),
    body('studentnumber')
      .isString()
      .withMessage('Student number must be a string'),
  ],
  validate,
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info(
        {useremail: req.user.email},
        ' admin / insert-student-user / ',
      );
    }
    const {email, first_name, last_name, studentnumber, studentGroupId} =
      req.body;
    // console.log(
    // 	'manual student user insert start ' + email + ' ' + studentnumber,
    // );
    try {
      const existingUserByNumber =
        await usermodel.checkIfUserExistsByStudentNumber(studentnumber);
      if (existingUserByNumber.length > 0) {
        res
          .status(400)
          .send({message: 'User with this student number already exists'});
        return;
      }
      const existingUserByEmail = await usermodel.checkIfUserExistsByEmail(
        email,
      );
      if (existingUserByEmail.length > 0) {
        res.status(400).json({message: 'User with this email already exists'});
        return;
      }
      const userResult = await usermodel.insertStudentUser(
        email,
        first_name,
        last_name,
        studentnumber,
        studentGroupId,
      );
      res
        .status(200)
        .send({message: 'Student user inserted successfully', userResult});
      console.log(
        'manual student user insert success ' + email + ' ' + studentnumber,
      );
    } catch (error) {
      console.error(error);
      logger.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);

router.post(
  '/insert-staff-user/',
  checkUserRole(['admin']),
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('first_name').isString().withMessage('First name must be a string'),
    body('last_name').isString().withMessage('Last name must be a string'),
  ],
  validate,
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info({useremail: req.user.email}, ' admin / insert-staff-user / ');
    }
    const {email, first_name, last_name, staff, roleid} = req.body;
    // console.log(
    // 	'manual student user insert start ' + email + ' ' + studentnumber,
    // );
    try {
      const existingUserByEmail = await usermodel.checkIfUserExistsByEmail(
        email,
      );
      if (existingUserByEmail.length > 0) {
        res.status(400).json({message: 'User with this email already exists'});
        return;
      }
      const userResult = await usermodel.insertStaffUser(
        email,
        first_name,
        last_name,
        staff,
        roleid,
      );
      res
        .status(200)
        .send({message: 'Staff user inserted successfully', userResult});
      console.log('manual staff user insert success ' + email);
    } catch (error) {
      console.error(error);
      logger.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);

/** route that get all lectures */
interface Lecture extends RowDataPacket {
  lectureid: number;
  actualStudentCount?: number;
}

router.get(
  '/alllectures/',
  checkUserRole(['admin']),
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info({useremail: req.user.email}, ' admin / alllectures / ');
    }
    try {
      const lectures = (await lectureModel.fetchAllLectures()) as Lecture[];
      for (const lecture of lectures) {
        const students = await lectureController.getStudentsInLecture(
          lecture.lectureid,
        );

        if (students) {
          lecture.actualStudentCount = students.length;
        }
      }
      res.send(lectures);
    } catch (err) {
      console.error(err);
      logger.error(err);
      res.status(500).json('Server error');
    }
  },
);
router.get(
  '/lectureandattendancecount/',
  checkUserRole(['admin']),
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info(
        {useremail: req.user.email},
        ' admin / lectureandattendancecount / ',
      );
    }
    try {
      const [lectures] = await pool
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM lecture');

      const counts = {
        lectures: lectures.length,
        notattended: 0,
        attended: 0,
      };

      for (const lecture of lectures) {
        const [attendanceCount0] = await pool
          .promise()
          .query<RowDataPacket[]>(
            'SELECT COUNT(*) AS count FROM attendance WHERE status = 0 AND lectureid = ?',
            [lecture.lectureid],
          );

        const [attendanceCount1] = await pool
          .promise()
          .query<RowDataPacket[]>(
            'SELECT COUNT(*) AS count FROM attendance WHERE status = 1 AND lectureid = ?',
            [lecture.lectureid],
          );

        counts.notattended += attendanceCount0[0].count;
        counts.attended += attendanceCount1[0].count;
      }

      res.send(counts);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json('Server error');
    }
  },
);
router.get(
  '/allattendancedatabycourse/:courseid/:lectureid',
  checkUserRole(['admin']),
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info(
        {useremail: req.user.email},
        ' admin / allattendancedatabycourse / ',
      );
    }
    try {
      const courseid = req.params.courseid;
      const lectureid = req.params.lectureid;
      const [attendanceResult] = await pool.promise().query(
        `SELECT
                attendance.status,
                attendance.attendanceid,
                usercourses.usercourseid,
                lecture.start_date,
                lecture.timeofday,
                lecture.lectureid,
                topics.topicname,
								courses.code,
                teachers.email AS teacher,
                attendingUsers.first_name,
                attendingUsers.last_name,
                attendingUsers.studentnumber,
                attendingUsers.email,
                attendingUsers.userid
            FROM
                attendance
            JOIN
                lecture ON attendance.lectureid = lecture.lectureid
            JOIN
                topics ON lecture.topicid = topics.topicid
            JOIN
                courses ON lecture.courseid = courses.courseid
            JOIN
                usercourses ON attendance.usercourseid = usercourses.usercourseid
            JOIN
                users AS teachers ON lecture.teacherid = teachers.userid
            JOIN
                users AS attendingUsers ON usercourses.userid = attendingUsers.userid
            WHERE
                lecture.courseid = ? AND lecture.lectureid = ?;`,
        [courseid, lectureid],
      );

      res.send(attendanceResult);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json('Server error');
    }
  },
);
/**
 * Route that fetches all courses with their details.
 *
 * @returns {Promise<Course[]>} A promise that resolves with all courses.
 */
router.get(
  '/getcourses',
  checkUserRole(['admin']),
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info({useremail: req.user.email}, ' admin / getcourses / ');
    }
    try {
      const courses = await course.getCoursesWithDetails();
      res.send(courses);
    } catch (error) {
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);
/**
 * Route that updates a user.
 *
 * @param {User} user - The updated user data.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
router.put(
  '/updateuser',
  checkUserRole(['admin']),
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info({useremail: req.user.email}, ' admin / updateuser / ');
    }
    try {
      const user = req.body;
      await usermodel.updateUser(user);
      res.send({message: 'User updated successfully'});
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);

/**
 * Route that checks if a student number exists.
 *
 * @param {number} studentnumber - The student number to check.
 * @returns {Promise<{exists: boolean}>} A promise that resolves with a boolean indicating if the student number exists.
 */
router.get(
  '/checkstudentnumber/:studentnumber',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [
    param('studentnumber')
      .isNumeric()
      .withMessage('Student number must be a number'),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const {studentnumber} = req.params;
      const existingStudentNumber = await usermodel.checkIfStudentNumberExists(
        studentnumber,
      );
      if (existingStudentNumber.length > 0) {
        res.send({exists: true});
      } else {
        res.send({exists: false});
      }
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);

router.get(
  '/checkstudentemail/:email',
  checkUserRole(['admin', 'teacher', 'counselor']),
  async (req: Request, res: Response) => {
    try {
      const {email} = req.params;
      const existingStudentEmail = await usermodel.checkIfStudentEmailExists(
        email,
      );
      if (existingStudentEmail.length > 0) {
        res.send({exists: true});
      } else {
        res.send({exists: false});
      }
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);

/**
 * Route that fetches the counts of users for each role.
 *
 * @returns {Promise<{[role: string]: number}>} A promise that resolves with an object where the keys are role names and the values are the counts of users with that role.
 */
router.get(
  '/getrolecounts',
  checkUserRole(['admin']),
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info({useremail: req.user.email}, 'admin / getrolecounts / ');
    }
    try {
      const roleCounts = await usermodel.getRoleCounts();
      const userLoggedCount = await usermodel.getUserLoggedCount();
      const otherRoleCounts = roleCounts
        .filter((role) =>
          ['admin', 'counselor', 'teacher'].includes(role.role_name),
        )
        .reduce((sum, role) => sum + role.user_count, 0);
      const studentLoggedCount = userLoggedCount - otherRoleCounts;
      const result = [
        ...roleCounts,
        {role_name: 'AllLogged', user_count: userLoggedCount},
        {role_name: 'StudentsLogged', user_count: studentLoggedCount},
      ];
      res.send(result);
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);
router.get(
  '/feedback',
  checkUserRole(['admin']),
  async (req: Request, res: Response): Promise<void> => {
    if (req.user) {
      logger.info(' admin / feedback / ', req.user?.email);
    }
    try {
      const feedback = await userFeedBackModel.getUserFeedback();
      res.send(feedback);
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);
router.delete(
  '/feedback/:feedbackId',
  checkUserRole(['admin']),
  async (req: Request, res: Response): Promise<void> => {
    const {feedbackId} = req.params;
    if (req.user) {
      logger.info(' admin / feedback / delete ', req.user?.email);
    }
    try {
      const result = await userFeedBackModel.deleteUserFeedback(
        Number(feedbackId),
      );
      if (result === null) {
        res.status(500).json({
          message: 'Internal server error',
        });
        return;
      }
      res.status(200).json({
        message: 'Feedback deleted successfully',
      });
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);

router.delete(
  '/attendance/delete/:attendanceid',
  checkUserRole(['admin']),
  async (req: Request, res: Response): Promise<void> => {
    if (req.user) {
      logger.info(' admin / attendance / delete ', req.user?.email);
    }
    const {attendanceid} = req.params;
    try {
      const result = await AttendanceModel.deleteAttendanceByAttendanceId(
        Number(attendanceid),
      );
      if (result.affectedRows === 0) {
        res.status(500).json({
          message: 'Internal server error',
        });
        return;
      }
      res.status(200).json({
        message: 'Attendance deleted successfully',
      });
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);
router.get(
  '/errorlogs/:lineLimit',
  checkUserRole(['admin']),
  param('lineLimit').isNumeric().withMessage('Line limit must be a number'),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    // if (req.user) {
    // 	console.log('admin/errorlogs view ', req.user?.email);
    // }
    const errorLogFilePath = './logs/error-logfile.log';
    const lineLimit = parseInt(req.params.lineLimit);

    // Validate lineLimit
    if (isNaN(lineLimit) || lineLimit <= 0) {
      res.status(400).json({message: 'Invalid line limit'});
      return;
    }

    try {
      const errorLog = await readLogFile(errorLogFilePath, lineLimit);
      res.status(200).json(errorLog);
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);

router.get(
  '/logs/:lineLimit',
  checkUserRole(['admin']),
  param('lineLimit').isNumeric().withMessage('Line limit must be a number'),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    // if (req.user) {
    // 	console.log('admin/logs view ', req.user?.email);
    // }
    const outLogFilePath = './logs/logfile.log';
    const lineLimit = parseInt(req.params.lineLimit);

    // Validate lineLimit
    if (isNaN(lineLimit) || lineLimit <= 0) {
      res.status(400).json({message: 'Invalid line limit'});
      return;
    }

    try {
      const logData = await readLogFile(outLogFilePath, lineLimit);
      res.status(200).json(logData);
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);

router.get(
  '/coursecounts',
  checkUserRole(['admin']),
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info({useremail: req.user.email}, 'admin / coursecounts / ');
    }
    try {
      const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

      // Get counts for regular courses
      const [regularCourses] = await pool
        .promise()
        .query(
          'SELECT COUNT(*) as total, SUM(CASE WHEN end_date >= ? THEN 1 ELSE 0 END) as active FROM courses',
          [currentDate],
        );

      // Get counts for worklog courses
      const [worklogCourses] = await pool
        .promise()
        .query(
          'SELECT COUNT(*) as total, SUM(CASE WHEN end_date >= ? THEN 1 ELSE 0 END) as active FROM work_log_courses',
          [currentDate],
        );

      res.send({
        regularCourses: {
          total: regularCourses[0].total,
          active: regularCourses[0].active || 0, // Use 0 if null
        },
        worklogCourses: {
          total: worklogCourses[0].total,
          active: worklogCourses[0].active || 0, // Use 0 if null
        },
      });
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);

router.get(
  '/worklogcounts',
  checkUserRole(['admin']),
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info({useremail: req.user.email}, 'admin / worklogcounts / ');
    }
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const formattedDate = threeDaysAgo
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      // Get counts for worklog entries
      // Status: 0=draft, 1=in, 2=out, 3=rejected
      const [worklogStats] = await pool.promise().query(
        `
        SELECT
          COUNT(CASE WHEN status = '1' THEN 1 END) as inCount,
          COUNT(CASE WHEN status = '2' THEN 1 END) as outCount,
          COUNT(CASE
            WHEN status = '1'
            AND end_time < ?
            THEN 1 END) as possibleMistakeIn
        FROM work_log_entries
        WHERE status IN ('1', '2')
      `,
        [formattedDate],
      );

      res.send({
        pending: worklogStats[0]?.inCount || 0,
        approved: worklogStats[0]?.outCount || 0,
        delayed: worklogStats[0]?.possibleMistakeIn || 0,
      });
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);

router.get(
  '/worklogcourses',
  checkUserRole(['admin']),
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info({useremail: req.user.email}, 'admin / worklogcourses / ');
    }
    try {
      const [courses] = await pool.promise().query(`
        SELECT
          work_log_course_id,
          name,
          start_date,
          end_date,
          code,
          description,
          required_hours,
          created_at
        FROM work_log_courses
        ORDER BY created_at DESC
      `);

      res.send(courses);
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);

export default router;
