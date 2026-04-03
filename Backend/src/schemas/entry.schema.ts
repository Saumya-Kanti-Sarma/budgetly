import { z } from 'zod';

export const createEntrySchema = z.object({
  monthKey: z.string().regex(/^\d{4}-\d{2}$/, 'Format must be YYYY-MM'),
  day: z.number().int().min(1).max(31),
  description: z.string().min(1).max(120),
  category: z.enum(['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Other']),
  amount: z.number().positive(),
  note: z.string().max(255).optional(),
});

export const updateEntrySchema = createEntrySchema.partial().omit({ monthKey: true, day: true });

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
