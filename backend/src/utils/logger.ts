// Import the rotating-file-stream module
import {createStream} from 'rotating-file-stream';

// Import the pino logging library
import pino from 'pino';

// Create the rotating file streams
const stream = createStream('logfile.log', {
  interval: '14d',
  path: './logs',
});

const errorStream = createStream('error-logfile.log', {
  interval: '14d',
  path: './logs',
});

// Create multistream configuration for both console and file output
const streams = [
  // Console output stream with pretty printing for development
  {stream: process.stdout},
  // Regular log file stream
  {stream: stream},
];

const errorStreams = [
  // Console error output stream
  {stream: process.stderr},
  // Error log file stream
  {stream: errorStream},
];

// Create the logger with multistream support
// @ts-expect-error
const logger = pino(
  {
    level: 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.multistream(streams),
);

// Configure error logger
// @ts-expect-error
logger.error = pino(
  {
    level: 'error',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.multistream(errorStreams),
).error;

// Add error handling for streams
stream.on('error', (err) => {
  console.error('Error with log stream:', err);
});

errorStream.on('error', (err) => {
  console.error('Error with error log stream:', err);
});

// Export the logger so it can be used in other parts of our application.
export default logger;
