import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    mood: {
      type: String,
      required: true
    },

    recommendedCategories: [{
      type: String
    }],

    recommendedFoods: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food"
    }],

    aiResponse: {
      type: String
    },

    wasOrdered: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Recommendation", recommendationSchema);
