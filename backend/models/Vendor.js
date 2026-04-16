import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^[6-9]\d{9}$/.test(v);
        },
        message: 'Please enter a valid 10-digit phone number'
      }
    },
    restaurantName: {
      type: String,
      required: true,
    },
    restaurantImage: {
      type: String,
      default: null,
    },
    cuisine: [{
      type: String,
      required: true,
    }],
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { 
        type: String, 
        required: true,
        validate: {
          validator: function(v) {
            return /^\d{6}$/.test(v);
          },
          message: 'Please enter a valid 6-digit PIN code'
        }
      },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
      }
    },
    businessLicense: {
      type: String,
      required: true,
    },
    fssaiNumber: {
      type: String,
      required: true,
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    deliveryTime: {
      type: String,
      default: "30-45 min",
    },
    minimumOrder: {
      type: Number,
      default: 100,
    },
    deliveryFee: {
      type: Number,
      default: 30,
    },
    openingHours: {
      monday: { open: String, close: String, isOpen: Boolean },
      tuesday: { open: String, close: String, isOpen: Boolean },
      wednesday: { open: String, close: String, isOpen: Boolean },
      thursday: { open: String, close: String, isOpen: Boolean },
      friday: { open: String, close: String, isOpen: Boolean },
      saturday: { open: String, close: String, isOpen: Boolean },
      sunday: { open: String, close: String, isOpen: Boolean },
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for full address
vendorSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
});

// Index for location-based queries
vendorSchema.index({ "address.coordinates": "2dsphere" });
vendorSchema.index({ cuisine: 1 });
vendorSchema.index({ rating: -1 });
vendorSchema.index({ isActive: 1, isVerified: 1 });

export default mongoose.model("Vendor", vendorSchema);