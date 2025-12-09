import { pool } from '../../config/db';
import { badRequest, notFound, serverError } from '../../utils/error';
import { CreateUserType, DeleteResponseType, User } from './user.types';

/**
 * Find user by email
 * @param email
 * @returns User
 */
const findUserByEmail = async (email: string): Promise<User | null> => {
  const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [
    email,
  ]);

  const result = userResult.rowCount === 0 ? null : userResult.rows[0];
  return result;
};

/**
 * Find user by ID
 * @param id
 * @returns User
 */
const findUserById = async (id: string): Promise<User | null> => {
  const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [
    id,
  ]);

  return userResult.rowCount === 0 ? null : userResult.rows[0];
};

const createUser = async (payload: CreateUserType): Promise<User | null> => {
  const { name, email, phone, password, role = 'customer' } = payload;

  const result = await pool.query(
    `INSERT INTO users (name, email, phone, password, role)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, email.toLowerCase(), phone, password, role]
  );
  
  return result.rowCount === 0 ? null : result.rows[0];
};

const getUsers = async (): Promise<User[]> => {
  const result = await pool.query('SELECT * FROM users');

  return result.rowCount === 0 ? [] : result.rows;
};

const updateUser = async (
  id: string,
  payload: CreateUserType
): Promise<User> => {
  const user = await findUserById(id);

  if (!user) {
    throw notFound('User not found');
  }

  const updatedData = {
    ...user,
    ...payload,
  };

  const { name, email, phone, role, password } = updatedData;

  const results = await pool.query(
    `UPDATE users 
     SET name = $1, email = $2, phone = $3, role = $4, password = $5, updated_at = NOW()
     WHERE id = $6 RETURNING *`,
    [name, email, phone, role, password, id]
  );

  if (results.rowCount === 0) {
    throw serverError('Failed to update user');
  }

  return results.rows[0];
};

/**
 * Delete user service
 * @param id number
 * @returns User
 */
const deleteUser = async (id: string): Promise<User> => {
  const user = await findUserById(id);

  if (!user) {
    throw notFound('User not found');
  }

  const activeBooking = await pool.query(
    'SELECT * FROM bookings WHERE customer_id = $1 AND status = $2',
    [user.id, 'active']
  );

  if (activeBooking.rowCount !== 0) {
    throw badRequest('Cannot delete user with active bookings');
  }

  const deletedResult = await pool.query('DELETE FROM users WHERE id = $1', [
    id,
  ]);

  if (deletedResult.rowCount === 0) {
    throw serverError('Failed to delete user');
  }

  return deletedResult.rows[0];
};

export const userServices = {
  findUserByEmail,
  findUserById,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
};
