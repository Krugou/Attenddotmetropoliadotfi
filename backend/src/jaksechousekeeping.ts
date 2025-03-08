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
 * UserDeactivationService handles the automatic deactivation of users
 * who were created more than 5 years ago.
 *
 * This improves data management and compliance with data retention policies.
 * The script is designed to be run weekly via PM2's cron scheduler.
 */
class UserDeactivationService {
  private pool;

  /**
   * Initialize the user deactivation service
   */
  constructor() {
    this.pool = createPool('ADMIN');
  }

  /**
   * Deactivates users that were created more than 5 years ago
   * by setting their activeStatus to 0
   *
   * @param {number} [yearsThreshold=5] - The number of years threshold for deactivation (default: 5)
   * @returns {Promise<{deactivatedCount: number}>} The count of deactivated users
   * @throws {DeactivationError} If there's an issue with the deactivation process
   */
  async deactivateOldUsers(
    yearsThreshold: number = 5,
  ): Promise<{deactivatedCount: number}> {
    try {
      // Validate input
      if (yearsThreshold <= 0) {
        throw new DeactivationError(
          'Years threshold must be a positive number',
        );
      }

      // Find and update users created more than the specified years ago
      const [result] = await this.pool.promise().query(
        `UPDATE users
        SET activeStatus = 0
        WHERE
          created_at < DATE_SUB(NOW(), INTERVAL ? YEAR)
          AND activeStatus = 1`,
        [yearsThreshold],
      );

      // Properly type the MySQL result
      type MySQLUpdateResult = {
        affectedRows: number;
        insertId: number;
        changedRows: number;
      };

      const deactivatedCount = (result as MySQLUpdateResult).affectedRows;

      if (deactivatedCount > 0) {
        logger.info(
          `Deactivated ${deactivatedCount} users who were created more than ${yearsThreshold} years ago`,
        );
      } else {
        logger.info(
          `No users needed deactivation (threshold: ${yearsThreshold} years)`,
        );
      }

      return {deactivatedCount};
    } catch (error) {
      logger.error('Error deactivating old users:', error);
      throw new DeactivationError('Failed to deactivate old users', error);
    }
  }
}

/**
 * Main function to execute the deactivation process
 */
async function main() {
  try {
    const userDeactivationService = new UserDeactivationService();
    logger.info('Starting weekly user deactivation process');

    const result = await userDeactivationService.deactivateOldUsers();

    logger.info(
      `Weekly deactivation completed: ${result.deactivatedCount} users deactivated`,
    );

    // Allow time for logging to complete, then exit
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } catch (error) {
    logger.error('Fatal error in housekeeping script:', error);
    process.exit(1);
  }
}

// Create a singleton instance for use in the API
const userDeactivationService = new UserDeactivationService();

// Run the main function when this script is executed directly
// Using ES modules compatible approach
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  main();
}

export default {
  UserDeactivationService,
  userDeactivationService, // Export the singleton instance
};
