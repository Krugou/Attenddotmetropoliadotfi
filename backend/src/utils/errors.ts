import logger from './logger';

/**
 * Class representing an HTTP error.
 */
class HttpError extends Error {
  status: number;

  /**
   * Create an HTTP error.
   *
   * @param {string} message - The error message.
   * @param {number} status - The HTTP status code.
   */
  constructor(message: string, status: number) {
    super(message); // Call the parent constructor with the message parameter
    this.status = status; // Add the status property
  }
}

/**
 * Create and log an HTTP error.
 *
 * @param {string} message - The error message.
 * @param {number} status - The HTTP status code.
 * @returns {HttpError} The created HTTP error.
 */
const httpError = (message: string, status: number) => {
  console.log('error used in httpError');
  logger.error(message);
  const err = new HttpError(message, status);
  return err;
};

export default httpError;
