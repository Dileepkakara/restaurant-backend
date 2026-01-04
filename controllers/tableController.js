import Table from '../models/Table.js';
import Restaurant from '../models/Restaurant.js';

export const getTables = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Check if restaurant exists and user has access
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if user owns this restaurant or is super-admin
    if (req.user.role !== 'super-admin' && restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tables = await Table.find({ restaurant: restaurantId }).sort({ number: 1 });
    res.json(tables);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch tables' });
  }
};

export const createTable = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Check if restaurant exists and user has access
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if user owns this restaurant or is super-admin
    if (req.user.role !== 'super-admin' && restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate QR code URL
    const qrCode = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu?restaurant=${restaurantId}&table=${req.body.number}`;

    const tableData = {
      ...req.body,
      restaurant: restaurantId,
      qrCode
    };

    const table = new Table(tableData);
    await table.save();

    res.status(201).json(table);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Table number already exists for this restaurant' });
    }
    res.status(500).json({ message: 'Failed to create table' });
  }
};

export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findById(id).populate('restaurant');
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Check if user owns the restaurant or is super-admin
    if (req.user.role !== 'super-admin' && table.restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedTable = await Table.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedTable);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Table number already exists for this restaurant' });
    }
    res.status(500).json({ message: 'Failed to update table' });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findById(id).populate('restaurant');
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Check if user owns the restaurant or is super-admin
    if (req.user.role !== 'super-admin' && table.restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Table.findByIdAndDelete(id);
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete table' });
  }
};