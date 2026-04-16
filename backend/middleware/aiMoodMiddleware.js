import { GoogleGenerativeAI } from "@google/generative-ai";
import Food from "../models/Food.js";

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// In-memory cache for mood mappings (use Redis in production)
const moodCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * AI Mood-Based Food Ordering Middleware
 * Converts user mood string into searchable food categories using Gemini 2.0 Flash
 */
export const analyzeMoodForFood = async (req, res, next) => {
  try {
    const { mood } = req.query;

    if (!mood || typeof mood !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Mood parameter is required as a string"
      });
    }

    const normalizedMood = mood.toLowerCase().trim();
    
    // Check cache first
    const cacheKey = `mood:${normalizedMood}`;
    const cached = moodCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log(`🧠 Cache hit for mood: ${normalizedMood}`);
      req.moodTags = cached.tags;
      return next();
    }

    console.log(`🤖 Analyzing mood with Gemini: "${mood}"`);

    // Initialize Gemini 2.0 Flash model with system instructions
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: `You are a culinary psychologist AI. Your role is to analyze human emotions and moods to recommend appropriate food categories that can help improve or complement that emotional state.

Rules:
1. Always return ONLY a valid JSON array of 3-5 food categories
2. Categories should be scientifically or culturally appropriate for the mood
3. Use specific, searchable food categories like "Comfort Food", "Dark Chocolate", "Herbal Tea"
4. Consider nutritional psychology and cultural food associations
5. Never include non-food items or explanations
6. Return only the JSON array, no additional text`,
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 200,
        responseMimeType: "application/json"
      }
    });

    // Craft the mood analysis prompt
    const prompt = `Analyze this user mood and return a JSON array of 3-5 food categories that would help with this emotional state:

User mood: "${mood}"

Examples:
- "stressed" → ["Comfort Food", "Dark Chocolate", "Herbal Tea", "Pasta", "Ice Cream"]
- "gym mood" → ["High Protein", "Smoothies", "Lean Meat", "Salad", "Energy Bars"]
- "sad and need comfort" → ["Comfort Food", "Chocolate", "Warm Soup", "Mac and Cheese", "Hot Chocolate"]
- "energetic and happy" → ["Fresh Fruits", "Smoothies", "Light Snacks", "Colorful Salads", "Green Tea"]
- "tired after work" → ["Coffee", "Energy Drinks", "Quick Snacks", "Sandwiches", "Pasta"]

Return ONLY the JSON array of food categories:`;

    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log(`🤖 Gemini raw response: ${text}`);

    // Parse the JSON response
    let foodTags;
    try {
      foodTags = JSON.parse(text);
      
      // Validate that it's an array
      if (!Array.isArray(foodTags)) {
        throw new Error("Response is not an array");
      }

      // Validate array contents
      if (foodTags.length === 0 || foodTags.some(tag => typeof tag !== 'string')) {
        throw new Error("Invalid array contents");
      }

    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      
      // Fallback mood mapping
      foodTags = getFallbackMoodTags(normalizedMood);
    }

    // Cache the result
    moodCache.set(cacheKey, {
      tags: foodTags,
      timestamp: Date.now()
    });

    console.log(`🎯 Mood "${mood}" mapped to tags:`, foodTags);

    // Attach tags to request for next middleware
    req.moodTags = foodTags;
    next();

  } catch (error) {
    console.error("AI Mood Analysis Error:", error);
    
    // Fallback to basic mood mapping
    const fallbackTags = getFallbackMoodTags(req.query.mood?.toLowerCase() || '');
    req.moodTags = fallbackTags;
    
    console.log(`⚠️ Using fallback tags for mood "${req.query.mood}":`, fallbackTags);
    next();
  }
};

/**
 * Database Integration: Find food items based on mood tags
 */
