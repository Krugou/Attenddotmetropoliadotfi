import express, { Router, type Request, type Response, type NextFunction, type RequestHandler } from 'express';
import { body, param } from 'express-validator';
import createPool from '../config/createPool.js';
import serverSettingsModel from '../models/serversettingsmodel.js';
import studentgroupmodel from '../models/studentgroupmodel.js';
import usercoursesModel from '../models/usercoursemodel.js';
import usermodel from '../models/usermodel.js';
import checkUserRole from '../utils/checkRole.js';
import logger from '../utils/logger.js';
import validate from '../utils/validate.js';
import UserModel from '../models/usermodel.js';
import attendanceController from '../controllers/attendancecontroller.js';
import openData from '../utils/opendata.js';

const router: Router = express.Router();
const pool = createPool('ADMIN');

// Helpers
const asyncHandler =
  (fn: RequestHandler) =>
    (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next);

const send500 = (res: Response, message = 'Internal server error') =>
  res.status(500).json({ message });

// Routes

// GET: Return current user object
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    console.log('row 23, secureroutes.ts, returning user object from request');

    if (!req.user) {
      res.end();
      return;
    }

    const user = await UserModel.getAllUserInfo(req.user.email);
    res.send(user);
    return;
  }),
);

// GET: All students
router.get(
  '/students',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (_req, res) => {
    try {
      console.log('row 37, secureroutes.ts, getting all students');
      const users = await usermodel.fetchAllStudents();
      res.send(users);
    } catch (error) {
      logger.error(error);
      console.error(error);
      send500(res);
    }
  }),
);

// GET: Attendance threshold
router.get(
  '/getattendancethreshold',
  asyncHandler(async (_req, res) => {
    try {
      console.log('row 52, secureroutes.ts, getting attendance threshold');
      const result = await serverSettingsModel.getAttentanceThreshold(pool);
      const threshold = result[0][0].attendancethreshold;
      res.send({ attendancethreshold: threshold });
    } catch (error) {
      logger.error(error);
      console.error(error);
      send500(res);
    }
  }),
);

// PUT: Accept GDPR (update status)
router.put(
  '/accept-gdpr/:userid',
  param('userid').isNumeric().withMessage('User ID must be a number'),
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 71, secureroutes.ts, updating GDPR status');
      const userId: number | undefined = req.user?.userid;
      await usermodel.updateUserGDPRStatus(userId);
      res.send({ success: true });
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json('Internal Server Error');
    }
  }),
);

// GET: Check if user exists & is staff by email
router.get(
  '/check-staff/:email',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('email').isEmail().withMessage('Email must be a valid email address'),
  validate,
  asyncHandler(async (req, res) => {
    const email = req.params.email;
    try {
      console.log('row 93, secureroutes.ts, checking if user exists by email and is a staff member');
      const user = await usermodel.checkIfUserExistsByEmailAndisStaff(email);
      if (user.length > 0) res.send({ exists: true, user: user[0] });
      else res.send({ exists: false });
    } catch (error) {
      logger.error(error);
      console.error(error);
      send500(res);
    }
  }),
);

// GET: All student groups
router.get(
  '/studentgroups',
  checkUserRole(['admin', 'teacher', 'counselor']),
  asyncHandler(async (_req, res) => {
    try {
      console.log('row 117, secureroutes.ts, getting all student groups');
      const groups = await studentgroupmodel.fetchAllStudentGroups();
      res.send(groups);
    } catch (error) {
      logger.error(error);
      console.error(error);
      send500(res);
    }
  }),
);

