import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/middlewares/errorHandler';
import { adminService } from './admin.service';
import { UnauthorizedError } from '../../shared/errors/AppError';

export const adminController = {
  resetResources: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    await adminService.resetResources(req.user.id);
    res.status(204).send();
  }),

  resetMyBookings: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    await adminService.resetMyBookings(req.user.id);
    res.status(204).send();
  }),

  resetAll: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    await adminService.resetAll(req.user.id);
    res.status(204).send();
  }),
};
