import mongoose from "mongoose";
import dotenv from "dotenv";
import Restaurant from "../models/Restaurant.js";
import Rider from "../models/Rider.js";

dotenv.config();

const seedEmergencyData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Restaurant.deleteMany({});
    await Rider.deleteMany({});
    console.log("🗑️  Cleared existing restaurants and riders");

    // Sample restaurants in Delhi area (coordinates: longitude, latitude)
    const sampleRestaurants = [
      {
        name: "Lightning Pizza Express",
        location: {
          type: "Point",
          coordinates: [77.2090, 28.6139] // New Delhi
        },
        address: "Connaught Place, New Delhi",
        phone: "+91-9876543210",
        cuisine: ["Pizza", "Italian"],
        isActive: true,
        ordersInProgress: 0,
        rating: 4.8,
        isEmergencyEnabled: true
      },
      {
        name: "Rapid Burger Hub",
        location: {
          type: "Point",
          coordinates: [77.2167, 28.6129] // CP area
        },
        address: "Janpath, New Delhi",
        phone: "+91-9876543211",
        cuisine: ["Burgers", "Fast Food"],
        isActive: true,
        ordersInProgress: 1,
        rating: 4.6,
        isEmergencyEnabled: true
      },
      {
        name: "Flash Biryani Kitchen",
        location: {
          type: "Point",
          coordinates: [77.2245, 28.6358] // Karol Bagh
        },
        address: "Karol Bagh, New Delhi",
        phone: "+91-9876543212",
        cuisine: ["Biryani", "Indian"],
        isActive: true,
        ordersInProgress: 2,
        rating: 4.9,
        isEmergencyEnabled: true
      },
      {
        name: "Speedy Noodle Corner",
        location: {
          type: "Point",
          coordinates: [77.2311, 28.6304] // Paharganj
        },
        address: "Paharganj, New Delhi",
        phone: "+91-9876543213",
        cuisine: ["Chinese", "Noodles"],
        isActive: true,
        ordersInProgress: 0,
        rating: 4.4,
        isEmergencyEnabled: true
      },
      {
        name: "Turbo Taco Station",
        location: {
          type: "Point",
          coordinates: [77.2077, 28.6271] // India Gate area
        },
        address: "India Gate, New Delhi",
        phone: "+91-9876543214",
        cuisine: ["Mexican", "Tacos"],
        isActive: true,
        ordersInProgress: 1,
        rating: 4.5,
        isEmergencyEnabled: true
      },
      {
        name: "Busy Restaurant (High Load)",
        location: {
          type: "Point",
          coordinates: [77.2100, 28.6200]
        },
        address: "Central Delhi",
        phone: "+91-9876543215",
        cuisine: ["Multi-cuisine"],
        isActive: true,
        ordersInProgress: 5, // High load - should be filtered out
        rating: 4.2,
        isEmergencyEnabled: true
      }
    ];

    // Sample riders near restaurants
    const sampleRiders = [
      {
        name: "Rajesh Kumar",
        email: "rajesh@quickbite.com",
        phone: "+91-8765432101",
        location: {
          type: "Point",
          coordinates: [77.2095, 28.6135] // Near Lightning Pizza
        },
        status: "idle",
        isOnline: true,
        vehicleType: "bike",
        rating: 4.7
      },
      {
        name: "Amit Singh",
        email: "amit@quickbite.com",
        phone: "+91-8765432102",
        location: {
          type: "Point",
          coordinates: [77.2170, 28.6125] // Near Rapid Burger
        },
        status: "idle",
        isOnline: true,
        vehicleType: "scooter",
        rating: 4.8
      },
      {
        name: "Priya Sharma",
        email: "priya@quickbite.com",
        phone: "+91-8765432103",
        location: {
          type: "Point",
          coordinates: [77.2250, 28.6360] // Near Flash Biryani
        },
        status: "idle",
        isOnline: true,
        vehicleType: "bicycle",
        rating: 4.9
      },
      {
        name: "Vikram Gupta",
        email: "vikram@quickbite.com",
        phone: "+91-8765432104",
        location: {
          type: "Point",
          coordinates: [77.2315, 28.6300] // Near Speedy Noodle
        },
        status: "busy", // Busy rider - should not be available
        isOnline: true,
        vehicleType: "bike",
        rating: 4.6
      },
      {
        name: "Sunita Devi",
        email: "sunita@quickbite.com",
        phone: "+91-8765432105",
        location: {
          type: "Point",
          coordinates: [77.2080, 28.6275] // Near Turbo Taco
        },
        status: "idle",
        isOnline: true,
        vehicleType: "scooter",
        rating: 4.5
      },
      {
        name: "Offline Rider",
        email: "offline@quickbite.com",
        phone: "+91-8765432106",
        location: {
          type: "Point",
          coordinates: [77.2105, 28.6205]
        },
        status: "idle",
        isOnline: false, // Offline - should not be available
        vehicleType: "bike",
        rating: 4.3
      }
    ];

    // Insert sample data
    const insertedRestaurants = await Restaurant.insertMany(sampleRestaurants);
    const insertedRiders = await Rider.insertMany(sampleRiders);

    console.log(`✅ Inserted ${insertedRestaurants.length} restaurants`);
    console.log(`✅ Inserted ${insertedRiders.length} riders`);

    console.log("\n🏪 Sample Restaurants:");
    insertedRestaurants.forEach((restaurant, index) => {
      console.log(`${index + 1}. ${restaurant.name} - Orders: ${restaurant.ordersInProgress} - ${restaurant.address}`);
    });

    console.log("\n🏍️  Sample Riders:");
    insertedRiders.forEach((rider, index) => {
      console.log(`${index + 1}. ${rider.name} - Status: ${rider.status} - Online: ${rider.isOnline} - Vehicle: ${rider.vehicleType}`);
    });

    console.log("\n🎉 Emergency Mode data seeded successfully!");
    console.log("\n📍 Test coordinates (New Delhi area):");
    console.log("User Location: [77.2090, 28.6139] (Connaught Place)");
    console.log("\n🚨 Test Emergency Mode API:");
    console.log("POST /api/emergency/hunger-emergency");
    console.log('Body: {"longitude": 77.2090, "latitude": 28.6139}');

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding emergency data:", error);
    process.exit(1);
  }
};

seedEmergencyData();