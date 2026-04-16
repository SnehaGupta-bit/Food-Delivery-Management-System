import { GoogleGenerativeAI } from "@google/generative-ai";
import multer from "multer";
import path from "path";

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Multer middleware for single image upload
export const uploadMenuImage = upload.single('menuImage');

/**
 * Smart Health Food Scanner Middleware
 * Analyzes menu images against user health profiles using Gemini 2.0 Flash Multimodal
 */
export const analyzeMenuForHealth = async (req, res) => {
  try {
    // Validate image upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Menu image is required. Please upload an image file."
      });
    }

    // Parse user health profile
    let userProfile;
    try {
      userProfile = typeof req.body.userProfile === 'string' 
        ? JSON.parse(req.body.userProfile) 
        : req.body.userProfile;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid user profile format. Expected JSON object with condition and goal fields."
      });
    }

    // Validate user profile
    if (!userProfile || !userProfile.condition) {
      return res.status(400).json({
        success: false,
        message: "User profile must include 'condition' field (e.g., 'Diabetic', 'Heart Disease', 'Weight Loss')"
      });
    }

    console.log(`🔍 Analyzing menu image for health profile:`, userProfile);
    console.log(`📸 Image size: ${req.file.size} bytes, type: ${req.file.mimetype}`);

    // Initialize Gemini 2.0 Flash multimodal model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: `You are a certified nutritionist and health advisor AI. Your role is to analyze food menu images and provide health recommendations based on specific medical conditions and dietary goals.

Rules:
1. Analyze every visible food item in the menu image
2. Provide nutritional estimates based on typical serving sizes
3. Consider the user's specific health condition when making recommendations
4. Return ONLY a valid JSON array of objects with the exact schema provided
5. Be conservative with health recommendations - when in doubt, mark as "Caution"
6. Provide clear, actionable reasoning for each recommendation`,
      generationConfig: {
        temperature: 0.2,
        topK: 32,
        topP: 0.8,
        maxOutputTokens: 2000,
        responseMimeType: "application/json"
      }
    });

    // Convert image buffer to Gemini-compatible format
    const imageData = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype
      }
    };

    // Craft the health analysis prompt
    const prompt = `Analyze this menu image and provide health recommendations for a user with the following profile:

User Health Profile: ${JSON.stringify(userProfile)}

For every visible food item in the menu, perform a nutritional estimation and health analysis. Return a JSON array of objects with this exact schema:

{
  "itemName": "string - exact name of the food item as shown in menu",
  "estimatedCalories": "number - estimated calories per typical serving",
  "suitability": "string - one of: 'Safe', 'Caution', 'Avoid'",
  "reasoning": "string - one sentence explanation based on the health condition"
}

Health Guidelines:
- For Diabetic users: Avoid high sugar, refined carbs. Safe: lean proteins, vegetables, whole grains
- For Weight Loss: Avoid high calorie, fried foods. Safe: salads, grilled items, low-calorie options
- For Heart Disease: Avoid high sodium, saturated fats. Safe: lean proteins, vegetables, low-sodium options
- For High Blood Pressure: Avoid high sodium foods. Safe: fresh vegetables, lean proteins, low-sodium items
- For Vegetarian/Vegan: Consider dietary restrictions in recommendations

Examples:
- "Grilled Chicken Salad" for Diabetic → "Safe" - "Low in carbs, high in protein, good for blood sugar control"
- "Chocolate Cake" for Weight Loss → "Avoid" - "High in calories and sugar, not suitable for weight loss goals"
- "French Fries" for Heart Disease → "Avoid" - "High in saturated fats and sodium, harmful for heart health"

