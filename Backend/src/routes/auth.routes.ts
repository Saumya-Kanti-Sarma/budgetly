import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema, updateMeSchema, refreshSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login', validate(loginSchema), ctrl.login);
router.post('/refresh', validate(refreshSchema), ctrl.refresh);
router.post('/logout', protect, ctrl.logout);
router.get('/me', protect, ctrl.getMe);
router.patch('/me', protect, validate(updateMeSchema), ctrl.updateMe);

export default router;
