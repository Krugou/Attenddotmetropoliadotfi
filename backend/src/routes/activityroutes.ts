import express, {Request, Response, Router} from 'express';
import ActivityController from '../controllers/courseactivity.js';
import checkUserRole from '../utils/checkRole.js';
import validate from '../utils/validate.js';
import logger from 'utils/logger.js';
const router: Router = express.Router();


router.get(
  '/:id',
  checkUserRole(['admin', 'counselor', 'teacher']),
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const requestedId = parseInt(req.params.id);
      const authenticatedUserId = req.user?.userid;

      if (!authenticatedUserId || (requestedId !== authenticatedUserId && req.user?.role !== 'admin')) {
        res.status(403).json({
          success: false,
          data: [],
          error: 'Unauthorized access to instructor data'
        });
        return;
      }

      const result = await ActivityController.getStudentsFromInstructorCourses(requestedId);


      res.json(result);

    } catch (error) {
      logger.error('Route error:', error);
      res.status(500).json({
        success: false,
        data: [],
        error: 'Internal server error'
      });
    }
  }
);

export default router;
