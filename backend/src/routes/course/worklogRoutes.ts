import express, {Request, Response, Router} from 'express';
import {body, param, query} from 'express-validator';
import workLogModel from '../../models/worklogmodel.js';
import validate from '../../utils/validate.js';
import checkUserRole from '../../utils/checkRole.js';

const router: Router = express.Router();
// route tester
router.get('/', (_req: Request, res: Response) => {
  res.send('Hello from worklog routes');
});
//  Course Management Routes
router.post(
  '/courses',
  checkUserRole(['admin', 'teacher']),
  [
    body('name').trim().isLength({min: 1}).escape(),
    body('startDate')
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date')
      .toDate(),
    body('endDate')
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date')
      .toDate()
      .custom((endDate, {req}) => {
        if (new Date(endDate) <= new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    body('code').trim().isLength({min: 1}).escape(),
    body('description').trim().escape(),
    body('required_hours').optional().isInt({min: 0}),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const {name, startDate, endDate, code, description, required_hours} =
        req.body;

      const result = await workLogModel.createWorkLogCourse(
        name,
        startDate,
        endDate,
        code,
        description,
        required_hours || 0,
      );
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating worklog course:', error);
      res.status(500).json({
        error: 'Failed to create work log course',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
);

// Course Entry Management Routes
router.post(
  '/entries',
  checkUserRole(['admin', 'teacher', 'student']),
  [
    body('courseId').isInt(),
    body('startTime').isISO8601().toDate(),
    body('endTime').isISO8601().toDate(),
    body('description').trim().escape(),
  ],
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {courseId, startTime, endTime, description} = req.body;
      const userId = req.user?.userid;

      if (!userId) {
        res.status(401).json({error: 'User not authenticated'});
        return;
      }

      const hasAccess = await workLogModel.validateUserCourseAccess(
        userId,
        courseId,
      );
      if (!hasAccess) {
        res.status(403).json({error: 'User not enrolled in course'});
        return;
      }

      const result = await workLogModel.createWorkLogEntry(
        userId,
        courseId,
        startTime,
        endTime,
        description,
      );
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({error: 'Failed to create work log entry'});
    }
  },
);

// Entry Status Management Routes
router.patch(
  '/entries/:entryId/status',
  checkUserRole(['admin', 'teacher']),
  [param('entryId').isInt(), body('status').isInt().isIn([0, 1, 2, 3])],
  validate,
  async (req: Request, res: Response) => {
    try {
      const {entryId} = req.params;
      const {status} = req.body;
      const result = await workLogModel.updateWorkLogEntryStatus(
        parseInt(entryId),
        status,
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({error: 'Failed to update entry status'});
    }
  },
);

// Course Enrollment Routes
router.post(
  '/courses/:courseId/users',
  checkUserRole(['admin', 'teacher']),
  [param('courseId').isInt(), body('userId').isInt()],
  validate,
  async (req: Request, res: Response) => {
    try {
      const {courseId} = req.params;
      const {userId} = req.body;
      const result = await workLogModel.addUserToCourse(
        userId,
        parseInt(courseId),
      );
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({error: 'Failed to enroll user in course'});
    }
  },
);

// Group Management Routes
router.post(
  '/groups',
  checkUserRole(['admin', 'teacher']),
  [
    body('courseId').isInt(),
    body('groupName').trim().isLength({min: 1}).escape(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const {courseId, groupName} = req.body;
      const result = await workLogModel.createWorkLogGroup(courseId, groupName);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({error: 'Failed to create work log group'});
    }
  },
);

// Retrieval Routes
router.get(
  '/worklogcourses',
  checkUserRole(['admin']),
  async (_req: Request, res: Response) => {
    try {
      const courses = await workLogModel.getAllWorkLogCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({error: 'Failed to fetch courses'});
    }
  },
);

router.get(
  '/courses/:courseId/entries',
  checkUserRole(['admin', 'teacher']),
  [param('courseId').isInt()],
  validate,
  async (req: Request, res: Response) => {
    try {
      const {courseId} = req.params;
      const entries = await workLogModel.getWorkLogEntriesByCourse(
        parseInt(courseId),
      );
      res.json(entries);
    } catch (error) {
      res.status(500).json({error: 'Failed to fetch course entries'});
    }
  },
);

router.get(
  '/users/:userId/stats',
  checkUserRole(['admin', 'teacher', 'student']),
  [param('userId').isInt()],
  validate,
  async (req: Request, res: Response) => {
    try {
      const {userId} = req.params;
      const stats = await workLogModel.getWorkLogStatsByUser(parseInt(userId));
      res.json(stats);
    } catch (error) {
      res.status(500).json({error: 'Failed to fetch user stats'});
    }
  },
);

// Search Routes
router.get(
  '/courses/search',
  checkUserRole(['admin', 'teacher', 'student']),
  [query('term').trim().escape()],
  validate,
  async (req: Request, res: Response) => {
    try {
      const searchTerm = req.query.term as string;
      const courses = await workLogModel.searchWorkLogCourses(searchTerm);
      res.json(courses);
    } catch (error) {
      res.status(500).json({error: 'Failed to search courses'});
    }
  },
);

export default router;
