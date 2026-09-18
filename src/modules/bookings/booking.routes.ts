import { Router } from 'express';
import { bookingController } from './booking.controller';
import { authenticate, authorize } from '../../shared/middlewares/authMiddleware';

export const bookingRoutes = Router();

bookingRoutes.post('/', authenticate, bookingController.create);
bookingRoutes.get('/me', authenticate, bookingController.listMine);
bookingRoutes.get('/', authenticate, authorize('ADMIN', 'MANAGER'), bookingController.listAll);

// Must come before '/:id' — otherwise Express would match "trash" as an :id.
bookingRoutes.delete('/trash', authenticate, bookingController.clearTrash);
bookingRoutes.delete('/:id', authenticate, bookingController.cancel);
