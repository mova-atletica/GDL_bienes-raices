import { z } from 'zod';

export const createValuationSchema = z.object({
  method: z.enum(['comparable_sales', 'cap_rate', 'income']),
  estimated_value_mxn: z.number().nonnegative().optional(),
  cap_rate: z.number().min(0).max(1).optional(),
  noi_annual_mxn: z.number().nonnegative().optional(),
  data: z.record(z.unknown()).optional().default({}),
  notes: z.string().optional().default(''),
});

export const updateValuationSchema = createValuationSchema.partial();
