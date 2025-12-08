import express from 'express';
import { userController } from './user.controller';
import authenticated from '../../middlewares/authenticated';
import authorize from '../../middlewares/authorize';

const router = express.Router();

router.get('/', authenticated, authorize(['admin']), userController.getUsers);
router.put(
  '/:userId',
  authenticated,
  authorize(['customer']),
  userController.updateUser
);
router.delete(
  '/:userId',
  authenticated,
  authorize(['admin']),
  userController.deleteUser
);

export const userRouter = router;
