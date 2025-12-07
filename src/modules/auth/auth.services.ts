import { pool } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { generateHash, hashMatched } from '../../utils/generateHash';
import { generateToken } from '../token/token.services';
import { userServices } from '../user/user.services';
import { RegisterInputType } from './auth.types';

const registerUser = async (payload: RegisterInputType) => {
  const { name, email, phone, password, role = 'customer' } = payload;

  try {
    const existingUser = await userServices.findUserByEmail(
      email.toLowerCase()
    );

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await generateHash(password);

    const result = await userServices.createUser({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    return result;
  } catch (error) {
    throw new Error(error as any);
  }
};

const loginUser = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;

  try {
    const user = await userServices.findUserByEmail(email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const passwordMatched = await hashMatched(password, user.password);

    if (!passwordMatched) {
      throw new Error('Invalid email or password');
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = generateToken({ payload });

    return { ...payload, accessToken };
  } catch (error) {
    throw new Error(error as any);
  }
};

export const authServices = {
  registerUser,
  loginUser,
};
