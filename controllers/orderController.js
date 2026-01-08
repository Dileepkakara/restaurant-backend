import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import Table from '../models/Table.js';

export const getOrders = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { status, limit = 50 } = req.query; // Add status filter and limit

        // Check if restaurant exists and user has access
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Check if user owns this restaurant or is super-admin, or if restaurant is approved (for demo)
        if (req.user.role !== 'super-admin' && restaurant.owner.toString() !== req.user.id && !restaurant.approved) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Build query
        const query = { 
            restaurant: restaurantId,
            table: { $exists: true, $ne: null } // Only show orders with valid table association (customer orders)
        };

        // Add status filter if provided
        if (status && status !== 'all') {
            if (status === 'active') {
                // Active orders: Pending, Preparing, Ready
                query.status = { $in: ['Pending', 'Preparing', 'Ready'] };
            } else {
                query.status = status;
            }
        }

        const orders = await Order.find(query)
            .populate('table', 'tableNumber')
            .populate('items.menuItem', 'name price')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Filter out orders where table population failed (table was deleted or invalid)
        const validOrders = orders.filter(order => order.table !== null);

        res.json(validOrders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { table, items, totalAmount } = req.body;

        // Check if restaurant exists and user has access
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Check if user owns this restaurant or is super-admin, or if restaurant is approved (for demo)
        if (req.user.role !== 'super-admin' && restaurant.owner.toString() !== req.user.id && !restaurant.approved) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if table exists and belongs to this restaurant
        const tableDoc = await Table.findById(table);
        if (!tableDoc || tableDoc.restaurant.toString() !== restaurantId) {
            return res.status(404).json({ message: 'Table not found' });
        }

        const orderData = {
            table,
            restaurant: restaurantId,
            items,
            totalAmount,
            status: 'Pending'
        };

        const order = new Order(orderData);
        await order.save();

        // Populate for response
        await order.populate('table', 'tableNumber');
        await order.populate('items.menuItem', 'name price');

        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create order' });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findById(id).populate('restaurant', 'owner');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns this restaurant or is super-admin, or if restaurant is approved (for demo)
        if (req.user.role !== 'super-admin' && order.restaurant.owner.toString() !== req.user.id && !order.restaurant.approved) {
            return res.status(403).json({ message: 'Access denied' });
        }

        order.status = status;
        await order.save();

        // Populate for response
        await order.populate('table', 'tableNumber');
        await order.populate('items.menuItem', 'name price');

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update order status' });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('table', 'tableNumber')
            .populate('restaurant', 'name owner')
            .populate('items.menuItem', 'name price category');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns this restaurant or is super-admin, or if restaurant is approved (for demo)
        if (req.user.role !== 'super-admin' && order.restaurant.owner.toString() !== req.user.id && !order.restaurant.approved) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch order' });
    }
};