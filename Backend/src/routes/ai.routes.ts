import { Router } from 'express';
import * as ctrl from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/summarize/:monthKey', ctrl.summarize);

export default router;
