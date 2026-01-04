import express from 'express';
import { requireRole } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import subscriptionValidation from '../validation/subscription.js';
import { listPlans, getPlan, createPlan, updatePlan, deletePlan } from '../controllers/subscriptionController.js';

const router = express.Router();

router.get('/', requireRole('super-admin'), listPlans);
router.get('/:id', requireRole('super-admin'), getPlan);
router.post('/', requireRole('super-admin'), validate(subscriptionValidation.createSchema), createPlan);
router.put('/:id', requireRole('super-admin'), validate(subscriptionValidation.updateSchema), updatePlan);
router.delete('/:id', requireRole('super-admin'), deletePlan);

export default router;
