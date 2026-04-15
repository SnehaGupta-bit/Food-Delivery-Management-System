import mongoose from "mongoose";

const groupOrderSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true
    },

    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    participants: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      name: String,
      items: [{
        foodId: String,
        name: String,
        price: Number,
        quantity: Number
      }],
      subtotal: Number,
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }],

    totalAmount: {
      type: Number,
      default: 0
    },

    deliveryAddress: {
      type: String
    },

    status: {
      type: String,
      enum: ["Active", "Locked", "Completed", "Cancelled"],
      default: "Active"
    },

    splitMethod: {
      type: String,
      enum: ["Equal", "ItemBased"],
      default: "ItemBased"
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    }
  },
  { timestamps: true }
);

export default mongoose.model("GroupOrder", groupOrderSchema);
