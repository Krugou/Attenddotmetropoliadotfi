'use strict';
import {config} from 'dotenv';
import {DoneFunction, DoneJwtFunction, JwtPayload, User} from '../types.js';
config();

// Import necessary modules and dependencies
import passport from 'passport';
import passportJWT from 'passport-jwt';
import {Strategy} from 'passport-local';
import UserModel from '../models/usermodel.js';
import logger from '../utils/logger.js';
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

/**
 * Local strategy for authentication.
 * This strategy will work with both Metropolia and Microsoft authentications
 * by looking up the user in our database using the email.
 *
 * @param {string} email - The email of the user.
 * @param {string} _password - The password of the user (not used in our validation).
 * @param {DoneFunction} done - The callback to be executed after the function finishes.
 * @returns {void}
 */
passport.use(
  new Strategy(async (email: string, _password: string, done: DoneFunction) => {
    try {
      logger.info(`Passport authenticating user with email: ${email}`);

      // Find a user in the database with the provided email
      const user: User | null = await UserModel.getAllUserInfo(email);

      // Check if the user exists
      if (user === null || user === undefined) {
        logger.warn(`Authentication failed: User not found for email ${email}`);
        return done(null, false, {message: 'Incorrect username.'});
      }

      logger.info(
        `Authentication successful for user: ${user.username || email}`,
      );
      return done(null, user, {message: 'Logged In Successfully'});
    } catch (err) {
      logger.error('Authentication error:', err);
      return done(err instanceof Error ? err : new Error(String(err)));
    }
  }),
);

/**
 * JWT strategy for handling JSON Web Tokens.
 * @param {JwtPayload} jwtPayload - The payload of the JWT.
 * @param {DoneJwtFunction} done - The callback to be executed after the function finishes.
 * @returns {void}
 */
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET as string,
    },
    (jwtPayload: JwtPayload, done: DoneJwtFunction) => {
      // Additional validation could be added here if needed
      done(null, jwtPayload);
    },
  ),
);

export default passport;
