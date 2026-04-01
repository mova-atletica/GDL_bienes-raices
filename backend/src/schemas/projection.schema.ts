import { z } from 'zod';

export const createProjectionSchema = z.object({
  name: z.string().min(1).max(255),
  projection_months: z.number().int().min(1).max(360),
  monthly_revenue_mxn: z.number().nonnegative(),
  monthly_expenses_mxn: z.number().nonnegative(),
  sale_price_mxn: z.number().nonnegative(),
  sale_month: z.number().int().positive().optional().nullable(),
  discount_rate: z.number().min(0).max(1),
});

export const updateProjectionSchema = createProjectionSchema.partial();
