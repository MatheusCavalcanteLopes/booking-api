import { Router } from 'express';
import { resourceController } from './resource.controller';
import { authenticate, authorize } from '../../shared/middlewares/authMiddleware';

export const resourceRoutes = Router();

// Anyone authenticated can browse resources to book them.
resourceRoutes.get('/', authenticate, resourceController.list);
resourceRoutes.get('/:id', authenticate, resourceController.getById);

// Only ADMIN and MANAGER can create/edit/deactivate resources.
resourceRoutes.post('/', authenticate, authorize('ADMIN', 'MANAGER'), resourceController.create);
resourceRoutes.patch(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  resourceController.update
);
resourceRoutes.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  resourceController.deactivate
);
