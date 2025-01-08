/**
 * Database backup utility script
 * This module provides functionality to create MySQL database backups,
 * manage backup retention, and handle cleanup of old backups.
 */

// Import required Node.js modules
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import util from 'util';

// Convert callback-based exec to promise-based for better async handling
const execPromise = util.promisify(exec);

/**
 * Custom error class for backup-specific errors
 * Helps in distinguishing backup errors from other types of errors
 */
class BackupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupError';
  }
}

/**
 * Database configuration interface
 * Defines the structure for database connection settings
 */
interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

/**
 * Backup configuration interface
 * Defines settings for backup storage and retention
 */
interface BackupConfig {
  backupDir: string;    // Directory where backups will be stored
  retentionDays: number; // Number of days to keep backups
}

/**
 * Database configuration object
 * Uses environment variables with fallback values for development
 */
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'jaksec',
  port: parseInt(process.env.DB_PORT || '3306'),
};

/**
 * Backup configuration object
 * Defines backup storage location and retention period
 */
const backupConfig: BackupConfig = {
  backupDir: path.join(__dirname, '../backups'),
  retentionDays: 7,
};

/**
 * Generates a unique backup filename using current timestamp
 * Format: backup_[database]_YYYY-MM-DD_HH-mm-ss.sql
 * @returns {string} Formatted backup filename
 */
const getBackupFileName = (): string => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .split('.')[0];
  return `backup_${dbConfig.database}_${timestamp}.sql`;
};

/**
 * Ensures the backup directory exists
 * Creates the directory if it doesn't exist
 * @throws {Error} If directory creation fails
 */
const ensureBackupDir = async (): Promise<void> => {
  try {
    await fs.access(backupConfig.backupDir);
  } catch {
    await fs.mkdir(backupConfig.backupDir, { recursive: true });
  }
};

/**
 * Removes backup files older than the retention period
 * Implements the backup retention policy
 * @throws {Error} If file operations fail
 */
const cleanOldBackups = async (): Promise<void> => {
  try {
    const files = await fs.readdir(backupConfig.backupDir);
    const now = new Date();

    for (const file of files) {
      const filePath = path.join(backupConfig.backupDir, file);
      const stats = await fs.stat(filePath);
      const daysOld = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

      if (daysOld > backupConfig.retentionDays) {
        await fs.unlink(filePath);
        console.log(`Deleted old backup: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning old backups:', error);
  }
};

/**
 * Executes the database backup process
 * 1. Creates backup directory if needed
 * 2. Runs mysqldump command
 * 3. Cleans up old backups
 * @throws {BackupError} If backup process fails
 */
const performBackup = async (): Promise<void> => {
  const backupFile = path.join(backupConfig.backupDir, getBackupFileName());

  // Construct mysqldump command with all necessary options
  const mysqldumpCmd = `mysqldump --host=${dbConfig.host} --port=${dbConfig.port} ` +
    `--user=${dbConfig.user} ${dbConfig.password ? `--password=${dbConfig.password}` : ''} ` +
    `--databases ${dbConfig.database} --result-file="${backupFile}" ` +
    // Use single-transaction for consistency, include routines, triggers, and events
    `--single-transaction --routines --triggers --events`;

  try {
    await ensureBackupDir();
    console.log('Starting database backup...');

    const { stderr } = await execPromise(mysqldumpCmd);

    if (stderr) {
      console.warn('Warnings during backup:', stderr);
    }

    console.log(`Backup completed successfully: ${backupFile}`);

    // Clean old backups after successful backup
    await cleanOldBackups();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new BackupError(`Backup failed: ${errorMessage}`);
  }
};

/**
 * Main execution function
 * Entry point for the backup process
 * Handles top-level error management
 */
const main = async (): Promise<void> => {
  try {
    await performBackup();
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  }
};

// Initialize the backup process
main();

/**
 * Global error handlers
 * Catch any unhandled errors or rejections to prevent silent failures
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});