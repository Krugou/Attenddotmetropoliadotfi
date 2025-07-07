import {NextFunction, Request, Response} from 'express';
import logger from './logger.js';

/**
 * Middleware to check if the user's role is authorized.
 *
 * @param {string[]} roles - The list of authorized roles.
 * @returns {Function} Middleware function that checks the user's role.
 */
const checkUserRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("Row 12, checkRole.ts - checkUserRole() called");
    if (!req.user) {
      logger.error({
        msg: 'Role check failed: No user logged in',
        path: req.path,
        method: req.method,
      });
      res.status(403).json({error: 'No user logged in'});
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.error({
        msg: 'Role check failed: Access denied',
        path: req.path,
        method: req.method,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        email: req.user.email,
      });
      res.status(403).json({error: 'Access denied'});
      return;
    }

    next();
  };
};

export default checkUserRole;
