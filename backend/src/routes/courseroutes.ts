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
/**
 * Router for course routes.
 */
const router: Router = express.Router();

router.use('/attendance', attendanceRoutes);
router.use('/topics', topicRoutes);

/**
 * Route that checks if a course exists in the database.
 *
 * @param {string} code - The course code.
 * @returns {Promise<boolean>} A promise that resolves with a boolean.
 */
router.post(
  '/check',
  checkUserRole(['admin', 'counselor', 'teacher']),
  express.json(),
  async (req: Request, res: Response): Promise<void> => {
    const {codes} = req.body;

    try {
      console.log("row 42, courseroutes.ts, checking if course exists");
      const data = await openData.checkOpenDataRealization(codes);

      // Check if message is "No results"
      if ((data as {message?: string}).message === 'No results') {
        res.status(404).json({
          exists: false,
        });
        return;
      }

      res.status(200).json({
        exists: true,
      }); // send the data as the response
    } catch (error) {
      logger.error(error);
      console.error('Error:', error);
      res.status(500).json('Internal server error');
    }
  },
);
/**
 * Route that checks if a course exists in the database.
 *
 * @param {string} code - The course code.
 * @returns {Promise<boolean>} A promise that resolves with a boolean.
 */
router.post(
  '/checkcode/:code',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('code')
    .isString()
    .notEmpty()
    .withMessage('Code must be a non-empty string'),
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({errors: errors.array()});
      return;
    }
    try {
      console.log("row 83, courseroutes.ts, checking if course exists");
      const {code} = req.params;
      const exists = await course.findByCode(code);
      res.status(200).json({exists});
    } catch (error) {
      logger.error(error);
      console.error('Error:', error);
      res.status(500).json('Internal server error');
    }
  },
);
/**
 * Route that checks reservations for a course.
 *
 * @param {string} code - The code of the course.
 * @param {string} studentGroup - The student group.
 * @returns {Promise<Reservation[]>} A promise that resolves with the reservations for the course.
 */
router.post(
  '/checkreservations/',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response): Promise<void> => {
    const {code = '', studentGroup = ''} = req.body;

    try {
      console.log("row 108, courseroutes.ts, checking reservations");
      const reservations = await openData.CheckOpenDataReservations(
        code,
        studentGroup,
      );
      res.send(reservations);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json('Server error');
    }
  },
);
/**
 * Route that creates a new course.
 *
 * @param {string} courseName - The name of the course.
 * @param {string} courseCode - The code of the course.
 * @param {string} studentGroup - The student group.
 * @param {string} startDate - The start date of the course.
 * @param {string} endDate - The end date of the course.
 * @param {string} topicGroup - The topic group of the course.
 * @param {string[]} topics - The topics of the course.
 * @param {string[]} instructors - The instructors of the course.
 * @returns {Promise<Course>} A promise that resolves with the created course.
 */
router.post(
  '/create',
  checkUserRole(['admin', 'counselor', 'teacher']),
  body('courseName')
    .isString()
    .notEmpty()
    .escape()
    .withMessage('Course name must be a non-empty string'),
  body('courseCode')
    .isString()
    .notEmpty()
    .escape()
    .withMessage('Course code must be a non-empty string'),
  body('studentGroup')
    .isString()
    .notEmpty()
    .optional()
    .escape()
    .withMessage('Student group must be a non-empty string'),
  body('startDate')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Start date is required'),
  body('endDate')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Start date is required'),
  body('topicGroup')
    .isString()
    .notEmpty()
    .optional()
    .escape()
    .withMessage('Topic group must be a non-empty string'),
  body('topics.*')
    .isString()
    .escape()
    .withMessage('Each topic must be a string'),
  body('instructors').isArray().withMessage('Instructors must be an array'),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    if (req.user) {
      console.log('create course ', req.user?.email);
      logger.info({email: req.user?.email}, 'create course');
    }
    const {
      courseName,
      courseCode,
      studentGroup,
      startDate,
      endDate,
      studentList,
      instructors,
      topicGroup,
      topics,
    } = req.body;

    try {
      console.log("row 193, courseroutes.ts, creating course and checking user roles");
      const response = await courseController.insertIntoCourse(
        courseName,
        startDate,
        endDate,
        courseCode,
        studentGroup,
        studentList,
        instructors,
        topics,
        topicGroup,
      );

      res.status(200).json({
        message: 'File uploaded and data logged successfully',
        courseId: response,
      });
    } catch (error) {
      logger.error(error);
      console.error(error);
      if (error instanceof Error) {
        res.status(500).json({
          message: error.message,
        });
      } else {
        res.status(500).json({
          message: 'An unknown error occurred',
        });
      }
    }
  },
);
/**
 * Route that creates a new course from an Excel file.
 *
 * @param {Buffer} file - The Excel file.
 * @param {string} checkCourseDetails - Whether to check the course details.
 * @param {string} instructorEmail - The email of the instructor.
 * @returns {Promise<CourseDetails>} A promise that resolves with the created course details.
 */
