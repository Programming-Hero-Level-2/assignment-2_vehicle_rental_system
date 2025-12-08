import express from 'express';
import { userController } from './user.controller';
import authenticated from '../../middlewares/authenticated';
import authorize from '../../middlewares/authorize';
import ownership from '../../middlewares/ownership';

const router = express.Router();

router.get('/', authenticated, authorize(['admin']), userController.getUsers);
router
  .put(
    '/:userId',
    authenticated,
    ownership,
    authorize(['admin', 'customer']),
    userController.updateUser
  )
  .delete(
    '/:userId',
    authenticated,
    authorize(['admin']),
    userController.deleteUser
  );

export const userRouter = router;
