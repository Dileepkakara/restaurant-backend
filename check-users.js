import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({}, 'email name role password');
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ${user.name}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkUsers();