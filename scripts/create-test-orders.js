import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

dotenv.config();

const createTestOrders = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get some menu items
    const menuItems = await MenuItem.find().limit(5);
    if (menuItems.length === 0) {
      console.log('No menu items found. Please run the seed script first.');
      return;
    }

    // Create some test orders
    const testOrders = [
      {
        restaurant: '6748b8f8e4b0a1b2c3d4e5f6',
        table: '6748b8f8e4b0a1b2c3d4e5f8',
        customer: '6748b8f8e4b0a1b2c3d4e5f7',
        items: [
          {
            menuItem: menuItems[0]._id,
            quantity: 2,
            price: menuItems[0].price
          },
          {
            menuItem: menuItems[1]._id,
            quantity: 1,
            price: menuItems[1].price
          }
        ],
        totalAmount: (menuItems[0].price * 2) + menuItems[1].price,
        status: 'Completed',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        restaurant: '6748b8f8e4b0a1b2c3d4e5f6',
        table: '6748b8f8e4b0a1b2c3d4e5f9',
        customer: '6748b8f8e4b0a1b2c3d4e5f7',
        items: [
          {
            menuItem: menuItems[2]._id,
            quantity: 1,
            price: menuItems[2].price
          }
        ],
        totalAmount: menuItems[2].price,
        status: 'Completed',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        restaurant: '6748b8f8e4b0a1b2c3d4e5f6',
        table: '6748b8f8e4b0a1b2c3d4e5fa',
        customer: '6748b8f8e4b0a1b2c3d4e5f7',
        items: [
          {
            menuItem: menuItems[0]._id,
            quantity: 3,
            price: menuItems[0].price
          }
        ],
        totalAmount: menuItems[0].price * 3,
        status: 'Completed',
        createdAt: new Date() // Today
      }
    ];

    await Order.insertMany(testOrders);
    console.log('Test orders created successfully!');

  } catch (error) {
    console.error('Error creating test orders:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

createTestOrders();