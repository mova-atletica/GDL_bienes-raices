import { Router, Request, Response, NextFunction } from 'express';
import db from '../config/database';
import { validate } from '../middleware/validate';
import { createProjectSchema, updateProjectSchema } from '../schemas/project.schema';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// List all projects
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await db('projects').orderBy('created_at', 'desc');
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// Get single project
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await db('projects').where('id', req.params.id).first();
    if (!project) throw new AppError(404, 'Project not found');
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// Create project
router.post('/', validate(createProjectSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const [project] = await db('projects').insert({
      ...data,
      exchange_rate: data.exchange_rate || 17.5,
      status: 'draft',
    }).returning('*');

    // If created from template, copy default costs
    if (data.template_id) {
      const template = await db('templates').where('id', data.template_id).first();
      if (template && template.default_costs) {
        const costItems = template.default_costs.map((cost: any, index: number) => ({
          project_id: project.id,
          category: cost.category,
          subcategory: cost.subcategory || '',
          description: req.language === 'es' ? cost.description_es : cost.description_en,
          amount_mxn: cost.typical_range_mxn ? (cost.typical_range_mxn[0] + cost.typical_range_mxn[1]) / 2 : 0,
          amount_usd: 0,
          sort_order: index,
        }));
        if (costItems.length > 0) {
          // Calculate USD amounts
          for (const item of costItems) {
            item.amount_usd = parseFloat((item.amount_mxn / project.exchange_rate).toFixed(2));
          }
          await db('cost_items').insert(costItems);
        }
      }
    }

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

// Update project
router.put('/:id', validate(updateProjectSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [project] = await db('projects')
      .where('id', req.params.id)
      .update({ ...req.body, updated_at: new Date() })
      .returning('*');
    if (!project) throw new AppError(404, 'Project not found');
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// Delete project
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await db('projects').where('id', req.params.id).del();
    if (!deleted) throw new AppError(404, 'Project not found');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
