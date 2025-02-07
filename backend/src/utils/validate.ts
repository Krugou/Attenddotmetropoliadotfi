import {NextFunction, Request, Response} from 'express';

import {validationResult} from 'express-validator';

import {RequestHandler} from 'express-serve-static-core';
/**
 * Middleware to validate the request using express-validator.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
const validate: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).send({errors: errors.array()});
    return;
  }

  next();
};

export default validate;
