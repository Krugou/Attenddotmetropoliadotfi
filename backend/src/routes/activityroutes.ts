import express, { Request, Response, Router } from 'express';
import ActivityController from '../controllers/courseactivity.js';
import checkUserRole from '../utils/checkRole.js';
import validate from '../utils/validate.js';
import logger from '../utils/logger.js';

const router: Router = express.Router();

// logger helper
const logAction = (
  message: string,
  meta: Record<string, any>,
  level: 'info' | 'warn' | 'error' = 'info'
) => {
  logger[level](meta, message);
};

//GET: all students activity data
router.get(
  '/all',
  checkUserRole(['admin', 'counselor']),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    console.log("row 24, activityRoutes.ts, Get all students activity data");

    const userId = req.user?.userid;
    const role = req.user?.role;

    try {
      console.log("row 30, activityRoutes.ts, Get all students activity data");
      logAction('GET /activity/all requested', { userId, userRole: role });
      const result = await ActivityController.getStudentsFromAllCourses();
      logAction('Successfully retrieved all students activity data', { userId, userRole: role });
      res.json(result);
    } catch (error) {
      logAction('Failed to retrieve all students activity data', {
        userId,
        userRole: role,
        error: error instanceof Error ? error.message : 'Unknown error',
        stackTrace: error instanceof Error ? error.stack : undefined,
      }, 'error');
      res.status(500).json({ success: false, data: [], error: 'Internal server error' });
    }
  },
);

//GET: instructor course activity data with id
router.get(
  '/:id',
  checkUserRole(['admin', 'counselor', 'teacher']),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    console.log("row 52, activityRoutes.ts, Get instructor course activity data with id");

    const requestedId = parseInt(req.params.id);
    const userId = req.user?.userid;
    const role = req.user?.role;

    logAction('GET /activity/:id requested', { userId, userRole: role, requestedId });

    if (!userId || (requestedId !== userId && role !== 'admin')) {
      logAction('Unauthorized access to instructor course data', {
        userId,
        userRole: role,
        requestedId,
        reason: 'Unauthorized access attempt',
      }, 'warn');
      res.status(403).json({
        success: false,
        data: [],
        error: 'Unauthorized access to instructor data',
      });
      return;
    }

    try {
      console.log("row 76, activityRoutes.ts, Get instructor course activity data with id");
      const result = await ActivityController.getStudentsFromInstructorCourses(requestedId);
      logAction('Successfully retrieved instructor course activity data', { userId, userRole: role, requestedId });
      res.json(result);
    } catch (error) {
      logAction('Failed to retrieve instructor course activity data', {
        userId,
        userRole: role,
        requestedId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stackTrace: error instanceof Error ? error.stack : undefined,
      }, 'error');
      res.status(500).json({
        success: false,
        data: [],
        error: 'Internal server error',
      });
    }
  },
);

export default router;
