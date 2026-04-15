import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true
    },

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    currentLocation: {
      lat: {
        type: Number,
        required: true
      },

      lng: {
        type: Number,
        required: true
      }
    },

    customerLocation: {
      lat: {
        type: Number,
        required: true
      },

      lng: {
        type: Number,
        required: true
      }
    },

    status: {
      type: String,
      enum: [
        "Assigned",
        "Picked Up",
        "On The Way",
        "Reached",
        "Delivered"
      ],
      default: "Assigned"
    },

    estimatedTime: {
      type: String,
      default: "15 mins"
    },

    distance: {
      type: String,
      default: "0 km"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Tracking", trackingSchema);