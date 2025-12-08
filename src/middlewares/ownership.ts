import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

const ownership = (req: Request, res: Response, next: NextFunction) => {
  try {
    const resourceOwnerId = req.params.userId; // Assuming the resource owner ID is passed as a URL parameter

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.id === resourceOwnerId || req.user.role === 'admin') {
      return next();
    }

    return next(new ApiError(403, 'Forbidden: You do not own this resource'));
  } catch (error) {
    next(error);
  }
};

export default ownership;
