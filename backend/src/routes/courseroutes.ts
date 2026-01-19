import {config} from 'dotenv';
import express, {Request, Response, Router} from 'express';
import {body, param, validationResult} from 'express-validator';
import multer from 'multer';
import XLSX from 'xlsx';
import courseController from '../controllers/coursecontroller.js';
import course from '../models/coursemodel.js';

import usermodel from '../models/usermodel.js';
import {CourseDetails, CourseUser, IData, Item} from '../types.js';
import checkUserRole from '../utils/checkRole.js';
import logger from '../utils/logger.js';
import openData from '../utils/opendata.js';
import validate from '../utils/validate.js';
import attendanceRoutes from './course/attendanceRoutes.js';
import topicRoutes from './course/topicRoutes.js';

config();
const upload = multer();

type AsyncHandler = (req: Request, res: Response) => Promise<void> | void;
function handle(fn: AsyncHandler, useValidationResult = false): AsyncHandler {
  return async (req, res) => {
    if (useValidationResult) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
    }
    try {
      await Promise.resolve(fn(req, res));
    } catch (error) {
      logger.error(error);
      console.error('Error:', error);
      res.status(500).json('Internal server error');
    }
  };
}

// Router: Course routes
const router: Router = express.Router();

// USE: Mount sub-routers
router.use('/attendance', attendanceRoutes);
router.use('/topics', topicRoutes);

// POST: Check if one or more courses exist via Open Data
router.post(
  '/check',
  checkUserRole(['admin', 'counselor', 'teacher']),
  express.json(),
  handle(async (req: Request, res: Response): Promise<void> => {
    const { codes } = req.body;
    console.log("row 42, courseroutes.ts, checking if course exists");
    const data = await openData.checkOpenDataRealization(codes);

    if ((data as { message?: string }).message === 'No results') {
      res.status(404).json({ exists: false });
      return;
    }
    res.status(200).json({ exists: true });
  })
);

// POST: Check if a specific course/worklog code exists in DB
router.post(
  '/checkcode/:code',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('code').isString().notEmpty().withMessage('Code must be a non-empty string'),
  handle(
    async (req: Request, res: Response): Promise<void> => {
      console.log('row 83, courseroutes.ts, checking if course exists');
      const { code } = req.params;

      const notExists = await courseController.assertCourseNotExists(code);

      const exists = !notExists;

      res.status(200).json({ exists });
    },
    /* useValidationResult */ true,
  ),
);

// POST: Check reservations for a course
router.post(
  '/checkreservations/',
  checkUserRole(['admin', 'counselor', 'teacher']),
  handle(async (req: Request, res: Response): Promise<void> => {
    const { code = '', studentGroup = '' } = req.body;
    console.log("row 108, courseroutes.ts, checking reservations");
    const reservations = await openData.CheckOpenDataReservations(code, studentGroup);
    res.send(reservations);
  })
);

// POST: Create a new course
router.post(
  '/create',
  checkUserRole(['admin', 'counselor', 'teacher']),
  body('courseName').isString().notEmpty().escape().withMessage('Course name must be a non-empty string'),
  body('courseCode').isString().notEmpty().escape().withMessage('Course code must be a non-empty string'),
  body('studentGroup').isString().notEmpty().optional().escape().withMessage('Student group must be a non-empty string'),
  body('startDate').trim().escape().notEmpty().withMessage('Start date is required'),
  body('endDate').trim().escape().notEmpty().withMessage('Start date is required'),
  body('topicGroup').isString().notEmpty().optional().escape().withMessage('Topic group must be a non-empty string'),
  body('topics.*').isString().escape().withMessage('Each topic must be a string'),
  body('instructors').isArray().withMessage('Instructors must be an array'),
  validate,
  handle(async (req: Request, res: Response): Promise<void> => {
    if (req.user) {
      console.log('create course ', req.user?.email);
      logger.info({ email: req.user?.email }, 'create course');
    }
    const {
      courseName, courseCode, studentGroup, startDate, endDate,
      studentList, instructors, topicGroup, topics
    } = req.body;

    console.log("row 193, courseroutes.ts, creating course and checking user roles");
    const response = await courseController.insertIntoCourse(
      courseName, startDate, endDate, courseCode, studentGroup,
      studentList, instructors, topics, topicGroup
    );

    res.status(200).json({
      message: 'File uploaded and data logged successfully',
      courseId: response,
    });
  })
);

