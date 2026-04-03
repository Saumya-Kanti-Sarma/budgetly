import { Router } from 'express';
import * as ctrl from '../controllers/entry.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createEntrySchema, updateEntrySchema } from '../schemas/entry.schema.js';

const router = Router();

router.use(protect);

router.get('/:monthKey', ctrl.getByMonth);
router.get('/:monthKey/:day', ctrl.getByDay);
router.post('/', validate(createEntrySchema), ctrl.create);
router.patch('/:entryId', validate(updateEntrySchema), ctrl.update);
router.delete('/:entryId', ctrl.remove);

export default router;
