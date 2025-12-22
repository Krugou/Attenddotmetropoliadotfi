import express, {Router, type Request, type Response, type NextFunction, type RequestHandler,} from 'express';
import { body, param } from 'express-validator';
import TopicGroupController from '../../controllers/topicgroupcontroller.js';
import TopicGroup from '../../models/topicgroupmodel.js';
import checkUserRole from '../../utils/checkRole.js';
import logger from '../../utils/logger.js';
import validate from '../../utils/validate.js';

const router: Router = express.Router();

// Helpers
const asyncHandler =
  (fn: RequestHandler) =>
    (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next);

const send500 = (res: Response, msg: string | object = 'Server error') =>
  res.status(500).json(msg);

// Routes

// GET: All topic groups with topics
router.get(
  '/',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (_req, res) => {
    try {
      console.log('row 21, topicRoutes.ts, Get all topic groups with topics');
      const topicData = await TopicGroup.fetchAllTopicGroupsWithTopics();
      res.send(topicData);
    } catch (err) {
      logger.error(err);
      console.error(err);
      send500(res);
    }
  }),
);

// POST: All groups & topics for user (by email)
router.post(
  '/',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [body('email').isEmail().withMessage('Email must be a valid email address')],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 45, topicRoutes.ts, Get all topic groups and topics for user with email');
      const { email } = req.body;
      const data = await TopicGroupController.getAllUserTopicGroupsAndTopics(email);
      res.send(data);
    } catch (err) {
      logger.error(err);
      console.error(err);
      send500(res, 'Server error: ' + String(err));
    }
  }),
);

// POST: Update topic group
router.post(
  '/update',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [
    body('topicGroup').notEmpty().withMessage('Topic group is required'),
    body('topics.*').notEmpty().withMessage('All topics must not be empty'),
    body('email').isEmail().withMessage('Email must be a valid email address'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    if (req.user) logger.info({ useremail: req.user.email }, 'User is updating topic group');
    try {
      console.log('row 79, topicRoutes.ts, Update topic group');
      const { topicGroup, topics, email } = req.body;

      if (!topicGroup) {
        res.status(400).json({ message: 'Topic group is required' });
        return;
      }
      if (!topics || topics.length === 0 || topics.every((t: string) => t.trim() === '')) {
        res.status(400).json({ message: 'Topics are required' });
        return;
      }

      const updated = await TopicGroupController.updateTopicGroup(topicGroup, topics, email);
      res.status(200).json(updated);
    } catch (err) {
      logger.error(err);
      console.error(err);
      send500(res, 'Server error: ' + String(err));
    }
  }),
);

// POST: Update topics for course
router.post(
  '/update/:usercourseid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [
    param('usercourseid').isNumeric().withMessage('User course ID must be a number'),
    body('modifiedTopics.*').notEmpty().withMessage('All modified topics must not be empty'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    if (req.user) logger.info({ useremail: req.user.email }, 'User is updating topics for course');
    try {
      console.log('row 134, topicRoutes.ts, Update topics for course');
      const usercourseid = parseInt(req.params.usercourseid, 10);
      const { modifiedTopics } = req.body;

      if (!modifiedTopics) {
        res.status(400).json({ message: 'Topics are required' });
        return;
      }

      const resp = await TopicGroupController.updateUserCourseTopics(usercourseid, modifiedTopics);
      res.status(200).json(resp);
    } catch (err) {
      logger.error(err);
      console.error(err);
      send500(res, 'Server error: ' + String(err));
    }
  }),
);

// POST: Check topic group existence by email & name
router.post(
  '/topicgroupcheck/',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [
    body('topicGroup').notEmpty().withMessage('Topic group is required'),
    body('email').isEmail().withMessage('Email must be a valid email address'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    if (req.user) logger.info({ useremail: req.user.email }, 'User is checking topic group');
    try {
      console.log('row 174, topicRoutes.ts, Check if topic group exists for user');
      const { topicGroup, email } = req.body;

      if (!topicGroup) {
        res.status(400).json({ message: 'Topic group is required' });
        return;
      }

      const exists = await TopicGroupController.checkIfTopicGroupExistsWithEmail(
        topicGroup as string,
        email as string,
      );
      res.status(200).json(exists);
    } catch (err) {
      logger.error(err);
      console.error(err);
      send500(res, 'Server error: ' + String(err));
    }
  }),
);

// DELETE: Delete topic group by name
router.delete(
  '/delete/:topicgroupname',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [param('topicgroupname').notEmpty().withMessage('Topic group name is required')],
  validate,
  asyncHandler(async (req, res) => {
    if (req.user) logger.info({ useremail: req.user.email }, 'User is deleting topic group');
    try {
      console.log('row 215, topicRoutes.ts, Delete topic group by name');
      const { topicgroupname } = req.params;

      if (!topicgroupname) {
        res.status(400).json({ message: 'Topic group is required' });
        return;
      }

      const userid = req.user?.userid;
      const result = await TopicGroupController.deleteTopicGroupByName(topicgroupname, userid);
      res.status(200).json(result);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json({ message: 'Server error: ' + String(err) });
    }
  }),
);

// Error handler
router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);
  res.status(500).json('Server error');
});

export default router;
