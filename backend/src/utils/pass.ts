'use strict';
import {config} from 'dotenv';
import {DoneFunction, DoneJwtFunction, JwtPayload, User} from '../types.js';
config();

// Import necessary modules and dependencies
import passport from 'passport';
import passportJWT from 'passport-jwt';
import {Strategy} from 'passport-local';
import UserModel from '../models/usermodel.js'; // Import the UserModel without '.js'
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

/**
 * Local strategy for email and password login.
 * @param {string} email - The email of the user.
 * @param {string} _password - The password of the user.
 * @param {DoneFunction} done - The callback to be executed after the function finishes.
 * @returns {void}
 */
passport.use(
  new Strategy(async (email: string, _password: string, done: DoneFunction) => {
    try {
      // Find a user in the database with the provided email
      const user: User | null = await UserModel.getAllUserInfo(email);
      // Check if the user exists
      if (user === null || user === undefined) {
        return done(null, false, {message: 'Incorrect username.'});
      }

      return done(null, user, {message: 'Logged In Successfully'});
    } catch (err) {
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
      secretOrKey: process.env.JWT_SECRET as string, // Assert process.env.JWT_SECRET as a string
    },
    (jwtPayload: JwtPayload, done: DoneJwtFunction) => {
      done(null, jwtPayload); // Pass the JWT payload as the authenticated user
    },
  ),
);

export default passport; // Export passport as the default export
