import express, {Request, Response, Router} from 'express';
import practicumController from '../controllers/practicumcontroller.js';
import logger from '../utils/logger.js';
import checkUserRole from '../utils/checkRole.js';
import {body} from 'express-validator';
import validate from '../utils/validate.js';

const router: Router = express.Router();

router.get(
  '/',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (_req: Request, res: Response) => {
    try {
      console.log("row 15, practicumroutes.ts, Get all practicums");
      const practicums = await practicumController.getAllPracticums();
      res.json(practicums);
    } catch (error) {
      logger.error('Error getting all practicums:', error);
      res.status(500).json({error: 'Failed to get practicums'});
    }
  },
);

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
      console.log("row 38, practicumroutes.ts, Post practicum");
      const result = await practicumController.createPracticum(req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Error creating practicum:', error);
      res.status(500).json({error: 'Failed to create practicum'});
    }
  },
);

router.get(
  '/:practicumId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 53, practicumroutes.ts, Get practicum details");
      const practicumId = Number(req.params.practicumId);
      const result = await practicumController.getPracticumDetails(practicumId);
      res.json(result);
    } catch (error) {
      logger.error('Error getting practicum details:', error);
      res.status(500).json({error: 'Failed to get practicum details'});
    }
  },
);

router.put(
  '/:practicumId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 69, practicumroutes.ts, Update practicum by ID");
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

router.delete(
  '/:practicumId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 88, practicumroutes.ts, Delete practicum by ID");
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

router.get(
  '/instructor/:userId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 108, practicumroutes.ts, Get practicums by instructor");
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

router.post(
  '/:practicumId/assign-student',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [
    body('userId').isInt().withMessage('Valid user ID is required'),
  ],
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("row 130, practicumroutes.ts, Assign student to practicum");
      const practicumId = Number(req.params.practicumId);
      const userId = Number(req.body.userId);

      if (!practicumId || !userId) {
        res.status(400).json({ error: 'Invalid practicum or user ID' });
        return;
      }
      const result = await practicumController.assignStudentToPracticum(practicumId, userId);
      res.json(result);
    } catch (error) {
      logger.error('Error assigning student to practicum:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to assign student'
      });
    }
  }
);

router.get(
  '/student/:email',
  async (req: Request, res: Response) => {
    try {
      console.log("row 153, practicumroutes.ts, Get student practicum by email");
      const email = req.params.email;
      const result = await practicumController.getPracticumByStudentEmail(email);
      res.json(result);
    } catch (error) {
      logger.error('Error getting student practicum:', error);
      res.status(500).json({error: 'Failed to get student practicum'});
    }
  }
);

export default router;
