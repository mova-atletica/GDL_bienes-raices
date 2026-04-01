import { Router, Request, Response, NextFunction } from 'express';
import db from '../config/database';
import { validate } from '../middleware/validate';
import { createProjectionSchema, updateProjectionSchema } from '../schemas/projection.schema';
import { AppError } from '../middleware/errorHandler';
import { generateCashFlows, calculateIRR, annualizeIRR, calculateROI, sensitivityAnalysis } from '../calculations';

const router = Router();

router.get('/:id/projections', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projections = await db('projections')
      .where('project_id', req.params.id)
      .orderBy('created_at');
    res.json(projections);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/projections', validate(createProjectionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await db('projects').where('id', req.params.id).first();
    if (!project) throw new AppError(404, 'Project not found');

    const [projection] = await db('projections').insert({
      ...req.body,
      project_id: req.params.id,
    }).returning('*');
    res.status(201).json(projection);
  } catch (err) {
    next(err);
  }
});

// Calculate/recalculate projection metrics
router.post('/:id/projections/:projId/calculate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projection = await db('projections')
      .where({ id: req.params.projId, project_id: req.params.id })
      .first();
    if (!projection) throw new AppError(404, 'Projection not found');

    // Get total investment from cost items
    const costItems = await db('cost_items').where('project_id', req.params.id);
    const totalInvestment = costItems.reduce((sum: number, item: any) => sum + parseFloat(item.amount_mxn), 0);

    if (totalInvestment === 0) {
      throw new AppError(400, 'No cost items found. Add costs before calculating projections.');
    }

    // Generate cash flows
    const cashFlows = generateCashFlows({
      totalInvestment,
      monthlyRevenue: parseFloat(projection.monthly_revenue_mxn),
      monthlyExpenses: parseFloat(projection.monthly_expenses_mxn),
      projectionMonths: projection.projection_months,
      salePrice: parseFloat(projection.sale_price_mxn),
      saleMonth: projection.sale_month,
    });

    // Calculate IRR
    const monthlyIRR = calculateIRR(cashFlows);
    const irr = monthlyIRR !== null ? parseFloat(annualizeIRR(monthlyIRR).toFixed(6)) : null;

    // Calculate ROI
    const totalGain = cashFlows.slice(1).reduce((sum, cf) => sum + cf, 0);
    const roi = parseFloat(calculateROI(totalGain, totalInvestment).toFixed(6));

    // Sensitivity analysis
    const sensitivity = sensitivityAnalysis({
      totalInvestment,
      monthlyRevenue: parseFloat(projection.monthly_revenue_mxn),
      monthlyExpenses: parseFloat(projection.monthly_expenses_mxn),
      projectionMonths: projection.projection_months,
      salePrice: parseFloat(projection.sale_price_mxn),
      saleMonth: projection.sale_month,
      variable_x: 'sale_price',
      variable_y: 'construction_cost',
      steps: 4,
      range_pct: 0.20,
    });

    // Update projection with calculated values
    const [updated] = await db('projections')
      .where({ id: req.params.projId })
      .update({
        cash_flows: JSON.stringify(cashFlows),
        irr,
        roi,
        sensitivity: JSON.stringify(sensitivity),
      })
      .returning('*');

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.put('/:id/projections/:projId', validate(updateProjectionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [projection] = await db('projections')
      .where({ id: req.params.projId, project_id: req.params.id })
      .update(req.body)
      .returning('*');
    if (!projection) throw new AppError(404, 'Projection not found');
    res.json(projection);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/projections/:projId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await db('projections')
      .where({ id: req.params.projId, project_id: req.params.id })
      .del();
    if (!deleted) throw new AppError(404, 'Projection not found');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
