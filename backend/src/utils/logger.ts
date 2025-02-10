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
    formatters: {
      level: (label) => {
        return {level: label};
      },
      bindings: () => {
        return {};
      },
      log: (object) => {
        // Ensure all fields are included in the output
        return {
          ...object,
          // If msg is an Error object, serialize it
          msg:
            object.msg instanceof Error
              ? pino.stdSerializers.err(object.msg)
              : object.msg,
        };
      },
    },
    serializers: {
      // Ensure all error objects are properly serialized
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
      // Custom serializer for request objects
      req: (req) => ({
        method: req?.method,
        url: req?.url,
        path: req?.path,
      }),
    },
    messageKey: 'msg',
    base: null, // Remove pid and hostname from logs
  },
  pino.multistream(streams),
);

export default logger;
