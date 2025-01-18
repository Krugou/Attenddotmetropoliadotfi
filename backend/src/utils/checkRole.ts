import {NextFunction, Request, Response} from 'express';
/**
 * Middleware to check if the user's role is authorized.
 *
 * @param {string[]} roles - The list of authorized roles.
 * @returns {Function} Middleware function that checks the user's role.
 */
const checkUserRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(403).json({error: 'No user logged in'});

      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({error: 'Access denied'});

      return;
    }

    next();
  };
};

export default checkUserRole;
