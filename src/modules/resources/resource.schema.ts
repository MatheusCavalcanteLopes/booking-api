import { z } from 'zod';

export const createResourceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  capacity: z.number().int().positive().default(1),
  location: z.string().optional(),
});

export const updateResourceSchema = createResourceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
