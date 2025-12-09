import ApiResponse from '../../utils/ApiResponse';
import asyncHandler from '../../utils/asyncHandler';
import { badRequest } from '../../utils/error';
import { generateToken } from '../token/token.services';
import { authServices } from './auth.services';

/**
 * Register user controller
 * @param req
 * @param res
 * @param next
 * @return {Promise<void>}
 * @throws {Error}
 */
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password, role = 'customer' } = req.body;

  if (
    [name, email, phone, password].some(
      (field) => field?.trim() === '' || !field
    )
  ) {
    throw badRequest('All fields are required');
  }

  if (password?.length < 6) {
    throw badRequest('Password must be at least 6 characters long');
  }

  const user = await authServices.registerUser({
    name,
    email: email.toLowerCase(),
    phone,
    password,
    role,
  });

  const payload = {
    id: user?.id,
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    role: user?.role,
  };

  const accessToken = generateToken({ payload });

  const response = {
    access_token: accessToken,
    user: {
      ...payload,
    },
  };

  res
    .status(201)
    .json(new ApiResponse('User registered successfully', 201, response));
});

/**
 * Login user controller
 * @param req
 * @param res
 * @param next
 * @return {Promise<void>}
 * @throws {Error}
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req?.body;

  if (!email || !password) {
    throw badRequest('Email and password are required');
  }

  const user = await authServices.loginUser({
    email: email.toLowerCase(),
    password,
  });

  res.status(200).json(
    new ApiResponse('Login successful', 200, {
      token: user?.accessToken,
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        role: user?.role,
      },
    })
  );
});

export const authController = {
  registerUser,
  loginUser,
};
