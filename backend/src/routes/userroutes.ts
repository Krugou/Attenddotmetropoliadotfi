import express, { Request, Response, Router, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import usermodel from '../models/usermodel.js';
import { ResponseData, User, UserData } from '../types.js';
import { authenticate } from '../utils/auth.js';
import doFetch from '../utils/doFetch.js';
import logger from '../utils/logger.js';
import rateLimit from 'express-rate-limit';

const loginUrl = 'https://streams.metropolia.fi/2.0/api/';
const router: Router = express.Router();

// Rate limiter for login requests
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again after 5 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Dev users for local development/testing
const devUsers = [
  {
    username: process.env.devaccount,
    password: process.env.devpass,
    staff: true, firstname: 'Gustav', lastname: 'Admin', email: 'admin@metropolia.fi'
  },
  {
    username: process.env.devteacheraccount,
    password: process.env.devteacherpass,
    staff: true, firstname: 'Willie', lastname: 'Teacher', email: 'teacher@metropolia.fi'
  },
  {
    username: process.env.devteacher2account,
    password: process.env.devteacher2pass,
    staff: true, firstname: 'Mark', lastname: 'Teacher2', email: 'teacher2@metropolia.fi'
  },
  {
    username: process.env.devstudentaccount,
    password: process.env.devstudentpass,
    staff: false, firstname: 'Sam', lastname: 'Student', email: 'student@metropolia.fi'
  },
  {
    username: process.env.devstudent2account,
    password: process.env.devstudent2pass,
    staff: false, firstname: 'Laurel', lastname: 'Student2', email: 'student2@metropolia.fi'
  },
  {
    username: process.env.devcounseloraccount,
    password: process.env.devcounselorpass,
    staff: true, firstname: 'Cass', lastname: 'Counselor', email: 'counselor@metropolia.fi'
  }
];

// Helper: get dev user data for login
const getDevUser = (username: string, password: string): ResponseData | null => {
  console.log("row 58, userroutes.ts, getDevUser, getting dev user data");
  for (const dev of devUsers) {
    if (username === dev.username && password === dev.password) {
      return {
        staff: dev.staff,
        user: dev.username!,
        firstname: dev.firstname,
        lastname: dev.lastname,
        email: dev.email,
      };
    }
  }
  return null;
};

// POST: User login (Metropolia API or dev user)
router.post('/', loginLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log("row 75, userroutes.ts, Post user login");
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');

    const { username, password } = req.body;
    let metropoliaData: ResponseData | null = getDevUser(username, password);

    // If not a dev user, try Metropolia API
    if (!metropoliaData) {
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      };
      metropoliaData = await doFetch(loginUrl, options);
    }

    // Invalid login
    if (!metropoliaData || metropoliaData.message === 'invalid username or password') {
      res.status(403).json({ message: 'Invalid username or password' });
      return;
    }

    req.body.username = metropoliaData.email;

    // Staff handling
    if (metropoliaData.staff) {
      const userFromDB = await usermodel.getAllUserInfo(metropoliaData.email);

      // Role mapping: 4 = admin, 2 = counselor, 3 = teacher
      let roleid = 3;
      if (metropoliaData.user === process.env.devaccount) roleid = 4;
      if (metropoliaData.user === process.env.devcounseloraccount) roleid = 2;

      const userData: UserData = {
        username: metropoliaData.user,
        staff: 1,
        first_name: metropoliaData.firstname,
        last_name: metropoliaData.lastname,
        email: metropoliaData.email,
        roleid: roleid,
      };

      if (!userFromDB) {
        // @ts-expect-error (type mismatch from model)
        const addStaffUserResponse = await usermodel.addStaffUser(userData);
        if (!addStaffUserResponse) {
          logger.error('Failed to add staff user to the database.');
          res.status(500).json({ error: 'Failed to add staff user' });
          return;
        }
        const token = jwt.sign(addStaffUserResponse as User, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ user: addStaffUserResponse, token });
        return;
      }

      if (username !== 'admin') {
        logger.info(`Staff Metropolia API login was successful for user: ${username}`);
      }
      authenticate(req, res, next, username);

    } else {
      // Non-staff user login
      logger.info(`Non-staff Metropolia API login was successful for user: ${username}`);
      authenticate(req, res, next, username);
    }

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