router.post(
  '/excelinput',
  checkUserRole(['admin', 'counselor', 'teacher']),
  upload.single('file'),
  async (req, res) => {
    logger.info({email: req.user?.email}, 'Excel input');
    try {
      console.log("row 240, courseroutes.ts, creating course from excel file and checking user roles");
      if (!req.file) {
        logger.error('No file uploaded');
        console.error('No file uploaded');
        res.status(400).json('No file uploaded');
        return;
      }
      const {checkCourseDetails, instructorEmail} = req.body;
      // Read the Excel file from the buffer
      const workbook = XLSX.read(req.file.buffer, {type: 'buffer'});
      // console.log('Loaded workbook'); // Debugging line

      // Get the first worksheet
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];

      if (!worksheet) {
        console.error('Worksheet not found');
        res.status(500).json('Internal server error');
        return;
      }
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      const createCourse = (data: Item[]): CourseDetails => {
        const fullCourseName = Object.keys(data[0])[0]; // get the first key
        const [courseName, courseCode] = fullCourseName.split(' (');
        const studentList = data
          .filter((item) => item.__EMPTY !== 'Etunimi')
          .map((item) => {
            const last_name = item[fullCourseName];
            const first_name = item.__EMPTY;
            const name = item.__EMPTY_1;
            const email = item.__EMPTY_2;
            const studentnumber = item.__EMPTY_4;
            const arrivalgroup = item.__EMPTY_5;
            const admingroups = item.__EMPTY_6;
            const program = item.__EMPTY_7;
            const educationform = item.__EMPTY_8;
            const registration = item.__EMPTY_9;
            const evaluation = item.__EMPTY_10;

            return {
              last_name,
              first_name,
              name,
              email,
              studentnumber,
              arrivalgroup,
              admingroups,
              program,
              educationform,
              registration,
              evaluation,
            };
          });

        return {
          courseName,
          courseCode: courseCode.replace('(', '').replace(')', ''),
          studentList,
          instructorEmail: '', // default value
          startDate: new Date(), // default value
          endDate: new Date(), // default value
          studentGroup: '', // default value
        };
      };

      const courseDetails = createCourse(jsonData as Item[]);
      courseDetails.instructorEmail = instructorEmail;
      if (checkCourseDetails === 'true') {
        const data = (await openData.checkOpenDataRealization(
          courseDetails.courseCode,
        )) as IData;
        // Extract startDate and endDate from data and convert them to Date objects
        courseDetails.startDate = new Date(data.realizations[0].startDate);
        courseDetails.endDate = new Date(data.realizations[0].endDate);
        const studentGroup = data.realizations[0].studentGroups[0];
        courseDetails.studentGroup = studentGroup ? studentGroup.code : '';
      } else {
        courseDetails.studentGroup = 'please enter student group';
        courseDetails.startDate = new Date();
        courseDetails.endDate = new Date();
      }
      res.send(courseDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json('Internal server error');
    }
  },
);
/**
 * Route that fetches all courses by the instructor's email.
 *
 * @param {string} email - The email of the instructor.
 * @returns {Promise<Course[]>} A promise that resolves with all courses taught by the instructor.
 */
