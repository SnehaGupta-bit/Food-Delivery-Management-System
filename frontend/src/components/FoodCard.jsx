import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function FoodCard({ food, onAdd }) {
  const [added, setAdded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();

  const handleAdd = (e) => {
    e.stopPropagation();
    onAdd(food);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleCardClick = () => {
    navigate(`/product/${food._id}`);
  };

  return (
    <motion.div
      className="food-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      layout
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className="food-img">
        {food.image ? (
          <>
            {!imgLoaded && <div className="skeleton" style={{ position: "absolute", inset: 0 }} />}
            <img
              src={food.image}
              alt={food.name}
              onLoad={() => setImgLoaded(true)}
              style={{ opacity: imgLoaded ? 1 : 0 }}
              loading="lazy"
            />
          </>
        ) : (
          <span>{food.emoji || "🍽️"}</span>
        )}
        <div className="food-badges">
          {food.badge && (
            <span className={`badge badge-${food.badge}`}>
              {food.badge === "hot" ? "🔥 Hot" : food.badge === "new" ? "✨ New" : "⭐ Popular"}
            </span>
          )}
          {food.isVeg !== undefined && (
            <span className={`badge ${food.isVeg ? "badge-veg" : "badge-nonveg"}`}>
              {food.isVeg ? "Veg" : "Non-Veg"}
            </span>
          )}
        </div>
      </div>
      <div className="food-body">
        {food.restaurant && (
          <div className="food-meta-row">
            <span className="food-restaurant">{food.restaurant}</span>
          </div>
        )}
        <div className="food-name">{food.name}</div>
        <div className="food-desc">{food.description}</div>
        <div className="food-info">
          <span className="food-rating">⭐ {food.rating || "4.5"}</span>
          {food.prepTime && <span className="food-time">⏱ {food.prepTime}</span>}
        </div>
        <div className="food-footer" style={{ marginTop: 12 }}>
          <div className="food-price-wrap">
            <span className="food-price">₹{food.price}</span>
            {food.originalPrice && food.originalPrice > food.price && (
              <span className="food-price-original">₹{food.originalPrice}</span>
            )}
          </div>
          <motion.button
            className={`food-add-btn${added ? " added" : ""}`}
            onClick={handleAdd}
            whileTap={{ scale: 0.9 }}
          >
            {added ? "✓ Added" : "+ Add"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}