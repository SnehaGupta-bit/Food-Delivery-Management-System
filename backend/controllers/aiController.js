import axios from "axios";
import Food from "../models/Food.js";

// QuickBite menu database
const QUICKBITE_MENU = [
  { _id: "1", name: "Margherita Pizza", emoji: "🍕", price: 299, category: "Pizza", description: "Classic cheese pizza with fresh basil" },
  { _id: "2", name: "Pepperoni Pizza", emoji: "🍕", price: 349, category: "Pizza", description: "Loaded with pepperoni slices" },
  { _id: "3", name: "Classic Smash Burger", emoji: "🍔", price: 349, category: "Burgers", description: "Juicy beef patty with special sauce" },
  { _id: "4", name: "BBQ Bacon Burger", emoji: "🍔", price: 399, category: "Burgers", description: "BBQ sauce, bacon, and cheese" },
  { _id: "5", name: "Salmon Sushi Platter", emoji: "🍣", price: 599, category: "Sushi", description: "Fresh salmon sushi rolls" },
  { _id: "6", name: "Tuna Roll", emoji: "🍣", price: 449, category: "Sushi", description: "Premium tuna sushi" },
  { _id: "7", name: "Spicy Ramen Bowl", emoji: "🍜", price: 389, category: "Noodles", description: "Hot and spicy ramen noodles" },
  { _id: "8", name: "Pad Thai Noodles", emoji: "🍜", price: 329, category: "Noodles", description: "Thai-style stir-fried noodles" },
  { _id: "9", name: "Street Tacos", emoji: "🌮", price: 259, category: "Tacos", description: "Authentic street-style tacos" },
  { _id: "10", name: "Beef Burrito", emoji: "🌯", price: 299, category: "Tacos", description: "Wrapped beef burrito" },
  { _id: "11", name: "Caesar Salad", emoji: "🥗", price: 229, category: "Salads", description: "Fresh romaine with Caesar dressing" },
  { _id: "12", name: "Greek Salad", emoji: "🥗", price: 219, category: "Salads", description: "Mediterranean-style salad" },
  { _id: "13", name: "Tiramisu Slice", emoji: "🍰", price: 199, category: "Desserts", description: "Italian coffee-flavored dessert" },
  { _id: "14", name: "Chocolate Lava Cake", emoji: "🍫", price: 229, category: "Desserts", description: "Warm chocolate cake with molten center" },
  { _id: "15", name: "Mango Lassi", emoji: "🥤", price: 129, category: "Drinks", description: "Refreshing mango yogurt drink" },
  { _id: "16", name: "Cold Brew Coffee", emoji: "☕", price: 149, category: "Drinks", description: "Smooth cold brew coffee" },
  { _id: "17", name: "Butter Chicken", emoji: "🍛", price: 329, category: "Indian", description: "Creamy butter chicken curry" },
  { _id: "18", name: "Chicken Tikka Pizza", emoji: "🍕", price: 399, category: "Pizza", description: "Pizza with chicken tikka topping" },
  { _id: "19", name: "Chicken Biryani", emoji: "🍛", price: 249, category: "Biryani", description: "Aromatic chicken biryani" },
  { _id: "20", name: "Paneer Butter Masala", emoji: "🍲", price: 199, category: "Indian", description: "Cottage cheese in rich gravy" }
];

