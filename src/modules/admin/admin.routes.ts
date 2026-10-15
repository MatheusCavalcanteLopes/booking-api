import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, authorize } from '../../shared/middlewares/authMiddleware';

export const adminRoutes = Router();

// authorize('ADMIN') only checks the JWT's role claim, which a preview
// admin also carries — adminService enforces the stricter "genuine admin"
// check on top of this for every action here.
adminRoutes.post(
  '/reset/resources',
  authenticate,
  authorize('ADMIN'),
  adminController.resetResources
);
adminRoutes.post(
  '/reset/my-bookings',
  authenticate,
  authorize('ADMIN'),
  adminController.resetMyBookings
);
adminRoutes.post('/reset/all', authenticate, authorize('ADMIN'), adminController.resetAll);
