import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryAgent'
    },
    currentLocation: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'Picked Up', 'In Transit', 'Nearby', 'Delivered'],
        default: 'Pending'
    },
    estimatedTime: {
        type: Number, // in minutes
        default: 30
    },
    locationHistory: [{
        latitude: Number,
        longitude: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    notes: String
}, { timestamps: true });

export default mongoose.model('Tracking', trackingSchema);
