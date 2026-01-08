import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';
import mongoose from 'mongoose';

export const getDashboardStats = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const user = req.user;

        // Check if restaurant exists
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Check if user has access to this restaurant
        if (user.role === 'admin' && (!user.restaurant || user.restaurant.toString() !== restaurantId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Today's revenue
        const todaysOrders = await Order.find({
            restaurant: restaurantId,
            createdAt: { $gte: today, $lt: tomorrow },
            status: 'Completed'
        });

        const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Active orders (Pending + Preparing)
        const activeOrders = await Order.countDocuments({
            restaurant: restaurantId,
            status: { $in: ['Pending', 'Preparing'] }
        });

        // Items served today (completed orders)
        const itemsServed = todaysOrders.length;

        // Average order time (for completed orders today)
        let avgOrderTime = 0;
        if (todaysOrders.length > 0) {
            const completedOrdersWithTime = todaysOrders.filter(order =>
                order.createdAt && order.updatedAt && order.status === 'Completed'
            );

            if (completedOrdersWithTime.length > 0) {
                const totalTime = completedOrdersWithTime.reduce((sum, order) => {
                    const timeDiff = order.updatedAt - order.createdAt;
                    return sum + (timeDiff / (1000 * 60)); // Convert to minutes
                }, 0);
                avgOrderTime = Math.round(totalTime / completedOrdersWithTime.length);
            }
        }

        // Recent orders (last 10)
        const recentOrders = await Order.find({
            restaurant: restaurantId,
            table: { $exists: true, $ne: null }
        })
            .populate('table', 'tableNumber')
            .populate('items.menuItem', 'name')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const formattedRecentOrders = recentOrders
            .filter(order => order.table !== null)
            .map(order => ({
                id: order._id,
                table: `Table ${order.table.tableNumber}`,
                items: order.items.map(item => {
                    const itemName = item.menuItem ? item.menuItem.name : 'Unknown Item';
                    return `${itemName} x${item.quantity}`;
                }).join(', '),
                amount: `₹${order.totalAmount}`,
                time: getRelativeTime(new Date(order.createdAt)),
                status: order.status
            }));

        res.json({
            todaysRevenue,
            activeOrders,
            itemsServed,
            avgOrderTime,
            recentOrders: formattedRecentOrders
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
    }
};

export const getTopSellingItems = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const user = req.user;

        console.log('Getting top selling items for restaurant:', restaurantId, 'user:', user?.id);

        // Check if restaurant exists
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            console.log('Restaurant not found:', restaurantId);
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Check if user has access to this restaurant
        if (user.role === 'admin' && (!user.restaurant || user.restaurant.toString() !== restaurantId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        console.log('Restaurant found:', restaurant.name);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        // Convert restaurantId to ObjectId
        let restaurantObjectId;
        try {
            restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);
        } catch (idError) {
            console.error('Invalid restaurant ID:', restaurantId, idError);
            return res.status(400).json({ message: 'Invalid restaurant ID' });
        }

        // Use aggregation pipeline for efficiency with timeout
        const aggregationPromise = Order.aggregate([
            {
                $match: {
                    restaurant: restaurantObjectId,
                    status: 'Completed',
                    createdAt: { $gte: sixtyDaysAgo }
                }
            },
            {
                $facet: {
                    currentPeriod: [
                        {
                            $match: {
                                createdAt: { $gte: thirtyDaysAgo }
                            }
                        },
                        { $unwind: '$items' },
                        {
                            $group: {
                                _id: '$items.menuItem',
                                totalOrders: { $sum: '$items.quantity' }
                            }
                        },
                        { $sort: { totalOrders: -1 } },
                        { $limit: 10 }
                    ],
                    previousPeriod: [
                        {
                            $match: {
                                createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
                            }
                        },
                        { $unwind: '$items' },
                        {
                            $group: {
                                _id: '$items.menuItem',
                                totalOrders: { $sum: '$items.quantity' }
                            }
                        }
                    ]
                }
            }
        ]);

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Query timeout')), 8000); // 8 second timeout
        });

        const result = await Promise.race([aggregationPromise, timeoutPromise]);
        console.log('Aggregation completed for restaurant:', restaurantId);

        const currentItems = result[0]?.currentPeriod || [];
        const previousItems = result[0]?.previousPeriod || [];

        // If no current items, return empty array
        if (currentItems.length === 0) {
            console.log('No top selling items found for restaurant:', restaurantId);
            return res.json([]);
        }

        // Create map of previous period data
        const previousMap = new Map();
        previousItems.forEach(item => {
            previousMap.set(item._id.toString(), item.totalOrders);
        });

        // Get menu item details for current top items
        const menuItemIds = currentItems.map(item => item._id);
        const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } }, 'name price');

        // Create menu item map
        const menuMap = new Map();
        menuItems.forEach(item => {
            menuMap.set(item._id.toString(), item);
        });

        // Format the results
        const formattedTopSellingItems = currentItems.map((item, index) => {
            const menuItem = menuMap.get(item._id.toString());
            if (!menuItem) return null;

            const previousOrders = previousMap.get(item._id.toString()) || 0;
            const growth = previousOrders > 0 ?
                Math.round(((item.totalOrders - previousOrders) / previousOrders) * 100) :
                (item.totalOrders > 0 ? 100 : 0); // If no previous orders, show 100% growth if current > 0

            return {
                id: item._id,
                name: menuItem.name,
                orders: item.totalOrders,
                price: `₹${menuItem.price}`,
                growth: `${growth >= 0 ? '+' : ''}${growth}%`,
                rank: index + 1
            };
        }).filter(Boolean); // Remove null items

        res.json(formattedTopSellingItems);

    } catch (error) {
        console.error('Top selling items error:', error);
        res.status(500).json({ message: 'Failed to fetch top selling items' });
    }
};

export const exportAnalyticsReport = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { startDate, endDate } = req.query;
        const user = req.user;

        // Check if restaurant exists
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Check if user has access to this restaurant
        if (user.role === 'admin' && (!user.restaurant || user.restaurant.toString() !== restaurantId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        // Get orders for the period
        const orders = await Order.find({
            restaurant: restaurantId,
            createdAt: { $gte: start, $lt: end }
        })
            .populate('table', 'tableNumber')
            .populate('items.menuItem', 'name price category')
            .sort({ createdAt: -1 });

        // Calculate statistics
        const totalRevenue = orders
            .filter(order => order.status === 'Completed')
            .reduce((sum, order) => sum + order.totalAmount, 0);

        const totalOrders = orders.length;
        const completedOrders = orders.filter(order => order.status === 'Completed').length;
        const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

        // Generate CSV content
        let csvContent = 'Order ID,Table,Items,Total Amount,Status,Date\n';

        orders.forEach(order => {
            const items = order.items.map(item =>
                `${item.menuItem?.name || 'Unknown'} x${item.quantity}`
            ).join('; ');

            csvContent += `${order._id},${order.table?.tableNumber || 'N/A'},"${items}",${order.totalAmount},${order.status},${order.createdAt.toISOString()}\n`;
        });

        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=restaurant-analytics-${restaurantId}-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}.csv`);

        res.send(csvContent);

    } catch (error) {
        console.error('Export analytics error:', error);
        res.status(500).json({ message: 'Failed to export analytics report' });
    }
};

// Helper function for relative time
function getRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
}