import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/middlewares/errorHandler';
import { userService } from './user.service';
import { updateLocaleSchema } from './user.schema';
import { UnauthorizedError } from '../../shared/errors/AppError';

export const userController = {
  updateMe: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const input = updateLocaleSchema.parse(req.body);
    const user = await userService.updateLocale(req.user.id, input);
    res.status(200).json({ user });
  }),
};
