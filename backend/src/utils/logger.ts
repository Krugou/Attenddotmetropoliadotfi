import { createStream } from 'rotating-file-stream';
import pino from 'pino';
import { Request } from 'express';

//helpers

// Configuration interface for the logger
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

// Sanitizes an object by removing sensitive fields and limiting depth
function sanitizeObject(obj: any, depth = 0): any {
  console.log('Row 50, logger.ts - sanitizeObject() called');
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

// Configure multistream with level-based routing
const streams = [
  // Console streams
  { stream: process.stdout, level: 'info' },
  { stream: process.stderr, level: 'error' },

  // File streams
  { stream: infoStream, level: 'info' },
  { stream: errorStream, level: 'error' },
];

// Create the logger instance
// @ts-ignore - pino does not have types for multistream
const logger = pino(
  {
    level: 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => {
        return { level: label };
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
    base: null, // Remove pid and hostname from logs
  },
  pino.multistream(streams)
);

// ---- helpers for type-safe-ish runtime behavior ----

type LogMeta = Record<string, unknown>;

const isRecord = (v: unknown): v is LogMeta =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const toMeta = (v: unknown): LogMeta => {
  if (isRecord(v)) return v;
  if (v instanceof Error) return { err: v };
  if (v === undefined) return {};
  return { value: v };
};

const shouldSkipByEmail = (meta: unknown): boolean => {
  if (!isRecord(meta)) return false;

  const possible = meta.useremail ?? meta.userEmail ?? (meta as any).email;
  if (typeof possible === 'string' && loggerConfig.ignoreEmails.includes(possible)) {
    return true;
  }

  const req = (meta as any).req;
  const reqEmail = req?.user?.email;
  if (typeof reqEmail === 'string' && loggerConfig.ignoreEmails.includes(reqEmail)) {
    return true;
  }

  return false;
};

// Enhance logger with flexible methods that accept unknown safely
const enhancedLogger = {
  ...logger,

  // info supports:
  // - info('message')
  // - info('message', {meta})
  // - info({meta}, 'message')
  // - info({meta}, Error)
  // - info('message', Error)
  info: (a: unknown, b?: unknown, c?: unknown): void => {
    // Normalize to: meta + message + optional err
    let meta: LogMeta = {};
    let msg = '';
    let err: Error | undefined;

    if (typeof a === 'string') {
      msg = a;

      if (b instanceof Error) {
        err = b;
      } else if (isRecord(b)) {
        meta = b;
      } else if (b !== undefined) {
        meta = toMeta(b);
      }

      if (c instanceof Error) err = c;
    } else if (isRecord(a)) {
      meta = a;

      if (typeof b === 'string') {
        msg = b;
      } else if (b instanceof Error) {
        err = b;
      } else if (b !== undefined) {
        msg = String(b);
      }

      if (c instanceof Error) err = c;
    } else {
      // a is primitive/unknown
      msg = typeof a === 'string' ? a : String(a);
      if (b instanceof Error) err = b;
      if (isRecord(b)) meta = b;
      if (c instanceof Error) err = c;
    }

    if (shouldSkipByEmail(meta)) return;

    if (err) {
      logger.info({ ...meta, err }, msg);
    } else if (Object.keys(meta).length > 0) {
      logger.info({ ...meta }, msg || undefined);
    } else {
      logger.info(msg);
    }
  },

  // error supports:
  // - error(Error)
  // - error('message')
  // - error('message', err)
  // - error(err, 'message')
  // - error({meta}, 'message')
  // - error({meta}, 'message', err)
  error: (a: unknown, b?: unknown, c?: unknown): void => {
    let meta: LogMeta = {};
    let msg = '';
    let err: Error | undefined;

    if (a instanceof Error) {
      err = a;

      if (typeof b === 'string') msg = b;
      else if (isRecord(b)) meta = b;
      else if (b !== undefined) msg = String(b);
    } else if (typeof a === 'string') {
      msg = a;

      if (b instanceof Error) err = b;
      else if (isRecord(b)) meta = b;
      else if (b !== undefined) meta = toMeta(b);

      if (c instanceof Error) err = c;
    } else if (isRecord(a)) {
      meta = a;

      if (typeof b === 'string') msg = b;
      else if (b instanceof Error) err = b;
      else if (b !== undefined) msg = String(b);

      if (c instanceof Error) err = c;
    } else {
      // a is unknown primitive/object/number/status etc.
      meta = toMeta(a);
      if (typeof b === 'string') msg = b;
      if (b instanceof Error) err = b;
      if (c instanceof Error) err = c;
    }

    if (shouldSkipByEmail(meta)) return;

    if (!err && meta.err instanceof Error) {
      err = meta.err;
    }

    if (err) {
      logger.error({ ...meta, err }, msg || err.message);
    } else if (Object.keys(meta).length > 0) {
      logger.error({ ...meta }, msg || undefined);
    } else {
      logger.error(msg || 'Unknown error');
    }
  },
};

export default enhancedLogger;
