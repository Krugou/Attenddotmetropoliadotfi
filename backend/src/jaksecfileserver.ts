/**
 * @fileoverview Static file server for the Metropolia Attendance Application.
 * Serves static files and handles single-page application routing.
 *
 * @module JakSecFileServer
 * @requires express
 * @requires http
 * @requires path
 *
 * @security This server only serves static files from the 'jaksec' directory
 * @performance Uses Express static file serving with proper caching headers
 */

import express, {Request, Response} from 'express';
import {Server, createServer} from 'http';
import logger from './utils/logger.js';

/**
 * Express application instance for static file serving
 * @type {express.Express}
 * @description Handles static file serving and SPA routing
 * @security All routes are public but limited to static files
 */
const app = express();

/**
 * HTTP server instance for the file server
 * @type {http.Server}
 * @description Dedicated HTTP server for static file serving
 * @security Runs on a separate port from the main application
 */
const http: Server = createServer(app);

/**
 * Port configuration for the file server
 * @type {number}
 * @description Dedicated port for static file serving
 * @default 3001
 */
const port: number = 3001;

/**
 * Server initialization timestamp
 * @type {Date}
 * @description Records when the file server started
 * @readonly
 */
const startTime: Date = new Date();

/**
 * Static File Serving Configuration
 * @description Configures Express to serve static files from 'jaksec' directory
 *
 * @middleware express.static() - Serves files from 'jaksec' directory
 * @security Files are served from a dedicated directory only
 * @performance Includes proper caching headers
 *
 * @example
 * // Accessing static files
 * GET http://localhost:3001/images/logo.png
 * GET http://localhost:3001/css/styles.css
 */
app.use(express.static('jaksec'));

/**
 * SPA Fallback Route
 * @description Handles all unmatched routes for single-page application
 *
 * @param {express.Request} _req - The request object (unused)
 * @param {express.Response} res - The response object
 * @returns {void} Sends the index.html file
 *
 * @security Only serves index.html from jaksec directory
 * @example
 * // Any unmatched route returns index.html
 * GET http://localhost:3001/any/path -> returns /jaksec/index.html
 */
app.get('*', (_req: Request, res: Response) => {
  try {
    res.sendFile('index.html', {root: 'jaksec'});
  } catch (error) {
    logger.error('Error serving index.html:', error);
    res.status(500).json('Error serving application');
  }
});

/**
 * Server Initialization
 * @description Starts the static file server
 *
 * @listens {port} Port 3001 for incoming connections
 * @fires Server#start When server successfully starts
 *
 * @example
 * // Server startup log
 * "JakSec FILE SERVER started at: http://localhost:3001/"
 */
http.listen(port, () => {
  logger.info(
    `JakSec FILE SERVER started at: http://localhost:${port}/. Start time: ${startTime.toLocaleString()}`,
  );
});

// Error handling for server
http.on('error', (error) => {
  logger.error('File server error:', error);
});

export default app;
