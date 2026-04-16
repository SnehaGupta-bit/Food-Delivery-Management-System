import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const HungerEmergencyMode = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const findEmergencyRestaurants = async (coords = null) => {
    setLoading(true);
    try {
      let location = coords;
      
      if (!location) {
        toast.loading("Getting your location...", { id: "location" });
        location = await getCurrentLocation();
        toast.success("Location found!", { id: "location" });
      }

      setUserLocation(location);

      const response = await fetch("http://localhost:3000/api/emergency/hunger-emergency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          longitude: location.longitude,
          latitude: location.latitude
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRestaurants(data.restaurants);
        setSearchPerformed(true);
        toast.success(`⚡ Found ${data.totalFound} ultra-fast kitchens!`);
      } else {
        setRestaurants([]);
        setSearchPerformed(true);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Emergency search error:", error);
      toast.error("Failed to find emergency restaurants. Please try again.");
      setRestaurants([]);
      setSearchPerformed(true);
    } finally {
      setLoading(false);
    }
  };

  const useTestLocation = () => {
    const testLocation = {
      latitude: 28.6139,
      longitude: 77.2090
    };
    findEmergencyRestaurants(testLocation);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-yellow-500 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  ⚡ Hunger Emergency Mode
                </h2>
                <p className="text-red-100 mt-1">
                  Ultra-fast restaurants with available riders nearby
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-red-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {!searchPerformed ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🚨</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Find Ultra-Fast Restaurants
                </h3>
                <p className="text-gray-600 mb-6">
                  We'll find restaurants with minimal wait times and available riders within 2km of your location.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => findEmergencyRestaurants()}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? "🔍 Searching..." : "📍 Use My Location"}
                  </button>
                  
                  <button
                    onClick={useTestLocation}
                    disabled={loading}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    🧪 Use Test Location (Delhi)
                  </button>
                </div>

                {userLocation && (
                  <div className="mt-4 text-sm text-gray-500">
                    📍 Current location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Search Results Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Emergency Results
                    </h3>
                    <p className="text-gray-600">
                      {restaurants.length > 0 
                        ? `Found ${restaurants.length} ultra-fast restaurants`
                        : "No restaurants available right now"
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchPerformed(false);
                      setRestaurants([]);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    🔄 Search Again
                  </button>
                </div>

                {/* Restaurant Results */}
                {restaurants.length > 0 ? (
                  <div className="space-y-4">
                    {restaurants.map((restaurant, index) => (
                      <motion.div
                        key={restaurant._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg text-gray-800">
                                {restaurant.name}
                              </h4>
                              {index === 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                  ⚡ FASTEST
                                </span>
                              )}
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-2">
                              📍 {restaurant.address}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {restaurant.cuisine.map((c, i) => (
                                <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                  {c}
                                </span>
                              ))}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Delivery Time:</span>
                                <div className="font-semibold text-green-600">
                                  ⏱️ {restaurant.estDeliveryTime} min
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Distance:</span>
                                <div className="font-semibold">
                                  📏 {restaurant.distanceFromUser}m
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Rating:</span>
                                <div className="font-semibold">
                                  ⭐ {restaurant.rating}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Queue:</span>
                                <div className="font-semibold text-blue-600">
                                  🍳 {restaurant.ordersInProgress} orders
                                </div>
                              </div>
                            </div>

                            {restaurant.availableRider && (
                              <div className="mt-3 p-2 bg-green-50 rounded border-l-4 border-green-400">
                                <div className="text-sm">
                                  <span className="text-green-700 font-medium">
                                    🏍️ Rider Available: {restaurant.availableRider.name}
                                  </span>
                                  <span className="text-green-600 ml-2">
                                    ({restaurant.availableRider.vehicleType}, ⭐ {restaurant.availableRider.rating})
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="ml-4">
                            <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-lg hover:from-red-600 hover:to-yellow-600 transition-all font-semibold">
                              Order Now
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">😔</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      No Emergency Restaurants Available
                    </h3>
                    <p className="text-gray-600 mb-4">
                      All nearby restaurants are either busy or don't have available riders right now.
                    </p>
                    <button
                      onClick={() => findEmergencyRestaurants(userLocation)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      🔄 Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HungerEmergencyMode;