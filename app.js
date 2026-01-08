import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import compression from 'compression';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import logsRoutes from './routes/logs.js';
import analyticsRoutes from './routes/analytics.js';
import restaurantRoutes from './routes/restaurants.js';
import subscriptionRoutes from './routes/subscriptions.js';
import menuItemRoutes from './routes/menuItems.js';
import tableRoutes from './routes/tables.js';
import orderRoutes from './routes/orders.js';
import customerRoutes from './routes/customer.js';
import { requestLogger } from './middlewares/logger.js';
import { authMiddleware } from './middlewares/auth.js';

dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ 
  origin: true
}));
app.use(compression());
app.use(morgan('dev'));
app.use(authMiddleware);
app.use(requestLogger);

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/logs', logsRoutes);

// Health check for Render
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Restaurant Backend API' }));

// Debug endpoint to check environment variables
app.get('/api/debug', (req, res) => res.json({ 
  frontend_url: process.env.FRONTEND_URL,
  mongodb_uri: process.env.MONGODB_URI ? 'Set' : 'Not set',
  port: process.env.PORT
}));

// health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

export default app;
