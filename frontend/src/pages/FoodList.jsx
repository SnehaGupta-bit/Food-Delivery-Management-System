import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext.jsx";
import { getFoods } from "../services/api.js";
import FoodCard from "../components/FoodCard.jsx";
import { CardSkeleton } from "../components/SkeletonLoader.jsx";
import toast from "react-hot-toast";
import { HiOutlineViewGrid, HiOutlineViewList } from "react-icons/hi";

const CATEGORIES = ["All", "Pizza", "Burgers", "Noodles", "Tacos", "Salads", "Sushi", "Desserts", "Drinks"];

const ALL_FOODS = [
  { _id: "1", name: "Margherita Pizza", description: "Fresh basil, mozzarella, tomato sauce on thin crust", price: 299, originalPrice: 399, emoji: "🍕", badge: "hot", rating: "4.8", category: "Pizza", prepTime: "20-25 min", isVeg: true, restaurant: "Pizza Paradise", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80" },
  { _id: "2", name: "Pepperoni Pizza", description: "Classic pepperoni with rich tomato base, extra cheese", price: 349, emoji: "🍕", badge: "popular", rating: "4.7", category: "Pizza", prepTime: "20-25 min", isVeg: false, restaurant: "Pizza Paradise", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80" },
  { _id: "3", name: "Classic Smash Burger", description: "Double patty, cheddar, caramelised onion, secret sauce", price: 349, originalPrice: 449, emoji: "🍔", badge: "popular", rating: "4.9", category: "Burgers", prepTime: "15-20 min", isVeg: false, restaurant: "Burger Lab", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
  { _id: "4", name: "BBQ Bacon Burger", description: "Smoky BBQ sauce, crispy bacon, pickles, onion rings", price: 399, emoji: "🍔", badge: "hot", rating: "4.8", category: "Burgers", prepTime: "15-20 min", isVeg: false, restaurant: "Burger Lab", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80" },
  { _id: "5", name: "Salmon Sushi Platter", description: "12 pieces, soy sauce & wasabi, premium atlantic salmon", price: 599, emoji: "🍣", badge: "new", rating: "4.7", category: "Sushi", prepTime: "25-30 min", isVeg: false, restaurant: "Tokyo Bites", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80" },
  { _id: "6", name: "Tuna Roll", description: "Fresh tuna, cucumber, sesame, soy & ginger", price: 449, emoji: "🍣", rating: "4.6", category: "Sushi", prepTime: "25-30 min", isVeg: false, restaurant: "Tokyo Bites", image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&q=80" },
  { _id: "7", name: "Spicy Ramen Bowl", description: "Rich pork broth, soft egg, nori, bamboo shoots", price: 389, originalPrice: 489, emoji: "🍜", badge: "hot", rating: "4.8", category: "Noodles", prepTime: "20-25 min", isVeg: false, restaurant: "Ramen House", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80" },
  { _id: "8", name: "Pad Thai Noodles", description: "Rice noodles, peanuts, tofu, tamarind, lime", price: 329, emoji: "🍜", rating: "4.6", category: "Noodles", prepTime: "15-20 min", isVeg: true, restaurant: "Thai Street", image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&q=80" },
  { _id: "9", name: "Street Tacos (3 pcs)", description: "Grilled chicken, fresh salsa, guacamole, lime", price: 259, emoji: "🌮", badge: "popular", rating: "4.6", category: "Tacos", prepTime: "10-15 min", isVeg: false, restaurant: "Taco Fiesta", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80" },
  { _id: "10", name: "Beef Burrito", description: "Slow-cooked beef, rice, beans, cheese, sour cream", price: 299, emoji: "🌯", rating: "4.5", category: "Tacos", prepTime: "15-20 min", isVeg: false, restaurant: "Taco Fiesta", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80" },
  { _id: "11", name: "Caesar Salad", description: "Romaine, croutons, parmesan, caesar dressing", price: 229, emoji: "🥗", badge: "new", rating: "4.4", category: "Salads", prepTime: "10 min", isVeg: true, restaurant: "Green Bowl", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80" },
  { _id: "12", name: "Greek Salad", description: "Olives, feta, tomato, cucumber, oregano dressing", price: 219, emoji: "🥗", rating: "4.5", category: "Salads", prepTime: "10 min", isVeg: true, restaurant: "Green Bowl", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80" },
  { _id: "13", name: "Tiramisu Slice", description: "Mascarpone cream, espresso-soaked ladyfinger, cocoa", price: 199, emoji: "🍰", badge: "new", rating: "4.9", category: "Desserts", prepTime: "5 min", isVeg: true, restaurant: "Sweet Tooth", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80" },
  { _id: "14", name: "Chocolate Lava Cake", description: "Warm molten centre, vanilla ice cream, berries", price: 229, emoji: "🍫", badge: "popular", rating: "4.8", category: "Desserts", prepTime: "15 min", isVeg: true, restaurant: "Sweet Tooth", image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80" },
  { _id: "15", name: "Mango Lassi", description: "Creamy yoghurt, fresh mango, cardamom, saffron", price: 129, emoji: "🥤", rating: "4.7", category: "Drinks", prepTime: "5 min", isVeg: true, restaurant: "Chai Point", image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&q=80" },
  { _id: "16", name: "Cold Brew Coffee", description: "Smooth 24hr cold brew, optional oat milk", price: 149, emoji: "☕", badge: "new", rating: "4.6", category: "Drinks", prepTime: "5 min", isVeg: true, restaurant: "Brew Bar", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80" },
];

export default function FoodList() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [vegOnly, setVegOnly] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const { addToCart } = useCart();
  const location = useLocation();

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("search");
    if (q) setSearch(q);
    const mode = new URLSearchParams(location.search).get("mode");
    if (mode === "emergency") {
      setSort("time");
      toast("⚡ Showing fastest delivery options!", {
        icon: "🚀",
        style: { background: "#222236", color: "#f0f0f5", border: "1px solid rgba(239,68,68,0.3)" },
      });
    }
  }, [location.search]);

  useEffect(() => {
    getFoods()
      .then((data) => setFoods(data.length > 0 ? data : ALL_FOODS))
      .catch(() => setFoods(ALL_FOODS))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (food) => {
    addToCart(food);
    toast.success(`${food.name} added to cart`, {
      style: { background: "#222236", color: "#f0f0f5", border: "1px solid rgba(255,255,255,0.08)" },
      iconTheme: { primary: "#ff6b35", secondary: "#fff" },
    });
  };

  let filtered = foods.filter((f) => {
    const ms = f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.description || "").toLowerCase().includes(search.toLowerCase());
    const mc = category === "All" || (f.category || "").toLowerCase() === category.toLowerCase();
    const mv = !vegOnly || f.isVeg;
    const mp = f.price >= priceRange[0] && f.price <= priceRange[1];
    const mr = parseFloat(f.rating || 0) >= minRating;
    return ms && mc && mv && mp && mr;
  });

  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === "rating") filtered = [...filtered].sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
  if (sort === "time") filtered = [...filtered].sort((a, b) => parseInt(a.prepTime || "30") - parseInt(b.prepTime || "30"));

  const activeFiltersCount = 
    (category !== "All" ? 1 : 0) + 
    (vegOnly ? 1 : 0) + 
    (priceRange[0] !== 0 || priceRange[1] !== 1000 ? 1 : 0) + 
    (minRating > 0 ? 1 : 0);

  const clearAllFilters = () => {
    setCategory("All");
    setVegOnly(false);
    setPriceRange([0, 1000]);
    setMinRating(0);
    setSort("default");
    setSearch("");
  };

  return (
    <div className="page-padded" style={{ position: "relative" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 24 }}
      >
        <h1 className="section-title" style={{ fontSize: 36 }}>
          Our Menu <span style={{ fontSize: 28 }}>🍽️</span>
        </h1>
        <p className="section-subtitle">Fresh ingredients, crafted with passion, delivered fast</p>
      </motion.div>

      {/* Advanced Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          marginBottom: 24,
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Top Row: Search, Sort, View Mode, Filter Toggle */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div className="hero-search" style={{ flex: 1, minWidth: 280, marginBottom: 0 }}>
            <span style={{ fontSize: 16, opacity: 0.4 }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, restaurants, cuisines..."
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 18,
                  padding: '0 8px'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value)} 
            className="filter-select"
            style={{ minWidth: 180 }}
          >
            <option value="default">🔥 Recommended</option>
            <option value="price-asc">💰 Price: Low → High</option>
            <option value="price-desc">💎 Price: High → Low</option>
            <option value="rating">⭐ Top Rated</option>
            <option value="time">⚡ Fastest Delivery</option>
          </select>

          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            gap: 4,
            background: 'var(--bg-secondary)',
            padding: 4,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)'
          }}>
            <motion.button
              onClick={() => setViewMode('grid')}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '8px 12px',
                background: viewMode === 'grid' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <HiOutlineViewGrid />
            </motion.button>
            <motion.button
              onClick={() => setViewMode('list')}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '8px 12px',
                background: viewMode === 'list' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'list' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <HiOutlineViewList />
            </motion.button>
          </div>

          {/* Advanced Filters Toggle */}
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '10px 18px',
              background: showFilters ? 'var(--accent)' : 'var(--glass-bg)',
              color: showFilters ? 'white' : 'var(--text-primary)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            🎛️ Filters
            {activeFiltersCount > 0 && (
              <span style={{
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700
              }}>
                {activeFiltersCount}
              </span>
            )}
          </motion.button>
        </div>

        {/* Category Pills */}
        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          paddingBottom: showFilters ? 16 : 0,
          borderBottom: showFilters ? '1px solid var(--glass-border)' : 'none',
          marginBottom: showFilters ? 16 : 0
        }}>
          {CATEGORIES.map((c) => (
            <motion.button
              key={c}
              onClick={() => setCategory(c)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '8px 16px',
                background: category === c ? 'var(--accent)' : 'var(--bg-secondary)',
                color: category === c ? 'white' : 'var(--text-secondary)',
                border: category === c ? 'none' : '1px solid var(--glass-border)',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: category === c ? 600 : 500,
                fontSize: 13,
                transition: 'all 0.3s ease',
                boxShadow: category === c ? '0 4px 12px rgba(255,107,53,0.3)' : 'none'
              }}
            >
              {c}
            </motion.button>
          ))}
          <motion.button
            onClick={() => setVegOnly(!vegOnly)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '8px 16px',
              background: vegOnly ? 'rgba(52,211,153,0.15)' : 'var(--bg-secondary)',
              color: vegOnly ? 'var(--emerald)' : 'var(--text-secondary)',
              border: vegOnly ? '1px solid rgba(52,211,153,0.4)' : '1px solid var(--glass-border)',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: vegOnly ? 600 : 500,
              fontSize: 13,
              transition: 'all 0.3s ease',
              boxShadow: vegOnly ? '0 4px 12px rgba(52,211,153,0.2)' : 'none'
            }}
          >
            🟢 Veg Only
          </motion.button>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 20,
                paddingTop: 4
              }}>
                {/* Price Range */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 12
                  }}>
                    💰 Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="50"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      style={{
                        flex: 1,
                        accentColor: 'var(--accent)',
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="50"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      style={{
                        flex: 1,
                        accentColor: 'var(--accent)',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 8,
                    fontSize: 11,
                    color: 'var(--text-muted)'
                  }}>
                    <span>₹0</span>
                    <span>₹1000+</span>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 12
                  }}>
                    ⭐ Minimum Rating
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                      <motion.button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          padding: '8px 12px',
                          background: minRating === rating ? 'var(--accent)' : 'var(--bg-secondary)',
                          color: minRating === rating ? 'white' : 'var(--text-secondary)',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 600,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {rating === 0 ? 'All' : `${rating}+`}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  justifyContent: 'flex-end'
                }}>
                  <motion.button
                    onClick={clearAllFilters}
                    whileTap={{ scale: 0.95 }}
                    disabled={activeFiltersCount === 0}
                    style={{
                      padding: '10px 16px',
                      background: activeFiltersCount > 0 ? 'rgba(239,68,68,0.1)' : 'var(--bg-secondary)',
                      color: activeFiltersCount > 0 ? '#ef4444' : 'var(--text-muted)',
                      border: '1px solid ' + (activeFiltersCount > 0 ? 'rgba(239,68,68,0.3)' : 'var(--glass-border)'),
                      borderRadius: 'var(--radius-md)',
                      cursor: activeFiltersCount > 0 ? 'pointer' : 'not-allowed',
                      fontSize: 13,
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      opacity: activeFiltersCount > 0 ? 1 : 0.5
                    }}
                  >
                    🔄 Clear All Filters
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results Info Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          padding: '12px 16px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>
            {filtered.length} dish{filtered.length !== 1 ? 'es' : ''} found
          </span>
          {activeFiltersCount > 0 && (
            <span style={{
              padding: '4px 10px',
              background: 'rgba(255,107,53,0.1)',
              color: 'var(--accent)',
              borderRadius: '50px',
              fontSize: 11,
              fontWeight: 600
            }}>
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </span>
          )}
        </div>
        {filtered.length > 0 && (
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            Sorted by: {
              sort === 'default' ? 'Recommended' :
              sort === 'price-asc' ? 'Price (Low to High)' :
              sort === 'price-desc' ? 'Price (High to Low)' :
              sort === 'rating' ? 'Top Rated' :
              'Fastest Delivery'
            }
          </span>
        )}
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'food-grid' : 'food-list'}>
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="empty-icon">🍽️</div>
          <div className="empty-title">No dishes found</div>
          <div className="empty-sub">Try a different search or category filter</div>
          <button className="btn-primary" onClick={clearAllFilters}>
            Clear filters
          </button>
        </motion.div>
      ) : (
        <motion.div
          className={viewMode === 'grid' ? 'food-grid' : 'food-list'}
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((food) => (
              <FoodCard key={food._id} food={food} onAdd={handleAdd} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}