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

    // Parallel: hash password and handle avatar upload
    const [hash, uploadResult] = await Promise.all([
      bcrypt.hash(password, 10), // Simplified, was genSalt then hash
      req.file ? new Promise((resolve, reject) => {
        const folder = (role || '').toLowerCase() === 'admin' ? 'restaurant_logos' : 'avatars';
        const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        stream.end(req.file.buffer);
      }) : Promise.resolve(null)
    ]);

    const user = new User({ name, email, password: hash, role: role || 'customer', location, approved: role === 'super-admin' });

    // Set avatar
    if (avatarUrl) {
      user.avatar = { url: avatarUrl };
    } else if (uploadResult) {
      user.avatar = { url: uploadResult.secure_url, public_id: uploadResult.public_id };
    }

    await user.save();

    let restaurant = null;
    if ((role || '').toLowerCase() === 'admin') {
      restaurant = new Restaurant({
        name: restaurantName || `${name}'s Restaurant`,
        address: location,
        phoneNumber: phoneNumber,
        owner: user._id,
        status: 'pending',
        approved: false
      });

      // Set logo
      if (avatarUrl) {
        restaurant.logo = { url: avatarUrl };
      } else if (uploadResult) {
        restaurant.logo = { url: uploadResult.secure_url, public_id: uploadResult.public_id };
      }

      // Parallel: save restaurant and find plan if needed
      const promises = [restaurant.save()];
      let plan = null;
      if (subscriptionPlan) {
        promises.push(Plan.findById(subscriptionPlan));
      }
      const results = await Promise.all(promises);
      if (subscriptionPlan) {
        plan = results[1];
        if (plan) {
          restaurant.subscriptionPlan = plan._id;
          await restaurant.save(); // Additional save if plan found
        }
      }

      user.restaurant = restaurant._id;
      await user.save();
    }

    if (user.role === 'admin' && !user.approved) {
      await user.populate('restaurant', 'name address phoneNumber status approved subscriptionPlan');
      return res.status(201).json({ message: 'Registered. Pending approval by a Super Admin.', user: { id: user._id, email: user.email, name: user.name, role: user.role, approved: user.approved, restaurant: user.restaurant } });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    await user.populate('restaurant', 'name address phoneNumber status approved subscriptionPlan');
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
    await user.populate('restaurant', 'name address phoneNumber status approved subscriptionPlan');
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, avatar: user.avatar, role: user.role, location: user.location, approved: user.approved, restaurant: user.restaurant } });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message || 'Login failed' });
  }
};

export default { register, login };
