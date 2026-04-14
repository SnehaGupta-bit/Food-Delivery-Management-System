import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { getFoods } from "../services/api.js";

const CATEGORIES = [
  { icon:"🍕", name:"Pizza"    }, { icon:"🍔", name:"Burgers"  },
  { icon:"🍜", name:"Noodles"  }, { icon:"🌮", name:"Tacos"    },
  { icon:"🥗", name:"Salads"   }, { icon:"🍣", name:"Sushi"    },
  { icon:"🍰", name:"Desserts" }, { icon:"🥤", name:"Drinks"   },
];
const BADGE_MAP   = { hot:"badge badge-hot", new:"badge badge-new", popular:"badge badge-pop" };
const BADGE_LABEL = { hot:"🔥 Hot", new:"✨ New", popular:"⭐ Popular" };

const FALLBACK = [
  { _id:"1", name:"Margherita Pizza",     description:"Fresh basil, mozzarella, tomato sauce",     price:299, emoji:"🍕", badge:"hot",     rating:"4.8", category:"Pizza"    },
  { _id:"2", name:"Classic Smash Burger", description:"Double patty, cheddar, caramelised onion",  price:349, emoji:"🍔", badge:"popular", rating:"4.9", category:"Burgers"  },
  { _id:"3", name:"Salmon Sushi Platter", description:"12 pieces, soy sauce & wasabi",             price:599, emoji:"🍣", badge:"new",     rating:"4.7", category:"Sushi"    },
  { _id:"4", name:"Spicy Ramen Bowl",     description:"Pork broth, soft egg, nori, bamboo shoots", price:389, emoji:"🍜", badge:"hot",     rating:"4.8", category:"Noodles"  },
  { _id:"5", name:"Street Tacos (3 pcs)", description:"Grilled chicken, salsa, guacamole",         price:259, emoji:"🌮", badge:"popular", rating:"4.6", category:"Tacos"    },
  { _id:"6", name:"Tiramisu Slice",       description:"Mascarpone, espresso, cocoa dusting",       price:199, emoji:"🍰", badge:"new",     rating:"4.9", category:"Desserts" },
];

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [toast, setToast] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    getFoods().then(setFoods).catch(() => setFoods(FALLBACK)).finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };
  const handleAdd = (food)  => { addToCart(food); showToast(`${food.name} added to cart 🛒`); };
  const handleSearch = (e)  => { e.preventDefault(); navigate(`/menu?search=${encodeURIComponent(search)}`); };

  const filtered = foods
    .filter((f) => activeCategory ? f.category?.toLowerCase() === activeCategory.toLowerCase() : true)
    .slice(0, 6);

  return (
    <div className="page">
      {/* HERO */}
      <section className="hero">
        <div>
          <h1 className="hero-title">Delicious Food,<br /><em>Delivered Fast 🚀</em></h1>
          <p className="hero-sub">
            Order from your favourite restaurants and get fresh food at your doorstep in 30 minutes.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <span style={{ fontSize:18 }}>🔍</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for pizza, burgers, sushi..." />
            <button type="submit" className="btn-primary" style={{ padding:"11px 26px" }}>Search</button>
          </form>
          <div className="hero-stats">
            <div className="stat-item"><div className="stat-num">500+</div><div className="stat-label">Restaurants</div></div>
            <div className="stat-item"><div className="stat-num">50K+</div><div className="stat-label">Happy users</div></div>
            <div className="stat-item"><div className="stat-num">30 min</div><div className="stat-label">Avg delivery</div></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-circle-wrap">
            <div className="hero-circle">🍱</div>
            <div className="hero-float hf1">🔥 Trending now</div>
            <div className="hero-float hf2">⭐ 4.9 rated</div>
            <div className="hero-float hf3">🎉 Free delivery</div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ marginBottom:56 }}>
        <h2 className="section-title">Browse by category</h2>
        <div className="categories-grid">
          {CATEGORIES.map((c) => (
            <div key={c.name}
              className={`cat-card${activeCategory === c.name ? " active" : ""}`}
              onClick={() => setActiveCategory(activeCategory === c.name ? null : c.name)}>
              <span className="cat-icon">{c.icon}</span>
              <div className="cat-name">{c.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR DISHES */}
      <section style={{ marginBottom:56 }}>
        <h2 className="section-title">Popular dishes</h2>
        {loading ? <div className="spinner" /> : (
          <div className="food-grid">
            {filtered.map((food) => (
              <div key={food._id} className="food-card">
                <div className="food-img">
                  {food.image ? <img src={food.image} alt={food.name} /> : <span>{food.emoji || "🍽️"}</span>}
                  <div className="food-badges">
                    {food.badge && (
                      <span className={BADGE_MAP[food.badge] || "badge badge-pop"}>
                        {BADGE_LABEL[food.badge] || food.badge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="food-body">
                  <div className="food-name">{food.name}</div>
                  <div className="food-desc">{food.description}</div>
                  <div className="food-footer">
                    <span className="food-price">₹{food.price}</span>
                    <span className="food-rating">⭐ {food.rating || "4.5"}</span>
                    <button className="btn-icon" onClick={() => handleAdd(food)}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PROMO */}
      <div className="promo-banner">
        <div>
          <div className="promo-title">First order? Get 30% off! 🎉</div>
          <p className="promo-sub">Use code at checkout. Limited time only.</p>
          <span className="promo-code">QUICKBITE30</span><br />
          <button className="btn-primary" style={{ marginTop:20 }} onClick={() => navigate("/menu")}>
            Order now →
          </button>
        </div>
        <div className="promo-emojis">🍕 🍔 🌮</div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}