// POST: Create a new course from an Excel file
router.post(
  '/excelinput',
  checkUserRole(['admin', 'counselor', 'teacher']),
  upload.single('file'),
  handle(async (req, res) => {
    logger.info({ email: req.user?.email }, 'Excel input');
    console.log("row 240, courseroutes.ts, creating course from excel file and checking user roles");

    if (!req.file) {
      logger.error('No file uploaded');
      console.error('No file uploaded');
      res.status(400).json('No file uploaded');
      return;
    }
    const { checkCourseDetails, instructorEmail } = req.body;

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];

    if (!worksheet) {
      console.error('Worksheet not found');
      res.status(500).json('Internal server error');
      return;
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    const createCourse = (data: Item[]): CourseDetails => {
      const fullCourseName = Object.keys(data[0])[0];
      const [courseName, courseCode] = fullCourseName.split(' (');
      const studentList = data
        .filter((item) => item.__EMPTY !== 'Etunimi')
        .map((item) => {
          const last_name = (item as any)[fullCourseName];
          const first_name = (item as any).__EMPTY;
          const name = (item as any).__EMPTY_1;
          const email = (item as any).__EMPTY_2;
          const studentnumber = (item as any).__EMPTY_4;
          const arrivalgroup = (item as any).__EMPTY_5;
          const admingroups = (item as any).__EMPTY_6;
          const program = (item as any).__EMPTY_7;
          const educationform = (item as any).__EMPTY_8;
          const registration = (item as any).__EMPTY_9;
          const evaluation = (item as any).__EMPTY_10;

          return {
            last_name, first_name, name, email, studentnumber,
            arrivalgroup, admingroups, program, educationform,
            registration, evaluation,
          };
        });

      return {
        courseName,
        courseCode: courseCode.replace('(', '').replace(')', ''),
        studentList,
        instructorEmail: '',
        startDate: new Date(),
        endDate: new Date(),
        studentGroup: '',
      };
    };

    const courseDetails = createCourse(jsonData as Item[]);
    courseDetails.instructorEmail = instructorEmail;

    if (checkCourseDetails === 'true') {
      const data = (await openData.checkOpenDataRealization(
        courseDetails.courseCode,
      )) as IData;

      courseDetails.startDate = new Date(data.realizations[0].startDate);
      courseDetails.endDate = new Date(data.realizations[0].endDate);
      const studentGroup = data.realizations[0].studentGroups[0];
      courseDetails.studentGroup = studentGroup ? studentGroup.code : '';
    } else {
      courseDetails.studentGroup = '';
      courseDetails.startDate = new Date();
      courseDetails.endDate = new Date();
    }
    res.send(courseDetails);
  })
);

// GET: Fetch all courses by instructor email
router.get(
  '/instructor/:email',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('email').isEmail().withMessage('Email must be a valid email address'),
  validate,
  handle(async (req: Request, res: Response): Promise<void> => {
    console.log("row 342, courseroutes.ts, get all courses by instructor email");
    const courses = await course.getCoursesByInstructorEmail(req.params.email);
    res.send(courses);
  })
);

// GET: Fetch courses by course ID
router.get(
  '/coursesbyid/:id',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('id').isNumeric().withMessage('ID must be a number'),
  validate,
  handle(async (req: Request, res: Response): Promise<void> => {
    console.log("row 369, courseroutes.ts, get courses by id");
    const courseId = Number(req.params.id);
    if (isNaN(courseId)) {
      res.status(400).json('Invalid course ID');
      return;
    }
    const coursesById = await course.getCoursesByCourseId(courseId);
    res.send(coursesById);
  })
);

declare module 'express-serve-static-core' {
  interface Request {
    user?: CourseUser;
  }
}

