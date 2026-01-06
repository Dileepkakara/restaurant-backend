import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import orderValidation from '../validation/order.js';
import {
    getOrders,
    createOrder,
    updateOrderStatus,
    getOrderById
} from '../controllers/orderController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get all orders for a restaurant
router.get('/restaurant/:restaurantId', getOrders);

// Get a specific order by ID
router.get('/:id', getOrderById);

// Create a new order
router.post('/restaurant/:restaurantId', validate(orderValidation.createOrderSchema), createOrder);

// Update order status
router.put('/:id/status', validate(orderValidation.updateOrderStatusSchema), updateOrderStatus);

export default router;