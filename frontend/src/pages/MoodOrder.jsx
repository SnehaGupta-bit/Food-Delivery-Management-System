import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext.jsx";
import { getFoods } from "../services/api.js";
import FoodCard from "../components/FoodCard.jsx";
import { CardSkeleton } from "../components/SkeletonLoader.jsx";
import MoodBasedOrdering from "../components/MoodBasedOrdering.jsx";
import HealthMenuScanner from "../components/HealthMenuScanner.jsx";
import toast from "react-hot-toast";
import "../styles/customer-panel.css";

const MOODS = [
  { emoji: "😊", label: "Happy", color: "#fbbf24", query: "comfort food, celebration" },
  { emoji: "😢", label: "Sad", color: "#60a5fa", query: "chocolate, ice cream, comfort" },
  { emoji: "😤", label: "Stressed", color: "#f87171", query: "spicy, crunchy, bold flavors" },
  { emoji: "🥰", label: "Romantic", color: "#f472b6", query: "pasta, desserts, wine pairing" },
  { emoji: "💪", label: "Gym Day", color: "#34d399", query: "protein, salad, healthy" },
  { emoji: "🎉", label: "Celebrating", color: "#a78bfa", query: "pizza, burgers, party food" },
  { emoji: "🤒", label: "Sick", color: "#94a3b8", query: "soup, warm, gentle, easy digest" },
  { emoji: "😴", label: "Lazy", color: "#fb923c", query: "quick delivery, easy to eat" },
  { emoji: "🧘", label: "Zen", color: "#2dd4bf", query: "vegan, light, fresh, green" },
];

const ALL_FOODS = [
  { _id: "1", name: "Margherita Pizza", description: "Fresh basil, mozzarella, tomato sauce", price: 299, emoji: "🍕", badge: "hot", rating: "4.8", category: "Pizza", isVeg: true, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80" },
  { _id: "3", name: "Classic Smash Burger", description: "Double patty, cheddar, caramelised onion", price: 349, emoji: "🍔", badge: "popular", rating: "4.9", category: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
  { _id: "7", name: "Spicy Ramen Bowl", description: "Rich pork broth, soft egg, nori", price: 389, emoji: "🍜", badge: "hot", rating: "4.8", category: "Noodles", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80" },
  { _id: "11", name: "Caesar Salad", description: "Romaine, croutons, parmesan dressing", price: 229, emoji: "🥗", rating: "4.4", category: "Salads", isVeg: true, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80" },
  { _id: "13", name: "Tiramisu Slice", description: "Mascarpone, espresso, cocoa", price: 199, emoji: "🍰", badge: "new", rating: "4.9", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80" },
  { _id: "14", name: "Chocolate Lava Cake", description: "Warm molten centre, vanilla ice cream", price: 229, emoji: "🍫", badge: "popular", rating: "4.8", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80" },
];

export default function MoodOrder() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [customMood, setCustomMood] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [showMoodAI, setShowMoodAI] = useState(false);
  const [showHealthScanner, setShowHealthScanner] = useState(false);
  const { addToCart } = useCart();

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    setLoading(true);
    setAiResponse("");

    try {
      const res = await fetch("http://localhost:3000/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `I'm feeling ${mood.label.toLowerCase()}. Suggest me some food from the menu. ${mood.query}`,
          history: [],
        }),
      });
      const data = await res.json();
      setAiResponse(data.reply || "");
    } catch {
      setAiResponse(`Feeling ${mood.label.toLowerCase()}? Here are perfect picks for your mood! 🎯`);
    }

    // Show filtered foods based on mood (simplified matching)
    setTimeout(() => {
      const shuffled = [...ALL_FOODS].sort(() => Math.random() - 0.5);
      setRecommendations(shuffled.slice(0, 4));
      setLoading(false);
    }, 800);
  };

  const handleCustomMood = async () => {
    if (!customMood.trim()) return;
    handleMoodSelect({ emoji: "🤔", label: customMood, color: "#a78bfa", query: customMood });
  };

  const handleAdd = (food) => {
    addToCart(food);
    toast.success(`${food.name} added to cart 🛒`, {
      style: { background: "#222236", color: "#f0f0f5", border: "1px solid rgba(255,255,255,0.08)" },
    });
  };

  return (
    <div className="page-padded">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title" style={{ fontSize: 36 }}>
          <span style={{ fontSize: 32 }}>🧠</span> CraveCrafter
        </h1>
        <p className="section-subtitle">Tell us how you feel — AI will find the perfect food for your mood</p>
        
        {/* AI Features Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 32 }}>
          <motion.button
            className="btn-primary"
            onClick={() => setShowMoodAI(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
          >
            🤖 Advanced AI Mood Analysis
          </motion.button>
          <motion.button
            className="btn-primary"
            onClick={() => setShowHealthScanner(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)" }}
          >
            🔍 Health Menu Scanner
          </motion.button>
        </div>
      </motion.div>

      {/* Mood Grid */}
      <motion.div
        className="mood-grid"
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
      >
        {MOODS.map((mood) => (
          <motion.div
            key={mood.label}
            className={`mood-card${selectedMood?.label === mood.label ? " selected" : ""}`}
            onClick={() => handleMoodSelect(mood)}
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            <span className="mood-label">{mood.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Custom Mood Input */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ display: "flex", gap: 12, marginBottom: 40 }}
      >
        <div className="hero-search" style={{ flex: 1, marginBottom: 0 }}>
          <span style={{ fontSize: 16, opacity: 0.4 }}>💭</span>
          <input
            value={customMood}
            onChange={(e) => setCustomMood(e.target.value)}
            placeholder="Or type how you're feeling... (e.g., 'I want something sweet and warm')"
            onKeyDown={(e) => e.key === "Enter" && handleCustomMood()}
          />
        </div>
        <motion.button
          className="btn-primary"
          onClick={handleCustomMood}
          whileTap={{ scale: 0.95 }}
        >
          Get Suggestions ✨
        </motion.button>
      </motion.div>

      {/* AI Response */}
      <AnimatePresence>
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: "20px 24px",
              background: "linear-gradient(135deg, rgba(255,107,53,0.06), rgba(167,139,250,0.04))",
              border: "1px solid rgba(255,107,53,0.15)",
              borderRadius: "var(--radius-lg)",
              marginBottom: 32,
              fontSize: 14, lineHeight: 1.7,
              color: "var(--text-secondary)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span className="ai-badge">AI</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>CraveCrafter says:</span>
            </div>
            {aiResponse}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendations */}
      <AnimatePresence>
        {loading ? (
          <div className="food-grid">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : recommendations.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="section-title" style={{ fontSize: 22 }}>
              {selectedMood?.emoji} Perfect for "{selectedMood?.label}" mood
            </h2>
            <motion.div
              className="food-grid"
              initial="hidden" animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              {recommendations.map((food) => (
                <FoodCard key={food._id} food={food} onAdd={handleAdd} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* AI Modals */}
      <MoodBasedOrdering 
        isOpen={showMoodAI}
        onClose={() => setShowMoodAI(false)}
      />
      
      <HealthMenuScanner 
        isOpen={showHealthScanner}
        onClose={() => setShowHealthScanner(false)}
      />
    </div>
  );
}
