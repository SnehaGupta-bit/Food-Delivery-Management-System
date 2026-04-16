import mongoose from "mongoose";
import dotenv from "dotenv";
import Food from "../models/Food.js";
import { sampleFoods } from "../data/sampleFoods.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing food items
    await Food.deleteMany({});
    console.log("🗑️  Cleared existing food items");

    // Insert sample foods
    const insertedFoods = await Food.insertMany(sampleFoods);
    console.log(`✅ Inserted ${insertedFoods.length} food items`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\nSample Food Items:");
    insertedFoods.forEach((food, index) => {
      console.log(`${index + 1}. ${food.emoji} ${food.name} - ₹${food.price} (${food.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
