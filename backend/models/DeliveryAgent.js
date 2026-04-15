import mongoose from "mongoose";

const deliveryAgentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    vehicleNumber: { type: String, required: true },
    vehicleType: { type: String, enum: ['Bike', 'Scooter', 'Car'], default: 'Bike' },
    currentLocation: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    },
    isAvailable: { type: Boolean, default: true },
    currentOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    totalDeliveries: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 }
}, { timestamps: true });

export default mongoose.model('DeliveryAgent', deliveryAgentSchema);