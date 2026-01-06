import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
        restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        items: [{
            menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true }
        }],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
            default: 'Pending'
        },
        orderType: {
            type: String,
            enum: ['dinein', 'takeaway'],
            default: 'dinein'
        },
        paymentMethod: {
            type: String,
            enum: ['upi', 'card', 'cod'],
            default: 'cod'
        }
    },
    { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;