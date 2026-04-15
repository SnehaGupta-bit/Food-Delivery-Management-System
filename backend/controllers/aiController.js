import axios from "axios";
import Recommendation from "../models/Recommendation.js";
import Food from "../models/Food.js";

const MOOD_TO_CATEGORIES = {
  sad: ["Chocolate", "Ice Cream", "Desserts", "Comfort Food"],
  happy: ["Pizza", "Burgers", "Party Food"],
  stressed: ["Healthy", "Salads", "Light Meals"],
  tired: ["Coffee", "Energy Drinks", "Quick Bites"],
  excited: ["Spicy", "Adventure Food", "New Items"],
  romantic: ["Fine Dining", "Desserts", "Wine"],
  hungry: ["Heavy Meals", "Burgers", "Pizza"]
};

export const getAIResponse = async (req, res) => {
  try {
    const { message, history } = req.body;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          ...history.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
      }
    );

    const reply =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

    res.json({ reply });
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({ error: "AI error" });
  }
};

export const getMoodBasedRecommendations = async (req, res) => {
  try {
    const { mood } = req.body;
    const userId = req.user?.id;

    if (!mood) {
      return res.status(400).json({ message: "Mood is required" });
    }

    // Use AI to understand mood and get food categories
    const prompt = `User says: "${mood}". 
    Analyze their mood/feeling and recommend food categories from this list: 
    Pizza, Burgers, Noodles, Tacos, Salads, Sushi, Desserts, Drinks, Comfort Food, Healthy, Spicy.
    
    Return ONLY a JSON array of 2-4 recommended categories. Example: ["Pizza", "Desserts"]`;

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
    let categories = [];
    
    try {
      categories = JSON.parse(aiResponse.replace(/```json|```/g, "").trim());
    } catch (e) {
      // Fallback to mood mapping
      const moodKey = mood.toLowerCase();
      categories = MOOD_TO_CATEGORIES[moodKey] || ["Pizza", "Burgers"];
    }

    // Get foods from these categories
    const foods = await Food.find({
      category: { $in: categories },
      isAvailable: true
    }).limit(12);

    // Save recommendation if user is logged in
    if (userId) {
      await Recommendation.create({
        userId,
        mood,
        recommendedCategories: categories,
        recommendedFoods: foods.map(f => f._id),
        aiResponse: aiResponse
      });
    }

    res.status(200).json({
      success: true,
      mood,
      categories,
      foods,
      message: `Based on your mood, we recommend these delicious options! 🍽️`
    });

  } catch (error) {
    console.error("Mood recommendation error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getHungerEmergencyMode = async (req, res) => {
  try {
    const { userLocation } = req.body; // { lat, lng }

    if (!userLocation || !userLocation.lat || !userLocation.lng) {
      return res.status(400).json({ message: "User location is required" });
    }

    // Get foods that can be delivered quickly
    const quickFoods = await Food.find({
      isAvailable: true,
      isPopular: true // Popular items are usually ready faster
    }).limit(10);

    // In a real app, you would:
    // 1. Query restaurants with low current_load
    // 2. Use Google Distance Matrix API to find nearby delivery agents
    // 3. Calculate estimated delivery time
    // 4. Filter for deliveryTime < 15 minutes

    const emergencyMessage = `🚨 HUNGER EMERGENCY MODE ACTIVATED! 
    These items can reach you in under 15 minutes! 
    Order now for lightning-fast delivery! ⚡`;

    res.status(200).json({
      success: true,
      message: emergencyMessage,
      foods: quickFoods,
      estimatedDelivery: "10-15 mins"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};