// GET: Fetch all courses for current user
router.get(
  '/user/all',
  checkUserRole(['admin', 'counselor', 'teacher', 'student']),
  handle(async (req: Request, res: Response): Promise<void> => {
    console.log("row 400, courseroutes.ts, get all users");
    if (!req.user) {
      res.status(403).json('User Info Unavailable');
      return;
    }

    const email = req.user.email;

    if (req.user.userrole !== 0 && req.user.email !== email) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const coursesList = await course.getStudentsCourses(email);
    res.send(coursesList);
  })
);

// DELETE: Delete course by ID
router.delete(
  '/delete/:id',
  checkUserRole(['admin', 'counselor', 'teacher']),
  handle(async (req: Request, res: Response): Promise<void> => {
    if (req.user) {
      logger.info({ email: req.user?.email }, ' delete course');
    }
    console.log("row 440, courseroutes.ts, deleting by id and checking user roles");
    const courseId = Number(req.params.id);
    if (isNaN(courseId)) {
      res.status(400).json('Invalid course ID');
      return;
    }
    const result = await course.deleteCourse(courseId);
    res.send(result);
  })
);

// GET: Fetch students by instructor user ID
// Supports search: /students/:userid?q=matti or /students/:userid?q=0123456
router.get(
  '/students/:userid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('userid').isNumeric().withMessage('User ID must be a number'),
  validate,
  handle(async (req: Request, res: Response): Promise<void> => {
    const userid = Number(req.params.userid);
    if (isNaN(userid)) {
      res.status(400).json('Invalid user ID');
      return;
    }

    const q = String(req.query.q ?? '').trim();

    console.log("row 474, courseroutes.ts, get students by id and checking user roles");

    if (q) {
      const students = await usermodel.searchStudentsByInstructor(userid, q);
      res.send(students);
      return;
    }

    const students = await usermodel.getStudentsByInstructorId(userid);
    res.send(students);
  })
);

// PUT: Update course by ID
router.put(
  '/update/:courseid',
  [
    body('modifiedData.courseName').trim().escape().notEmpty().withMessage('Course name is required'),
    body('modifiedData.courseCode').trim().escape().notEmpty().withMessage('Course code is required'),
    body('modifiedData.studentGroup').trim().escape().optional(),
    body('modifiedData.start_date').trim().escape().notEmpty().withMessage('Start date is required'),
    body('modifiedData.end_date').trim().escape().notEmpty().withMessage('End date is required'),
    body('modifiedData.instructors').isArray().withMessage('Instructors must be an array'),
    body('modifiedData.topic_names.*').isString().escape().withMessage('Each topic must be a string'),
  ],
  validate,
  handle(async (req: Request, res: Response): Promise<void> => {
    if (req.user) {
      logger.info({ email: req.user?.email }, ' update course');
    }
    try {
      console.log("row 531, courseroutes.ts, updating by id and checking user roles");
      if (req.user && req.user.role !== 'teacher' && req.user.role !== 'admin') {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }
    } catch (error) {
      logger.error(error);
    }

    const courseId = Number(req.params.courseid);
    if (isNaN(courseId)) {
      res.status(400).json('Invalid course ID');
      return;
    }

    const {
      courseName, courseCode, studentGroup, start_date, end_date, instructors, topic_names,
    } = req.body.modifiedData;

    const result = await course.updateCourseInfo(
      courseId, courseName, start_date, end_date, courseCode, studentGroup, instructors, topic_names,
    );
    res.send(result);
  })
);

// GET: Fetch all courses (role-aware)
router.get(
  '/getallcourses',
  checkUserRole(['admin', 'counselor', 'teacher']),
  handle(async (req: Request, res: Response): Promise<void> => {
    console.log("row 598, courseroutes.ts, get all courses");
    if (req.user?.role === 'counselor' || req.user?.role === 'admin') {
      const courses = await course.fetchAllCourses();
      res.send(courses);
    } else if (req.user?.role === 'teacher') {
      const courses = await course.getCoursesByInstructorEmail(req.user.email);
      res.send(courses);
    } else {
      res.status(403).json({ error: 'Unauthorized' });
    }
  })
);

