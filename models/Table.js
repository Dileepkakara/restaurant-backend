import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    capacity: { type: Number, required: true, min: 1 },
    estimatedTime: { type: Number, required: true, min: 1 }, // in minutes
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved'],
      default: 'available'
    },
    qrCode: { type: String, required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }
  },
  { timestamps: true }
);

// Compound index to ensure unique table numbers per restaurant
tableSchema.index({ restaurant: 1, number: 1 }, { unique: true });

const Table = mongoose.models.Table || mongoose.model('Table', tableSchema);
export default Table;