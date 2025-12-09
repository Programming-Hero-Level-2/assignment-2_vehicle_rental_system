import tokenServices from '../modules/token/token.services';
import { userServices } from '../modules/user/user.services';
import { User } from '../modules/user/user.types';
import asyncHandler from '../utils/asyncHandler';
import { authenticationError } from '../utils/error';

const authenticated = asyncHandler(async (req, _res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(authenticationError('Unauthorized request'));
  }

  const decodedToken = tokenServices.verifyToken({ token: token! });

  const user = await userServices.findUserById(Number((decodedToken as User).id));
  if (!user) {
    return next(authenticationError('Authentication failed'));
  }

  req.user = {
    id: user?.id,
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    role: user?.role,
  };

  return next();
});

export default authenticated;
