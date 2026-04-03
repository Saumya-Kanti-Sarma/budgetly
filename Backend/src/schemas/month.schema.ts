import { z } from 'zod';

export const monthKeySchema = z.object({
  monthKey: z.string().regex(/^\d{4}-\d{2}$/, 'Format must be YYYY-MM'),
});