export const findFoodByMoodTags = async (req, res) => {
  try {
    const { moodTags } = req;
    const { limit = 12, page = 1 } = req.query;

    if (!moodTags || !Array.isArray(moodTags)) {
      return res.status(400).json({
        success: false,
        message: "Mood tags not found. Please ensure mood analysis completed."
      });
    }

    console.log(`🔍 Searching foods with tags:`, moodTags);

    // Create regex patterns for flexible matching
    const tagRegexes = moodTags.map(tag => new RegExp(tag, 'i'));

    // MongoDB query to find foods matching mood tags
    const query = {
      $or: [
        { category: { $in: tagRegexes } },
        { name: { $in: tagRegexes } },
        { description: { $regex: tagRegexes.map(r => r.source).join('|'), $options: 'i' } }
      ],
      isAvailable: { $ne: false }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [foods, totalCount] = await Promise.all([
      Food.find(query)
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ rating: -1, createdAt: -1 }),
      Food.countDocuments(query)
    ]);

    // If no direct matches, try broader category search
    if (foods.length === 0) {
      console.log("🔄 No direct matches, trying broader search...");
      
      const broadQuery = {
        $or: [
          { category: { $regex: 'comfort|dessert|snack|drink', $options: 'i' } },
          { name: { $regex: 'chocolate|coffee|tea|pizza|burger', $options: 'i' } }
        ],
        isAvailable: { $ne: false }
      };

      const [broadFoods, broadCount] = await Promise.all([
        Food.find(broadQuery).limit(parseInt(limit)).sort({ rating: -1 }),
        Food.countDocuments(broadQuery)
      ]);

      return res.json({
        success: true,
        message: `Found ${broadCount} comfort foods for your mood`,
        mood: req.query.mood,
        moodTags: moodTags,
        foods: broadFoods,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(broadCount / parseInt(limit)),
          totalItems: broadCount,
          itemsPerPage: parseInt(limit)
        },
        searchType: "broad_match"
      });
    }

    // Add mood relevance score to each food item
    const foodsWithScore = foods.map(food => {
      let relevanceScore = 0;
      
      moodTags.forEach(tag => {
        const tagLower = tag.toLowerCase();
        if (food.category?.toLowerCase().includes(tagLower)) relevanceScore += 3;
        if (food.name?.toLowerCase().includes(tagLower)) relevanceScore += 2;
        if (food.description?.toLowerCase().includes(tagLower)) relevanceScore += 1;
      });

      return {
        ...food.toObject(),
        moodRelevanceScore: relevanceScore,
        matchedTags: moodTags.filter(tag => 
          food.category?.toLowerCase().includes(tag.toLowerCase()) ||
          food.name?.toLowerCase().includes(tag.toLowerCase()) ||
          food.description?.toLowerCase().includes(tag.toLowerCase())
        )
      };
    });

    // Sort by relevance score
    foodsWithScore.sort((a, b) => b.moodRelevanceScore - a.moodRelevanceScore);

    res.json({
      success: true,
      message: `Found ${totalCount} foods perfect for your mood!`,
      mood: req.query.mood,
      moodTags: moodTags,
      foods: foodsWithScore,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      },
      searchType: "mood_based",
      aiAnalysis: {
        model: "gemini-1.5-flash-latest",
        cached: moodCache.has(`mood:${req.query.mood?.toLowerCase().trim()}`)
      }
    });

  } catch (error) {
    console.error("Food search error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to find foods for your mood",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Fallback mood mapping for when AI fails
 */
function getFallbackMoodTags(mood) {
  const fallbackMap = {
    'sad': ['Comfort Food', 'Chocolate', 'Ice Cream', 'Warm Soup'],
    'happy': ['Pizza', 'Celebration', 'Desserts', 'Party Food'],
    'stressed': ['Comfort Food', 'Dark Chocolate', 'Herbal Tea', 'Pasta'],
    'tired': ['Coffee', 'Energy Drinks', 'Quick Snacks', 'Sandwiches'],
    'energetic': ['Fresh Fruits', 'Smoothies', 'Light Snacks', 'Salads'],
    'romantic': ['Wine', 'Chocolate', 'Fine Dining', 'Desserts'],
    'gym': ['High Protein', 'Smoothies', 'Lean Meat', 'Salads'],
    'sick': ['Soup', 'Herbal Tea', 'Light Food', 'Warm Drinks'],
    'celebration': ['Pizza', 'Cake', 'Party Food', 'Drinks'],
    'comfort': ['Comfort Food', 'Mac and Cheese', 'Hot Chocolate', 'Pasta']
  };

  // Find matching mood or return default
  for (const [key, tags] of Object.entries(fallbackMap)) {
    if (mood.includes(key)) {
      return tags;
    }
  }

  return ['Comfort Food', 'Popular', 'Recommended', 'Favorites'];
}

/**
 * Clear mood cache (for testing/admin purposes)
 */
export const clearMoodCache = (req, res) => {
  moodCache.clear();
  res.json({
    success: true,
    message: "Mood cache cleared successfully"
  });
};