import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/middlewares/errorHandler';
import { authService } from './auth.service';
import { loginSchema, refreshSchema, registerSchema } from './auth.schema';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const input = registerSchema.parse(req.body);
    const user = await authService.register(input);
    res.status(201).json({ user });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.status(200).json(result);
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await authService.refresh(refreshToken);
    res.status(200).json(result);
  }),
};
