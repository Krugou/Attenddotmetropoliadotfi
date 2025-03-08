import createPool from './config/createPool.js';
import logger from './utils/logger.js';

/**
 * Custom error class for user deactivation related errors
 */
class DeactivationError extends Error {
  /**
   * @param {string} message - Error message
   * @param {unknown} cause - The original error that caused this error
   */
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'DeactivationError';
  }
}

/**
 * Custom error class for database connection issues
 */
class DatabaseConnectionError extends Error {
  /**
   * @param {string} message - Error message
   * @param {unknown} cause - The original error that caused this connection error
   */
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

/**
 * Database connection result type
 */
type ConnectionResult = {
  pool: any;
  testConnection: () => Promise<void>;
  cleanup: () => Promise<void>;
};

/**
 * User role type for database connections
 */
type UserRole = 'ADMIN' | 'TEACHER' | 'COUNSELOR' | 'STUDENT';

/**
 * Creates and tests a database connection with retry functionality
 *
 * @param userRole - The database userRole to use for connection
 * @param maxRetries - Maximum number of connection attempts
 * @param retryDelayMs - Delay between retry attempts in milliseconds
 * @returns A Promise resolving to connection result object
 * @throws DatabaseConnectionError if connection fails after all retries
 */
const createDatabaseConnection = async (
  userRole: UserRole = 'ADMIN',
  maxRetries: number = 3,
  retryDelayMs: number = 2000,
): Promise<ConnectionResult> => {
  const pool = createPool(userRole);

  // Pure function for delay
  const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Higher-order function for retry logic
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
          `${description} attempt ${attempt}/${retries} failed:`,
          error,
        );

        if (attempt < retries) {
          logger.info(`Retrying in ${delayMs / 1000} seconds...`);
          await delay(delayMs);
        }
      }
    }

    logger.error(`Failed ${description} after ${retries} attempts`);
    throw new DatabaseConnectionError(`Failed ${description}`, lastError);
  };

  // Test connection function
  const testConnection = async (): Promise<void> => {
    await withRetry(
      () => pool.promise().query('SELECT 1'),
      'Database connection',
      maxRetries,
      retryDelayMs,
    );
    logger.info('Database connection established successfully');
  };

  // Cleanup function
  const cleanup = async (): Promise<void> => {
    try {
      await pool.promise().end();
      logger.info('Database connection pool closed');
    } catch (error) {
      logger.error('Error while cleaning up database resources:', error);
    }
  };

  // Test the connection initially
  await testConnection();

  return {pool, testConnection, cleanup};
};

/**
 * Result type for deactivation operation
 */
type DeactivationResult = {
  deactivatedCount: number;
};

/**
 * Deactivates users that were created more than the specified years ago
 *
 * @param connection - Database connection object
 * @param yearsThreshold - The number of years threshold for deactivation
 * @returns Promise resolving to a DeactivationResult
 * @throws DeactivationError if the operation fails
 */
const deactivateOldUsers = async (
  connection: ConnectionResult,
  yearsThreshold: number = 4,
): Promise<DeactivationResult> => {
  // Input validation - pure function
  const validateInput = (years: number): void => {
    if (years <= 0) {
      throw new DeactivationError('Years threshold must be a positive number');
    }
  };

  // Database update - side effect
  const performDeactivation = async (years: number): Promise<number> => {
    const [result] = await connection.pool.promise().query(
      `UPDATE users
      SET activeStatus = 0
      WHERE
        created_at < DATE_SUB(NOW(), INTERVAL ? YEAR)
        AND activeStatus = 1`,
      [years],
    );

    // Properly type the MySQL result
    type MySQLUpdateResult = {
      affectedRows: number;
      insertId: number;
      changedRows: number;
    };

    return (result as MySQLUpdateResult).affectedRows;
  };

  // Log result - side effect
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
    // Function composition pattern
    validateInput(yearsThreshold);
    await connection.testConnection();
    const deactivatedCount = await performDeactivation(yearsThreshold);
    logResult(deactivatedCount, yearsThreshold);

    return {deactivatedCount};
  } catch (error) {
    logger.error('Error deactivating old users:', error);
    throw new DeactivationError('Failed to deactivate old users', error);
  }
};

/**
 * Main function to execute the deactivation process
 */
const main = async (): Promise<void> => {
  let connection: ConnectionResult | null = null;

  try {
    // Establish database connection
    connection = await createDatabaseConnection();

    logger.info('Starting weekly user deactivation process');
    const result = await deactivateOldUsers(connection);
    logger.info(
      `Weekly deactivation completed: ${result.deactivatedCount} users deactivated`,
    );
  } catch (error) {
    if (error instanceof DatabaseConnectionError) {
      logger.error('Database connection error in housekeeping script:', error);
      logger.error(
        'Please check database credentials and authentication plugins configuration',
      );
    } else {
      logger.error('Fatal error in housekeeping script:', error);
    }
    process.exitCode = 1;
  } finally {
    // Clean up resources
    if (connection) {
      await connection.cleanup();
    }

    // Allow time for logging to complete, then exit
    setTimeout(() => {
      process.exit(process.exitCode || 0);
    }, 1000);
  }
};

// Lazily evaluated singleton database connection for API use
let connectionPromise: Promise<ConnectionResult> | null = null;

/**
 * Gets the shared database connection, creating it if necessary
 * @returns Promise resolving to the database connection
 */
const getSharedConnection = (): Promise<ConnectionResult> => {
  if (!connectionPromise) {
    connectionPromise = createDatabaseConnection().catch((error) => {
      logger.error('Failed to initialize shared database connection:', error);
      connectionPromise = null; // Reset for future retry
      throw error;
    });
  }
  return connectionPromise;
};

/**
 * UserDeactivationService implementation for the API
 * Uses functional core with imperative shell pattern
 */
const userDeactivationService = {
  /**
   * Deactivates users that were created more than the specified years ago
   * @param yearsThreshold - The threshold in years for user deactivation
   * @returns Promise resolving to the deactivation results
   */
  deactivateOldUsers: async (
    yearsThreshold: number = 5,
  ): Promise<DeactivationResult> => {
    try {
      const connection = await getSharedConnection();
      return await deactivateOldUsers(connection, yearsThreshold);
    } catch (error) {
      logger.error('Error in userDeactivationService:', error);
      throw error;
    }
  },

  /**
   * Cleans up resources used by the service
   */
  cleanup: async (): Promise<void> => {
    if (connectionPromise) {
      try {
        const connection = await connectionPromise;
        await connection.cleanup();
        connectionPromise = null;
      } catch (error) {
        logger.error('Error cleaning up shared connection:', error);
      }
    }
  },
};

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
