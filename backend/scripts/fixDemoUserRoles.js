import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const fixDemoUserRoles = async () => {
  try {
    console.log("🔧 Fixing demo user roles...");
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Update each demo user with correct role
    const updates = [
      {
        email: "customer@demo.com",
        role: "customer"
      },
      {
        email: "vendor@demo.com",
        role: "vendor",
        restaurantName: "Demo Restaurant"
      },
      {
        email: "delivery@demo.com",
        role: "delivery_partner",
        vehicleType: "bike"
      },
      {
        email: "admin@demo.com",
        role: "admin"
      }
    ];

    for (const update of updates) {
      const { email, role, restaurantName, vehicleType } = update;
      
      const updateData = { role };
      if (restaurantName) updateData.restaurantName = restaurantName;
      if (vehicleType) updateData.vehicleType = vehicleType;
      
      const result = await User.updateOne(
        { email },
        { $set: updateData }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${email} to role: ${role}`);
      } else {
        console.log(`ℹ️  ${email} not found or already has correct role`);
      }
    }

    console.log("\n🎉 Demo user roles fixed!");
    console.log("\n📋 Login Credentials:");
    console.log("┌─────────────────┬─────────────────────┬─────────────────┐");
    console.log("│ Panel           │ Email               │ Password        │");
    console.log("├─────────────────┼─────────────────────┼─────────────────┤");
    console.log("│ Customer        │ customer@demo.com   │ customer123     │");
    console.log("│ Vendor          │ vendor@demo.com     │ vendor123       │");
    console.log("│ Delivery        │ delivery@demo.com   │ delivery123     │");
    console.log("│ Admin           │ admin@demo.com      │ admin123        │");
    console.log("└─────────────────┴─────────────────────┴─────────────────┘");

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

fixDemoUserRoles();
