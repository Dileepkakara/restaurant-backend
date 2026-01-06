import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';
import Table from '../models/Table.js';
import Order from '../models/Order.js';

// Get menu items for a restaurant (public API)
export const getMenuItems = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const menuItems = await MenuItem.find({ restaurant: restaurantId, isAvailable: true });
        res.json(menuItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch menu items' });
    }
};

// Get restaurant information (public API)
export const getRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const restaurant = await Restaurant.findById(restaurantId).select('name description address phone email');
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.json(restaurant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch restaurant' });
    }
};

// Validate table access (public API)
export const validateTable = async (req, res) => {
    try {
        const { restaurantId, tableId } = req.params;

        const table = await Table.findOne({ restaurant: restaurantId, number: parseInt(tableId) });
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        res.json({
            tableNumber: table.number,
            isOccupied: table.status === 'occupied',
            restaurant: table.restaurant
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to validate table' });
    }
};

// Create customer order (public API)
export const createCustomerOrder = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { table, items, orderType = 'dinein', paymentMethod = 'cod' } = req.body;

        // Validate restaurant
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Validate table
        const tableDoc = await Table.findOne({ restaurant: restaurantId, number: parseInt(table) });
        if (!tableDoc) {
            return res.status(404).json({ message: 'Table not found' });
        }

        // Calculate total amount
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItem);
            if (!menuItem || menuItem.restaurant.toString() !== restaurantId) {
                return res.status(400).json({ message: `Invalid menu item: ${item.menuItem}` });
            }

            const itemPrice = menuItem.price;
            const itemTotal = itemPrice * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                menuItem: item.menuItem,
                quantity: item.quantity,
                price: itemPrice
            });
        }

        // Create order
        const order = new Order({
            table: tableDoc._id,
            restaurant: restaurantId,
            items: orderItems,
            totalAmount,
            status: 'Pending',
            orderType,
            paymentMethod
        });

        await order.save();

        // Update table status to occupied
        tableDoc.status = 'occupied';
        await tableDoc.save();

        // Populate for response
        await order.populate('table', 'number');
        await order.populate('items.menuItem', 'name price');

        res.status(201).json({
            orderId: order._id,
            orderNumber: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
            status: order.status,
            estimatedTime: '15-20 min'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create order' });
    }
};

// Get order status for tracking (public API)
export const getOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate('table', 'number')
            .populate('restaurant', 'name')
            .populate('items.menuItem', 'name price');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({
            orderId: order._id,
            orderNumber: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
            status: order.status,
            table: order.table.number,
            restaurant: order.restaurant.name,
            items: order.items,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
            estimatedTime: '15-20 min'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch order status' });
    }
};

// Get menu categories (public API)
export const getCategories = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const categories = await MenuItem.distinct('category', { restaurant: restaurantId, isAvailable: true });

        // Format categories with icons
        const categoryMap = {
            starters: { name: "Starters", icon: "🥗" },
            mains: { name: "Main Course", icon: "🍛" },
            biryanis: { name: "Biryanis", icon: "🍚" },
            breads: { name: "Breads", icon: "🫓" },
            desserts: { name: "Desserts", icon: "🍮" },
            beverages: { name: "Beverages", icon: "🥤" }
        };

        const formattedCategories = [
            { id: "all", name: "All", icon: "🍽️" },
            ...categories.map(cat => ({
                id: cat,
                name: categoryMap[cat]?.name || cat,
                icon: categoryMap[cat]?.icon || "🍽️"
            }))
        ];

        res.json(formattedCategories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
};