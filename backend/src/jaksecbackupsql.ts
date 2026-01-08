/**
 * Database backup utility script
 * This module provides functionality to create MySQL database backups,
 * manage backup retention, and handle cleanup of old backups.
 */

// Import required Node.js modules
const {exec} = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const {promisify} = require('util');

// Convert callback-based exec to promise-based for better async handling
const execPromise = promisify(exec);

// Database configuration object
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jaksec',
  port: parseInt(process.env.DB_PORT || '3306'),
};

// Backup configuration object
const backupConfig = {
  backupDir: path.join(__dirname, '../backups'),
  retentionDays: 7,
};

// Custom error class for backup-specific errors
class BackupError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BackupError';
  }
}

// Generates a unique backup filename using current timestamp
const getBackupFileName = () => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .split('.')[0];
  return `backup_${dbConfig.database}_${timestamp}.sql`;
};

// Ensures the backup directory exists
const ensureBackupDir = async () => {
  try {
    await fs.access(backupConfig.backupDir);
  } catch {
    await fs.mkdir(backupConfig.backupDir, {recursive: true});
  }
};

// Removes backup files older than the retention period
const cleanOldBackups = async () => {
  try {
    const files = await fs.readdir(backupConfig.backupDir);
    const now = new Date();

    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(backupConfig.backupDir, file);
        const stats = await fs.stat(filePath);
        const daysOld =
          (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

        if (daysOld > backupConfig.retentionDays) {
          await fs.unlink(filePath);
          console.log(`Deleted old backup: ${file}`);
        }
      }),
    );
  } catch (error) {
    console.error('Error cleaning old backups:', error);
  }
};

// Executes the database backup process
const performBackup = async () => {
  const backupFile = path.join(backupConfig.backupDir, getBackupFileName());

  try {
    await ensureBackupDir();
    console.log('Starting database backup...');

    const mysqldumpCmd = [
      'mysqldump',
      `--host=${dbConfig.host}`,
      `--port=${dbConfig.port}`,
      `--user=${dbConfig.user}`,
      dbConfig.password ? `--password=${dbConfig.password}` : '',
      `--databases ${dbConfig.database}`,
      `--result-file="${backupFile}"`,
      '--single-transaction',
      '--routines',
      '--triggers',
      '--events',
    ]
      .filter(Boolean)
      .join(' ');

    const {stderr} = await execPromise(mysqldumpCmd);

    if (stderr) {
      console.warn('Warnings during backup:', stderr);
    }

    await fs.chmod(backupFile, 0o600);
    console.log(`Backup completed successfully: ${backupFile}`);
    await cleanOldBackups();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new BackupError(`Backup failed: ${errorMessage}`);
  }
};

// Main execution function
const main = async () => {
  try {
    await performBackup();
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : 'Unknown error occurred',
    );
    process.exit(1);
  }
};

// Initialize the backup process
main();

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
