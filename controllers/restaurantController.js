import bcrypt from 'bcryptjs';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';

export const getPending = async (req, res) => {
  try {
    const pending = await Restaurant.find({ status: 'pending' }).populate('owner', 'name email');
    res.json(pending);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load pending restaurants' });
  }
};

export const approveRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Not found' });

    restaurant.status = 'approved';
    restaurant.approved = true;
    await restaurant.save();

    await User.findByIdAndUpdate(restaurant.owner, { approved: true });

    res.json({ message: 'Restaurant approved' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Approval failed' });
  }
};

export const listApproved = async (req, res) => {
  try {
    const approved = await Restaurant.find({ status: 'approved' }).populate('owner', 'name email');
    res.json(approved);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load approved restaurants' });
  }
};

export const createBySuperAdmin = async (req, res) => {
  try {
    const { name, address, image, ownerName, ownerEmail, phone, plan } = req.body;

    let owner = null;
    if (ownerEmail) {
      owner = await User.findOne({ email: ownerEmail });
    }

    if (!owner) {
      // create a placeholder owner user
      const password = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const userData = { name: ownerName || (ownerEmail ? ownerEmail.split('@')[0] : 'Owner'), email: ownerEmail || `owner+${Date.now()}@example.com`, password: hash, role: 'admin', approved: true };
      const newUser = new User(userData);
      await newUser.save();
      owner = newUser;
    }

    const restaurant = new Restaurant({ name, address, owner: owner._id, logo: { url: image }, status: 'approved', approved: true, plan });
    await restaurant.save();

    // link restaurant to owner
    owner.restaurant = restaurant._id;
    await owner.save();

    res.status(201).json(restaurant);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to create restaurant' });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Not found' });

    const { name, address, image, ownerName, ownerEmail, phone, plan, status } = req.body;

    if (name) restaurant.name = name;
    if (address) restaurant.address = address;
    if (image) restaurant.logo = { url: image };
    if (plan) restaurant.plan = plan;
    if (status) {
      restaurant.status = status;
      restaurant.approved = status === 'approved';
    }

    await restaurant.save();

    // Optionally update owner information
    if (ownerEmail || ownerName) {
      const owner = await User.findById(restaurant.owner);
      if (owner) {
        if (ownerEmail) owner.email = ownerEmail;
        if (ownerName) owner.name = ownerName;
        await owner.save();
      }
    }

    res.json(restaurant);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update restaurant' });
  }
};

export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Not found' });
    // Optionally unlink owner
    if (restaurant.owner) {
      await User.findByIdAndUpdate(restaurant.owner, { $unset: { restaurant: 1 } });
    }
    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to delete restaurant' });
  }
};

export default { getPending, approveRestaurant, listApproved, createBySuperAdmin, updateRestaurant, deleteRestaurant };

