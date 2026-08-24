import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/middlewares/errorHandler';
import { resourceService } from './resource.service';
import { createResourceSchema, updateResourceSchema } from './resource.schema';

export const resourceController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const input = createResourceSchema.parse(req.body);
    const resource = await resourceService.create(input);
    res.status(201).json({ resource });
  }),

  list: asyncHandler(async (_req: Request, res: Response) => {
    const resources = await resourceService.list();
    res.status(200).json({ resources });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const resource = await resourceService.getById(req.params.id);
    res.status(200).json({ resource });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const input = updateResourceSchema.parse(req.body);
    const resource = await resourceService.update(req.params.id, input);
    res.status(200).json({ resource });
  }),

  deactivate: asyncHandler(async (req: Request, res: Response) => {
    await resourceService.deactivate(req.params.id);
    res.status(204).send();
  }),
};
