import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/middlewares/errorHandler';
import { bookingService } from './booking.service';
import { createBookingSchema } from './booking.schema';
import { UnauthorizedError } from '../../shared/errors/AppError';

export const bookingController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const input = createBookingSchema.parse(req.body);
    const booking = await bookingService.create(req.user.id, input);
    res.status(201).json({ booking });
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const bookings = await bookingService.listForUser(req.user.id);
    res.status(200).json({ bookings });
  }),

  listAll: asyncHandler(async (_req: Request, res: Response) => {
    const bookings = await bookingService.listAll();
    res.status(200).json({ bookings });
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const booking = await bookingService.cancel(req.params.id, req.user);
    res.status(200).json({ booking });
  }),
};
