import { z } from 'zod';

export const createCostItemSchema = z.object({
  category: z.enum(['land', 'construction', 'permits', 'fees', 'financing', 'taxes', 'other']),
  subcategory: z.string().max(100).optional().default(''),
  description: z.string().optional().default(''),
  amount_mxn: z.number().nonnegative(),
  is_recurring: z.boolean().optional().default(false),
  recurrence_months: z.number().int().positive().optional().nullable(),
  notes: z.string().optional().default(''),
});

export const updateCostItemSchema = createCostItemSchema.partial();
