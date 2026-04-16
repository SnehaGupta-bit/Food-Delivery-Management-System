import Restaurant from "../models/Restaurant.js";
import Rider from "../models/Rider.js";

/**
 * Hunger Emergency Mode - Ultra-fast restaurant finder
 * Finds restaurants with minimal wait times and available riders
 */
export const getEmergencyRestaurants = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;

    // Validate coordinates
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: "User coordinates (longitude, latitude) are required"
      });
    }

    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates provided"
      });
    }

    const userLocation = [parseFloat(longitude), parseFloat(latitude)];

    console.log(`🚨 Emergency Mode: Finding restaurants near [${longitude}, ${latitude}]`);

    // Step 1: Find active restaurants within 2000m radius with low order load
    const nearbyRestaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: userLocation
          },
          $maxDistance: 2000 // 2000 meters
        }
      },
      isActive: true,
      isEmergencyEnabled: true,
      ordersInProgress: { $lt: 3 } // Less than 3 orders in progress
    }).select('_id name location ordersInProgress address phone cuisine rating averageDeliveryTime');

    if (nearbyRestaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No fast kitchens available in your area. Try expanding your search radius.",
        availableRestaurants: 0
      });
    }

    console.log(`📍 Found ${nearbyRestaurants.length} nearby restaurants with low load`);

    // Step 2: Filter restaurants that have available riders within 1000m
    const restaurantsWithRiders = [];

    // Use Promise.all for parallel processing (performance optimization)
    const riderCheckPromises = nearbyRestaurants.map(async (restaurant) => {
      try {
        // Check if there's at least one idle rider within 1000m of this restaurant
        const availableRider = await Rider.findOne({
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: restaurant.location.coordinates
              },
              $maxDistance: 1000 // 1000 meters from restaurant
            }
          },
          status: 'idle',
          isOnline: true
        }).select('_id name vehicleType rating');

        if (availableRider) {
          // Calculate estimated delivery time: (ordersInProgress * 2) + 10 minutes
          const estDeliveryTime = (restaurant.ordersInProgress * 2) + 10;
          
          // Calculate distance from user (for additional info)
          const distanceFromUser = calculateDistance(
            userLocation[1], userLocation[0], // user lat, lng
            restaurant.location.coordinates[1], restaurant.location.coordinates[0] // restaurant lat, lng
          );

          return {
            _id: restaurant._id,
            name: restaurant.name,
            location: restaurant.location,
            address: restaurant.address,
            phone: restaurant.phone,
            cuisine: restaurant.cuisine,
            rating: restaurant.rating,
            ordersInProgress: restaurant.ordersInProgress,
            estDeliveryTime: estDeliveryTime,
            distanceFromUser: Math.round(distanceFromUser), // in meters
            availableRider: {
              id: availableRider._id,
              name: availableRider.name,
              vehicleType: availableRider.vehicleType,
              rating: availableRider.rating
            },
            emergencyScore: calculateEmergencyScore(restaurant.ordersInProgress, estDeliveryTime, distanceFromUser)
          };
        }
        return null;
      } catch (error) {
        console.error(`Error checking riders for restaurant ${restaurant._id}:`, error);
        return null;
      }
    });

    const results = await Promise.all(riderCheckPromises);
    
    // Filter out null results and sort by emergency score (lowest orders first, then by delivery time)
    results.forEach(result => {
      if (result) {
        restaurantsWithRiders.push(result);
      }
    });

    if (restaurantsWithRiders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No fast kitchens available with riders in your area. All riders are currently busy.",
        nearbyRestaurants: nearbyRestaurants.length,
        availableRestaurants: 0
      });
    }

    // Step 3: Sort by emergency score (prioritize lowest orders, fastest delivery)
    restaurantsWithRiders.sort((a, b) => {
      // Primary sort: orders in progress (ascending)
      if (a.ordersInProgress !== b.ordersInProgress) {
        return a.ordersInProgress - b.ordersInProgress;
      }
      // Secondary sort: estimated delivery time (ascending)
      if (a.estDeliveryTime !== b.estDeliveryTime) {
        return a.estDeliveryTime - b.estDeliveryTime;
      }
      // Tertiary sort: distance from user (ascending)
      return a.distanceFromUser - b.distanceFromUser;
    });

    console.log(`⚡ Emergency Mode: Found ${restaurantsWithRiders.length} ultra-fast restaurants`);

    // Return optimized results
    res.status(200).json({
      success: true,
      message: `⚡ Emergency Mode: ${restaurantsWithRiders.length} ultra-fast kitchens found!`,
      userLocation: {
        longitude: userLocation[0],
        latitude: userLocation[1]
      },
      searchRadius: "2000m restaurants, 1000m riders",
      totalFound: restaurantsWithRiders.length,
      fastestDelivery: restaurantsWithRiders[0]?.estDeliveryTime || null,
      restaurants: restaurantsWithRiders,
      timestamp: new Date().toISOString(),
      emergencyTip: "These restaurants have the lowest wait times and available riders right now!"
    });

  } catch (error) {
    console.error("Emergency Mode Error:", error);
    res.status(500).json({
      success: false,
      message: "Emergency mode temporarily unavailable. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Calculate emergency score for ranking
 * Lower score = better for emergency delivery
 */
function calculateEmergencyScore(ordersInProgress, estDeliveryTime, distanceFromUser) {
  return (ordersInProgress * 10) + (estDeliveryTime * 0.5) + (distanceFromUser * 0.001);
}

/**
 * Update restaurant order count (call when order is placed/completed)
 */
export const updateRestaurantOrderCount = async (req, res) => {
  try {
    const { restaurantId, increment } = req.body;
    
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { 
        $inc: { ordersInProgress: increment ? 1 : -1 }
      },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Ensure ordersInProgress doesn't go below 0
    if (restaurant.ordersInProgress < 0) {
      restaurant.ordersInProgress = 0;
      await restaurant.save();
    }

    res.json({
      success: true,
      message: `Restaurant order count ${increment ? 'increased' : 'decreased'}`,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        ordersInProgress: restaurant.ordersInProgress
      }
    });

  } catch (error) {
    console.error("Update order count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update restaurant order count"
    });
  }
};

/**
 * Update rider status and location
 */
export const updateRiderStatus = async (req, res) => {
  try {
    const { riderId, status, longitude, latitude, isOnline } = req.body;

    const updateData = {
      lastLocationUpdate: new Date()
    };

    if (status) updateData.status = status;
    if (isOnline !== undefined) updateData.isOnline = isOnline;
    if (longitude && latitude) {
      updateData.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

    const rider = await Rider.findByIdAndUpdate(
      riderId,
      updateData,
      { new: true }
    );

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found"
      });
    }

    res.json({
      success: true,
      message: "Rider status updated",
      rider: {
        id: rider._id,
        name: rider.name,
        status: rider.status,
        isOnline: rider.isOnline,
        location: rider.location
      }
    });

  } catch (error) {
    console.error("Update rider status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update rider status"
    });
  }
};