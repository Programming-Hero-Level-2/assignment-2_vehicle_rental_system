import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

const ownership = (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.params.userId;

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.id === ownerId || req.user.role === 'admin') {
      return next();
    }

    return next(new ApiError(403, 'Forbidden: You do not own this resource'));
  } catch (error) {
    next(error);
  }
};

export default ownership;
