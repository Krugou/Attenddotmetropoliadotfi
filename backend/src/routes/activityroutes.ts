/**
 * @fileoverview Routes for handling student activity data across courses
 * Provides endpoints for retrieving student activity metrics for administrators,
 * counselors, and teachers.
 *
 * @module ActivityRoutes
 * @requires express
 * @requires ../controllers/courseactivity
 * @requires ../utils/checkRole
 * @requires ../utils/validate
 * @requires ../utils/logger
 */

import express, {Request, Response, Router} from 'express';
import ActivityController from '../controllers/courseactivity.js';
import checkUserRole from '../utils/checkRole.js';
import validate from '../utils/validate.js';
import logger from '../utils/logger.js';

/**
 * Express router for activity-related endpoints
 * @type {express.Router}
 */
const router: Router = express.Router();

/**
 * Retrieve student activity data from all courses
 *
 * @route GET /activity/all
 * @access Private - Requires admin or counselor role
 * @returns {Object} JSON response with student activity data
 * @throws {500} If server encounters an error retrieving data
 */
router.get(
  '/all',
  checkUserRole(['admin', 'counselor']),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info(
        {
          userId: req.user?.userid,
          userRole: req.user?.role,
          action: 'Requesting all students activity data',
        },
        'GET /activity/all requested',
      );

      const result = await ActivityController.getStudentsFromAllCourses();

      logger.info(
        {
          userId: req.user?.userid,
          userRole: req.user?.role,
        },
        'Successfully retrieved all students activity data',
      );

      res.json(result);
    } catch (error) {
      logger.error(
        {
          userId: req.user?.userid,
          userRole: req.user?.role,
          error: error instanceof Error ? error.message : 'Unknown error',
          stackTrace: error instanceof Error ? error.stack : undefined,
        },
        'Failed to retrieve all students activity data',
      );

      res.status(500).json({
        success: false,
        data: [],
        error: 'Internal server error',
      });
    }
  },
);

/**
 * Retrieve student activity data for courses taught by a specific instructor
 *
 * @route GET /activity/:id
 * @param {number} id - User ID of the instructor
 * @access Private - Requires admin, counselor, or teacher role with appropriate permissions
 *                   Teachers can only access their own data unless they are admins
 * @returns {Object} JSON response with student activity data for the instructor's courses
 * @throws {403} If user attempts to access another instructor's data without admin permissions
 * @throws {500} If server encounters an error retrieving data
 */
router.get(
  '/:id',
  checkUserRole(['admin', 'counselor', 'teacher']),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const requestedId = parseInt(req.params.id);
      const authenticatedUserId = req.user?.userid;
      const userRole = req.user?.role;

      logger.info(
        {
          userId: authenticatedUserId,
          userRole: userRole,
          requestedId,
          action: 'Requesting instructor course activity data',
        },
        'GET /activity/:id requested',
      );

      // Authorization check
      if (
        !authenticatedUserId ||
        (requestedId !== authenticatedUserId && userRole !== 'admin')
      ) {
        logger.warn(
          {
            userId: authenticatedUserId,
            userRole: userRole,
            requestedId,
            reason: 'Unauthorized access attempt',
          },
          'Unauthorized access to instructor course data',
        );

        res.status(403).json({
          success: false,
          data: [],
          error: 'Unauthorized access to instructor data',
        });
        return;
      }

      const result = await ActivityController.getStudentsFromInstructorCourses(
        requestedId,
      );

      logger.info(
        {
          userId: authenticatedUserId,
          userRole: userRole,
          requestedId,
        },
        'Successfully retrieved instructor course activity data',
      );

      res.json(result);
    } catch (error) {
      logger.error(
        {
          userId: req.user?.userid,
          userRole: req.user?.role,
          requestedId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          stackTrace: error instanceof Error ? error.stack : undefined,
        },
        'Failed to retrieve instructor course activity data',
      );

      res.status(500).json({
        success: false,
        data: [],
        error: 'Internal server error',
      });
    }
  },
);

export default router;
