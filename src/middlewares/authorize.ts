import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../types/authorize.type';
import { ApiError } from '../utils/ApiError';

const authorize = (roles: UserRole[] = ['admin']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (roles.includes(req.user.role)) {
        return next();
      }

      return next(new ApiError(403, 'Forbidden: Access is Denied'));
    } catch (error) {
      next(error);
    }
  };
};

export default authorize;
