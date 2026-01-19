import express, { Request, Response, Router } from 'express';
import { body, param } from 'express-validator';
import { RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';
import adminController from '../controllers/admincontroller.js';
import lectureController from '../controllers/lecturecontroller.js';
import AttendanceModel from '../models/attendancemodel.js';
import course from '../models/coursemodel.js';
import lectureModel from '../models/lecturemodel.js';
import rolemodel from '../models/rolemodel.js';
import userFeedBackModel from '../models/userfeedbackmodel.js';
import usermodel from '../models/usermodel.js';
// import housekeeping from '../jaksechousekeeping.js';
import checkUserRole from '../utils/checkRole.js';
import logger from '../utils/logger.js';
import readLogFile from '../utils/readLogFile.js';
import validate from '../utils/validate.js';

const pool = createPool('ADMIN');
const router: Router = express.Router();
// const {userDeactivationService} = housekeeping;

// Helpers
const INTERNAL_ERROR = { message: 'Internal server error' } as const;

// Centralized async wrapper to avoid repetitive try/catch
const handle = (
  label: string,
  handler: (req: Request, res: Response) => Promise<void> | void,
) => async (req: Request, res: Response) => {
  try {
    console.log(label);
    await handler(req, res);
  } catch (error) {
    logger.error(error);
    console.error(error);
    res.status(500).json(INTERNAL_ERROR);
  }
};

// Common role groups
const ADMIN = ['admin'] as const;
const STAFF = ['admin', 'teacher', 'counselor'] as const;



// Routes

// GET: Fetch server settings
router.get(
  '/',
  checkUserRole(ADMIN as unknown as string[]),
  handle('row 33, adminroutes.ts, getting server settings', async (_req, res) => {
    const serverSettings = await adminController.getServerSettings();
    res.status(200).json(serverSettings[0][0]);
  }),
);

// POST: Update server settings
router.post(
  '/',
  checkUserRole(ADMIN as unknown as string[]),
  [
    body('speedofhash').isNumeric().withMessage('Speed of hash must be a number'),
    body('leewayspeed').isNumeric().withMessage('Leeway speed must be a number'),
    body('timeouttime').isNumeric().withMessage('Timeout time must be a number'),
    body('attendancethreshold').isNumeric().withMessage('Attendance threshold must be a number'),
  ],
  validate,
  handle('row 78, adminroutes.ts, updating server settings', async (req, res) => {
    if (req.user) {
      logger.info({ useremail: req.user.email }, ' admin / update / ');
    }

    const { speedofhash, leewayspeed, timeouttime, attendancethreshold } = req.body;
    await adminController.updateServerSettings(speedofhash, leewayspeed, timeouttime, attendancethreshold);
    res.status(200).json({ message: 'Server settings updated successfully' });
  }),
);

// GET: Fetch teacher & counselor roles
router.get(
  '/rolesspecial',
  checkUserRole(STAFF as unknown as string[]),
  validate,
  handle('row 104, adminroutes.ts, fetching teacher and counselor roles', async (_req, res) => {
    const roles = await rolemodel.fetchTeacherAndCounselorRoles();
    res.send(roles);
  }),
);

// GET: Fetch all roles
router.get(
  '/roles',
  checkUserRole(STAFF as unknown as string[]),
  handle('row 124, adminroutes.ts, fetching all roles', async (_req, res) => {
    const roles = await rolemodel.fetchAllRoles();
    res.send(roles);
  }),
);

// POST: Change user role
router.post(
  '/change-role',
  checkUserRole(STAFF as unknown as string[]),
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('roleId').isNumeric().withMessage('Role ID must be a number'),
  ],
  validate,
  handle('row 155, adminroutes.ts, changing role of user', async (req, res) => {
    if (req.user) {
      logger.info({ useremail: req.user.email }, ' admin / change-role / ');
    }

    const { email, roleId } = req.body;
    await usermodel.changeRoleId(email, roleId);
    res.send({ message: 'Role changed successfully' });
  }),
);

