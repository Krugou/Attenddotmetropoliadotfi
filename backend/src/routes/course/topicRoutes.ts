import express, {Request, Response, Router} from 'express';

import {body, param} from 'express-validator';
import TopicGroupController from '../../controllers/topicgroupcontroller.js';
import TopicGroup from '../../models/topicgroupmodel.js';
import checkUserRole from '../../utils/checkRole.js';
import logger from '../../utils/logger.js';
import validate from '../../utils/validate.js';

const router: Router = express.Router();
/**
 * Route that fetches all topic groups with their topics.
 *
 * @returns {Promise<TopicGroup[]>} A promise that resolves with all topic groups and their topics.
 */
router.get(
  '/',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (_req: Request, res: Response) => {
    try {
      console.log("row 21, topicRoutes.ts, Get all topic groups with topics")
      const topicData = await TopicGroup.fetchAllTopicGroupsWithTopics();

      res.send(topicData);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json('Server error');
    }
  },
);
/**
 * Route that fetches all topic groups and topics for a user.
 *
 * @param {string} email - The email of the user.
 * @returns {Promise<TopicGroup[]>} A promise that resolves with all topic groups and topics for the user.
 */
router.post(
  '/',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [body('email').isEmail().withMessage('Email must be a valid email address')],
  validate,
  async (req: Request, res: Response) => {
    try {
      console.log("row 45, topicRoutes.ts, Get all topic groups and topics for user with email")
      const {email} = req.body;
      const topicGroupData =
        await TopicGroupController.getAllUserTopicGroupsAndTopics(email);
      res.send(topicGroupData);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json('Server error: ' + err);
    }
  },
);
/**
 * Route that updates a topic group.
 *
 * @param {string} topicGroup - The name of the topic group.
 * @param {string[]} topics - The topics for the topic group.
 * @param {string} email - The email of the user.
 * @returns {Promise<TopicGroup>} A promise that resolves with the updated topic group.
 */
router.post(
  '/update',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [
    body('topicGroup').notEmpty().withMessage('Topic group is required'),
    body('topics.*').notEmpty().withMessage('All topics must not be empty'),
    body('email').isEmail().withMessage('Email must be a valid email address'),
  ],
  validate,
  async (req: Request, res: Response): Promise<void> => {
    if (req.user) {
      logger.info({useremail: req.user.email}, 'User is updating topic group');
    }
    try {
      console.log("row 79, topicRoutes.ts, Update topic group")
      const {topicGroup, topics, email} = req.body;

      if (!topicGroup) {
        res.status(400).json({message: 'Topic group is required'});
        return;
      }
      if (
        !topics ||
        topics.length === 0 ||
        topics.every((topic: string) => topic.trim() === '')
      ) {
        res.status(400).json({message: 'Topics are required'});
        return;
      }
      const topicGroupData = await TopicGroupController.updateTopicGroup(
        topicGroup,
        topics,
        email,
      );
      res.status(200).json(topicGroupData);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json('Server error: ' + err);
    }
  },
);
/**
 * Route that updates the topics for a user's course.
 *
 * @param {number} usercourseid - The ID of the user's course.
 * @param {string[]} modifiedTopics - The updated topics.
 * @returns {Promise<TopicGroup>} A promise that resolves with the updated topics for the user's course.
 */
router.post(
  '/update/:usercourseid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [
    param('usercourseid')
      .isNumeric()
      .withMessage('User course ID must be a number'),
    body('modifiedTopics.*')
      .notEmpty()
      .withMessage('All modified topics must not be empty'),
  ],
  validate,
  async (req: Request, res: Response): Promise<void> => {
    if (req.user) {
      logger.info(
        {useremail: req.user.email},
        'User is updating topics for course',
      );
    }
    try {
      console.log("row 134, topicRoutes.ts, Update topics for course")
      const usercourseid = parseInt(req.params.usercourseid);
      const {modifiedTopics} = req.body;
      if (!modifiedTopics) {
        res.status(400).json({message: 'Topics are required'});
        return;
      }

      const topicResponse = await TopicGroupController.updateUserCourseTopics(
        usercourseid,
        modifiedTopics,
      );
      res.status(200).json(topicResponse);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json('Server error: ' + err);
    }
  },
);
/**
 * Route that checks if a topic group exists for a user.
 *
 * @param {string} topicGroup - The name of the topic group.
 * @param {string} email - The email of the user.
 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the topic group exists for the user.
 */
router.post(
  '/topicgroupcheck/',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [
    body('topicGroup').notEmpty().withMessage('Topic group is required'),
    body('email').isEmail().withMessage('Email must be a valid email address'),
  ],
  validate,
  async (req: Request, res: Response): Promise<void> => {
    if (req.user) {
      logger.info({useremail: req.user.email}, 'User is checking topic group');
    }
    try {
      console.log("row 174, topicRoutes.ts, Check if topic group exists for user")
      const {topicGroup, email} = req.body;

      if (!topicGroup) {
        res.status(400).json({message: 'Topic group is required'});
        return;
      }
      const topicGroupResult =
        await TopicGroupController.checkIfTopicGroupExistsWithEmail(
          topicGroup as string,
          email as string,
        );

      res.status(200).json(topicGroupResult);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json('Server error: ' + err);
    }
  },
);
/**
 * Route that deletes a topic group by its name.
 *
 * @param {string} topicgroupname - The name of the topic group.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
router.delete(
  '/delete/:topicgroupname',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [
    param('topicgroupname')
      .notEmpty()
      .withMessage('Topic group name is required'),
  ],
  validate,
  async (req: Request, res: Response): Promise<void> => {
    if (req.user) {
      logger.info({useremail: req.user.email}, 'User is deleting topic group');
    }
    try {
      console.log("row 215, topicRoutes.ts, Delete topic group by name")
      const topicgroupname = req.params.topicgroupname;
      if (!topicgroupname) {
        res.status(400).json({message: 'Topic group is required'});
        return;
      }
      const userid = req.user?.userid;

      const topicGroupResult =
        await TopicGroupController.deleteTopicGroupByName(
          topicgroupname,
          userid,
        );

      res.status(200).json(topicGroupResult);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json({message: 'Server error: ' + err});
    }
  },
);

export default router;
