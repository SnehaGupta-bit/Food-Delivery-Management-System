import { motion } from "framer-motion";
import { useAIChat } from "../context/AIChatContext.jsx";

const MOODS_SUGGESTIONS = {
  default: [
    { _id: "r1", name: "Margherita Pizza", emoji: "🍕", price: 299, badge: "hot", rating: "4.8", description: "Fresh basil, mozzarella, tomato sauce", category: "Pizza" },
    { _id: "r2", name: "Classic Smash Burger", emoji: "🍔", price: 349, badge: "popular", rating: "4.9", description: "Double patty, cheddar, caramelised onion", category: "Burgers" },
    { _id: "r3", name: "Spicy Ramen Bowl", emoji: "🍜", price: 389, badge: "hot", rating: "4.8", description: "Pork broth, soft egg, nori", category: "Noodles" },
    { _id: "r4", name: "Tiramisu Slice", emoji: "🍰", price: 199, badge: "new", rating: "4.9", description: "Mascarpone, espresso, cocoa", category: "Desserts" },
  ],
};

export default function AIRecommendationBanner({ onAddToCart }) {
  const items = MOODS_SUGGESTIONS.default;
  const { openChat } = useAIChat();

  return (
    <motion.div
      className="ai-banner"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      <div className="ai-banner-header">
        <div className="ai-banner-title">
          <span>✨</span>
          AI Picks for You
          <span className="ai-badge">AI</span>
        </div>
        <button 
          className="btn-glass" 
          style={{ padding: "7px 16px", fontSize: 12 }}
          onClick={openChat}
        >
          🤖 Ask AI
        </button>
      </div>
      <div className="ai-scroll">
        {items.map((item, i) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            style={{
              minWidth: 220,
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-lg)",
              padding: 16,
              scrollSnapAlign: "start",
              flexShrink: 0,
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div style={{ fontSize: 40, marginBottom: 10 }}>{item.emoji}</div>
            <div style={{
              fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700,
              color: "var(--text-primary)", marginBottom: 4,
            }}>{item.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.4 }}>
              {item.description}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
                color: "var(--text-primary)",
              }}>₹{item.price}</span>
              <motion.button
                className="food-add-btn"
                style={{ padding: "6px 14px", fontSize: 11 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onAddToCart && onAddToCart(item); }}
              >
                + Add
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
