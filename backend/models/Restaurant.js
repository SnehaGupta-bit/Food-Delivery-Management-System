import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;    // latitude
        },
        message: 'Invalid coordinates format'
      }
    }
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  ordersInProgress: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  cuisine: [{
    type: String,
    required: true
  }],
  rating: {
    type: Number,
    default: 4.0,
    min: 1,
    max: 5
  },
  averageDeliveryTime: {
    type: Number,
    default: 30 // minutes
  },
  isEmergencyEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries (production optimization)
restaurantSchema.index({ location: "2dsphere" });

// Additional indexes for performance
restaurantSchema.index({ isActive: 1, ordersInProgress: 1 });
restaurantSchema.index({ isActive: 1, isEmergencyEnabled: 1, ordersInProgress: 1 });

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;