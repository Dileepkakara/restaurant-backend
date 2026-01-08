import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    logo: {
      url: { type: String },
      public_id: { type: String }
    },
    subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    subscription: {
      plan: { type: String },
      status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
      validUntil: { type: Date }
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approved: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Add indexes for faster queries
restaurantSchema.index({ status: 1 });
restaurantSchema.index({ approved: 1 });

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
