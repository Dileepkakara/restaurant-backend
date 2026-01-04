import express from 'express';
import { requireRole } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import restaurantValidation from '../validation/restaurant.js';
import { getPending, approveRestaurant, listApproved, createBySuperAdmin, updateRestaurant, deleteRestaurant } from '../controllers/restaurantController.js';

const router = express.Router();

// Get pending restaurants for superadmin review
router.get('/pending', requireRole('super-admin'), validate(restaurantValidation.approveSchema), getPending);

// Approve a restaurant and mark owner as approved
router.post('/:id/approve', requireRole('super-admin'), validate(restaurantValidation.approveSchema), approveRestaurant);

// List approved restaurants
router.get('/approved', requireRole('super-admin'), listApproved);

// Create a restaurant (by superadmin) - auto approved
router.post('/', requireRole('super-admin'), validate(restaurantValidation.createSchema), createBySuperAdmin);

// Update restaurant
router.put('/:id', requireRole('super-admin'), validate(restaurantValidation.updateSchema), updateRestaurant);

// Delete restaurant
router.delete('/:id', requireRole('super-admin'), deleteRestaurant);

export default router;
