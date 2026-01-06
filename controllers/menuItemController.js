import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';

export const getMenuItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Check if restaurant exists and user has access
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if user owns this restaurant or is super-admin, or if restaurant is approved (for demo)
    if (req.user.role !== 'super-admin' && restaurant.owner.toString() !== req.user.id && !restaurant.approved) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const menuItems = await MenuItem.find({ restaurant: restaurantId });
    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch menu items' });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Check if restaurant exists and user has access
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if user owns this restaurant or is super-admin, or if restaurant is approved (for demo)
    if (req.user.role !== 'super-admin' && restaurant.owner.toString() !== req.user.id && !restaurant.approved) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const menuItemData = { ...req.body, restaurant: restaurantId };
    const menuItem = new MenuItem(menuItemData);
    await menuItem.save();

    res.status(201).json(menuItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create menu item' });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuItem = await MenuItem.findById(id).populate('restaurant');
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Check if user owns the restaurant or is super-admin, or if restaurant is approved (for demo)
    if (req.user.role !== 'super-admin' && menuItem.restaurant.owner.toString() !== req.user.id && !menuItem.restaurant.approved) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedMenuItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update menu item' });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuItem = await MenuItem.findById(id).populate('restaurant');
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Check if user owns the restaurant or is super-admin, or if restaurant is approved (for demo)
    if (req.user.role !== 'super-admin' && menuItem.restaurant.owner.toString() !== req.user.id && !menuItem.restaurant.approved) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await MenuItem.findByIdAndDelete(id);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete menu item' });
  }
};