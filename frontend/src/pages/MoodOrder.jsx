import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { getMoodRecommendations, getEmergencyFood } from "../services/api.js";

const MOOD_OPTIONS = [
  { emoji: "😢", label: "Sad", value: "I am feeling sad" },
  { emoji: "😊", label: "Happy", value: "I am feeling happy" },
  { emoji: "😰", label: "Stressed", value: "I am stressed" },
  { emoji: "😴", label: "Tired", value: "I am tired" },
  { emoji: "🤩", label: "Excited", value: "I am excited" },
  { emoji: "😍", label: "Romantic", value: "I am in a romantic mood" },
  { emoji: "🤤", label: "Hungry", value: "I am very hungry" },
];

export default function MoodOrder() {
  const [mood, setMood] = useState("");
  const [customMood, setCustomMood] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [emergencyMode, setEmergencyMode] = useState(false);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleMoodSelect = async (moodValue) => {
    setMood(moodValue);
    setLoading(true);

    try {
      const data = await getMoodRecommendations({ mood: moodValue });
      setRecommendations(data);
      showToast(data.message);
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomMood = async () => {
    if (!customMood.trim()) return;
    
    setMood(customMood);
    setLoading(true);

    try {
      const data = await getMoodRecommendations({ mood: customMood });
      setRecommendations(data);
      showToast(data.message);
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyMode = async () => {
    setEmergencyMode(true);
    setLoading(true);

    try {
      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const data = await getEmergencyFood({
              userLocation: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            });
            setRecommendations(data);
            showToast(data.message);
            setLoading(false);
          },
          (error) => {
            // Fallback without location
            getEmergencyFood({ userLocation: { lat: 0, lng: 0 } })
              .then(data => {
                setRecommendations(data);
                showToast(data.message);
              })
              .catch(err => showToast(err.message))
              .finally(() => setLoading(false));
          }
        );
      }
    } catch (error) {
      showToast(error.message);
      setLoading(false);
    }
  };

  const handleAddToCart = (food) => {
    addToCart(food);
    showToast(`${food.name} added to cart! 🛒`);
  };

  return (
    <div className="page">
      <h1 className="section-title">Mood-Based Ordering 🎭</h1>
      <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: 36, fontSize: 15 }}>
        Tell us how you're feeling, and we'll recommend the perfect food!
      </p>

      {/* Emergency Button */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <button
          className="btn-primary"
          style={{
            padding: "16px 32px",
            fontSize: 18,
            background: emergencyMode ? "#ff4444" : "white",
            animation: emergencyMode ? "pulse 1s infinite" : "none"
          }}
          onClick={handleEmergencyMode}
        >
          🚨 HUNGER EMERGENCY MODE ⚡
        </button>
      </div>

      {!recommendations && (
        <>
          {/* Mood Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 16,
            marginBottom: 32
          }}>
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleMoodSelect(option.value)}
                disabled={loading}
                style={{
                  padding: "24px 16px",
                  background: mood === option.value 
                    ? "rgba(255,255,255,0.35)" 
                    : "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  borderRadius: "var(--radius)",
                  backdropFilter: "blur(12px)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "center"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ fontSize: 48, marginBottom: 8 }}>{option.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>
                  {option.label}
                </div>
              </button>
            ))}
          </div>

          {/* Custom Mood Input */}
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div className="hero-search">
              <span style={{ fontSize: 18 }}>💭</span>
              <input
                value={customMood}
                onChange={(e) => setCustomMood(e.target.value)}
                placeholder="Or describe your mood in your own words..."
                onKeyDown={(e) => e.key === "Enter" && handleCustomMood()}
              />
              <button
                className="btn-primary"
                style={{ padding: "11px 26px" }}
                onClick={handleCustomMood}
                disabled={loading || !customMood.trim()}
              >
                Get Recommendations
              </button>
            </div>
          </div>
        </>
      )}

      {loading && <div className="spinner" />}

      {recommendations && (
        <>
          {/* Categories */}
          {recommendations.categories && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "white" }}>
                Recommended Categories
              </h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {recommendations.categories.map((cat, i) => (
                  <span key={i} className="order-item-chip" style={{ fontSize: 14 }}>
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Foods */}
          {recommendations.foods && recommendations.foods.length > 0 && (
            <>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "white" }}>
                Perfect for Your Mood
              </h3>
              <div className="food-grid">
                {recommendations.foods.map((food) => (
                  <div key={food._id} className="food-card">
                    <div className="food-img">
                      {food.image ? <img src={food.image} alt={food.name} /> : <span>{food.emoji || "🍽️"}</span>}
                    </div>
                    <div className="food-body">
                      <div className="food-name">{food.name}</div>
                      <div className="food-desc">{food.description}</div>
                      <div className="food-footer">
                        <span className="food-price">₹{food.price}</span>
                        <span className="food-rating">⭐ {food.rating || "4.5"}</span>
                        <button className="btn-icon" onClick={() => handleAddToCart(food)}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button
              className="btn-glass"
              onClick={() => {
                setRecommendations(null);
                setMood("");
                setCustomMood("");
                setEmergencyMode(false);
              }}
            >
              Try Another Mood
            </button>
            <button
              className="btn-primary"
              style={{ marginLeft: 12 }}
              onClick={() => navigate("/cart")}
            >
              Go to Cart →
            </button>
          </div>
        </>
      )}

      {toast && <div className="toast">{toast}</div>}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
