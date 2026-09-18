import { z } from 'zod';

export const updateLocaleSchema = z.object({
  locale: z.enum(['pt-BR', 'en']),
});

export type UpdateLocaleInput = z.infer<typeof updateLocaleSchema>;

export const setAdminPreviewSchema = z.object({
  enabled: z.boolean(),
});

export type SetAdminPreviewInput = z.infer<typeof setAdminPreviewSchema>;
