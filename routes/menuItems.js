import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import menuItemValidation from '../validation/menuItem.js';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuItemController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get all menu items for a restaurant
router.get('/restaurant/:restaurantId', getMenuItems);

// Create a new menu item
router.post('/restaurant/:restaurantId', validate(menuItemValidation.createMenuItemSchema), createMenuItem);

// Update a menu item
router.put('/:id', validate(menuItemValidation.updateMenuItemSchema), updateMenuItem);

// Delete a menu item
router.delete('/:id', deleteMenuItem);

export default router;