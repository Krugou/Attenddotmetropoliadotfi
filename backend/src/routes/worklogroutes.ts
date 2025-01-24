import express, { Router } from 'express';
import workLogController from '../controllers/worklogcontroller.js';

const router: Router = express.Router();

// Update routes to remove /worklog prefix since it's now handled by app.use
router.post('/', async (req, res) => {
  try {
    const result = await workLogController.createWorkLogCourse(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating worklog course:', error);
    res.status(500).json({ error: 'Failed to create worklog course' });
  }
});

router.get('/:courseId', async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const result = await workLogController.getWorkLogCourseDetails(courseId);
    res.json(result);
  } catch (error) {
 console.log(error)
  }
});

// Update other routes to remove /worklog prefix
router.post('/entries', async (req, res) => {
  try {
    const result = await workLogController.createWorkLogEntry(req.body);
    res.json(result);
  } catch (error) {
    console.log(error)
  }
});

router.get('/entries/user/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const entries = await workLogController.getWorkLogEntriesByUser(userId);
    res.json(entries);
  } catch (error) {
    console.log(error)
  }
});

router.put('/entries/:entryId/status', async (req, res) => {
  try {
    const entryId = Number(req.params.entryId);
    const status = req.body.status as 0 | 1 | 2 | 3;
    const result = await workLogController.updateWorkLogEntryStatus( entryId, status );
    res.json(result);
  } catch (error) {
    console.log(error)
  }
});

// Group Management Routes
router.post('/groups', async (req, res) => {
  try {
    const { courseId, groupName } = req.body;
    const result = await workLogController.createWorkLogGroup( courseId, groupName );
    res.json(result);
  } catch (error) {
    console.log(error)
  }
});

router.post('/groups/:groupId/students', async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    const { userId } = req.body;
    const result = await workLogController.assignStudentToGroup(groupId, userId);
    res.json(result);
  } catch (error) {
    console.log(error)
  }
});

// User Course Assignment Route
router.post('/courses/:courseId/users', async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const { userId } = req.body;
    const result = await workLogController.assignUserToCourse(userId, courseId);
    res.json(result);
  } catch (error) {
    console.log(error)
  }
});

// Statistics Route
router.get('/stats/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const stats = await workLogController.getWorkLogStats(userId);
    res.json(stats);
  } catch (error) {
    console.log(error)
  }
});

router.get('/checkcode/:code', async (req, res) => {
  console.log('Received request to check worklog code:', req.params.code);
  try {
    const code = req.params.code;
    const exists = await workLogController.checkWorklogCodeExists(code);
    res.json({ exists });
  } catch (error) {
    console.error('Error checking worklog code:', error);
    res.status(500).json({ error: 'Failed to check worklog code' });
  }
});

export default router;
