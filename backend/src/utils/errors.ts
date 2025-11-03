import logger from './logger.js';


 // Class representing an HTTP error.

class HttpError extends Error {
  status: number;


   // Create an HTTP error.

  constructor(message: string, status: number) {
    super(message); // Call the parent constructor with the message parameter
    this.status = status; // Add the status property
  }
}


 // Create and log an HTTP error.

const httpError = (message: string, status: number) => {
  logger.error(message);
  console.log("Row 30, errors.ts, httpError() called");
  const err = new HttpError(message, status);
  return err;
};

export default httpError;
