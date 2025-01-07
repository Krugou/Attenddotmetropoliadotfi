// Import the rotating-file-stream module
import {createStream} from 'rotating-file-stream';

// Import the pino logging library
import pino from 'pino';

/**
 * The stream used for logging.
 *
 * This creates a rotating file stream that writes to a new file every 14 days.
 * The files are written in the './logs' directory and are named 'logfile.log'.
 */

// Stream for regular logs
const stream = createStream('logfile.log', {
  interval: '14d',
  path: './logs',
});

// Stream for error logs
const errorStream = createStream('error-logfile.log', {
  interval: '14d',
  path: './logs',
});

// Create a new pino logger that writes logs to our rotating file stream.
// The logger is configured to log messages with a level of 'info' and above.
// @ts-expect-error
const logger = pino({level: 'info'}, stream);

// Create a new pino logger that writes logs to our rotating file stream.
// The logger is configured to log messages with a level of 'error' and above.
// @ts-expect-error
logger.error = pino({level: 'error'}, errorStream).error;

// Add error handling for stream creation
stream.on('error', (err) => {
  console.error('Error with log stream:', err);
});

errorStream.on('error', (err) => {
  console.error('Error with error log stream:', err);
});

// Export the logger so it can be used in other parts of our application.
export default logger;
