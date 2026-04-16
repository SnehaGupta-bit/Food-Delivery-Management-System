import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);