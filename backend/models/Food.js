import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    price: {
      type: Number,
      required: true
    },

    image: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    rating: {
      type: Number,
      default: 4.5
    },

    isAvailable: {
      type: Boolean,
      default: true
    },

    isVeg: {
      type: Boolean,
      default: true
    },

    discountPrice: {
      type: Number,
      default: 0
    },

    isPopular: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Food", foodSchema);