router.get(
  '/instructor/:email',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('email').isEmail().withMessage('Email must be a valid email address'),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("row 342, courseroutes.ts, get all courses by instructor email");
      const courses = await course.getCoursesByInstructorEmail(
        req.params.email,
      );
      // console.log(courses);

      res.send(courses);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json('Server error');
    }
  },
);
/**
 * Route that fetches the courses by course ID.
 *
 * @param {number} id - The ID of the course.
 * @returns {Promise<Course[]>} A promise that resolves with the courses.
 */
router.get(
  '/coursesbyid/:id',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('id').isNumeric().withMessage('ID must be a number'),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("row 369, courseroutes.ts, get courses by id");
      const courseId = Number(req.params.id);
      if (isNaN(courseId)) {
        res.status(400).json('Invalid course ID');
        return;
      }
      const courses = await course.getCoursesByCourseId(courseId);
      res.send(courses);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json('Server error');
    }
  },
);

declare module 'express-serve-static-core' {
  interface Request {
    user?: CourseUser;
  }
}
/**
 * Route that fetches all courses for a user.
 *
 * @returns {Promise<Course[]>} A promise that resolves with all courses for the user.
 */
router.get(
  '/user/all',
  checkUserRole(['admin', 'counselor', 'teacher', 'student']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("row 400, courseroutes.ts, get all users");
      // Validate that the user is logged in
      if (!req.user) {
        res.status(403).json('User Info Unavailable');
        return;
      }

      // Get the email from the request
      const email = req.user.email;

      // Check if the user is an admin or the user is requesting their own info
      if (req.user.userrole !== 0 && req.user.email !== email) {
        res.status(403).json({error: 'Access denied'});
        return;
      }
      // Get the courses for the user
      const courses = await course.getStudentsCourses(email);
      res.send(courses);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json('Server error');
    }
  },
);
/**
 * Route that deletes a course by its ID.
 *
 * @param {number} id - The ID of the course.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
router.delete(
  '/delete/:id',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response): Promise<void> => {
    if (req.user) {
      logger.info({email: req.user?.email}, ' delete course');
    }
    // Get the course ID from the request
    try {
      console.log("row 440, courseroutes.ts, deleting by id and checking user roles");
      const courseId = Number(req.params.id);
      if (isNaN(courseId)) {
        res.status(400).json('Invalid course ID');
        return;
      }
      const result = await course.deleteCourse(courseId);
      res.send(result);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json('Server error');
    }
  },
);
/**
 * Route that fetches all students for an instructor by the instructor's ID.
 *
 * @param {number} userid - The ID of the instructor.
 * @returns {Promise<Student[]>} A promise that resolves with all students for the instructor.
 */
router.get(
  '/students/:userid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response): Promise<void> => {
    // Get the instructor ID from the request
    const userid = Number(req.params.userid);

    if (isNaN(userid)) {
      res.status(400).json('Invalid user ID');
      return;
    }

    try {
      console.log("row 474, courseroutes.ts, get students by id and checking user roles");
      // Get the students for the instructor
      const students = await usermodel.getStudentsByInstructorId(userid);
      res.send(students);
    } catch (err) {
      console.error(err);
      res.status(500).json('Server error');
    }
  },
);

/**
 * Route that updates a course by its ID.
 *
 * @param {number} courseid - The ID of the course.
 * @param {CourseData} modifiedData - The modified data of the course.
 * @returns {Promise<Course>} A promise that resolves with the updated course.
 */
