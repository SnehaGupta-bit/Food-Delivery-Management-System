import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext.jsx";
import { getFoods } from "../services/api.js";
import FoodCard from "../components/FoodCard.jsx";
import AIRecommendationBanner from "../components/AIRecommendationBanner.jsx";
import ParticleBackground from "../components/ParticleBackground.jsx";
import HungerPanicButton from "../components/HungerPanicButton.jsx";
import { CardSkeleton } from "../components/SkeletonLoader.jsx";
import "../styles/customer-panel.css";
import toast from "react-hot-toast";

const CATEGORIES = [
  { icon: "🍕", name: "Pizza" }, { icon: "🍔", name: "Burgers" },
  { icon: "🍜", name: "Noodles" }, { icon: "🌮", name: "Tacos" },
  { icon: "🥗", name: "Salads" }, { icon: "🍣", name: "Sushi" },
  { icon: "🍰", name: "Desserts" }, { icon: "🥤", name: "Drinks" },
];

const FALLBACK = [
  { _id: "1", name: "Margherita Pizza", description: "Fresh basil, mozzarella, tomato sauce on thin crust", price: 299, originalPrice: 399, emoji: "🍕", badge: "hot", rating: "4.8", category: "Pizza", prepTime: "20-25 min", isVeg: true, restaurant: "Pizza Paradise", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80" },
  { _id: "2", name: "Classic Smash Burger", description: "Double patty, cheddar, caramelised onion, secret sauce", price: 349, originalPrice: 449, emoji: "🍔", badge: "popular", rating: "4.9", category: "Burgers", prepTime: "15-20 min", isVeg: false, restaurant: "Burger Lab", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
  { _id: "3", name: "Salmon Sushi Platter", description: "12 pieces, soy sauce & wasabi, premium fish", price: 599, emoji: "🍣", badge: "new", rating: "4.7", category: "Sushi", prepTime: "25-30 min", isVeg: false, restaurant: "Tokyo Bites", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80" },
  { _id: "4", name: "Spicy Ramen Bowl", description: "Rich pork broth, soft egg, nori, bamboo shoots", price: 389, originalPrice: 489, emoji: "🍜", badge: "hot", rating: "4.8", category: "Noodles", prepTime: "20-25 min", isVeg: false, restaurant: "Ramen House", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80" },
  { _id: "5", name: "Street Tacos (3 pcs)", description: "Grilled chicken, fresh salsa, guacamole, lime", price: 259, emoji: "🌮", badge: "popular", rating: "4.6", category: "Tacos", prepTime: "10-15 min", isVeg: false, restaurant: "Taco Fiesta", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80" },
  { _id: "6", name: "Tiramisu Slice", description: "Mascarpone cream, espresso-soaked ladyfinger, cocoa", price: 199, emoji: "🍰", badge: "new", rating: "4.9", category: "Desserts", prepTime: "5 min", isVeg: true, restaurant: "Sweet Tooth", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80" },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    getFoods()
      .then((data) => setFoods(data.length > 0 ? data : FALLBACK))
      .catch(() => setFoods(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (food) => {
    addToCart(food);
    toast.success(`${food.name} added to cart 🛒`, {
      style: { background: "#222236", color: "#f0f0f5", border: "1px solid rgba(255,255,255,0.08)" },
      iconTheme: { primary: "#ff6b35", secondary: "#fff" },
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/menu?search=${encodeURIComponent(search)}`);
  };

  const filtered = foods
    .filter((f) => (activeCategory ? f.category?.toLowerCase() === activeCategory.toLowerCase() : true))
    .slice(0, 6);

  return (
    <div style={{ position: "relative" }}>
      <ParticleBackground />

      {/* ── HERO ── */}
      <section className="hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="hero-title">
            Delicious Food,<br />
            <span className="gradient-text">Delivered Fast</span> 🚀
          </h1>
          <p className="hero-sub">
            Order from your favourite restaurants and get AI-powered recommendations.
            Fresh food at your doorstep in 30 minutes or less.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <span style={{ fontSize: 18, opacity: 0.5 }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for pizza, burgers, sushi..."
            />
            <button type="submit" className="btn-primary" style={{ padding: "11px 26px" }}>
              Search
            </button>
          </form>
          <div className="hero-stats">
            <div className="stat-item">
              <motion.div className="stat-num" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                500<span className="accent">+</span>
              </motion.div>
              <div className="stat-label">Restaurants</div>
            </div>
            <div className="stat-item">
              <motion.div className="stat-num" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                50K<span className="accent">+</span>
              </motion.div>
              <div className="stat-label">Happy Users</div>
            </div>
            <div className="stat-item">
              <motion.div className="stat-num" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                30<span className="accent"> min</span>
              </motion.div>
              <div className="stat-label">Avg Delivery</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="hero-circle-wrap">
            <div className="hero-circle">🍱</div>
            <motion.div className="hero-float hf1" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              🔥 Trending now
            </motion.div>
            <motion.div className="hero-float hf2" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}>
              ⭐ 4.9 rated
            </motion.div>
            <motion.div className="hero-float hf3" animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}>
              🎉 Free delivery
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── AI RECOMMENDATIONS ── */}
      <AIRecommendationBanner onAddToCart={handleAdd} />

      {/* ── CATEGORIES ── */}
      <section className="categories-section">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Browse by Category
        </motion.h2>
        <div className="categories-scroll">
          {CATEGORIES.map((c, i) => (
            <motion.div
              key={c.name}
              className={`cat-card${activeCategory === c.name ? " active" : ""}`}
              onClick={() => setActiveCategory(activeCategory === c.name ? null : c.name)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="cat-icon">{c.icon}</span>
              <div className="cat-name">{c.name}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── POPULAR DISHES ── */}
      <section className="page-padded" style={{ paddingTop: 0 }}>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          🔥 Popular Right Now
        </motion.h2>
        {loading ? (
          <div className="food-grid">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <motion.div className="food-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {filtered.map((food) => (
              <FoodCard key={food._id} food={food} onAdd={handleAdd} />
            ))}
          </motion.div>
        )}

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <motion.button
            className="btn-secondary"
            onClick={() => navigate("/menu")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Full Menu →
          </motion.button>
        </div>
      </section>

      {/* ── PROMO ── */}
      <motion.div
        className="promo-banner"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div>
          <div className="promo-title">First order? Get 30% off! 🎉</div>
          <p className="promo-sub">Use code at checkout. Limited time only.</p>
          <span className="promo-code">QUICKBITE30</span><br />
          <motion.button
            className="btn-primary"
            style={{ marginTop: 20 }}
            onClick={() => navigate("/menu")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Order now →
          </motion.button>
        </div>
        <div className="promo-emojis">🍕 🍔 🌮</div>
      </motion.div>

      {/* ── HUNGER PANIC ── */}
      <HungerPanicButton onActivate={() => {
        toast("⚡ Finding fastest delivery options!", {
          icon: "🚀",
          style: { background: "#222236", color: "#f0f0f5", border: "1px solid rgba(239,68,68,0.3)" },
        });
        navigate("/menu?mode=emergency");
      }} />
    </div>
  );
}