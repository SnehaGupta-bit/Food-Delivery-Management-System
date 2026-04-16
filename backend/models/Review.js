import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    foodRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    deliveryRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    images: [{
      type: String,
    }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    vendorReply: {
      message: String,
      repliedAt: Date,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index to prevent duplicate reviews
reviewSchema.index({ userId: 1, orderId: 1 }, { unique: true });
reviewSchema.index({ vendorId: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });

export default mongoose.model("Review", reviewSchema);