import { z } from 'zod';

export const createBookingSchema = z
  .object({
    resourceId: z.string().uuid(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    notes: z.string().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  })
  .refine((data) => data.startTime > new Date(), {
    message: 'startTime must be in the future',
    path: ['startTime'],
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
