import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    features: { type: [String], default: [] },
    maxRestaurants: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);
export default Plan;
