import { Router } from 'express';
import scenesRouter from './scenes';
import missionsRouter from './missions';

const router = Router();

// Mount admin routes
router.use(scenesRouter);
router.use(missionsRouter);

export default router;