router.put(
  '/update/:courseid',
  [
    body('modifiedData.courseName')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Course name is required'),
    body('modifiedData.courseCode')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Course code is required'),
    body('modifiedData.studentGroup').trim().escape().optional(),
    body('modifiedData.start_date')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Start date is required'),
    body('modifiedData.end_date')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('End date is required'),
    body('modifiedData.instructors')
      .isArray()
      .withMessage('Instructors must be an array'),
    body('modifiedData.topic_names.*')
      .isString()
      .escape()
      .withMessage('Each topic must be a string'),
  ],
  validate,
  async (req: Request, res: Response): Promise<void> => {
    if (req.user) {
      logger.info({email: req.user?.email}, ' update course');
    }
    // Validate that the user is logged in
    try {
      console.log("row 531, courseroutes.ts, updating by id and checking user roles");
      // Check if the user's role is either 'teacher' or 'admin'
      if (
        req.user &&
        req.user.role !== 'teacher' &&
        req.user.role !== 'admin'
      ) {
        // If not, return an error
        res.status(403).json({error: 'Unauthorized'});
        return;
      }
    } catch (error) {
      logger.error(error);
      // console.log('error', error);
    }

    // Get the course ID from the request
    const courseId = Number(req.params.courseid);

    if (isNaN(courseId)) {
      res.status(400).json('Invalid course ID');
      return;
    }

    // Get the course data from the request body
    const {
      courseName,
      courseCode,
      studentGroup,
      start_date,
      end_date,
      instructors,
      topic_names,
    } = req.body.modifiedData;

    try {
      // Update the course
      const result = await course.updateCourseInfo(
        courseId,
        courseName,
        start_date,
        end_date,
        courseCode,
        studentGroup,
        instructors,
        topic_names,
      );
      res.send(result);
    } catch (err) {
      if (err instanceof Error) {
        logger.error(err);
        console.error(err);
        res.status(500).json({message: err.message});
      }
    }
  },
);
/**
 * Route that fetches all courses.
 *
 * @returns {Promise<Course[]>} A promise that resolves with all courses.
 */
router.get(
  '/getallcourses',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("row 598, courseroutes.ts, get all courses");
      if (req.user?.role === 'counselor' || req.user?.role === 'admin') {
        const courses = await course.fetchAllCourses();
        res.send(courses);
      } else if (req.user?.role === 'teacher') {
        const courses = await course.getCoursesByInstructorEmail(
          req.user.email,
        );
        res.send(courses);
      } else {
        res.status(403).json({error: 'Unauthorized'});
      }
    } catch (error) {
      logger.error(error);
      console.error(error);
      let errorMessage = 'Internal server error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(500).json({message: errorMessage});
    }
  },
);
/**
 * Route that fetches the details of a course by its ID.
 *
 * @param {number} courseId - The ID of the course.
 * @returns {Promise<CourseDetails>} A promise that resolves with the details of the course.
 */
router.get(
  '/getdetailsbycourseid/:courseId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('courseId').isNumeric().withMessage('Course ID must be a number'),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("row 634, courseroutes.ts, get details by course id");
      const courseId = req.params.courseId;
      const details = await courseController.getDetailsByCourseId(courseId);
      res.send(details);
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);
/**
 * Route that updates the courses of a user by the user's ID and the course's ID.
 *
 * @param {number} userid - The ID of the user.
 * @param {number} courseid - The ID of the course.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
router.post(
  '/updateusercourses/:userid/:courseid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('courseid').isNumeric().withMessage('Course ID must be a number'),
  param('userid').isNumeric().withMessage('User ID must be a number'),
  validate,
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info({email: req.user?.email}, ' update user courses');
    }
    const {userid, courseid} = req.params;

    try {
      console.log("row 665, courseroutes.ts, update user courses with course id and user id");
      const useridNumber = parseInt(userid, 10);
      const courseidNumber = parseInt(courseid, 10);
      await courseController.updateStudentCourses(useridNumber, courseidNumber);

      res.status(200).json({message: 'Successfully updated student courses'});
    } catch (error) {
      logger.error(error);
      console.error(error);
      let errorMessage = 'Internal server error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(500).json({message: errorMessage});
    }
  },
);
/**
 * Route that deletes a course from a user by the user's course ID.
 *
 * @param {number} usercourseid - The ID of the user's course.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
router.delete(
  '/deleteusercourse/:usercourseid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('usercourseid')
    .isNumeric()
    .withMessage('User Course ID must be a number'),
  validate,
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info({email: req.user?.email}, ' delete user course');
    }
    const usercourseid = Number(req.params.usercourseid);
    try {
      console.log("row 701, courseroutes.ts, delete user course with user course id");
      await courseController.removeStudentCourses(usercourseid);
      res.status(200).json({message: 'Successfully deleted student courses'});
    } catch (error: unknown) {
      logger.error(error);
      console.error(error);
      if (error instanceof Error) {
        res.status(500).json({message: error.message});
      } else {
        res.status(500).json({message: 'Internal server error'});
      }
    }
  },
);
/**
 * Route that fetches the student and selected topics by the user's course ID.
 *
 * @param {number} usercourseid - The ID of the user's course.
 * @returns {Promise<Course[]>} A promise that resolves with the student and selected topics.
 */
