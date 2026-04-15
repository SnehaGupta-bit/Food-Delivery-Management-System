import HealthProfile from "../models/HealthProfile.js";
import Food from "../models/Food.js";
import axios from "axios";

export const createHealthProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dietType, allergies, healthConditions, calorieGoal, restrictions, preferences } = req.body;

    // Check if profile already exists
    let profile = await HealthProfile.findOne({ userId });

    if (profile) {
      // Update existing profile
      profile = await HealthProfile.findOneAndUpdate(
        { userId },
        { dietType, allergies, healthConditions, calorieGoal, restrictions, preferences },
        { new: true }
      );
    } else {
      // Create new profile
      profile = await HealthProfile.create({
        userId,
        dietType,
        allergies,
        healthConditions,
        calorieGoal,
        restrictions,
        preferences
      });
    }

    res.status(201).json({
      success: true,
      profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHealthProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await HealthProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: "Health profile not found" });
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHealthyRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await HealthProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: "Please create a health profile first" });
    }

    // Build filter based on health profile
    const filter = { isAvailable: true };

    if (profile.dietType === "Vegetarian" || profile.dietType === "Vegan") {
      filter.isVeg = true;
    }

    // Get all foods
    let foods = await Food.find(filter);

    // Use AI to filter based on health conditions
    if (profile.healthConditions.length > 0) {
      const prompt = `Given these health conditions: ${profile.healthConditions.join(", ")}, 
      and these food items: ${foods.map(f => f.name).join(", ")}, 
      return a JSON array of food names that are safe and recommended. 
      Only return the JSON array, no other text.`;

      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{
              role: "user",
              parts: [{ text: prompt }]
            }]
          }
        );

        const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        const recommendedNames = JSON.parse(aiResponse.replace(/```json|```/g, "").trim());

        foods = foods.filter(f => recommendedNames.includes(f.name));
      } catch (aiError) {
        console.error("AI filtering error:", aiError);
      }
    }

    res.status(200).json({
      success: true,
      count: foods.length,
      foods
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const scanFoodLabel = async (req, res) => {
  try {
    const { imageUrl, foodName } = req.body;
    const userId = req.user.id;

    const profile = await HealthProfile.findOne({ userId });

    const prompt = `Analyze this food item: "${foodName}". 
    ${profile ? `The user has these health conditions: ${profile.healthConditions.join(", ")} and follows a ${profile.dietType} diet.` : ""}
    Provide:
    1. Estimated calories
    2. Main ingredients
    3. Health warnings (if any)
    4. Suitability score (1-10)
    5. Alternative suggestions
    
    Return as JSON with keys: calories, ingredients, warnings, score, alternatives`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }]
      }
    );

    const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const analysis = JSON.parse(aiResponse.replace(/```json|```/g, "").trim());

    res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
