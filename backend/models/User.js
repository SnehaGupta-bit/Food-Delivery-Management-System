import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
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
      required: function () {
        return this.authProvider !== "google";
      },
      minlength: 6,
    },

    googleId: {
      type: String,
      default: null,
    },

    avatar: {
      type: String,
      default: null,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    role: {
      type: String,
      enum: ["customer", "admin", "vendor", "delivery_partner"],
      default: "customer",
    },

    // Additional profile fields
    phone: {
      type: String,
      default: null,
    },

    address: {
      type: String,
      default: null,
    },

    city: {
      type: String,
      default: null,
    },

    state: {
      type: String,
      default: null,
    },

    pincode: {
      type: String,
      default: null,
    },

    // Vendor-specific fields
    restaurantName: {
      type: String,
      default: null,
    },

    restaurantAddress: {
      type: String,
      default: null,
    },

    fssaiLicense: {
      type: String,
      default: null,
    },

    gstNumber: {
      type: String,
      default: null,
    },

    bankAccountNumber: {
      type: String,
      default: null,
    },

    ifscCode: {
      type: String,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationDocuments: [{
      type: String,
    }],

    // Delivery Partner specific fields
    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "bicycle", "car", null],
      default: null,
    },

    vehicleNumber: {
      type: String,
      default: null,
    },

    drivingLicense: {
      type: String,
      default: null,
    },

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    totalDeliveries: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },

    earnings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 🔐 Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (!this.password) return next(); // Skip for Google auth

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Create geospatial index for delivery partner location
userSchema.index({ currentLocation: "2dsphere" });

export default mongoose.model("User", userSchema);