import {createStream} from 'rotating-file-stream';
import pino from 'pino';

// Create the rotating file streams
const infoStream = createStream('logfile.log', {
  interval: '14d',
  path: './logs',
});

const errorStream = createStream('error-logfile.log', {
  interval: '14d',
  path: './logs',
});

// Error handling for streams
infoStream.on('error', (err) => {
  console.error('Error with info log stream:', err);
});

errorStream.on('error', (err) => {
  console.error('Error with error log stream:', err);
});

// Configure multistream with level-based routing
const streams = [
  // Console streams
  {stream: process.stdout, level: 'info'},
  {stream: process.stderr, level: 'error'},

  // File streams
  {stream: infoStream, level: 'info'},
  {stream: errorStream, level: 'error'},
];

// Create the logger instance
//@ts-ignore - pino does not have types for multistream
const logger = pino(
  {
    level: 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.multistream(streams),
);

export default logger;
