import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Restaurant from '../models/Restaurant.js';
import Table from '../models/Table.js';
import MenuItem from '../models/MenuItem.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const sampleUsers = [
  {
    _id: new mongoose.Types.ObjectId('6748b8f8e4b0a1b2c3d4e5f7'),
    name: 'Admin User',
    email: 'admin@digitalfeast.com',
    password: '$2a$10$WsViQ9an4EjxkWQNDuiUsOXfQUSQzvtyaQyl8eiu3ugftWAQTSAVS', // admin123
    role: 'admin',
    location: 'Tech City',
    approved: true,
    restaurant: new mongoose.Types.ObjectId('6748b8f8e4b0a1b2c3d4e5f6') // Assign restaurant
  },
  {
    name: 'Super Admin',
    email: 'superadmin@digitalfeast.com',
    password: '$2a$10$waW40cvN3KdrIKQyDA4Tfe6TtNa99E0ktAeu7ADgyt/jFIxmI2LjS', // super123
    role: 'super-admin',
    location: 'Tech City',
    approved: true
  },
  {
    name: 'Customer User',
    email: 'customer@digitalfeast.com',
    password: '$2a$10$B4mHJVtNCiTS3mjSGETkcugqBLrVCk078QWdxui5buox1RkMwjwIa', // customer123
    role: 'customer',
    location: 'Tech City',
    approved: true
  }
];

const sampleRestaurant = {
  _id: new mongoose.Types.ObjectId('6748b8f8e4b0a1b2c3d4e5f6'),
  name: 'Digital Feast Restaurant',
  description: 'Experience modern dining with our digital menu system',
  address: '123 Food Street, Tech City',
  phone: '+91-9876543210',
  email: 'info@digitalfeast.com',
  owner: new mongoose.Types.ObjectId('6748b8f8e4b0a1b2c3d4e5f7'), // Sample owner ID
  approved: true,
  subscription: {
    plan: 'premium',
    status: 'active',
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
  }
};

const sampleTables = [
  {
    _id: new mongoose.Types.ObjectId('6748b8f8e4b0a1b2c3d4e5f8'),
    number: 1,
    capacity: 4,
    estimatedTime: 15,
    status: 'available',
    qrCode: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu?restaurant=${sampleRestaurant._id}&table=1`,
    restaurant: sampleRestaurant._id
  },
  {
    _id: new mongoose.Types.ObjectId('6748b8f8e4b0a1b2c3d4e5f9'),
    number: 2,
    capacity: 4,
    estimatedTime: 15,
    status: 'available',
    qrCode: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu?restaurant=${sampleRestaurant._id}&table=2`,
    restaurant: sampleRestaurant._id
  },
  {
    _id: new mongoose.Types.ObjectId('6748b8f8e4b0a1b2c3d4e5fa'),
    number: 3,
    capacity: 2,
    estimatedTime: 10,
    status: 'available',
    qrCode: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu?restaurant=${sampleRestaurant._id}&table=3`,
    restaurant: sampleRestaurant._id
  },
  {
    _id: new mongoose.Types.ObjectId('6748b8f8e4b0a1b2c3d4e5fb'),
    number: 4,
    capacity: 6,
    estimatedTime: 20,
    status: 'available',
    qrCode: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu?restaurant=${sampleRestaurant._id}&table=4`,
    restaurant: sampleRestaurant._id
  },
  {
    _id: new mongoose.Types.ObjectId('6748b8f8e4b0a1b2c3d4e5fc'),
    number: 5,
    capacity: 4,
    estimatedTime: 15,
    status: 'available',
    qrCode: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu?restaurant=${sampleRestaurant._id}&table=5`,
    restaurant: sampleRestaurant._id
  }
];

const sampleMenuItems = [
  {
    name: "Butter Chicken",
    description: "Tender chicken in rich, creamy tomato gravy with aromatic spices",
    price: 349,
    originalPrice: 449,
    category: "mains",
    isVeg: false,
    isRecommended: true,
    isPopular: true,
    isNewArrival: false,
    isTodaySpecial: false,
    spicyLevel: 2,
    isAvailable: true,
    hasOffer: true,
    offerLabel: "Dussehra Special",
    image: "/api/placeholder/400/300",
    restaurant: sampleRestaurant._id
  },
  {
    name: "Hyderabadi Chicken Biryani",
    description: "Aromatic basmati rice layered with spiced chicken and saffron",
    price: 299,
    category: "biryanis",
    isVeg: false,
    isRecommended: true,
    isPopular: true,
    isNewArrival: false,
    isTodaySpecial: true,
    spicyLevel: 3,
    isAvailable: true,
    image: "/api/placeholder/400/300",
    restaurant: sampleRestaurant._id
  },
  {
    name: "Paneer Tikka",
    description: "Marinated paneer cubes grilled to perfection with spices",
    price: 249,
    category: "starters",
    isVeg: true,
    isRecommended: false,
    isPopular: true,
    isNewArrival: true,
    isTodaySpecial: false,
    spicyLevel: 1,
    isAvailable: true,
    image: "/api/placeholder/400/300",
    restaurant: sampleRestaurant._id
  },
  {
    name: "Masala Dosa",
    description: "Crispy dosa filled with potato masala and served with chutneys",
    price: 149,
    category: "mains",
    isVeg: true,
    isRecommended: true,
    isPopular: false,
    isNewArrival: false,
    isTodaySpecial: false,
    spicyLevel: 1,
    isAvailable: true,
    image: "/api/placeholder/400/300",
    restaurant: sampleRestaurant._id
  },
  {
    name: "Gulab Jamun",
    description: "Soft and syrupy dumplings made from milk solids",
    price: 89,
    category: "desserts",
    isVeg: true,
    isRecommended: false,
    isPopular: true,
    isNewArrival: false,
    isTodaySpecial: false,
    spicyLevel: 1,
    isAvailable: true,
    image: "/api/placeholder/400/300",
    restaurant: sampleRestaurant._id
  },
  {
    name: "Samosa",
    description: "Crispy fried pastry filled with spiced potatoes and peas",
    price: 49,
    category: "starters",
    isVeg: true,
    isRecommended: false,
    isPopular: false,
    isNewArrival: false,
    isTodaySpecial: false,
    spicyLevel: 2,
    isAvailable: true,
    image: "/api/placeholder/400/300",
    restaurant: sampleRestaurant._id
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Table.deleteMany({});
    await MenuItem.deleteMany({});

    // Insert sample data
    console.log('Inserting sample users...');
    await User.insertMany(sampleUsers);

    console.log('Inserting sample restaurant...');
    await Restaurant.create(sampleRestaurant);

    console.log('Inserting sample tables...');
    await Table.insertMany(sampleTables);

    console.log('Inserting sample menu items...');
    await MenuItem.insertMany(sampleMenuItems);

    console.log('Sample data seeded successfully!');
    console.log(`Restaurant ID: ${sampleRestaurant._id}`);
    console.log(`Table IDs: ${sampleTables.map(t => t._id).join(', ')}`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedDatabase();