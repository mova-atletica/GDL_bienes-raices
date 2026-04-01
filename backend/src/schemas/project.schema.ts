import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  project_type: z.enum(['residential', 'commercial', 'mixed_use', 'agricultural']),
  template_id: z.string().uuid().optional(),
  location: z.string().min(1).max(255),
  description: z.string().optional().default(''),
  exchange_rate: z.number().positive().optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(['draft', 'in_progress', 'complete']).optional(),
});
