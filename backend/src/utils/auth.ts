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
    if (err || !user) {
      logger.info('User is not assigned to any courses');
      logger.error('User not found in database', {error: err});
      return res.status(403).send({
        message:
          'You are currently not assigned to any courses. Please contact your teacher to be assigned to a course.',
      });
    }
    req.login(user, {session: false}, async (err) => {
      if (err) {
        logger.info('User is not assigned to any courses', {email: user.email});
        logger.error('User found in database but login failed', {error: err});
        return res.status(403).send({
          message:
            'You are registered in the system but not assigned to any courses. Please contact your teacher to be assigned to a course.',
        });
      }
      if (user && !user.username) {
        try {
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
      res.send({user, token});
    });
  })(req, res, next);
};
