import express, {Request, Response, Router} from 'express';
import {body, param} from 'express-validator';
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
const pool = createPool('ADMIN');
/**
 * Router for secure routes.
 */
const router: Router = express.Router();
/**
 * Route that returns the user object from the request.
 */
router.get('/', async (req: Request, res: Response) => {
  if (req.user) {
    const user = await UserModel.getAllUserInfo(req.user.email);
    res.send(user);
  }
});
/**
 * Route that fetches all students.
 */
router.get(
  '/students',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (_req: Request, res: Response) => {
    try {
      const users = await usermodel.fetchAllStudents();
      res.send(users);
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);
/**
 * Route that gets the attendance threshold.
 */
router.get('/getattendancethreshold', async (_req: Request, res: Response) => {
  try {
    const result = await serverSettingsModel.getAttentanceThreshold(pool); // replace with your actual function to get the threshold
    const threshold = result[0][0].attendancethreshold;
    res.send({attendancethreshold: threshold});
  } catch (error) {
    logger.error(error);
    console.error(error);
    res.status(500).json({message: 'Internal server error'});
  }
});
/**
 * Route that updates the GDPR status of a user.
 */
router.put(
  '/accept-gdpr/:userid',
  param('userid').isNumeric().withMessage('User ID must be a number'),
  validate,
  async (req, res) => {
    try {
      const userId: number | undefined = req.user?.userid;
      await usermodel.updateUserGDPRStatus(userId);
      res.send({success: true});
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json('Internal Server Error');
    }
  },
);
/**
 * Route that checks if a user exists by email and is a staff member.
 */
router.get(
  '/check-staff/:email',
  checkUserRole(['admin', 'counselor', 'teacher']),
  param('email').isEmail().withMessage('Email must be a valid email address'),
  validate,
  async (req: Request, res: Response) => {
    const email = req.params.email;
    try {
      const user = await usermodel.checkIfUserExistsByEmailAndisStaff(email);
      if (user.length > 0) {
        res.send({exists: true, user: user[0]});
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
 * Route that fetches all student groups.
 *
 * @returns {Promise<StudentGroup[]>} A promise that resolves with all student groups.
 */
router.get(
  '/studentgroups',
  checkUserRole(['admin', 'teacher', 'counselor']),
  async (_req: Request, res: Response) => {
    try {
      const groups = await studentgroupmodel.fetchAllStudentGroups();
      res.send(groups);
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);
router.post(
  '/insert-student-user-course/',
  checkUserRole(['admin', 'counselor', 'teacher']),
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
      console.log('insert-student-user-course ', req.user?.email);
      logger.info({email: req.user?.email}, 'Inserting student user');
    }
    const {
      email,
      first_name,
      last_name,
      studentnumber,
      studentGroupId,
      courseId,
    } = req.body;

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

      // Check if course connection exists
      const existingUserCourse = await usercoursesModel.checkIfUserCourseExists(
        userResult.insertId,
        courseId,
      );
      if (existingUserCourse.length === 0) {
        // If course connection does not exist, add it
        await usercoursesModel.insertUserCourse(userResult.insertId, courseId);
      }

      // Automatically mark the student as "not present" for past lectures
      try {
        await attendanceController.markStudentAsNotPresentInPastLectures(
          studentnumber, // Now works with both string and number
          courseId,
        );
      } catch (error) {
        logger.error('Error adding student to previous lectures:', error);
      }

      res
        .status(200)
        .send({message: 'Student user inserted successfully', userResult});
      console.log(
        `Student user successfully inserted. Email: ${email}, Student Number: ${studentnumber}`,
      );
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
);
router.put(
  '/updateuser',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
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
 * Route that fetches a user by their ID.
 *
 * @param {number} userid - The ID of the user.
 * @returns {Promise<User>} A promise that resolves with the user.
 */
router.get(
  '/getuser/:userid',
  checkUserRole(['admin', 'counselor', 'teacher']),
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
router.get(
  '/students/paginated',
  checkUserRole(['admin', 'counselor', 'teacher']),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = Number(req.query.limit) || 10;
      const page = Number(req.query.page) || 1;
      const offset = (page - 1) * limit;

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
      res.status(500).json({message: 'Internal server error'});
    }
  },
);

router.put(
  '/update-language',
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {email, language} = req.body;

      if (!['en', 'fi', 'sv'].includes(language)) {
        res.status(400).json({
          ok: false,
          error: 'Invalid language code',
        } as const);
        return;
      }

      await usermodel.updateUserLanguage(email, language);

      res.send({
        ok: true,
        message: 'Language updated successfully',
      } as const);
    } catch (error) {
      logger.error('Error updating language:', error);
      res.status(500).json({
        ok: false,
        error: 'Internal server error',
      } as const);
    }
  },
);

router.get(
  '/user-language/:email',
  validate,
  async (req: Request, res: Response) => {
    try {
      const {email} = req.params;
      //@ts-expect-error
      const result = await usermodel.getUserLanguage(email);
      if (result && result[0]) {
        res.send({
          ok: true,
          language: result[0].language,
        });
      } else {
        res.status(404).json({
          ok: false,
          error: 'User language not found',
        });
      }
    } catch (error) {
      logger.error('Error fetching user language:', error);
      res.status(500).json({
        ok: false,
        error: 'Internal server error',
      });
    }
  },
);

export default router;
