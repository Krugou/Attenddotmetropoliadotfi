import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import usermodel from '../models/usermodel.js';
import {User} from '../types.js';
import logger from './logger.js';

/**
 * Authenticates a user and generates a JWT token for them.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {(err?: Error | null) => void} next - The next middleware function.
 * @param {string} newUsername - The new username for the user.
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: (err?: Error | null) => void,
  newUsername: string,
) => {
  passport.authenticate('local', {session: false}, (err: Error, user: User) => {
    console.log("Row 23, auth.ts - authenticate() called");
    if (err || !user) {
      logger.info('User is not assigned to any courses');
      logger.error('User not found in database', {error: err});
      return res.status(403).json({
        message:
          'You are currently not assigned to any courses. Please contact your teacher to be assigned to a course.',
      });
    }
    req.login(user, {session: false}, async (err) => {
      console.log("Row 33, auth.ts, login() called");
      if (err) {
        logger.info('User is not assigned to any courses', {email: user.email});
        logger.error('User found in database but login failed', {error: err});
        return res.status(403).json({
          message:
            'You are registered in the system but not assigned to any courses. Please contact your teacher to be assigned to a course.',
        });
      }
      if (user && !user.username) {
        try {
          console.log("Row 44, auth.ts, if (user && !user.username)");
          logger.info(
            'New login detected for user without username, updating',
            {
              newUsername,
              email: user.email,
            },
          );
          await usermodel.updateUsernameByEmail(user.email, newUsername);
        } catch (error) {
          logger.error('Failed to update username', {error});
        }
        user.username = newUsername;
      }
      const token = jwt.sign(user as User, process.env.JWT_SECRET as string, {
        expiresIn: '2h',
      });
      console.log("Row 61, auth.ts, token created");
      res.json({user, token});
    });
  })(req, res, next);
};
