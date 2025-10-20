import {createStream} from 'rotating-file-stream';
import pino from 'pino';
import {Request} from 'express';

/**
 * Configuration interface for the logger
 */
interface LoggerConfig {
  ignoreEmails: string[];
  sensitiveFields: string[];
  maxObjectDepth: number;
}

// Logger configuration
const loggerConfig: LoggerConfig = {
  ignoreEmails: ['admin@metropolia.fi'],
  sensitiveFields: ['password', 'token', 'apiKey', 'secret'],
  maxObjectDepth: 5,
};

// Create the rotating file streams
const infoStream = createStream('logfile.log', {
  interval: '14d',
  path: './logs',
  size: '10M', // Limit file size to 10MB
});

const errorStream = createStream('error-logfile.log', {
  interval: '14d',
  path: './logs',
  size: '10M', // Limit file size to 10MB
});

// Error handling for streams
infoStream.on('error', (err) => {
  console.error('Error with info log stream:', err);
});

errorStream.on('error', (err) => {
  console.error('Error with error log stream:', err);
});

/**
 * Sanitizes an object by removing sensitive fields and limiting depth
 * @param obj The object to sanitize
 * @param depth Current recursion depth
 * @returns Sanitized object
 */
function sanitizeObject(obj: any, depth = 0): any {
  console.log("Row 50, logger.ts - sanitizeObject() called");
  if (depth > loggerConfig.maxObjectDepth) {
    return '[Max Depth Reached]';
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1));
  }

  // Handle objects
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip sensitive fields
    if (loggerConfig.sensitiveFields.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    sanitized[key] = sanitizeObject(value, depth + 1);
  }
  return sanitized;
}

/**
 * Custom filter function to prevent logging for specified admin emails
 */
const logFilter = (level: number, logProps: any): boolean => {
  console.log("Row 86, logger.ts - logFilter() called");
  // Skip logging if the object contains an ignored email
  if (
    logProps.useremail &&
    loggerConfig.ignoreEmails.includes(logProps.useremail)
  ) {
    return false;
  }

  // Skip if req.user contains an ignored email
  if (
    logProps.req?.user?.email &&
    loggerConfig.ignoreEmails.includes(logProps.req.user.email)
  ) {
    return false;
  }

  return true;
};

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
        // Sanitize all objects to remove sensitive data
        const sanitized = sanitizeObject(object);

        // Ensure all fields are included in the output
        return {
          ...sanitized,
          // If msg is an Error object, serialize it
          msg:
            sanitized.msg instanceof Error
              ? pino.stdSerializers.err(sanitized.msg)
              : sanitized.msg,
        };
      },
    },
    serializers: {
      // Ensure all error objects are properly serialized
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
      // Custom serializer for request objects
      req: (req: Request | any) => ({
        method: req?.method,
        url: req?.url,
        path: req?.path,
        userEmail: req?.user?.email
          ? loggerConfig.ignoreEmails.includes(req.user.email)
            ? '[FILTERED]'
            : req.user.email
          : undefined,
      }),
    },
    messageKey: 'msg',
    base: null, // Remove pid and hostname from logs,

    // Apply log filtering
    customLevels: {
      filter: logFilter,
    },
  },
  pino.multistream(streams),
);

// Enhance logger with custom methods for better type safety
const enhancedLogger = {
  ...logger,

  /**
   * Log info level message with context and optional error
   * @param context Context object or message
   * @param message Message string
   * @param error Optional error object
   */
  info: (
    context: object | string,
    message?: string | Error,
    error?: Error,
  ): void => {
    // Skip logging if context contains ignored email
    if (
      typeof context === 'object' &&
      'useremail' in context &&
      typeof context.useremail === 'string' &&
      loggerConfig.ignoreEmails.includes(context.useremail)
    ) {
      return;
    }

    if (typeof context === 'object') {
      if (message instanceof Error) {
        logger.info({...context, err: message});
      } else if (typeof message === 'string') {
        logger.info({...context}, message);
      } else {
        logger.info(context);
      }
    } else if (message instanceof Error) {
      logger.info({err: message}, context);
    } else if (error) {
      logger.info({err: error}, context + (message ? ` ${message}` : ''));
    } else {
      logger.info(context + (message ? ` ${message}` : ''));
    }
  },

  /**
   * Log error level message with context and optional error
   * @param error Error object or message
   * @param context Optional context object or message
   */
  error: (error: Error | string | object, context?: object | string): void => {
    // Handle different input types
    if (error instanceof Error) {
      if (typeof context === 'object') {
        logger.error({...context, err: error}, error.message);
      } else if (typeof context === 'string') {
        logger.error({err: error}, context);
      } else {
        logger.error({err: error});
      }
    } else if (typeof error === 'object') {
      logger.error(error, context as string);
    } else {
      logger.error(context ? {context} : {}, error);
    }
  },
};

export default enhancedLogger;
