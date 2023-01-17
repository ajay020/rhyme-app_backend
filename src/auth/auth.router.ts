import express from 'express';
export const authRouter = express.Router();
import * as authController from './auth.controller';

authRouter.post('/signup', authController.signup);
authRouter.post('/login', authController.login);

authRouter.post('/forgotPassword', authController.forgotPassword);
authRouter.patch('/resetPassword/:token', authController.resetPassword);