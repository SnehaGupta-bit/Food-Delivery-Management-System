import mongoose from "mongoose";

const deliveryAgentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    vehicleNumber: { type: String, required: true },
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('DeliveryAgent', deliveryAgentSchema);