// POST: Create student user and link to course
router.post(
  '/insert-student-user-course/',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('first_name').isString().withMessage('First name must be a string'),
    body('last_name').isString().withMessage('Last name must be a string'),
    body('studentnumber').isString().withMessage('Student number must be a string'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    if (req.user) logger.info({ email: req.user?.email }, 'Inserting student user');

    const { email, first_name, last_name, studentnumber, studentGroupId, courseId } = req.body;

    try {
      console.log('row 154, secureroutes.ts, inserting student user');

      const byNumber = await usermodel.checkIfUserExistsByStudentNumber(studentnumber);
      if (byNumber.length > 0) {
        res.status(400).send({ message: 'User with this student number already exists' });
        return;
      }

      const byEmail = await usermodel.checkIfUserExistsByEmail(email);
      if (byEmail.length > 0) {
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

      console.log('row 179, secureroutes.ts, inserting student user');

      const existingUserCourse = await usercoursesModel.checkIfUserCourseExists(userResult.insertId, courseId);
      if (existingUserCourse.length === 0) {
        await usercoursesModel.insertUserCourse(userResult.insertId, courseId);
      }

      try {
        await attendanceController.markStudentAsNotPresentInPastLectures(studentnumber, courseId);
      } catch (error) {
        logger.error('Error adding student to previous lectures:', error);
      }

      res.status(200).send({ message: 'Student user inserted successfully', userResult });
    } catch (error) {
      logger.error(error);
      console.error(error);
      send500(res);
    }
  }),
);

// PUT: Update user
router.put(
  '/updateuser',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 216, secureroutes.ts, updating user');
      await usermodel.updateUser(req.body);
      res.send({ message: 'User updated successfully' });
    } catch (error) {
      logger.error(error);
      console.error(error);
      send500(res);
    }
  }),
);

// GET: Get user by ID
router.get(
  '/getuser/:userid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [param('userid').isNumeric().withMessage('User ID must be a number')],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 240, secureroutes.ts, getting user by ID');
      const { userid } = req.params;
      const user = await usermodel.fetchUserById(Number(userid));
      res.send(user);
    } catch (error) {
      logger.error(error);
      console.error(error);
      send500(res);
    }
  }),
);

// GET: Paginated students
router.get(
  '/students/paginated',
  checkUserRole(['admin', 'counselor', 'teacher']),
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 257, secureroutes.ts, getting paginated students');
      const limit = Number(req.query.limit) || 10;
      const page = Number(req.query.page) || 1;
      const offset = (page - 1) * limit;

      if (limit < 1 || limit > 100) {
        res.status(400).json({ message: 'Limit must be between 1 and 100' });
        return;
      }
      if (page < 1) {
        res.status(400).json({ message: 'Page must be greater than 0' });
        return;
      }

      const result = await usermodel.fetchNumberOfStudents(limit, offset);
      res.send({
        students: result.students,
        total: result.total,
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        limit,
      });
    } catch (error) {
      logger.error('Error fetching paginated students:', error);
      send500(res);
    }
  }),
);

// PUT: Update language preference
router.put(
  '/update-language',
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 298, secureroutes.ts, updating language');
      const { email, language } = req.body;

      if (!['en', 'fi', 'sv'].includes(language)) {
        res.status(400).json({ ok: false, error: 'Invalid language code' as const });
        return;
      }

      await usermodel.updateUserLanguage(email, language);
      res.send({ ok: true, message: 'Language updated successfully' as const });
    } catch (error) {
      logger.error('Error updating language:', error);
      res.status(500).json({ ok: false, error: 'Internal server error' as const });
    }
  }),
);

// GET: Get user language by email
router.get(
  '/user-language/:email',
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 330, secureroutes.ts, getting user language');
      // @ts-expect-error (mallin tyyppi)
      const result = await usermodel.getUserLanguage(req.params.email);
      if (result && result[0]) {
        res.send({ ok: true, language: result[0].language });
      } else {
        res.status(404).json({ ok: false, error: 'User language not found' });
      }
    } catch (error) {
      logger.error('Error fetching user language:', error);
      res.status(500).json({ ok: false, error: 'Internal server error' });
    }
  }),
);

// GET: Smoke test OpenData API connectivity
router.get(
  '/test-opendata',
  checkUserRole(['admin', 'teacher', 'counselor']),
  asyncHandler(async (_req, res) => {
    try {
      console.log('row 360, secureroutes.ts, testing OpenData API');
      const testCode = 'TX00AA11-3001';
      const response = await openData.checkOpenDataRealization(testCode);

      if (response && !response.error) {
        res.json({ status: 'success', message: 'OpenData API connection successful', connected: true });
      } else {
        res.status(401).json({
          status: 'error',
          message: 'Failed to connect to OpenData API - Invalid credentials',
          connected: false,
        });
      }
    } catch (error) {
      logger.error('OpenData API test failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to connect to OpenData API',
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }),
);

// Error handler
router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

export default router;
