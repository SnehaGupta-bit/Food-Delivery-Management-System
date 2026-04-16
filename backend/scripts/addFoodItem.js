import mongoose from "mongoose";
import dotenv from "dotenv";
import Food from "../models/Food.js";

dotenv.config();

const addFoodItem = async (foodData) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Create new food item
    const newFood = new Food(foodData);
    const savedFood = await newFood.save();

    console.log("✅ Food item added successfully!");
    console.log(`${savedFood.emoji} ${savedFood.name} - ₹${savedFood.price} (${savedFood.category})`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding food item:", error);
    process.exit(1);
  }
};

// Example usage - you can modify this object to add new items
const newFoodItem = {
  name: "Chicken Wrap",
  price: 199,
  originalPrice: 249,
  category: "Wraps",
  description: "Grilled chicken with fresh vegetables wrapped in soft tortilla",
  emoji: "🌯",
  badge: "new",
  rating: 4.5,
  isVeg: false,
  prepTime: "15-20 min",
  restaurant: "Wrap House",
  isAvailable: true
};

// Uncomment the line below and modify newFoodItem to add a new item
// addFoodItem(newFoodItem);

console.log("📝 To add a new food item:");
console.log("1. Modify the 'newFoodItem' object above");
console.log("2. Uncomment the 'addFoodItem(newFoodItem)' line");
console.log("3. Run: node scripts/addFoodItem.js");