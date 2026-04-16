import express from "express";
import Food from "../models/Food.js";

const router = express.Router();

// Get all foods
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find({ isAvailable: { $ne: false } });
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get food by ID
router.get("/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Seed database with menu items
router.post("/seed", async (req, res) => {
  try {
    const seedData = [
      { name: "Margherita Pizza", price: 299, originalPrice: 399, category: "Pizza", description: "Fresh basil, mozzarella, tomato sauce on thin crust", emoji: "🍕", badge: "hot", rating: 4.8, isVeg: true, prepTime: "20-25 min", restaurant: "Pizza Paradise", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80" },
      { name: "Pepperoni Pizza", price: 349, category: "Pizza", description: "Classic pepperoni with rich tomato base, extra cheese", emoji: "🍕", badge: "popular", rating: 4.7, isVeg: false, prepTime: "20-25 min", restaurant: "Pizza Paradise", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80" },
      { name: "Classic Smash Burger", price: 349, originalPrice: 449, category: "Burgers", description: "Double patty, cheddar, caramelised onion, secret sauce", emoji: "🍔", badge: "popular", rating: 4.9, isVeg: false, prepTime: "15-20 min", restaurant: "Burger Lab", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
      { name: "BBQ Bacon Burger", price: 399, category: "Burgers", description: "Smoky BBQ sauce, crispy bacon, pickles, onion rings", emoji: "🍔", badge: "hot", rating: 4.8, isVeg: false, prepTime: "15-20 min", restaurant: "Burger Lab", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80" },
      { name: "Salmon Sushi Platter", price: 599, category: "Sushi", description: "12 pieces, soy sauce & wasabi, premium atlantic salmon", emoji: "🍣", badge: "new", rating: 4.7, isVeg: false, prepTime: "25-30 min", restaurant: "Tokyo Bites", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80" },
      { name: "Tuna Roll", price: 449, category: "Sushi", description: "Fresh tuna, cucumber, sesame, soy & ginger", emoji: "🍣", rating: 4.6, isVeg: false, prepTime: "25-30 min", restaurant: "Tokyo Bites", image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&q=80" },
      { name: "Spicy Ramen Bowl", price: 389, originalPrice: 489, category: "Noodles", description: "Rich pork broth, soft egg, nori, bamboo shoots", emoji: "🍜", badge: "hot", rating: 4.8, isVeg: false, prepTime: "20-25 min", restaurant: "Ramen House", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80" },
      { name: "Pad Thai Noodles", price: 329, category: "Noodles", description: "Rice noodles, peanuts, tofu, tamarind, lime", emoji: "🍜", rating: 4.6, isVeg: true, prepTime: "15-20 min", restaurant: "Thai Street", image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&q=80" },
      { name: "Street Tacos (3 pcs)", price: 259, category: "Tacos", description: "Grilled chicken, fresh salsa, guacamole, lime", emoji: "🌮", badge: "popular", rating: 4.6, isVeg: false, prepTime: "10-15 min", restaurant: "Taco Fiesta", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80" },
      { name: "Beef Burrito", price: 299, category: "Tacos", description: "Slow-cooked beef, rice, beans, cheese, sour cream", emoji: "🌯", rating: 4.5, isVeg: false, prepTime: "15-20 min", restaurant: "Taco Fiesta", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80" },
      { name: "Caesar Salad", price: 229, category: "Salads", description: "Romaine, croutons, parmesan, caesar dressing", emoji: "🥗", badge: "new", rating: 4.4, isVeg: true, prepTime: "10 min", restaurant: "Green Bowl", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80" },
      { name: "Greek Salad", price: 219, category: "Salads", description: "Olives, feta, tomato, cucumber, oregano dressing", emoji: "🥗", rating: 4.5, isVeg: true, prepTime: "10 min", restaurant: "Green Bowl", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80" },
      { name: "Tiramisu Slice", price: 199, category: "Desserts", description: "Mascarpone cream, espresso-soaked ladyfinger, cocoa", emoji: "🍰", badge: "new", rating: 4.9, isVeg: true, prepTime: "5 min", restaurant: "Sweet Tooth", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80" },
      { name: "Chocolate Lava Cake", price: 229, category: "Desserts", description: "Warm molten centre, vanilla ice cream, berries", emoji: "🍫", badge: "popular", rating: 4.8, isVeg: true, prepTime: "15 min", restaurant: "Sweet Tooth", image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80" },
      { name: "Mango Lassi", price: 129, category: "Drinks", description: "Creamy yoghurt, fresh mango, cardamom, saffron", emoji: "🥤", rating: 4.7, isVeg: true, prepTime: "5 min", restaurant: "Chai Point", image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&q=80" },
      { name: "Cold Brew Coffee", price: 149, category: "Drinks", description: "Smooth 24hr cold brew, optional oat milk", emoji: "☕", badge: "new", rating: 4.6, isVeg: true, prepTime: "5 min", restaurant: "Brew Bar", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80" },
    ];

    await Food.deleteMany({});
    const foods = await Food.insertMany(seedData);
    res.json({ message: `Seeded ${foods.length} food items`, count: foods.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new food item
router.post("/add", async (req, res) => {
  try {
    const {
      name,
      price,
      originalPrice,
      category,
      description,
      emoji,
      badge,
      rating,
      isVeg,
      prepTime,
      restaurant,
      image,
      isAvailable
    } = req.body;

    // Validate required fields
    if (!name || !price || !category || !description) {
      return res.status(400).json({ 
        message: "Missing required fields: name, price, category, description" 
      });
    }

    const newFood = new Food({
      name,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category,
      description,
      emoji: emoji || "🍽️",
      badge: badge || null,
      rating: rating ? Number(rating) : 4.0,
      isVeg: Boolean(isVeg),
      prepTime: prepTime || "15-20 min",
      restaurant: restaurant || "QuickBite Kitchen",
      image: image || "",
      isAvailable: isAvailable !== false
    });

    const savedFood = await newFood.save();
    res.status(201).json({
      message: "Food item added successfully",
      food: savedFood
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update food item
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFood = await Food.findByIdAndUpdate(id, req.body, { 
      new: true, 
      runValidators: true 
    });
    
    if (!updatedFood) {
      return res.status(404).json({ message: "Food item not found" });
    }
    
    res.json({
      message: "Food item updated successfully",
      food: updatedFood
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete food item
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFood = await Food.findByIdAndDelete(id);
    
    if (!deletedFood) {
      return res.status(404).json({ message: "Food item not found" });
    }
    
    res.json({
      message: "Food item deleted successfully",
      food: deletedFood
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;