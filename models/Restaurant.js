import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    phoneNumber: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    logo: {
      url: { type: String },
      public_id: { type: String }
    },
    subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
