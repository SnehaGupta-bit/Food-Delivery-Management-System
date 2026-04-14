import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { getFoods } from "../services/api.js";

const CATEGORIES = ["All","Pizza","Burgers","Noodles","Tacos","Salads","Sushi","Desserts","Drinks"];
const BADGE_MAP   = { hot:"badge badge-hot", new:"badge badge-new", popular:"badge badge-pop" };
const BADGE_LABEL = { hot:"🔥 Hot", new:"✨ New", popular:"⭐ Popular" };

const ALL_FOODS = [
  { _id:"1",  name:"Margherita Pizza",      description:"Fresh basil, mozzarella, tomato sauce",     price:299, emoji:"🍕", badge:"hot",     rating:"4.8", category:"Pizza"    },
  { _id:"2",  name:"Pepperoni Pizza",        description:"Classic pepperoni with rich tomato base",   price:349, emoji:"🍕", badge:"popular", rating:"4.7", category:"Pizza"    },
  { _id:"3",  name:"Classic Smash Burger",   description:"Double patty, cheddar, caramelised onion", price:349, emoji:"🍔", badge:"popular", rating:"4.9", category:"Burgers"  },
  { _id:"4",  name:"BBQ Bacon Burger",       description:"Smoky BBQ sauce, crispy bacon, pickles",   price:399, emoji:"🍔", badge:"hot",     rating:"4.8", category:"Burgers"  },
  { _id:"5",  name:"Salmon Sushi Platter",   description:"12 pieces, soy sauce & wasabi",            price:599, emoji:"🍣", badge:"new",     rating:"4.7", category:"Sushi"    },
  { _id:"6",  name:"Tuna Roll",              description:"Fresh tuna, cucumber, sesame",             price:449, emoji:"🍣",                  rating:"4.6", category:"Sushi"    },
  { _id:"7",  name:"Spicy Ramen Bowl",       description:"Pork broth, soft egg, nori, bamboo",       price:389, emoji:"🍜", badge:"hot",     rating:"4.8", category:"Noodles"  },
  { _id:"8",  name:"Pad Thai Noodles",       description:"Rice noodles, peanuts, tofu or chicken",  price:329, emoji:"🍜",                  rating:"4.6", category:"Noodles"  },
  { _id:"9",  name:"Street Tacos (3 pcs)",   description:"Grilled chicken, salsa, guacamole",        price:259, emoji:"🌮", badge:"popular", rating:"4.6", category:"Tacos"    },
  { _id:"10", name:"Beef Burrito",           description:"Slow-cooked beef, rice, beans, cheese",    price:299, emoji:"🌯",                  rating:"4.5", category:"Tacos"    },
  { _id:"11", name:"Caesar Salad",           description:"Romaine, croutons, parmesan, dressing",    price:229, emoji:"🥗", badge:"new",     rating:"4.4", category:"Salads"   },
  { _id:"12", name:"Greek Salad",            description:"Olives, feta, tomato, cucumber, oregano",  price:219, emoji:"🥗",                  rating:"4.5", category:"Salads"   },
  { _id:"13", name:"Tiramisu Slice",         description:"Mascarpone, espresso, cocoa dusting",      price:199, emoji:"🍰", badge:"new",     rating:"4.9", category:"Desserts" },
  { _id:"14", name:"Chocolate Lava Cake",    description:"Warm molten centre, vanilla ice cream",    price:229, emoji:"🍫", badge:"popular", rating:"4.8", category:"Desserts" },
  { _id:"15", name:"Mango Lassi",            description:"Creamy yoghurt, fresh mango, cardamom",    price:129, emoji:"🥤",                  rating:"4.7", category:"Drinks"   },
  { _id:"16", name:"Cold Brew Coffee",       description:"Smooth 24hr cold brew, optional milk",     price:149, emoji:"☕", badge:"new",     rating:"4.6", category:"Drinks"   },
];

export default function FoodList() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [toast, setToast] = useState(null);
  const { addToCart } = useCart();
  const location = useLocation();

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("search");
    if (q) setSearch(q);
  }, [location.search]);

  useEffect(() => {
    getFoods().then(setFoods).catch(() => setFoods(ALL_FOODS)).finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };
  const handleAdd = (food)  => { addToCart(food); showToast(`${food.name} added to cart 🛒`); };

  let filtered = foods.filter((f) => {
    const ms = f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.description || "").toLowerCase().includes(search.toLowerCase());
    const mc = category === "All" || (f.category || "").toLowerCase() === category.toLowerCase();
    return ms && mc;
  });
  if (sort === "price-asc")  filtered = [...filtered].sort((a,b) => a.price - b.price);
  if (sort === "price-desc") filtered = [...filtered].sort((a,b) => b.price - a.price);
  if (sort === "rating")     filtered = [...filtered].sort((a,b) => parseFloat(b.rating||0) - parseFloat(a.rating||0));

  return (
    <div className="page">
      <h1 className="section-title" style={{ fontSize:36, marginBottom:8 }}>Our Menu 🍽️</h1>
      <p style={{ color:"rgba(255,255,255,0.7)", marginBottom:32, fontSize:15 }}>
        Fresh ingredients, delivered fast
      </p>

      {/* FILTERS */}
      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap", alignItems:"center" }}>
        <div className="hero-search" style={{ flex:1, minWidth:220, marginBottom:0 }}>
          <span style={{ fontSize:16 }}>🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search dishes..." />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{
          background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.32)",
          color:"white", padding:"11px 18px", borderRadius:50, fontSize:14,
          fontFamily:"var(--font-body)", outline:"none", cursor:"pointer",
        }}>
          <option value="default"    style={{ color:"#333" }}>Sort: Default</option>
          <option value="price-asc"  style={{ color:"#333" }}>Price: Low → High</option>
          <option value="price-desc" style={{ color:"#333" }}>Price: High → Low</option>
          <option value="rating"     style={{ color:"#333" }}>Top Rated</option>
        </select>
      </div>

      {/* TABS */}
      <div style={{ display:"flex", gap:10, marginBottom:36, overflowX:"auto", paddingBottom:4 }}>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} style={{
            padding:"9px 20px", borderRadius:50,
            border:"1px solid rgba(255,255,255,0.3)",
            background: category === c ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.14)",
            color:"white", fontFamily:"var(--font-body)",
            fontSize:13, fontWeight: category === c ? 700 : 500,
            cursor:"pointer", whiteSpace:"nowrap",
            transition:"all 0.2s",
          }}>
            {c}
          </button>
        ))}
      </div>

      <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, marginBottom:20 }}>
        Showing {filtered.length} dish{filtered.length !== 1 ? "es" : ""}
      </p>

      {loading ? <div className="spinner" /> : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <div className="empty-title">No dishes found</div>
          <div className="empty-sub">Try a different search or category</div>
          <button className="btn-primary" onClick={() => { setSearch(""); setCategory("All"); }}>
            Clear filters
          </button>
        </div>
      ) : (
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
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}