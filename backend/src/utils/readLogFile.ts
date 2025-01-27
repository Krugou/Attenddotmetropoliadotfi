import fs from 'fs';
import logger from './logger.js';
/**
 * readFile function
 *
 * This function reads a file and returns the last 'lineCount' lines.
 *
 * @param {string} filePath - The path to the file to read.
 * @param {number} lineCount - The number of lines to read from the end of the file.
 * @returns {Promise<string>} A promise that resolves to a string containing the last 'lineCount' lines of the file.
 */
const readFile = (filePath: string, lineCount: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        const lines = data.split('\n');
        const lastLines = lines
          .slice(Math.max(lines.length - lineCount, 0))
          .join('\n');
        resolve(lastLines);
      }
    });
  });
};
/**
 * readLogFile function
 *
 * This function reads a log file and returns the last 'lineCount' lines.
 * If an error occurs while reading the file, it logs the error and returns undefined.
 *
 * @param {string} logFilePath - The path to the log file to read.
 * @param {number} lineCount - The number of lines to read from the end of the log file.
 * @returns {Promise<string | undefined>} A promise that resolves to a string containing the last 'lineCount' lines of the log file, or undefined if an error occurs.
 */
const readLogFile = async (
  logFilePath: string,
  lineCount: number,
): Promise<Array<{line: string}> | undefined> => {
  try {
    const logData = await readFile(logFilePath, lineCount);
    const lines = logData.split('\n');
    const jsonOutput = lines.map((line, index) => ({
      line: line,
      lineNumber: index + 1,
    }));
    return jsonOutput;
  } catch (error) {
    logger.error('Error reading log file:', error);
  }
};

export default readLogFile;
