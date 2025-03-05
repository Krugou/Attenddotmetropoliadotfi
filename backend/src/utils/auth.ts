import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import usermodel from '../models/usermodel.js';
import {User} from '../types.js';
import logger from './logger.js';

/**
 * Authenticates a user and generates a JWT token for them.
 * Handles both Metropolia and Microsoft authentication methods.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {(err?: Error | null) => void} next - The next middleware function.
 * @param {string} newUsername - The new username for the user.
 * @param {string} [loginType='metropolia'] - The type of login ('microsoft' or 'metropolia')
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: (err?: Error | null) => void,
  newUsername: string,
  loginType: string = 'metropolia',
) => {
  // Ensure the username is correctly set in the request body for passport validation
  req.body.username = newUsername;

  passport.authenticate('local', {session: false}, (err: Error, user: User) => {
    if (err || !user) {
      logger.info(`User is not assigned to any courses (${loginType} login)`);
      logger.error('User not found in database', {error: err, loginType});
      return res.status(403).json({
        message:
          'You are currently not assigned to any courses. Please contact your teacher to be assigned to a course.',
      });
    }

    req.login(user, {session: false}, async (err) => {
      if (err) {
        logger.info(
          `User is not assigned to any courses (${loginType} login)`,
          {email: user.email},
        );
        logger.error('User found in database but login failed', {
          error: err,
          loginType,
        });
        return res.status(403).json({
          message:
            'You are registered in the system but not assigned to any courses. Please contact your teacher to be assigned to a course.',
        });
      }

      if (user && !user.username) {
        try {
          logger.info(
            `New ${loginType} login detected for user without username, updating`,
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

      res.json({user, token});
    });
  })(req, res, next);
};
