import mongoose from "mongoose";

const riderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
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
  status: {
    type: String,
    enum: ['idle', 'busy', 'offline'],
    required: true,
    default: 'idle'
  },
  isOnline: {
    type: Boolean,
    required: true,
    default: false
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'scooter', 'bicycle', 'car'],
    required: true,
    default: 'bike'
  },
  rating: {
    type: Number,
    default: 4.0,
    min: 1,
    max: 5
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  currentOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  lastLocationUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries (production optimization)
riderSchema.index({ location: "2dsphere" });

// Additional indexes for performance
riderSchema.index({ status: 1, isOnline: 1 });
riderSchema.index({ isOnline: 1, status: 1, location: "2dsphere" });

const Rider = mongoose.model("Rider", riderSchema);

export default Rider;