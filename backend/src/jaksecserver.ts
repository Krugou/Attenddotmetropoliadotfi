/**
 * @fileoverview Main server setup and configuration for the Metropolia Attendance Application.
 * This file handles Express setup, middleware configuration, route integration, and server initialization.
 *
 * @module JakSecServer
 * @requires express
 * @requires socket.io
 * @requires cors
 * @requires passport
 * @requires dotenv
 */

'use strict';

import cors from 'cors';
import {config} from 'dotenv';
import {Request, Response} from 'express';
import {Server} from 'socket.io';
import adminRoutes from './routes/adminroutes.js';
import courseRoutes from './routes/courseroutes.js';
import secureRoutes from './routes/secureroutes.js';
import userRoutes from './routes/userroutes.js';
import workLogRoutes from './routes/worklogroutes.js';
import practiumroutes from './routes/practicumroutes.js';
import activityRoutes from './routes/activityroutes.js';
import feedbackRoutes from './routes/feedbackroutes.js';
import microsoftAuthRoutes from './routes/microsoftAuthRoutes.js';
import SocketHandlers from './sockets/socketHandlers.js';
import logger from './utils/logger.js';
/**
 * Load environment variables from .env file
 */
config();

import express from 'express';
import {createServer} from 'http';
import passport from './utils/pass.js';

/**
 * Express application instance
 * @type {express.Express}
 * @description Core Express application instance that handles HTTP requests
 * @security All routes are protected with appropriate authentication and authorization
 */
const app = express();

/**
 * HTTP server instance wrapped around Express
 * @type {http.Server}
 * @description HTTP server that enables both REST API and WebSocket connections
 */
const http = createServer(app);

/**
 * Socket.IO server instance for real-time communication
 * @type {socket.io.Server}
 * @description WebSocket server that handles real-time events
 * @security CORS is enabled with appropriate origin restrictions
 */
const io = new Server(http, {
  cors: {
    origin: '*', // Consider restricting this in production
  },
});

/**
 * Setup socket handlers
 */
SocketHandlers(io);

/**
 * Port number for the server to listen on
 * @type {number}
 */
const port = 3002;

/**
 * Server start time
 * @type {Date}
 */
const startTime = new Date();
/**
 * Middleware Configuration
 * @description Sets up essential middleware for the application
 *
 * @middleware express.json() - Parses incoming JSON payloads
 * @middleware cors() - Handles Cross-Origin Resource Sharing
 * @middleware passport.initialize() - Initializes authentication
 *
 * @security Implements proper request parsing and security headers
 */
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

/**
 * Route Configuration
 * @description Configures all application routes with their respective middleware
 *
 * Base Routes:
 * - GET /metrostation/ - Health check endpoint
 *
 * Protected Routes (require JWT authentication):
 * - /users - User management endpoints
 * - /secure - Secured operations endpoints
 * - /courses - Course management endpoints
 * - /admin - Administrative operations endpoints
 * - /worklog - Work log management endpoints
 * - /feedback - User feedback endpoints
 *
 * @security All protected routes require valid JWT token
 * @example
 * // Example of accessing a protected route
 * fetch('/courses', {
 *   headers: {
 *     'Authorization': 'Bearer <jwt_token>'
 *   }
 * });
 */

/**
 * Use user routes for /users path
 * This sets up the routes related to user management under the /users path.
 */
app.use('/users', userRoutes);

/**
 * Use Microsoft authentication routes for /auth/microsoft path
 * This sets up the routes related to Microsoft Entra ID authentication under the /auth/microsoft path.
 */
app.use('/auth/microsoft', microsoftAuthRoutes);

/**
 * Simple GET route for debugging
 */

app.get('/metrostation/', (_req: Request, res: Response) => {
  res.json({
    message: 'API is working',
    builddate: process.env.VITE_REACT_APP_BUILD_DATE,
  });
});
/**
 * Use secure routes for /secure path with JWT authentication
 * This sets up secure routes that require JWT authentication under the /secure path.
 */
app.use(
  '/secure',
  passport.authenticate('jwt', {session: false}),
  secureRoutes,
);

/**
 * Use course routes for /courses path with JWT authentication
 * This sets up routes related to courses that require JWT authentication under the /courses path.
 */
app.use(
  '/courses',
  passport.authenticate('jwt', {session: false}),
  courseRoutes,
);

/**
 * Use admin routes for /admin path with JWT authentication
 * This sets up admin-specific routes that require JWT authentication under the /admin path.
 */
app.use('/admin', passport.authenticate('jwt', {session: false}), adminRoutes);

/**
 * Use worklog routes for /worklog path with JWT authentication
 * This sets up routes related to worklog that require JWT authentication
 */
app.use(
  '/worklog',
  passport.authenticate('jwt', {session: false}),
  workLogRoutes,
);

app.use(
  '/practicum',
  passport.authenticate('jwt', {session: false}),
  practiumroutes,
);

app.use(
  '/activity',
  passport.authenticate('jwt', {session: false}),
  activityRoutes,
);

/**
 * Use feedback routes for /feedback path with JWT authentication
 * This sets up routes related to user feedback that require JWT authentication
 */
app.use(
  '/feedback',
  passport.authenticate('jwt', {session: false}),
  feedbackRoutes,
);

/**
 * Server Initialization
 * @description Starts the HTTP server on the specified port
 *
 * @param {number} port - The port number to listen on
 * @param {Function} callback - Called when server starts successfully
 *
 * @fires Server#start
 * @listens {port}
 *
 * @example
 * // Server startup log
 * "Metropolia Attendance App REST + DATABASE SERVER Started at: http://localhost:3002/"
 */
http.listen(port, () => {
  logger.info(
    `Metropolia Attendance App REST + DATABASE SERVER Started at: http://localhost:${port}/ start time: ${startTime.toLocaleString()}`,
  );
});
