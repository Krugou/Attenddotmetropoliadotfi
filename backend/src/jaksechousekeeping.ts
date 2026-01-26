import createPool from './config/createPool.js';
import logger from './utils/logger.js';

// Custom error used when user deactivation fails
class DeactivationError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'DeactivationError';
  }
}

// Custom error used when database connection or retries fail
class DatabaseConnectionError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

// Represents an active database connection with lifecycle helpers
type ConnectionResult = {
  pool: any;
  testConnection: () => Promise<void>;
  cleanup: () => Promise<void>;
};

// Supported database user roles
type UserRole = 'ADMIN' | 'TEACHER' | 'COUNSELOR' | 'STUDENT';

// Converts unknown errors into readable log output
const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    const stack = error.stack ? `\n${error.stack}` : '';
    return `${error.name}: ${error.message}${stack}`;
  }
  return String(error);
};

// Creates a database connection pool with retry logic and health checks
const createDatabaseConnection = async (
  userRole: UserRole = 'ADMIN',
  maxRetries: number = 3,
  retryDelayMs: number = 2000,
): Promise<ConnectionResult> => {
  const pool = createPool(userRole);

  // Simple async delay helper
  const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Generic retry wrapper for database operations
  const withRetry = async <T>(
    operation: () => Promise<T>,
    description: string,
    retries: number,
    delayMs: number,
  ): Promise<T> => {
    let lastError: unknown;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        logger.warn(
          `${description} attempt ${attempt}/${retries} failed: ${formatError(error)}`,
        );

        if (attempt < retries) {
          logger.info(`Retrying in ${delayMs / 1000} seconds...`);
          await delay(delayMs);
        }
      }
    }

    // All retries failed
    logger.error(`Failed ${description} after ${retries} attempts`);
    throw new DatabaseConnectionError(`Failed ${description}`, lastError);
  };

  // Verifies that the database connection is usable
  const testConnection = async (): Promise<void> => {
    await withRetry(
      () => pool.promise().query('SELECT 1'),
      'Database connection',
      maxRetries,
      retryDelayMs,
    );
    logger.info('Database connection established successfully');
  };

  // Closes the database connection pool
  const cleanup = async (): Promise<void> => {
    try {
      await pool.promise().end();
      logger.info('Database connection pool closed');
    } catch (error) {
      logger.error(
        `Error while cleaning up database resources: ${formatError(error)}`,
      );
    }
  };

  // Test connection immediately after creation
  await testConnection();

  return { pool, testConnection, cleanup };
};

// Result object returned after user deactivation
type DeactivationResult = {
  deactivatedCount: number;
};

// Deactivates users whose accounts are older than the given year threshold
const deactivateOldUsers = async (
  connection: ConnectionResult,
  yearsThreshold: number = 4,
): Promise<DeactivationResult> => {
  // Ensures input is valid before running database updates
  const validateInput = (years: number): void => {
    if (years <= 0) {
      throw new DeactivationError('Years threshold must be a positive number');
    }
  };

  // Executes the UPDATE query and returns number of affected rows
  const performDeactivation = async (years: number): Promise<number> => {
    const [result] = await connection.pool.promise().query(
      `UPDATE users
       SET activeStatus = 0
       WHERE
         created_at < DATE_SUB(NOW(), INTERVAL ? YEAR)
         AND activeStatus = 1`,
      [years],
    );

    type MySQLUpdateResult = {
      affectedRows: number;
      insertId: number;
      changedRows: number;
    };

    return (result as MySQLUpdateResult).affectedRows;
  };

  // Logs a summary of the deactivation result
  const logResult = (count: number, years: number): void => {
    if (count > 0) {
      logger.info(
        `Deactivated ${count} users who were created more than ${years} years ago`,
      );
    } else {
      logger.info(`No users needed deactivation (threshold: ${years} years)`);
    }
  };

  try {
    validateInput(yearsThreshold);
    await connection.testConnection();

    const deactivatedCount = await performDeactivation(yearsThreshold);
    logResult(deactivatedCount, yearsThreshold);

    return { deactivatedCount };
  } catch (error) {
    logger.error(`Error deactivating old users: ${formatError(error)}`);
    throw new DeactivationError('Failed to deactivate old users', error);
  }
};

// Main entry point for scheduled / standalone execution
const main = async (): Promise<void> => {
  let connection: ConnectionResult | null = null;

  try {
    connection = await createDatabaseConnection();

    logger.info('Starting weekly user deactivation process');
    const result = await deactivateOldUsers(connection);

    logger.info(
      `Weekly deactivation completed: ${result.deactivatedCount} users deactivated`,
    );
  } catch (error) {
    if (error instanceof DatabaseConnectionError) {
      logger.error(
        `Database connection error in housekeeping script: ${formatError(error)}`,
      );
      logger.error(
        'Please check database credentials and authentication plugins configuration',
      );
    } else {
      logger.error(`Fatal error in housekeeping script: ${formatError(error)}`);
    }
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.cleanup();
    }

    // Small delay to ensure logs are flushed before exit
    setTimeout(() => {
      process.exit(process.exitCode || 0);
    }, 1000);
  }
};

// Shared singleton database connection for service usage
let connectionPromise: Promise<ConnectionResult> | null = null;

// Lazily initializes and reuses a single database connection
const getSharedConnection = (): Promise<ConnectionResult> => {
  if (!connectionPromise) {
    connectionPromise = createDatabaseConnection().catch((error) => {
      logger.error(
        `Failed to initialize shared database connection: ${formatError(error)}`,
      );
      connectionPromise = null;
      throw error;
    });
  }
  return connectionPromise;
};

// Service wrapper intended for programmatic usage
const userDeactivationService = {
  // Public API for triggering user deactivation
  deactivateOldUsers: async (
    yearsThreshold: number = 5,
  ): Promise<DeactivationResult> => {
    try {
      const connection = await getSharedConnection();
      return await deactivateOldUsers(connection, yearsThreshold);
    } catch (error) {
      logger.error(`Error in userDeactivationService: ${formatError(error)}`);
      throw error;
    }
  },

  // Cleans up shared resources when the service is shut down
  cleanup: async (): Promise<void> => {
    if (connectionPromise) {
      try {
        const connection = await connectionPromise;
        await connection.cleanup();
        connectionPromise = null;
      } catch (error) {
        logger.error(
          `Error cleaning up shared connection: ${formatError(error)}`,
        );
      }
    }
  },
};

// Execute script when run directly
main();

export {
  deactivateOldUsers,
  createDatabaseConnection,
  DeactivationError,
  DatabaseConnectionError,
};

export default {
  userDeactivationService,
};
