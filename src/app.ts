import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRoutes } from './modules/auth/auth.routes';
import { resourceRoutes } from './modules/resources/resource.routes';
import { bookingRoutes } from './modules/bookings/booking.routes';
import { userRoutes } from './modules/users/user.routes';
import { errorHandler } from './shared/middlewares/errorHandler';

/**
 * The Express app is built here, separate from server.ts, so that
 * integration tests can import `app` and use supertest against it
 * without actually binding a port.
 */
export function buildApp(): Application {
  const app = express();

  app.use(helmet()); // sets a batch of security-related HTTP headers
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/auth', authRoutes);
  app.use('/resources', resourceRoutes);
  app.use('/bookings', bookingRoutes);
  app.use('/users', userRoutes);

  // Must be the LAST middleware registered: Express only treats a
  // 4-arg middleware as an error handler, and order matters.
  app.use(errorHandler);

  return app;
}
