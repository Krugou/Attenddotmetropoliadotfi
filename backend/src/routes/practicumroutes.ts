import express, { Request, Response, Router } from 'express';
import practicumController from '../controllers/practicumcontroller.js';
import logger from '../utils/logger.js';
import checkUserRole from '../utils/checkRole.js';
import { body } from 'express-validator';
import validate from '../utils/validate.js';

const router: Router = express.Router();
const allow = checkUserRole(['admin', 'counselor', 'teacher']);
const c = practicumController;

// Helpers: async wrapper to cut try/catch boilerplate
const asyncRoute = (
  label: string,
  errorMsg: string,
  fn: (req: Request, res: Response) => Promise<void>,
) =>
  async (req: Request, res: Response) => {
    try {
      console.log(label);
      await fn(req, res);
    } catch (error) {
      logger.error(`${errorMsg}:`, error);
      res.status(500).json({ error: errorMsg });
    }
  };

// Validators
const createPracticumRules = [
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('description').isString().notEmpty().withMessage('Description is required'),
  body('requiredHours').isInt({ min: 0 }).withMessage('Valid required hours is required'),
];

const assignStudentRules = [
  body('userId').isInt().withMessage('Valid user ID is required'),
];

// Routes

// GET: All practicums
router.get(
  '/',
  allow,
  asyncRoute(
    'row 15, practicumroutes.ts, Get all practicums',
    'Failed to get practicums',
    async (_req, res) => {
      const practicums = await c.getAllPracticums();
      res.json(practicums);
    },
  ),
);

// POST: Create practicum
router.post(
  '/',
  allow,
  createPracticumRules,
  validate,
  asyncRoute(
    'row 61, practicumroutes.ts, Post practicum',
    'Failed to create practicum',
    async (req, res) => {
      const result = await c.createPracticum(req.body);
      res.status(201).json(result);
    },
  ),
);

// GET: Practicum details by ID
router.get(
  '/:practicumId',
  allow,
  asyncRoute(
    'row 74, practicumroutes.ts, Get practicum details',
    'Failed to get practicum details',
    async (req, res) => {
      const practicumId = Number(req.params.practicumId);
      const result = await c.getPracticumDetails(practicumId);
      res.json(result);
    },
  ),
);

// PUT: Update practicum by ID
router.put(
  '/:practicumId',
  allow,
  asyncRoute(
    'row 88, practicumroutes.ts, Update practicum by ID',
    'Failed to update practicum',
    async (req, res) => {
      const practicumId = Number(req.params.practicumId);
      const result = await c.updatePracticum(practicumId, req.body);
      res.json(result);
    },
  ),
);

// DELETE: Delete practicum by ID
router.delete(
  '/:practicumId',
  allow,
  asyncRoute(
    'row 102, practicumroutes.ts, Delete practicum by ID',
    'Failed to delete practicum',
    async (req, res) => {
      const practicumId = Number(req.params.practicumId);
      const result = await c.deletePracticum(practicumId);
      res.json({ success: true, message: 'Practicum deleted successfully', result });
    },
  ),
);

// GET: Practicums by instructor user ID
router.get(
  '/instructor/:userId',
  allow,
  asyncRoute(
    'row 116, practicumroutes.ts, Get practicums by instructor',
    'Failed to get practicums',
    async (req, res) => {
      const userId = Number(req.params.userId);
      const practicums = await c.getPracticumsByInstructor(userId);
      res.json(practicums);
    },
  ),
);

// POST: Assign student to practicum
router.post(
  '/:practicumId/assign-student',
  allow,
  assignStudentRules,
  validate,
  asyncRoute(
    'row 132, practicumroutes.ts, Assign student to practicum',
    'Failed to assign student',
    async (req, res) => {
      const practicumId = Number(req.params.practicumId);
      const userId = Number(req.body.userId);
      if (!practicumId || !userId) {
        res.status(400).json({ error: 'Invalid practicum or user ID' });
        return;
      }
      const result = await c.assignStudentToPracticum(practicumId, userId);
      res.json(result);
    },
  ),
);

// GET: Student practicum by email (no role check by design)
router.get(
  '/student/:email',
  asyncRoute(
    'row 153, practicumroutes.ts, Get student practicum by email',
    'Failed to get student practicum',
    async (req, res) => {
      const email = req.params.email;
      const result = await c.getPracticumByStudentEmail(email);
      res.json(result);
    },
  ),
);

export default router;