// Intelligent product recommendation based on user query
const getRecommendedProducts = (message) => {
  const msg = message.toLowerCase();
  let recommendations = [];

  // Keyword-based matching
  if (msg.includes('spicy') || msg.includes('hot') || msg.includes('heat')) {
    recommendations = QUICKBITE_MENU.filter(item => 
      ['Spicy Ramen Bowl', 'BBQ Bacon Burger', 'Chicken Tikka Pizza'].includes(item.name)
    );
  } else if (msg.includes('pizza')) {
    recommendations = QUICKBITE_MENU.filter(item => item.category === 'Pizza');
  } else if (msg.includes('burger')) {
    recommendations = QUICKBITE_MENU.filter(item => item.category === 'Burgers');
  } else if (msg.includes('healthy') || msg.includes('salad') || msg.includes('diet') || msg.includes('light')) {
    recommendations = QUICKBITE_MENU.filter(item => item.category === 'Salads');
  } else if (msg.includes('sweet') || msg.includes('dessert') || msg.includes('cake') || msg.includes('chocolate')) {
    recommendations = QUICKBITE_MENU.filter(item => item.category === 'Desserts');
  } else if (msg.includes('drink') || msg.includes('beverage') || msg.includes('coffee') || msg.includes('lassi')) {
    recommendations = QUICKBITE_MENU.filter(item => item.category === 'Drinks');
  } else if (msg.includes('indian') || msg.includes('curry') || msg.includes('biryani') || msg.includes('paneer')) {
    recommendations = QUICKBITE_MENU.filter(item => item.category === 'Indian' || item.category === 'Biryani');
  } else if (msg.includes('sushi') || msg.includes('japanese')) {
    recommendations = QUICKBITE_MENU.filter(item => item.category === 'Sushi');
  } else if (msg.includes('noodles') || msg.includes('ramen') || msg.includes('thai')) {
    recommendations = QUICKBITE_MENU.filter(item => item.category === 'Noodles');
  } else if (msg.includes('taco') || msg.includes('burrito') || msg.includes('mexican')) {
    recommendations = QUICKBITE_MENU.filter(item => item.category === 'Tacos');
  } else if (msg.includes('cheap') || msg.includes('budget') || msg.includes('affordable') || msg.includes('300')) {
    recommendations = QUICKBITE_MENU.filter(item => item.price <= 300).slice(0, 4);
  } else if (msg.includes('popular') || msg.includes('best') || msg.includes('recommend')) {
    recommendations = [
      QUICKBITE_MENU.find(item => item.name === 'Margherita Pizza'),
      QUICKBITE_MENU.find(item => item.name === 'BBQ Bacon Burger'),
      QUICKBITE_MENU.find(item => item.name === 'Spicy Ramen Bowl'),
      QUICKBITE_MENU.find(item => item.name === 'Chocolate Lava Cake')
    ].filter(Boolean);
  } else if (msg.includes('sad') || msg.includes('down') || msg.includes('comfort')) {
    recommendations = [
      QUICKBITE_MENU.find(item => item.name === 'Chocolate Lava Cake'),
      QUICKBITE_MENU.find(item => item.name === 'Margherita Pizza'),
      QUICKBITE_MENU.find(item => item.name === 'Spicy Ramen Bowl')
    ].filter(Boolean);
  } else if (msg.includes('happy') || msg.includes('celebrate') || msg.includes('party')) {
    recommendations = QUICKBITE_MENU.filter(item => item.category === 'Pizza').slice(0, 3);
  }

  // Return top 4 recommendations or popular items
  if (recommendations.length === 0) {
    recommendations = [
      QUICKBITE_MENU.find(item => item.name === 'Margherita Pizza'),
      QUICKBITE_MENU.find(item => item.name === 'Classic Smash Burger'),
      QUICKBITE_MENU.find(item => item.name === 'Spicy Ramen Bowl'),
      QUICKBITE_MENU.find(item => item.name === 'Caesar Salad')
    ].filter(Boolean);
  }

  return recommendations.slice(0, 4);
};

