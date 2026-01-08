import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import {
    getDashboardStats,
    getTopSellingItems,
    exportAnalyticsReport
} from '../controllers/analyticsController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get dashboard statistics
router.get('/dashboard/:restaurantId', getDashboardStats);

// Get top selling items
router.get('/top-selling/:restaurantId', getTopSellingItems);

// Export analytics report
router.get('/export/:restaurantId', exportAnalyticsReport);

export default router;