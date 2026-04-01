import { Router, Request, Response, NextFunction } from 'express';
import db from '../config/database';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await db('templates').orderBy('project_type');
    const lang = req.language;
    const result = templates.map((t: any) => ({
      id: t.id,
      name: lang === 'es' ? t.name_es : t.name_en,
      project_type: t.project_type,
      description: lang === 'es' ? t.description_es : t.description_en,
      default_costs: t.default_costs,
      default_assumptions: t.default_assumptions,
    }));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await db('templates').where('id', req.params.id).first();
    if (!template) throw new AppError(404, 'Template not found');
    const lang = req.language;
    res.json({
      id: template.id,
      name: lang === 'es' ? template.name_es : template.name_en,
      project_type: template.project_type,
      description: lang === 'es' ? template.description_es : template.description_en,
      default_costs: template.default_costs,
      default_assumptions: template.default_assumptions,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
