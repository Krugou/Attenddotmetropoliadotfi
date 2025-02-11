import express, {Request, Response, Router} from 'express';
import {body, validationResult} from 'express-validator';
import userFeedBackModel from '../models/userfeedbackmodel.js';
import logger from '../utils/logger.js';

/**
 * Router for feedback routes.
 */
const router: Router = express.Router();

/**
 * Route that handles user feedback submission.
 * @route POST /feedback
 */
router.post(
  '/',
  [
    body('topic').notEmpty().withMessage('Topic is required'),
    body('text').notEmpty().withMessage('Text is required'),
    body('userId').notEmpty().withMessage('User ID is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return;
      }
      const {topic, text, userId} = req.body;

      const result = await userFeedBackModel.insertUserFeedback(
        userId,
        topic,
        text,
      );
      if (result === null) {
        res.status(500).json({
          message: 'Internal server error',
        });
        return;
      }
      res.status(200).json({
        message: 'Success',
      });
    } catch (error) {
      logger.error(error);
      res.status(500).json({
        message: 'An unexpected error occurred',
      });
    }
  },
);

export default router;
