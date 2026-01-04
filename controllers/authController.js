import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cloudinary from '../utils/cloudinary.js';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Plan from '../models/Plan.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, location, avatarUrl, restaurantName, phoneNumber, subscriptionPlan } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hash, role: role || 'customer', location, approved: role === 'super-admin' });

    // For non-admins, allow storing avatar on user
    if (role && role.toLowerCase() !== 'admin') {
      if (avatarUrl) user.avatar = { url: avatarUrl };
      if (req.file) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'avatars' }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          });
          stream.end(req.file.buffer);
        });
        user.avatar = { url: uploadResult.secure_url, public_id: uploadResult.public_id };
      }
    }

    await user.save();

    if ((role || '').toLowerCase() === 'admin') {
      const r = new Restaurant({
        name: restaurantName || `${name}'s Restaurant`,
        address: location,
        phoneNumber: phoneNumber,
        owner: user._id,
        status: 'pending',
        approved: false
      });

      if (avatarUrl) r.logo = { url: avatarUrl };
      if (req.file) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'restaurant_logos' }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          });
          stream.end(req.file.buffer);
        });
        r.logo = { url: uploadResult.secure_url, public_id: uploadResult.public_id };
      }

      await r.save();

      // Create subscription if plan is selected
      if (subscriptionPlan) {
        const plan = await Plan.findById(subscriptionPlan);
        if (plan) {
          // Here you would typically create a subscription record
          // For now, we'll just store the plan reference on the restaurant
          r.subscriptionPlan = plan._id;
          await r.save();
        }
      }

      user.restaurant = r._id;
      await user.save();
    }

    if (user.role === 'admin' && !user.approved) {
      await user.populate('restaurant');
      return res.status(201).json({ message: 'Registered. Pending approval by a Super Admin.', user: { id: user._id, email: user.email, name: user.name, role: user.role, approved: user.approved, restaurant: user.restaurant } });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    await user.populate('restaurant');
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, avatar: user.avatar, role: user.role, location: user.location, approved: user.approved, restaurant: user.restaurant } });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message || 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.role === 'admin' && !user.approved) return res.status(403).json({ message: 'Your registration is pending approval by a super admin' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    await user.populate('restaurant');
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, avatar: user.avatar, role: user.role, location: user.location, approved: user.approved, restaurant: user.restaurant } });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message || 'Login failed' });
  }
};

export default { register, login };
