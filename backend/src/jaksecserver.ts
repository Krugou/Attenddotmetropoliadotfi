'use strict';

import cors from 'cors';
import {config} from 'dotenv';
import {Request, Response} from 'express';
import {Server} from 'socket.io';
import adminRoutes from './routes/adminroutes.js';
import courseRoutes from './routes/courseroutes.js';
import secureRoutes from './routes/secureroutes.js';
import userRoutes from './routes/userroutes.js';
import SocketHandlers from './sockets/socketHandlers.js';
// import logger from './utils/logger.js';
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
 */
const app = express();

/**
 * HTTP server instance
 * @type {http.Server}
 */
const http = createServer(app);

/**
 * Socket.IO server instance
 * @type {socket.io.Server}
 */
const io = new Server(http, {
  cors: {
    origin: '*',
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
 * Use JSON middleware for Express to parse JSON bodies
 * This middleware enables Express to parse incoming JSON requests.
 */
app.use(express.json());

/**
 * Use CORS middleware to enable CORS
 * This middleware enables Cross-Origin Resource Sharing (CORS) for the Express application.
 */
app.use(cors());

/**
 * Initialize Passport middleware
 * This middleware initializes Passport for handling authentication in the Express application.
 */
app.use(passport.initialize());

/**
 * Use user routes for /users path
 * This sets up the routes related to user management under the /users path.
 */
app.use('/users', userRoutes);
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
 * Start the server
 * This section starts the HTTP server and listens on the specified port.
 */
http.listen(port, () => {
  // logger.info(
  // 	'Metropolia Attendance App REST + DATABASE SERVER Started at: http://localhost:' +
  // 		port +
  // 		'/ ' +
  // 		'start time: ' +
  // 		startTime.toLocaleString(),
  // );
  console.log(
    `JakSec REST + DATABASE SERVER started at: http://localhost:${port}/. Start time: ${startTime.toLocaleString()}`,
  );
});
