import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  category: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  emoji: { type: String },
  badge: { type: String, enum: ["hot", "new", "popular", null], default: null },
  rating: { type: Number, default: 4.5 },
  isVeg: { type: Boolean, default: false },
  prepTime: { type: String, default: "20-30 min" },
  restaurant: { type: String },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Food", foodSchema);