// GET: Fetch all users
router.get(
  '/getusers',
  checkUserRole(ADMIN as unknown as string[]),
  handle('row 175, adminroutes.ts, fetching all users', async (_req, res) => {
    const users = await usermodel.fetchUsers();
    res.send(users);
  }),
);

// GET: Search students (counselor/admin)
router.get(
  '/getstudents',
  checkUserRole(['admin', 'counselor']),
  handle('row XXX, adminroutes.ts, searching students', async (req, res) => {
    const q = String(req.query.q ?? '').trim()

    if (!q) {
      res.send([])
      return
    }

    const students = await usermodel.searchStudents(q)
    res.send(students)
  }),
)



// GET: Fetch user by ID
router.get(
  '/getuser/:userid',
  checkUserRole(ADMIN as unknown as string[]),
  [param('userid').isNumeric().withMessage('User ID must be a number')],
  validate,
  handle('row 198, adminroutes.ts, fetching user by id', async (req, res) => {
    const { userid } = req.params;
    const user = await usermodel.fetchUserById(Number(userid));
    res.send(user);
  }),
);

// POST: Insert new student user
router.post(
  '/insert-student-user/',
  checkUserRole(ADMIN as unknown as string[]),
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('first_name').isString().withMessage('First name must be a string'),
    body('last_name').isString().withMessage('Last name must be a string'),
    body('studentnumber').isString().withMessage('Student number must be a string'),
  ],
  validate,
  handle('row 241, adminroutes.ts, inserting student user', async (req, res) => {
    if (req.user) {
      logger.info({ useremail: req.user.email }, ' admin / insert-student-user / ');
    }

    const { email, first_name, last_name, studentnumber, studentGroupId } = req.body;

    const existingUserByNumber = await usermodel.checkIfUserExistsByStudentNumber(studentnumber);
    if (existingUserByNumber.length > 0) {
      res.status(400).send({ message: 'User with this student number already exists' });
      return;
    }

    const existingUserByEmail = await usermodel.checkIfUserExistsByEmail(email);
    if (existingUserByEmail.length > 0) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    const userResult = await usermodel.insertStudentUser(
      email,
      first_name,
      last_name,
      studentnumber,
      studentGroupId,
    );

    console.log('row 264, adminroutes.ts, inserting student user');
    res.status(200).send({ message: 'Student user inserted successfully', userResult });
  }),
);

// POST: Insert new staff user
router.post(
  '/insert-staff-user/',
  checkUserRole(ADMIN as unknown as string[]),
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('first_name').isString().withMessage('First name must be a string'),
    body('last_name').isString().withMessage('Last name must be a string'),
  ],
  validate,
  handle('row 295, adminroutes.ts, inserting staff user', async (req, res) => {
    if (req.user) {
      logger.info({ useremail: req.user.email }, ' admin / insert-staff-user / ');
    }

    const { email, first_name, last_name, staff, roleid } = req.body;

    const existingUserByEmail = await usermodel.checkIfUserExistsByEmail(email);
    if (existingUserByEmail.length > 0) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    const userResult = await usermodel.insertStaffUser(
      email,
      first_name,
      last_name,
      staff,
      roleid,
    );

    res.status(200).send({ message: 'Staff user inserted successfully', userResult });
  }),
);

// Types
interface Lecture extends RowDataPacket {
  lectureid: number;
  actualStudentCount?: number;
}

// GET: Fetch all TeacherLectures with actual student counts
router.get(
  '/alllectures/',
  checkUserRole(ADMIN as unknown as string[]),
  handle('row 336, adminroutes.ts, fetching all TeacherLectures', async (req, res) => {
    if (req.user) {
      logger.info({ useremail: req.user.email }, ' admin / alllectures / ');
    }

    const lectures = (await lectureModel.fetchAllLectures()) as Lecture[];
    for (const lecture of lectures) {
      const students = await lectureController.getStudentsInLecture(lecture.lectureid);
      if (students) {
        lecture.actualStudentCount = students.length;
      }
    }

    res.send(lectures);
  }),
);

