import { badRequest } from '../../utils/error';
import { generateHash, hashMatched } from '../../utils/generateHash';
import { generateToken } from '../token/token.services';
import { userServices } from '../user/user.services';
import { User } from '../user/user.types';
import { LoginInputType, RegisterInputType } from './auth.types';

/**
 * Register user service - using this service we can register a new user
 * @param payload
 * @returns User | null
 */
const registerUser = async (payload: RegisterInputType): Promise<User> => {
  const { name, email, phone, password, role = 'customer' } = payload;

  const existingUser = await userServices.findUserByEmail(email.toLowerCase());

  if (existingUser) {
    throw badRequest('User with this email already exists');
  }

  const hashedPassword = await generateHash(password);

  const result = await userServices.createUser({
    name,
    email,
    phone,
    password: hashedPassword,
    role,
  });

  if (!result) {
    throw badRequest('Failed to register user');
  }

  return result;
};

/**
 * Login user service - using this service we can login a user
 * @param payload
 * @returns User | null
 */
const loginUser = async (
  payload: LoginInputType
): Promise<(User & { accessToken: string }) | null> => {
  const { email, password } = payload;

  const user = await userServices.findUserByEmail(email);
  if (!user) {
    throw badRequest('Invalid email or password');
  }

  const passwordMatched = await hashMatched(password, user.password);
  if (!passwordMatched) {
    throw badRequest('Invalid email or password');
  }

  const userPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  const accessToken = generateToken({
    payload: userPayload,
  });

  return {
    ...userPayload,
    password: user.password,
    created_at: user.created_at,
    updated_at: user.updated_at,
    accessToken,
  };
};

export const authServices = {
  registerUser,
  loginUser,
};
