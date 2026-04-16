import express from "express";
import { 
  analyzeMoodForFood, 
  findFoodByMoodTags, 
  clearMoodCache 
} from "../middleware/aiMoodMiddleware.js";
import { 
  uploadMenuImage, 
  analyzeMenuForHealth, 
  validateHealthProfile 
} from "../middleware/aiHealthScannerMiddleware.js";

const router = express.Router();

// ============================================
// AI MOOD-BASED FOOD ORDERING ROUTES
// ============================================

/**
 * GET /api/ai-advanced/mood-food?mood=stressed
 * Analyze user mood and return matching food recommendations
 */
router.get("/mood-food", analyzeMoodForFood, findFoodByMoodTags);

/**
 * POST /api/ai-advanced/clear-mood-cache
 * Clear the mood analysis cache (admin/testing)
 */
router.post("/clear-mood-cache", clearMoodCache);

// ============================================
// SMART HEALTH FOOD SCANNER ROUTES
// ============================================

/**
 * POST /api/ai-advanced/scan-menu
 * Analyze menu image against user health profile
 * 
 * Body (multipart/form-data):
 * - menuImage: Image file (required)
 * - userProfile: JSON string with condition and goal (required)
 * 
 * Example userProfile:
 * {
 *   "condition": "Diabetic",
 *   "goal": "Weight Loss"
 * }
 */
router.post("/scan-menu", 
  validateHealthProfile,
  uploadMenuImage, 
  analyzeMenuForHealth
);

/**
 * GET /api/ai-advanced/health-conditions
 * Get list of supported health conditions and goals
 */
router.get("/health-conditions", (req, res) => {
  res.json({
    success: true,
    supportedConditions: [
      'Diabetic',
      'Heart Disease', 
      'High Blood Pressure',
      'Weight Loss',
      'Weight Gain',
      'Vegetarian',
      'Vegan', 
      'Gluten-Free',
      'Keto',
      'Low Sodium',
      'Low Fat',
      'High Protein',
      'None'
    ],
    supportedGoals: [
      'Weight Loss',
      'Weight Gain', 
      'Muscle Building',
      'Heart Health',
      'Blood Sugar Control',
      'General Health',
      'Athletic Performance',
      'None'
    ],
    examples: [
      {
        condition: "Diabetic",
        goal: "Blood Sugar Control",
        description: "Focuses on low-carb, low-sugar options"
      },
      {
        condition: "Heart Disease", 
        goal: "Heart Health",
        description: "Emphasizes low-sodium, lean protein options"
      },
      {
        condition: "None",
        goal: "Weight Loss", 
        description: "Highlights low-calorie, nutrient-dense foods"
      }
    ]
  });
});

/**
 * GET /api/ai-advanced/test-mood
 * Test endpoint for mood analysis with sample moods
 */
router.get("/test-mood", (req, res) => {
  const sampleMoods = [
    "I'm feeling stressed after a long day at work",
    "Happy and celebrating with friends", 
    "Sad and need some comfort food",
    "Energetic after my workout session",
    "Tired and need something quick",
    "Romantic dinner mood",
    "Sick and need something light",
    "Feeling adventurous and want to try new flavors"
  ];

  res.json({
    success: true,
    message: "Test these sample moods with the mood-food endpoint",
    sampleMoods: sampleMoods,
    usage: "GET /api/ai-advanced/mood-food?mood=YOUR_MOOD_HERE",
    examples: sampleMoods.map(mood => ({
      mood: mood,
      url: `/api/ai-advanced/mood-food?mood=${encodeURIComponent(mood)}`
    }))
  });
});

export default router;