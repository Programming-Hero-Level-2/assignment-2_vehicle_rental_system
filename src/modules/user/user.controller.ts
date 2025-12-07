import { NextFunction, Request, Response } from 'express';
import { userServices } from './user.services';

const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userServices.getUsers();

    if (user.length === 0) {
      return res.status(200).json({
        code: 200,
        message: 'No users found',
        success: true,
        data: user,
      });
    }

    res.status(200).json({
      code: 200,
      message: 'Users fetched successfully',
      success: true,
      data: user,
    });
  } catch (error) {
    next(error as any);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  try {
    const user = await userServices.updateUser(userId!, req.body);

    res.status(200).json({
      code: 200,
      message: 'User updated successfully',
      success: true,
      data: user,
    });
  } catch (error) {
    next(error as any);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: 'User ID is required',
        success: false,
      });
    }
    const response = await userServices.deleteUser(userId!);

    res.status(200).json(response);
  } catch (error) {
    next(error as any);
  }
};

export const userController = {
  getUsers,
  updateUser,
  deleteUser,
};
