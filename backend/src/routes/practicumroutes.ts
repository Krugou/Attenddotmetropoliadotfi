import express, {Request, Response, Router} from 'express';
import practicumController from '../controllers/practicumcontroller.js';
import logger from '../utils/logger.js';
import checkUserRole from '../utils/checkRole.js';
import {body} from 'express-validator';
import validate from '../utils/validate.js';

const router: Router = express.Router();

// Create new practicum
router.post(
  '/',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('description').isString().notEmpty().withMessage('Description is required'),
    body('requiredHours').isInt({min: 0}).withMessage('Valid required hours is required'),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const result = await practicumController.createPracticum(req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Error creating practicum:', error);
      res.status(500).json({error: 'Failed to create practicum'});
    }
  },
);

// Get practicum details
router.get(
  '/:practicumId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      const practicumId = Number(req.params.practicumId);
      const result = await practicumController.getPracticumDetails(practicumId);
      res.json(result);
    } catch (error) {
      logger.error('Error getting practicum details:', error);
      res.status(500).json({error: 'Failed to get practicum details'});
    }
  },
);

// Update practicum
router.put(
  '/:practicumId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      const practicumId = Number(req.params.practicumId);
      const result = await practicumController.updatePracticum(
        practicumId,
        req.body,
      );
      res.json(result);
    } catch (error) {
      logger.error('Error updating practicum:', error);
      res.status(500).json({error: 'Failed to update practicum'});
    }
  },
);

// Delete practicum
router.delete(
  '/:practicumId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      const practicumId = Number(req.params.practicumId);
      const result = await practicumController.deletePracticum(practicumId);
      res.json({
        success: true,
        message: 'Practicum deleted successfully',
        result,
      });
    } catch (error) {
      logger.error('Error deleting practicum:', error);
      res.status(500).json({error: 'Failed to delete practicum'});
    }
  },
);

// Get practicums by instructor
router.get(
  '/instructor/:userId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const practicums = await practicumController.getPracticumsByInstructor(
        userId
      );
      res.json(practicums);
    } catch (error) {
      logger.error('Error getting practicums by instructor:', error);
      res.status(500).json({error: 'Failed to get practicums'});
    }
  },
);

export default router;