// GET: Fetch global lecture/attendance counts summary
router.get(
  '/lectureandattendancecount/',
  checkUserRole(ADMIN as unknown as string[]),
  handle('row 366, adminroutes.ts, fetching lecture & attendance counts', async (req, res) => {
    if (req.user) {
      logger.info({ useremail: req.user.email }, ' admin / lectureandattendancecount / ');
    }

    const [lectures] = await pool.promise().query<RowDataPacket[]>('SELECT * FROM lecture');

    const counts = { lectures: lectures.length, notattended: 0, attended: 0 } as {
      lectures: number; notattended: number; attended: number;
    };

    for (const lecture of lectures as any[]) {
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

      counts.notattended += (attendanceCount0 as any)[0].count as number;
      counts.attended += (attendanceCount1 as any)[0].count as number;
    }

    res.send(counts);
  }),
);

// GET: Fetch attendance data for course & lecture
router.get(
  '/allattendancedatabycourse/:courseid/:lectureid',
  checkUserRole(ADMIN as unknown as string[]),
  handle('row 415, adminroutes.ts, fetching attendance data by course & lecture', async (req, res) => {
    if (req.user) {
      logger.info({ useremail: req.user.email }, ' admin / allattendancedatabycourse / ');
    }

    const { courseid, lectureid } = req.params as { courseid: string; lectureid: string };
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
      FROM attendance
      JOIN lecture ON attendance.lectureid = lecture.lectureid
      JOIN topics ON lecture.topicid = topics.topicid
      JOIN courses ON lecture.courseid = courses.courseid
      JOIN usercourses ON attendance.usercourseid = usercourses.usercourseid
      JOIN users AS teachers ON lecture.teacherid = teachers.userid
      JOIN users AS attendingUsers ON usercourses.userid = attendingUsers.userid
      WHERE lecture.courseid = ? AND lecture.lectureid = ?;`,
      [courseid, lectureid],
    );

    res.send(attendanceResult);
  }),
);

// GET: Fetch all courses with details
router.get(
  '/getcourses',
  checkUserRole(ADMIN as unknown as string[]),
  handle('row 474, adminroutes.ts, get all courses', async (req, res) => {
    if (req.user) {
      logger.info({ useremail: req.user.email }, ' admin / getcourses / ');
    }

    const courses = await course.getCoursesWithDetails();
    res.send(courses);
  }),
);

// PUT: Update user
router.put(
  '/updateuser',
  checkUserRole(ADMIN as unknown as string[]),
  handle('row 497, adminroutes.ts, updating user', async (req, res) => {
    if (req.user) {
      logger.info({ useremail: req.user.email }, ' admin / updateuser / ');
    }

    const user = req.body;
    await usermodel.updateUser(user);
    res.send({ message: 'User updated successfully' });
  }),
);

// GET: Check if student number exists
router.get(
  '/checkstudentnumber/:studentnumber',
  checkUserRole(STAFF as unknown as string[]),
  [param('studentnumber').isNumeric().withMessage('Student number must be a number')],
  validate,
  handle('row 526, adminroutes.ts, checking student number', async (req, res) => {
    const { studentnumber } = req.params;
    const existingStudentNumber = await usermodel.checkIfStudentNumberExists(studentnumber);
    res.send({ exists: existingStudentNumber.length > 0 });
  }),
);

// GET: Check if student email exists
router.get(
  '/checkstudentemail/:email',
  checkUserRole(STAFF as unknown as string[]),
  handle('row 549, adminroutes.ts, checking student email', async (req, res) => {
    const { email } = req.params;
    const existingStudentEmail = await usermodel.checkIfStudentEmailExists(email);
    res.send({ exists: existingStudentEmail.length > 0 });
  }),
);

// GET: Fetch role counts (+ derived totals)
router.get(
  '/getrolecounts',
  checkUserRole(ADMIN as unknown as string[]),
  handle('row 580, adminroutes.ts, getting role counts', async (req, res) => {
    if (req.user) {
      logger.info({ useremail: req.user.email }, 'admin / getrolecounts / ');
    }

    const roleCounts = await usermodel.getRoleCounts();
    const userLoggedCount = await usermodel.getUserLoggedCount();
    const otherRoleCounts = roleCounts
      .filter((role: any) => ['admin', 'counselor', 'teacher'].includes(role.role_name))
      .reduce((sum: number, role: any) => sum + role.user_count, 0);

    const studentLoggedCount = userLoggedCount - otherRoleCounts;
    const result = [
      ...roleCounts,
      { role_name: 'AllLogged', user_count: userLoggedCount },
      { role_name: 'StudentsLogged', user_count: studentLoggedCount },
    ];

    res.send(result);
  }),
);

// GET: Fetch user feedback
router.get(
  '/feedback',
  checkUserRole(ADMIN as unknown as string[]),
  handle('row 610, adminroutes.ts, getting feedback', async (req, res) => {
    if (req.user) {
      logger.info(' admin / feedback / ', req.user?.email);
    }

    const feedback = await userFeedBackModel.getUserFeedback();
    res.send(feedback);
  }),
);

// DELETE: Delete user feedback by ID
router.delete(
  '/feedback/:feedbackId',
  checkUserRole(ADMIN as unknown as string[]),
  handle('row 629, adminroutes.ts, deleting feedback', async (req, res) => {
    const { feedbackId } = req.params;
    if (req.user) {
      logger.info(' admin / feedback / delete ', req.user?.email);
    }

    const result = await userFeedBackModel.deleteUserFeedback(Number(feedbackId));
    if (result === null) {
      res.status(500).json(INTERNAL_ERROR);
      return;
    }
    res.status(200).json({ message: 'Feedback deleted successfully' });
  }),
);

// DELETE: Delete attendance by attendance ID
router.delete(
  '/attendance/delete/:attendanceid',
  checkUserRole(ADMIN as unknown as string[]),
  handle('row 659, adminroutes.ts, deleting attendance', async (req, res) => {
    if (req.user) {
      logger.info(' admin / attendance / delete ', req.user?.email);
    }

    const { attendanceid } = req.params;
    const result = await AttendanceModel.deleteAttendanceByAttendanceId(Number(attendanceid));
    if (result.affectedRows === 0) {
      res.status(500).json(INTERNAL_ERROR);
      return;
    }
    res.status(200).json({ message: 'Attendance deleted successfully' });
  }),
);

// GET: Fetch latest error logs (tail)
router.get(
  '/errorlogs/:lineLimit',
  checkUserRole(ADMIN as unknown as string[]),
  param('lineLimit').isNumeric().withMessage('Line limit must be a number'),
  validate,
  handle('row 698, adminroutes.ts, getting error logs', async (req, res) => {
    const errorLogFilePath = './logs/error-logfile.log';
    const lineLimit = parseInt(req.params.lineLimit);

    if (isNaN(lineLimit) || lineLimit <= 0) {
      res.status(400).json({ message: 'Invalid line limit' });
      return;
    }

    const errorLog = await readLogFile(errorLogFilePath, lineLimit);
    res.status(200).json(errorLog);
  }),
);

// GET: Fetch latest application logs (tail)
router.get(
  '/logs/:lineLimit',
  checkUserRole(ADMIN as unknown as string[]),
  param('lineLimit').isNumeric().withMessage('Line limit must be a number'),
  validate,
  handle('row 728, adminroutes.ts, getting logs', async (req, res) => {
    const outLogFilePath = './logs/logfile.log';
    const lineLimit = parseInt(req.params.lineLimit);

    if (isNaN(lineLimit) || lineLimit <= 0) {
      res.status(400).json({ message: 'Invalid line limit' });
      return;
    }

    const logData = await readLogFile(outLogFilePath, lineLimit);
    res.status(200).json(logData);
  }),
);

// GET: Fetch course counts (regular & worklog, with active totals)
router.get(
  '/coursecounts',
  checkUserRole(ADMIN as unknown as string[]),
  handle('row 747, adminroutes.ts, getting course counts', async (req, res) => {
    if (req.user) {
      logger.info({ useremail: req.user.email }, 'admin / coursecounts / ');
    }

    const currentDate = new Date().toISOString().split('T')[0];

    const [regularCourses] = await pool
      .promise()
      .query<any[]>(
        'SELECT COUNT(*) as total, SUM(CASE WHEN end_date >= ? THEN 1 ELSE 0 END) as active FROM courses',
        [currentDate],
      );

    const [worklogCourses] = await pool
      .promise()
      .query<any[]>(
        'SELECT COUNT(*) as total, SUM(CASE WHEN end_date >= ? THEN 1 ELSE 0 END) as active FROM work_log_courses',
        [currentDate],
      );

    res.send({
      regularCourses: {
        total: (regularCourses as any)[0].total,
        active: (regularCourses as any)[0].active || 0,
      },
      worklogCourses: {
        total: (worklogCourses as any)[0].total,
        active: (worklogCourses as any)[0].active || 0,
      },
    });
  }),
);

// GET: Fetch worklog counts (pending/approved/delayed)
router.get(
  '/worklogcounts',
  checkUserRole(ADMIN as unknown as string[]),
  handle('row 792, adminroutes.ts, getting worklog counts', async (req, res) => {
    if (req.user) {
      logger.info({ useremail: req.user.email }, 'admin / worklogcounts / ');
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const formattedDate = threeDaysAgo.toISOString().slice(0, 19).replace('T', ' ');

    const [worklogStats] = await pool.promise().query<any[]>(
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
      pending: (worklogStats as any)[0]?.inCount || 0,
      approved: (worklogStats as any)[0]?.outCount || 0,
      delayed: (worklogStats as any)[0]?.possibleMistakeIn || 0,
    });
  }),
);

// GET: Fetch worklog courses (latest first)
router.get(
  '/worklogcourses',
  checkUserRole(ADMIN as unknown as string[]),
  handle('row 838, adminroutes.ts, getting worklog courses', async (req, res) => {
    if (req.user) {
      logger.info({ useremail: req.user.email }, 'admin / worklogcourses / ');
    }

    const [courses] = await pool.promise().query(
      `
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
      `,
    );

    res.send(courses);
  }),
);

// GET: Fetch server status (system + DB)
router.get(
  '/server-status',
  checkUserRole(ADMIN as unknown as string[]),
  handle('row 867, adminroutes.ts, getting server status', async (_req, res) => {
    // Get system information
    const os = await import('os');
    const systemInfo: any = {
      system: {
        uptime: os.uptime(),
        cpuUsage: os.loadavg()[0] / os.cpus().length,
        loadAverage: os.loadavg(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
      },
      database: {
        uptime: 0,
        connectionCount: 0,
        threadCount: 0,
        queryCount: 0,
        slowQueries: 0,
      },
    };

    // Get database information
    const [dbStatus] = await pool
      .promise()
      .query<RowDataPacket[]>(
        'SHOW GLOBAL STATUS WHERE Variable_name IN (?, ?, ?, ?, ?)',
        ['Uptime', 'Threads_connected', 'Threads_running', 'Questions', 'Slow_queries'],
      );

    const dbStatusMap = new Map((dbStatus as RowDataPacket[]).map((row: any) => [row.Variable_name, row.Value]));

    systemInfo.database = {
      uptime: parseInt(String(dbStatusMap.get('Uptime')) || '0'),
      connectionCount: parseInt(String(dbStatusMap.get('Threads_connected')) || '0'),
      threadCount: parseInt(String(dbStatusMap.get('Threads_running')) || '0'),
      queryCount: parseInt(String(dbStatusMap.get('Questions')) || '0'),
      slowQueries: parseInt(String(dbStatusMap.get('Slow_queries')) || '0'),
    };

    res.json(systemInfo);
  }),
);

export default router;
