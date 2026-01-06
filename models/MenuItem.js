import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: { type: String, required: true },
    isVeg: { type: Boolean, default: true },
    isRecommended: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isTodaySpecial: { type: Boolean, default: false },
    spicyLevel: { type: Number, min: 1, max: 3, default: 1 },
    isAvailable: { type: Boolean, default: true },
    hasOffer: { type: Boolean, default: false },
    offerLabel: { type: String },
    image: { type: String },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }
  },
  { timestamps: true }
);

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;