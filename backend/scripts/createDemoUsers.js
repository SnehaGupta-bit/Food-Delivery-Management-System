import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const createDemoUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Demo users data
    const demoUsers = [
      {
        name: "Demo Customer",
        email: "customer@demo.com",
        password: "customer123",
        role: "customer",
        phone: "+91 9876543210",
        address: "123 Customer Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001"
      },
      {
        name: "Demo Vendor",
        email: "vendor@demo.com",
        password: "vendor123",
        role: "vendor",
        phone: "+91 9876543211",
        restaurantName: "Demo Restaurant",
        restaurantAddress: "456 Restaurant Lane, Mumbai",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400002",
        fssaiLicense: "12345678901234",
        gstNumber: "27ABCDE1234F1Z5",
        bankAccountNumber: "1234567890",
        ifscCode: "HDFC0000123",
        isVerified: true
      },
      {
        name: "Demo Delivery Partner",
        email: "delivery@demo.com",
        password: "delivery123",
        role: "delivery_partner",
        phone: "+91 9876543212",
        address: "789 Delivery Road",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400003",
        vehicleType: "bike",
        vehicleNumber: "MH01AB1234",
        drivingLicense: "MH0120230001234",
        currentLocation: {
          type: "Point",
          coordinates: [72.8777, 19.0760] // Mumbai coordinates
        },
        isOnline: true,
        totalDeliveries: 150,
        rating: 4.8,
        earnings: 25000,
        isVerified: true
      },
      {
        name: "Demo Admin",
        email: "admin@demo.com",
        password: "admin123",
        role: "admin",
        phone: "+91 9876543213",
        address: "Admin Office, Business District",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400004",
        isVerified: true
      }
    ];

    // Check if demo users already exist and delete them
    console.log("🔄 Checking for existing demo users...");
    const existingEmails = demoUsers.map(user => user.email);
    await User.deleteMany({ email: { $in: existingEmails } });
    console.log("🗑️ Removed existing demo users");

    // Create new demo users
    console.log("👥 Creating demo users...");
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log("\n🎉 Demo users created successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("┌─────────────────┬─────────────────────┬─────────────────┐");
    console.log("│ Panel           │ Email               │ Password        │");
    console.log("├─────────────────┼─────────────────────┼─────────────────┤");
    console.log("│ Customer        │ customer@demo.com   │ customer123     │");
    console.log("│ Vendor          │ vendor@demo.com     │ vendor123       │");
    console.log("│ Delivery        │ delivery@demo.com   │ delivery123     │");
    console.log("│ Admin           │ admin@demo.com      │ admin123        │");
    console.log("└─────────────────┴─────────────────────┴─────────────────┘");

    console.log("\n🌐 Panel URLs:");
    console.log("• Customer Panel:  http://localhost:5173/");
    console.log("• Vendor Panel:    http://localhost:5173/vendor/login");
    console.log("• Delivery Panel:  http://localhost:5173/delivery/login");
    console.log("• Admin Panel:     http://localhost:5173/admin/login");
    console.log("• Panel Selection: http://localhost:5173/panels");

  } catch (error) {
    console.error("❌ Error creating demo users:", error.message);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run the script
createDemoUsers();