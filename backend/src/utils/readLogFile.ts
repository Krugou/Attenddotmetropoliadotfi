import fs from 'fs';
import logger from './logger.js';

 // readFile function

const readFile = (filePath: string, lineCount: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      console.log("Row 15, readLogFile.ts, readFile() called");
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

 // This function reads a log file and returns the last 'lineCount' lines.
 // If an error occurs while reading the file, it logs the error and returns undefined.

const readLogFile = async (
  logFilePath: string,
  lineCount: number,
): Promise<Array<{line: string}> | undefined> => {
  try {
    console.log("Row 43, readLogFile.ts, readLogFile() called");
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
