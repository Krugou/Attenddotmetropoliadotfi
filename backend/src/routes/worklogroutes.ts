import express, {Router} from 'express';
import workLogController from '../controllers/worklogcontroller.js';
import logger from '../utils/logger.js';
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

router.get('/:courseId', async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const result = await workLogController.getWorkLogCourseDetails(courseId);
    res.json(result);
  } catch (error) {
    logger.error(error);
  }
});

router.put('/:worklogId', async (req, res) => {
  try {
    const worklogId = Number(req.params.worklogId);
    // Extract modifiedData from request body
    const { modifiedData } = req.body;

    if (!modifiedData) {
      return res.status(400).json({ error: 'No modified data provided' });
    }

    const result = await workLogController.updateWorkLogCourse(worklogId, modifiedData);
    res.json(result);
  } catch (error) {
    logger.error('Error updating worklog course:', error);
    res.status(500).json({error: 'Failed to update worklog course'});
  }
});

router.delete('/:worklogId', async (req, res) => {
  try {
    const worklogId = Number(req.params.worklogId);

    if (isNaN(worklogId)) {
      return res.status(400).json({ error: 'Invalid worklog ID' });
    }

    const result = await workLogController.deleteWorkLog(worklogId);

    if (!result) {
      return res.status(404).json({ error: 'Worklog not found' });
    }

    res.json({ message: 'Worklog deleted successfully' });
  } catch (error) {
    logger.error('Error deleting worklog:', error);
    res.status(500).json({ error: 'Failed to delete worklog' });
  }
});

// Update other routes to remove /worklog prefix
router.post('/entries', async (req, res) => {
  try {
    const result = await workLogController.createWorkLogEntry(req.body);
    res.json(result);
  } catch (error) {
    logger.error(error);
  }
});

router.get('/entries/user/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const entries = await workLogController.getWorkLogEntriesByUser(userId);
    res.json(entries);
  } catch (error) {
    logger.error(error);
  }
});

router.put('/entries/:entryId/status', async (req, res) => {
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
});

// Group Management Routes
router.post('/groups', async (req, res) => {
  try {
    const {courseId, groupName} = req.body;
    const result = await workLogController.createWorkLogGroup(
      courseId,
      groupName,
    );
    res.json(result);
  } catch (error) {
    logger.error(error);
  }
});

router.post('/groups/:groupId/students', async (req, res) => {
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
});

// User Course Assignment Route
router.post('/courses/:courseId/users', async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const {userId} = req.body;
    const result = await workLogController.assignUserToCourse(userId, courseId);
    res.json(result);
  } catch (error) {
    logger.error(error);
  }
});

// Statistics Route
router.get('/stats/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const stats = await workLogController.getWorkLogStats(userId);
    res.json(stats);
  } catch (error) {
    logger.error(error);
  }
});

router.get('/checkcode/:code', async (req, res) => {
  try {
    const code = req.params.code;
    const exists = await workLogController.checkWorklogCodeExists(code);
    res.json({exists});
  } catch (error) {
    logger.error('Error checking worklog code:', error);
    res.status(500).json({error: 'Failed to check worklog code'});
  }
});

router.get('/instructor/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const courses = await workLogController.getWorkLogCoursesByInstructor(email);
    res.json(courses);
  } catch (error) {
    logger.error('Error getting worklog courses by instructor:', error);
    res.status(500).json({error: 'Failed to get worklog courses'});
  }
});

export default router;
