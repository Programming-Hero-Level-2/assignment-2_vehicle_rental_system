import { pool } from '../../config/db';
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

const getUsers = async (): Promise<Omit<User, 'password'>[]> => {
  const result = await pool.query('SELECT * FROM users');

  if (result.rowCount === 0) {
    return [];
  }

  const payload = result.rows.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }));

  return payload;
};

const updateUser = async (
  id: string,
  payload: Partial<CreateUserType>
): Promise<User> => {
  const user = await findUserById(id);

  if (!user) {
    throw new Error('User not found');
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
    throw new Error('Failed to update user');
  }

  return results.rows[0];
};

const deleteUser = async (id: string): Promise<DeleteResponseType> => {
  const user = await findUserById(id);

  if (!user) {
    throw new Error('User not found');
  }

  const activeBooking = await pool.query(
    'SELECT * FROM bookings WHERE customer_id = $1 AND status = $2',
    [user.id, 'active']
  );

  if (activeBooking.rowCount !== 0) {
    throw new Error('Cannot delete user with active bookings');
  }

  await pool.query('DELETE FROM users WHERE id = $1', [id]);

  return {
    code: 204,
    message: 'User deleted successfully',
    success: true,
  };
};

export const userServices = {
  findUserByEmail,
  findUserById,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
};
