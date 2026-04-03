import { Router } from 'express';
import * as ctrl from '../controllers/month.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', ctrl.getMonths);
router.get('/:monthKey', ctrl.getMonth);

export default router;