// GET: Fetch course details by course ID
router.get(
  '/getdetailsbycourseid/:courseId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('courseId').isNumeric().withMessage('Course ID must be a number'),
  validate,
  handle(async (req: Request, res: Response): Promise<void> => {
    console.log("row 634, courseroutes.ts, get details by course id");
    const courseId = req.params.courseId;
    const details = await courseController.getDetailsByCourseId(courseId);
    res.send(details);
  })
);

// POST: Update user-courses by user ID and course ID
router.post(
  '/updateusercourses/:userid/:courseid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('courseid').isNumeric().withMessage('Course ID must be a number'),
  param('userid').isNumeric().withMessage('User ID must be a number'),
  validate,
  handle(async (req: Request, res: Response) => {
    if (req.user) {
      logger.info({ email: req.user?.email }, ' update user courses');
    }
    const { userid, courseid } = req.params;

    console.log("row 665, courseroutes.ts, update user courses with course id and user id");
    const useridNumber = parseInt(userid, 10);
    const courseidNumber = parseInt(courseid, 10);
    await courseController.updateStudentCourses(useridNumber, courseidNumber);

    res.status(200).json({ message: 'Successfully updated student courses' });
  })
);

// DELETE: Delete a user-course by usercourse ID
router.delete(
  '/deleteusercourse/:usercourseid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('usercourseid').isNumeric().withMessage('User Course ID must be a number'),
  validate,
  handle(async (req: Request, res: Response) => {
    if (req.user) {
      logger.info({ email: req.user?.email }, ' delete user course');
    }
    const usercourseid = Number(req.params.usercourseid);
    console.log("row 701, courseroutes.ts, delete user course with user course id");
    await courseController.removeStudentCourses(usercourseid);
    res.status(200).json({ message: 'Successfully deleted student courses' });
  })
);

// GET: Fetch student & selected topics by usercourse ID
router.get(
  '/studentandtopics/:usercourseid',
  param('usercourseid').isNumeric().withMessage('User Course ID must be a number'),
  validate,
  handle(async (req: Request, res: Response) => {
    console.log("row 729, courseroutes.ts, get student and topics by user course id");
    const usercourseid = Number(req.params.usercourseid);
    const coursesList = await courseController.getStudentAndSelectedTopicsByUsercourseId(usercourseid);
    res.send(coursesList);
  })
);

// GET: Fetch all students on a course by course ID
router.get(
  '/studentsbycourse/:courseid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('courseid').isNumeric().withMessage('Course ID must be a number'),
  validate,
  handle(async (req: Request, res: Response) => {
    console.log("row 756, courseroutes.ts, get students by course id");
    const courseid = Number(req.params.courseid);
    const students = await course.getAllStudentsOnCourse(courseid.toString());
    res.send(students);
  })
);

// GET: Fetch a user and their courses by user ID
router.get(
  '/:userid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('userid').isNumeric().withMessage('User ID must be a number'),
  validate,
  handle(async (req: Request, res: Response): Promise<void> => {
    const userid = req.params.userid;
    console.log("row 781, courseroutes.ts, get user by id");
    const useridNumber = parseInt(userid, 10);
    const users = await usermodel.fetchUserById(useridNumber);
    const email = users[0].email;
    const coursesList = await course.getStudentsCourses(email);

    res.send({ user: users[0], courses: coursesList });
  })
);

// GET: Students pagination by instructor user ID
router.get(
  '/students/pagination/:userid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  handle(async (req: Request, res: Response): Promise<void> => {
    console.log("row 802, courseroutes.ts, get students by id and checking user roles");
    const userid = Number(req.params.userid);
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const offset = (page - 1) * limit;

    if (isNaN(userid)) {
      res.status(400).json('Invalid user ID');
      return;
    }
    if (limit < 1 || limit > 100) {
      res.status(400).json({ message: 'Limit must be between 1 and 100' });
      return;
    }
    if (page < 1) {
      res.status(400).json({ message: 'Page must be greater than 0' });
      return;
    }

    const students = await usermodel.fetchStudentsPaginationByInstructorId(
      userid, limit, offset,
    );
    res.send({
      students: students.students,
      total: students.total,
      currentPage: page,
      totalPages: Math.ceil(students.total / limit),
      limit,
    });
  })
);

export default router;
