import { NextFunction, Request, Response } from 'express';
import tokenServices from '../modules/token/token.services';
import { ApiError } from '../utils/ApiError';
import { userServices } from '../modules/user/user.services';
import { User } from '../modules/user/user.types';

const authenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      // throw new ApiError(404, 'Unauthorized request');
      return next(new ApiError(404, 'Unauthorized request'));
    }

    const decodedToken = tokenServices.verifyToken({ token: token! });

    const user = await userServices.findUserByEmail(
      (decodedToken as User).email
    );

    if (!user) {
      return next(new ApiError(404, 'Authentication Failed'));
    }

    req.user = {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      role: user?.role,
    };
    return next();
  } catch (error) {
    next(error);
  }
};

export default authenticated;
