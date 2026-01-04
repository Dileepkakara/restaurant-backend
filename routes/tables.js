import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import tableValidation from '../validation/table.js';
import { getTables, createTable, updateTable, deleteTable } from '../controllers/tableController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get all tables for a restaurant
router.get('/restaurant/:restaurantId', getTables);

// Create a new table
router.post('/restaurant/:restaurantId', validate(tableValidation.createTableSchema), createTable);

// Update a table
router.put('/:id', validate(tableValidation.updateTableSchema), updateTable);

// Delete a table
router.delete('/:id', deleteTable);

export default router;