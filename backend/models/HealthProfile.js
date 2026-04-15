import mongoose from "mongoose";

const healthProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    dietType: {
      type: String,
      enum: ["None", "Vegetarian", "Vegan", "Keto", "Paleo", "GymDiet"],
      default: "None"
    },

    allergies: [{
      type: String
    }],

    healthConditions: [{
      type: String,
      enum: ["Diabetic", "Hypertension", "HeartDisease", "Celiac", "LactoseIntolerant"]
    }],

    calorieGoal: {
      type: Number,
      default: 2000
    },

    restrictions: [{
      type: String
    }],

    preferences: {
      spicyLevel: {
        type: String,
        enum: ["None", "Mild", "Medium", "Hot", "ExtraHot"],
        default: "Medium"
      },
      sweetness: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Medium"
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("HealthProfile", healthProfileSchema);