router.get(
  '/studentandtopics/:usercourseid',
  param('usercourseid')
    .isNumeric()
    .withMessage('User Course ID must be a number'),
  validate,
  async (req: Request, res: Response) => {
    try {
      console.log("row 729, courseroutes.ts, get student and topics by user course id");
      const usercourseid = Number(req.params.usercourseid);
      const courses =
        await courseController.getStudentAndSelectedTopicsByUsercourseId(
          usercourseid,
        );
      res.send(courses);
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json('Server error');
    }
  },
);
/**
 * Route that fetches all students for a course by the course's ID.
 *
 * @param {number} courseid - The ID of the course.
 * @returns {Promise<Student[]>} A promise that resolves with all students for the course.
 */
router.get(
  '/studentsbycourse/:courseid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('courseid').isNumeric().withMessage('Course ID must be a number'),
  validate,
  async (req: Request, res: Response) => {
    try {
      console.log("row 756, courseroutes.ts, get students by course id");
      const courseid = Number(req.params.courseid);
      const students = await course.getAllStudentsOnCourse(courseid.toString());
      res.send(students);
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json('Server error');
    }
  },
);
/**
 * Route that fetches a user and their courses by the user's ID.
 *
 * @param {number} userid - The ID of the user.
 * @returns {Promise<{user: User, courses: Course[]}>} A promise that resolves with the user and their courses.
 */
router.get(
  '/:userid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('userid').isNumeric().withMessage('User ID must be a number'),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    const userid = req.params.userid;
    try {
      console.log("row 781, courseroutes.ts, get user by id");
      const useridNumber = parseInt(userid, 10);
      const users = await usermodel.fetchUserById(useridNumber);
      const email = users[0].email;
      const courses = await course.getStudentsCourses(email);

      res.send({user: users[0], courses: courses});
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);

router.get(
  '/students/pagination/:userid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response): Promise<void> => {
    // Get the instructor ID from the request
    try {
      console.log("row 802, courseroutes.ts, get students by id and checking user roles");
      const userid = Number(req.params.userid);
      const limit = Number(req.query.limit) || 10;
      const page = Number(req.query.page) || 1;
      const offset = (page - 1) * limit;

      if (isNaN(userid)) {
        res.status(400).json('Invalid user ID');
        return;
      }
      // Input validation
      if (limit < 1 || limit > 100) {
        res.status(400).json({
          message: 'Limit must be between 1 and 100',
        });
        return;
      }

      if (page < 1) {
        res.status(400).json({
          message: 'Page must be greater than 0',
        });
        return;
      }

      // Get the students for the instructor
      const students = await usermodel.fetchStudentsPaginationByInstructorId(
        userid,
        limit,
        offset,
      );
      res.send({
        students: students.students,
        total: students.total,
        currentPage: page,
        totalPages: Math.ceil(students.total / limit),
        limit,
      });
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json('Server error');
    }
  },
);

export default router;
