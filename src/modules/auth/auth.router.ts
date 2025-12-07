import express from 'express';
import { authController } from './auth.controller';

const router = express.Router();

router.post('/signup', authController.registerUser);
router.post('/signin', authController.loginUser);

export const authRouter = router;
