import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        foodId: {
          type: String,
          required: true
        },
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        image: String,
        selectedSize: {
          type: String,
          default: "Regular"
        }
      }
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    deliveryAddress: {
      type: String,
      required: true
    },

    customerDetails: {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
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
      address: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
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
      landmark: String,
      instructions: String
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD"
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending"
    },

    paymentId: {
      type: String,
      default: null
    },

    orderStatus: {
      type: String,
      enum: [
        "Placed",
        "Confirmed", 
        "Preparing",
        "Ready for Pickup",
        "Picked Up",
        "Out for Delivery",
        "Delivered",
        "Cancelled"
      ],
      default: "Placed"
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    deliveryLocation: {
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

    customerLocation: {
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

    statusHistory: [{
      status: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      note: String
    }],

    deliveryFee: {
      type: Number,
      default: 40
    },

    platformFee: {
      type: Number,
      default: 5
    },

    gst: {
      type: Number,
      default: 0
    },

    discount: {
      type: Number,
      default: 0
    },

    estimatedDeliveryTime: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 45 * 60 * 1000); // 45 minutes from now
      }
    },

    actualDeliveryTime: {
      type: Date,
      default: null
    },

    preparationTime: {
      type: Number, // in minutes
      default: 20
    },

    cancellationReason: {
      type: String,
      default: null
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },

    review: {
      type: String,
      default: null
    },

    deliveryPartnerRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },

    vendorRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for order number
orderSchema.virtual('orderNumber').get(function() {
  return `QB${this._id.toString().slice(-8).toUpperCase()}`;
});

// Index for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ vendorId: 1, createdAt: -1 });
orderSchema.index({ deliveryAgent: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ deliveryLocation: "2dsphere" });
orderSchema.index({ customerLocation: "2dsphere" });

export default mongoose.model("Order", orderSchema);