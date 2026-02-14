import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    transactionId: { type: String, required: true },
    paymentMethod: { type: String, enum: ['Card', 'UPI', 'COD'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);