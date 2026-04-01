import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { chat, getHistory } from '../services/claude.service';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';

const router = Router();

const chatSchema = z.object({
  message: z.string().min(1).max(5000),
  context: z.enum(['cost_analysis', 'valuation', 'projections', 'general']),
  language: z.enum(['en', 'es']),
});

router.post('/:id/assistant/chat', validate(chatSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!env.ANTHROPIC_API_KEY) {
      throw new AppError(503, 'AI assistant is not configured. Set ANTHROPIC_API_KEY in environment.');
    }

    const result = await chat({
      projectId: req.params.id,
      message: req.body.message,
      context: req.body.context,
      language: req.body.language,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/assistant/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = (req.query.context as string) || 'general';
    const messages = await getHistory(req.params.id, context);
    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

export default router;
