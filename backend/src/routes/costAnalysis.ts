import { Router, Request, Response, NextFunction } from 'express';
import db from '../config/database';
import { validate } from '../middleware/validate';
import { createCostItemSchema, updateCostItemSchema } from '../schemas/cost.schema';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get all cost items for a project
router.get('/:id/costs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await db('cost_items')
      .where('project_id', req.params.id)
      .orderBy('sort_order');
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// Get cost summary by category
router.get('/:id/costs/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await db('cost_items').where('project_id', req.params.id);
    const total_mxn = items.reduce((sum: number, item: any) => sum + parseFloat(item.amount_mxn), 0);
    const total_usd = items.reduce((sum: number, item: any) => sum + parseFloat(item.amount_usd || 0), 0);

    const categoryMap = new Map<string, { total_mxn: number; total_usd: number }>();
    for (const item of items) {
      const existing = categoryMap.get(item.category) || { total_mxn: 0, total_usd: 0 };
      existing.total_mxn += parseFloat(item.amount_mxn);
      existing.total_usd += parseFloat(item.amount_usd || 0);
      categoryMap.set(item.category, existing);
    }

    const by_category = Array.from(categoryMap.entries()).map(([category, totals]) => ({
      category,
      total_mxn: totals.total_mxn,
      total_usd: totals.total_usd,
      percentage: total_mxn > 0 ? (totals.total_mxn / total_mxn) * 100 : 0,
    }));

    res.json({ by_category, total_mxn, total_usd });
  } catch (err) {
    next(err);
  }
});

// Add cost item
router.post('/:id/costs', validate(createCostItemSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await db('projects').where('id', req.params.id).first();
    if (!project) throw new AppError(404, 'Project not found');

    const amount_usd = parseFloat((req.body.amount_mxn / project.exchange_rate).toFixed(2));
    const [item] = await db('cost_items').insert({
      ...req.body,
      project_id: req.params.id,
      amount_usd,
    }).returning('*');
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// Update cost item
router.put('/:id/costs/:costId', validate(updateCostItemSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updateData: any = { ...req.body };
    if (req.body.amount_mxn !== undefined) {
      const project = await db('projects').where('id', req.params.id).first();
      if (project) {
        updateData.amount_usd = parseFloat((req.body.amount_mxn / project.exchange_rate).toFixed(2));
      }
    }
    const [item] = await db('cost_items')
      .where({ id: req.params.costId, project_id: req.params.id })
      .update(updateData)
      .returning('*');
    if (!item) throw new AppError(404, 'Cost item not found');
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// Delete cost item
router.delete('/:id/costs/:costId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await db('cost_items')
      .where({ id: req.params.costId, project_id: req.params.id })
      .del();
    if (!deleted) throw new AppError(404, 'Cost item not found');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