export const getAIResponse = async (req, res) => {
  try {
    const { message, history } = req.body;

    // Get product recommendations based on query
    const recommendedProducts = getRecommendedProducts(message);

    // Build context for Gemini with QuickBite menu
    const menuContext = QUICKBITE_MENU.map(item => 
      `${item.name} (${item.emoji}) - ₹${item.price} - ${item.description}`
    ).join('\n');

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`,
        {
          contents: [
            {
              parts: [{ 
                text: `You are QuickBite AI, a friendly food delivery chatbot assistant for QuickBite restaurant. 

IMPORTANT RULES:
1. ONLY recommend food items from the QuickBite menu below
2. DO NOT suggest items not on this menu
3. Keep responses under 60 words
4. Use food emojis and be enthusiastic
5. Focus on helping customers find the perfect meal from OUR menu

QUICKBITE MENU:
${menuContext}

User message: ${message}

Provide a helpful, friendly response recommending items from the QuickBite menu above.` 
              }]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.GEMINI_API_KEY
          }
        }
      );

      const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (reply) {
        return res.json({ 
          reply,
          products: recommendedProducts
        });
      }
    } catch (geminiError) {
      console.log("Gemini API error:", geminiError.response?.data || geminiError.message);
    }

    // Fallback response with smart recommendations
    const fallbackReplies = {
      spicy: "🌶️ Craving heat? Try our Spicy Ramen Bowl or BBQ Bacon Burger! Perfect for spice lovers! 🔥",
      pizza: "🍕 Pizza time! Our Margherita Pizza is a classic, or go bold with Pepperoni Pizza! 🧀",
      burger: "🍔 Burger cravings? The Classic Smash Burger is amazing, or try our BBQ Bacon Burger! 🥓",
      healthy: "🥗 Going healthy? Caesar Salad or Greek Salad - fresh and satisfying! 🌿",
      sweet: "🍰 Sweet tooth? Tiramisu Slice or Chocolate Lava Cake will hit the spot! 🍫",
      sad: "🤗 Comfort food time! Try our Chocolate Lava Cake or creamy Spicy Ramen Bowl! 💕",
      indian: "🍛 Indian cravings? Butter Chicken, Chicken Biryani, or Paneer Butter Masala! 🔥",
      cheap: "💰 Budget picks: Mango Lassi (₹129), Caesar Salad (₹229), Street Tacos (₹259)! 🌮"
    };

    let fallbackReply = "🍽️ What are you craving? Pizza, burgers, Indian, sushi, or something sweet? I'll help you find the perfect meal! 🤤";
    
    const msg = message.toLowerCase();
    for (const [key, reply] of Object.entries(fallbackReplies)) {
      if (msg.includes(key)) {
        fallbackReply = reply;
        break;
      }
    }

    res.json({ 
      reply: fallbackReply,
      products: recommendedProducts
    });

  } catch (error) {
    console.log("AI Error:", error.message);
    res.json({ 
      reply: "🤖 I'm here to help! What are you craving from QuickBite? Pizza, burgers, Indian food, or something else? 🍕🍔🍛",
      products: getRecommendedProducts("popular")
    });
  }
};

export const getMoodSuggestion = async (req, res) => {
  try {
    const { mood } = req.body;

    // Simple mood-to-food mapping
    const moodMap = {
      sad: ["Desserts", "Pizza", "Burgers"],
      happy: ["Pizza", "Tacos", "Sushi"],
      tired: ["Drinks", "Burgers", "Noodles"],
      stressed: ["Desserts", "Pizza", "Drinks"],
      excited: ["Tacos", "Sushi", "Pizza"],
      hungry: ["Burgers", "Pizza", "Noodles"]
    };

    const moodLower = mood.toLowerCase();
    let categories = [];
    
    for (const [key, cats] of Object.entries(moodMap)) {
      if (moodLower.includes(key)) {
        categories = cats;
        break;
      }
    }

    if (categories.length === 0) {
      categories = ["Pizza", "Burgers", "Desserts"];
    }

    // Find matching foods
    const foods = await Food.find({
      category: { $in: categories.map(c => new RegExp(c, "i")) },
      isAvailable: { $ne: false },
    }).limit(8);

    res.json({ categories, foods, mood });
  } catch (error) {
    console.log("Mood suggestion error:", error.message);
    res.status(500).json({ error: "Mood suggestion failed" });
  }
};

export const getEmergencyFood = async (req, res) => {
  try {
    // Return fastest delivery items
    const foods = await Food.find({ isAvailable: { $ne: false } })
      .sort({ prepTime: 1 })
      .limit(6);

    res.json({
      foods,
      message: "⚡ Ultra-fast delivery items — estimated under 15 minutes!",
    });
  } catch (error) {
    console.log("Emergency food error:", error.message);
    res.status(500).json({ error: "Emergency mode failed" });
  }
};