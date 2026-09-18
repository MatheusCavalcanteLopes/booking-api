import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../shared/middlewares/authMiddleware';

export const userRoutes = Router();

userRoutes.patch('/me', authenticate, userController.updateMe);
userRoutes.patch('/me/admin-preview', authenticate, userController.setAdminPreview);
