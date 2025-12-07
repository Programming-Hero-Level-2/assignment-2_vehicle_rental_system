import { NextFunction, Request, Response } from 'express';
import { generateToken } from '../token/token.services';
import { authServices } from './auth.services';

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, phone, password, role = 'customer' } = req.body;

  try {
    if ([name, email, phone, password].some((field) => field?.trim() === '')) {
      throw new Error('All fields are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const user = await authServices.registerUser({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role,
    });

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = generateToken({ payload });

    const response = {
      code: 201,
      message: 'User registered successfully',
      success: true,
      data: {
        access_token: accessToken,
        user: {
          ...payload,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = await authServices.loginUser({
      email: email.toLowerCase(),
      password,
    });

    res.status(200).json({
      code: 200,
      message: 'User logged in successfully',
      success: true,
      data: {
        token: user.accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const authController = {
  registerUser,
  loginUser,
};
