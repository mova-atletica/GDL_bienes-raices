import { Router, Request, Response, NextFunction } from 'express';
import db from '../config/database';
import { validate } from '../middleware/validate';
import { createValuationSchema, updateValuationSchema } from '../schemas/valuation.schema';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/:id/valuations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const valuations = await db('valuations')
      .where('project_id', req.params.id)
      .orderBy('created_at');
    res.json(valuations);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/valuations', validate(createValuationSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await db('projects').where('id', req.params.id).first();
    if (!project) throw new AppError(404, 'Project not found');

    const data = { ...req.body, project_id: req.params.id };

    // Auto-calculate based on method
    if (data.method === 'cap_rate' && data.noi_annual_mxn && data.cap_rate) {
      data.estimated_value_mxn = parseFloat((data.noi_annual_mxn / data.cap_rate).toFixed(2));
    }

    if (data.estimated_value_mxn) {
      data.estimated_value_usd = parseFloat((data.estimated_value_mxn / project.exchange_rate).toFixed(2));
    }

    const [valuation] = await db('valuations').insert(data).returning('*');
    res.status(201).json(valuation);
  } catch (err) {
    next(err);
  }
});

router.put('/:id/valuations/:valId', validate(updateValuationSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await db('projects').where('id', req.params.id).first();
    const updateData: any = { ...req.body };

    if (updateData.method === 'cap_rate' && updateData.noi_annual_mxn && updateData.cap_rate) {
      updateData.estimated_value_mxn = parseFloat((updateData.noi_annual_mxn / updateData.cap_rate).toFixed(2));
    }
    if (updateData.estimated_value_mxn && project) {
      updateData.estimated_value_usd = parseFloat((updateData.estimated_value_mxn / project.exchange_rate).toFixed(2));
    }

    const [valuation] = await db('valuations')
      .where({ id: req.params.valId, project_id: req.params.id })
      .update(updateData)
      .returning('*');
    if (!valuation) throw new AppError(404, 'Valuation not found');
    res.json(valuation);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/valuations/:valId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await db('valuations')
      .where({ id: req.params.valId, project_id: req.params.id })
      .del();
    if (!deleted) throw new AppError(404, 'Valuation not found');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
