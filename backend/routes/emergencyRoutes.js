import express from "express";
import { 
  getEmergencyRestaurants, 
  updateRestaurantOrderCount, 
  updateRiderStatus 
} from "../controllers/emergencyController.js";

const router = express.Router();

// Emergency Mode - Find ultra-fast restaurants
router.post("/hunger-emergency", getEmergencyRestaurants);

// Seed emergency data (for testing)
router.post("/seed", async (req, res) => {
  try {
    const Restaurant = (await import("../models/Restaurant.js")).default;
    const Rider = (await import("../models/Rider.js")).default;

    // Clear existing data
    await Restaurant.deleteMany({});
    await Rider.deleteMany({});

    // Sample restaurants in Delhi area
    const sampleRestaurants = [
      {
        name: "Lightning Pizza Express",
        location: { type: "Point", coordinates: [77.2090, 28.6139] },
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
        location: { type: "Point", coordinates: [77.2167, 28.6129] },
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
        location: { type: "Point", coordinates: [77.2245, 28.6358] },
        address: "Karol Bagh, New Delhi",
        phone: "+91-9876543212",
        cuisine: ["Biryani", "Indian"],
        isActive: true,
        ordersInProgress: 2,
        rating: 4.9,
        isEmergencyEnabled: true
      }
    ];

    // Sample riders
    const sampleRiders = [
      {
        name: "Rajesh Kumar",
        email: "rajesh@quickbite.com",
        phone: "+91-8765432101",
        location: { type: "Point", coordinates: [77.2095, 28.6135] },
        status: "idle",
        isOnline: true,
        vehicleType: "bike",
        rating: 4.7
      },
      {
        name: "Amit Singh",
        email: "amit@quickbite.com",
        phone: "+91-8765432102",
        location: { type: "Point", coordinates: [77.2170, 28.6125] },
        status: "idle",
        isOnline: true,
        vehicleType: "scooter",
        rating: 4.8
      },
      {
        name: "Priya Sharma",
        email: "priya@quickbite.com",
        phone: "+91-8765432103",
        location: { type: "Point", coordinates: [77.2250, 28.6360] },
        status: "idle",
        isOnline: true,
        vehicleType: "bicycle",
        rating: 4.9
      }
    ];

    const restaurants = await Restaurant.insertMany(sampleRestaurants);
    const riders = await Rider.insertMany(sampleRiders);

    res.json({
      success: true,
      message: "Emergency data seeded successfully",
      restaurants: restaurants.length,
      riders: riders.length
    });

  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed emergency data",
      error: error.message
    });
  }
});

// Update restaurant order count
router.put("/restaurant/orders", updateRestaurantOrderCount);

// Update rider status and location
router.put("/rider/status", updateRiderStatus);

export default router;