import { pool } from '../../config/db';
import { CreateUserType, User } from './user.types';

/**
 * Find user by email
 * @param email
 * @returns User
 */
const findUserByEmail = async (email: string): Promise<User> => {
  const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [
    email,
  ]);
  return userResult.rows[0];
};

/**
 * Find user by ID
 * @param id
 * @returns User
 */
const findUserById = async (id: string): Promise<User> => {
  const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [
    id,
  ]);
  return userResult.rows[0];
};

const createUser = async (payload: CreateUserType): Promise<User> => {
  const { name, email, phone, password, role = 'customer' } = payload;

  const result = await pool.query(
    `INSERT INTO users (name, email, phone, password, role)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, email.toLowerCase(), phone, password, role]
  );
  return result.rows[0];
};

export const userServices = {
  findUserByEmail,
  findUserById,
  createUser,
};
