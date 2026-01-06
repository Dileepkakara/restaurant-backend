import express from 'express';
import {
    getMenuItems,
    getRestaurant,
    validateTable,
    createCustomerOrder,
    getOrderStatus,
    getCategories
} from '../controllers/customerController.js';

const router = express.Router();

// Public routes (no authentication required for customer app)

// Get restaurant information
router.get('/restaurant/:restaurantId', getRestaurant);

// Get menu items for a restaurant
router.get('/restaurant/:restaurantId/menu', getMenuItems);

// Get menu categories for a restaurant
router.get('/restaurant/:restaurantId/categories', getCategories);

// Validate table access
router.get('/restaurant/:restaurantId/table/:tableId', validateTable);

// Create customer order
router.post('/restaurant/:restaurantId/order', express.json(), createCustomerOrder);

// Get order status for tracking
router.get('/order/:orderId/status', getOrderStatus);

export default router;