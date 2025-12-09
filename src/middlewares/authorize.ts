import { UserRole } from '../types/authorize.type';
import asyncHandler from '../utils/asyncHandler';
import { authorizationError } from '../utils/error';

const authorize = (roles: UserRole[] = ['admin']) => {
  return asyncHandler(async (req, _res, next) => {
    if (!req.user) {
      return next(authorizationError('Unauthorized'));
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    return next(authorizationError('Forbidden: Access is Denied'));
  });
};

export default authorize;
