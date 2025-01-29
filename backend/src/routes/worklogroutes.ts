import express, {Router} from 'express';
import workLogController from '../controllers/worklogcontroller.js';
import logger from '../utils/logger.js';
import checkUserRole from '../utils/checkRole.js';
const router: Router = express.Router();

// Update routes to remove /worklog prefix since it's now handled by app.use
router.post('/', async (req, res) => {
  try {
    const result = await workLogController.createWorkLogCourse(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error creating worklog course:', error);
    res.status(500).json({error: 'Failed to create worklog course'});
  }
});

router.get(
  '/:courseId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req, res) => {
    try {
      const courseId = Number(req.params.courseId);
      const result = await workLogController.getWorkLogCourseDetails(courseId);
      res.json(result);
    } catch (error) {
      logger.error(error);
    }
  },
);

router.put(
  '/:worklogId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req, res) => {
    try {
      const worklogId = Number(req.params.worklogId);
      const {modifiedData} = req.body;
      if (!modifiedData) {
        return res.status(400).json({error: 'No modified data provided'});
      }
      const result = await workLogController.updateWorkLogCourse(
        worklogId,
        modifiedData,
      );
      res.json(result);
    } catch (error) {
      logger.error('Error updating worklog course:', error);
    }
  },
);

router.delete(
  '/:worklogId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req, res) => {
    try {
      const worklogId = Number(req.params.worklogId);
      const result = await workLogController.deleteWorkLog(worklogId);
      // Previous code was sending two responses:
      // res.json(result);
      // res.json({ message: 'Worklog deleted successfully' });

      // Fixed version - send only one response:
      res.json({
        success: true,
        message: 'Worklog deleted successfully',
        result,
      });
    } catch (error) {
      logger.error('Error deleting worklog:', error);
      res.status(500).json({error: 'Failed to delete worklog'});
    }
  },
);

// Update other routes to remove /worklog prefix
router.post(
  '/entries',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req, res) => {
    try {
      const result = await workLogController.createWorkLogEntry(req.body);
      res.json(result);
    } catch (error) {
      logger.error(error);
    }
  },
);

router.get(
  '/entries/user/:userId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const entries = await workLogController.getWorkLogEntriesByUser(userId);
      res.json(entries);
    } catch (error) {
      logger.error(error);
    }
  },
);

router.put(
  '/entries/:entryId/status',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req, res) => {
    try {
      const entryId = Number(req.params.entryId);
      const status = req.body.status as 0 | 1 | 2 | 3;
      const result = await workLogController.updateWorkLogEntryStatus(
        entryId,
        status,
      );
      res.json(result);
    } catch (error) {
      logger.error(error);
    }
  },
);

// Group Management Routes
router.post(
  '/:courseId/groups',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req, res) => {
    try {
      const courseId = Number(req.params.courseId);
      const {name} = req.body;
      if (!name) {
        return res.status(400).json({error: 'Group name is required'});
      }
      const result = await workLogController.createWorkLogGroup(courseId, name);
      res.json(result);
    } catch (error) {
      logger.error('Error creating worklog group:', error);
    }
  },
);

router.post(
  '/groups/:groupId/students',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req, res) => {
    try {
      const groupId = Number(req.params.groupId);
      const {userId} = req.body;
      const result = await workLogController.assignStudentToGroup(
        groupId,
        userId,
      );
      res.json(result);
    } catch (error) {
      logger.error(error);
    }
  },
);

router.get(
  '/groups/:groupId/students',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req, res) => {
    try {
      const groupId = Number(req.params.groupId);
      const result = await workLogController.getWorkLogGroupStudents(groupId);
      res.json(result);
    } catch (error) {
      logger.error('Error getting worklog group students:', error);
    }
  },
);

router.post(
  '/courses/:courseId/users',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req, res) => {
    try {
      const courseId = Number(req.params.courseId);
      const {userId} = req.body;
      const result = await workLogController.assignUserToCourse(
        userId,
        courseId,
      );
      res.json(result);
    } catch (error) {
      logger.error(error);
    }
  },
);

// Statistics Route
router.get(
  '/stats/:userId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const stats = await workLogController.getWorkLogStats(userId);
      res.json(stats);
    } catch (error) {
      logger.error(error);
    }
  },
);

router.get(
  '/checkcode/:code',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req, res) => {
    try {
      const code = req.params.code;
      const exists = await workLogController.checkWorklogCodeExists(code);
      res.json({exists});
    } catch (error) {
      logger.error('Error checking worklog code:', error);
      res.status(500).json({error: 'Failed to check worklog code'});
    }
  },
);

router.get(
  '/instructor/:email',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req, res) => {
    try {
      const email = req.params.email;
      const courses = await workLogController.getWorkLogCoursesByInstructor(
        email,
      );
      res.json(courses);
    } catch (error) {
      logger.error('Error getting worklog courses by instructor:', error);
      res.status(500).json({error: 'Failed to get worklog courses'});
    }
  },
);

router.get('/:courseId/students', async (req, res) => {
  try {
    const {courseId} = req.params;
    const result = await workLogController.getWorkLogStudentsByCourse(courseId);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({error: error.message});
    } else {
      res.status(500).json({error: 'Internal server error'});
    }
  }
});

router.get(
  '/:courseId/groups',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req, res) => {
    try {
      const {courseId} = req.params;
      const result = await workLogController.getWorkLogGroupsByCourse(courseId);
      res.json(result);
    } catch (error) {
      logger.error('Error getting worklog course groups:', error);
    }
  },
);

export default router;