Return ONLY the JSON array:`;

    // Generate content with Gemini multimodal
    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();

    console.log(`🤖 Gemini multimodal response length: ${text.length} characters`);

    // Parse the JSON response
    let menuAnalysis;
    try {
      menuAnalysis = JSON.parse(text);
      
      // Validate response structure
      if (!Array.isArray(menuAnalysis)) {
        throw new Error("Response is not an array");
      }

      // Validate each item in the array
      menuAnalysis.forEach((item, index) => {
        if (!item.itemName || !item.estimatedCalories || !item.suitability || !item.reasoning) {
          throw new Error(`Invalid item structure at index ${index}`);
        }
        
        if (!['Safe', 'Caution', 'Avoid'].includes(item.suitability)) {
          throw new Error(`Invalid suitability value at index ${index}: ${item.suitability}`);
        }
      });

    } catch (parseError) {
      console.error("Failed to parse Gemini multimodal response:", parseError);
      console.log("Raw response:", text);
      
      return res.status(500).json({
        success: false,
        message: "Failed to analyze menu image. The AI response was not in the expected format.",
        error: process.env.NODE_ENV === 'development' ? parseError.message : undefined
      });
    }

    // Calculate health statistics
    const stats = {
      totalItems: menuAnalysis.length,
      safeItems: menuAnalysis.filter(item => item.suitability === 'Safe').length,
      cautionItems: menuAnalysis.filter(item => item.suitability === 'Caution').length,
      avoidItems: menuAnalysis.filter(item => item.suitability === 'Avoid').length,
      averageCalories: Math.round(
        menuAnalysis.reduce((sum, item) => sum + item.estimatedCalories, 0) / menuAnalysis.length
      )
    };

    // Generate health summary
    const healthSummary = generateHealthSummary(userProfile, stats);

    console.log(`✅ Successfully analyzed ${stats.totalItems} menu items`);

    res.json({
      success: true,
      message: `Successfully analyzed ${stats.totalItems} menu items for your health profile`,
      userProfile: userProfile,
      menuAnalysis: menuAnalysis,
      healthStats: stats,
      healthSummary: healthSummary,
      recommendations: {
        bestChoices: menuAnalysis
          .filter(item => item.suitability === 'Safe')
          .sort((a, b) => a.estimatedCalories - b.estimatedCalories)
          .slice(0, 3),
        itemsToAvoid: menuAnalysis
          .filter(item => item.suitability === 'Avoid')
          .sort((a, b) => b.estimatedCalories - a.estimatedCalories)
          .slice(0, 3)
      },
      aiAnalysis: {
        model: "gemini-1.5-flash-latest",
        imageSize: req.file.size,
        processingTime: Date.now()
      }
    });

  } catch (error) {
    console.error("Health Scanner Error:", error);
    
    res.status(500).json({
      success: false,
      message: "Failed to analyze menu for health recommendations",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generate health summary based on analysis results
 */
function generateHealthSummary(userProfile, stats) {
  const { condition, goal } = userProfile;
  const safePercentage = Math.round((stats.safeItems / stats.totalItems) * 100);
  
  let summary = `Based on your ${condition} condition`;
  if (goal) {
    summary += ` and ${goal} goal`;
  }
  summary += `, we found ${stats.safeItems} safe options out of ${stats.totalItems} menu items (${safePercentage}%).`;

  // Add condition-specific advice
  if (condition.toLowerCase().includes('diabetic')) {
    summary += " Focus on lean proteins and vegetables while avoiding high-sugar items.";
  } else if (condition.toLowerCase().includes('heart')) {
    summary += " Choose low-sodium, lean options and avoid fried foods.";
  } else if (goal && goal.toLowerCase().includes('weight loss')) {
    summary += " Opt for lower-calorie, nutrient-dense options.";
  }

  if (stats.avoidItems > stats.safeItems) {
    summary += " ⚠️ This menu has limited healthy options for your profile. Consider asking about modifications or choosing a different restaurant.";
  } else if (stats.safeItems >= stats.totalItems * 0.5) {
    summary += " ✅ This menu offers good healthy choices for your dietary needs!";
  }

  return summary;
}

/**
 * Health profile validation middleware
 */
export const validateHealthProfile = (req, res, next) => {
  const validConditions = [
    'Diabetic', 'Heart Disease', 'High Blood Pressure', 'Weight Loss', 
    'Weight Gain', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 
    'Low Sodium', 'Low Fat', 'High Protein', 'None'
  ];

  const validGoals = [
    'Weight Loss', 'Weight Gain', 'Muscle Building', 'Heart Health',
    'Blood Sugar Control', 'General Health', 'Athletic Performance', 'None'
  ];

  // Set default profile if none provided
  if (!req.body.userProfile) {
    req.body.userProfile = {
      condition: 'None',
      goal: 'General Health'
    };
  }

  next();
};