import { NextFunction, Request, Response } from 'express';
import { userServices } from './user.services';
import asyncHandler from '../../utils/asyncHandler';
import ApiResponse from '../../utils/ApiResponse';
import { badRequest } from '../../utils/error';
import { User } from './user.types';

const getUsers = asyncHandler(async (_req, res) => {
  const user = await userServices.getUsers();

  if (user.length === 0) {
    return res.status(200).json(new ApiResponse('No users found', 200, user));
  }

  const response = user?.map(
    ({ password, created_at, updated_at, ...user }) => user
  );

  res
    .status(200)
    .json(new ApiResponse('Users retrieved successfully', 200, response));
});

const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw badRequest('User ID is required');
  }

  const user = await userServices.updateUser(userId!, req.body);

  delete (user as Partial<User>).password;
  delete (user as Partial<User>).created_at;
  delete (user as Partial<User>).updated_at;

  res.status(200).json(new ApiResponse('User updated successfully', 200, user));
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw badRequest('User ID is required');
  }

  await userServices.deleteUser(userId!);

  res.status(200).json(new ApiResponse('User deleted successfully', 200));
});

export const userController = {
  getUsers,
  updateUser,
  deleteUser,
};
