import Plan from '../models/Plan.js';

export const listPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json(plans);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
};

export const getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch plan' });
  }
};

export const createPlan = async (req, res) => {
  try {
    const { name, price, features, maxRestaurants } = req.body;
    const plan = new Plan({ name, price, features: features || [], maxRestaurants: maxRestaurants || 0 });
    await plan.save();
    res.status(201).json(plan);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to create plan' });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const { name, price, features, maxRestaurants } = req.body;
    plan.name = name ?? plan.name;
    plan.price = price ?? plan.price;
    plan.features = features ?? plan.features;
    plan.maxRestaurants = maxRestaurants ?? plan.maxRestaurants;
    await plan.save();
    res.json(plan);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update plan' });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to delete plan' });
  }
};

export default { listPlans, getPlan, createPlan, updatePlan, deletePlan };
