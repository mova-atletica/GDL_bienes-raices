import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

// Cached exchange rate with timestamp
let cachedRate = { rate: 17.5, updated_at: new Date().toISOString() };

router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
  // For MVP, return a reasonable default rate
  // In production, integrate with an exchange rate API
  res.json({
    from: 'USD',
    to: 'MXN',
    rate: cachedRate.rate,
    updated_at: cachedRate.updated_at,
  });
});

export default router;
