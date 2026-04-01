import { Router } from 'express';
import projectsRouter from './projects';
import costsRouter from './costAnalysis';
import valuationsRouter from './valuations';
import projectionsRouter from './projections';
import templatesRouter from './templates';
import assistantRouter from './assistant';
import exchangeRouter from './exchange';

const router = Router();

router.use('/projects', projectsRouter);
router.use('/projects', costsRouter);
router.use('/projects', valuationsRouter);
router.use('/projects', projectionsRouter);
router.use('/templates', templatesRouter);
router.use('/projects', assistantRouter);
router.use('/exchange-rate', exchangeRouter);

export default router;
