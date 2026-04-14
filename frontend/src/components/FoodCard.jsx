import { useState } from "react";

export default function FoodCard({ food, onAdd }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd(food);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="food-card">
      <div className="food-card-img">
        <span className="food-emoji">{food.image}</span>
        <span className={`veg-badge ${food.isVeg ? "veg" : "non-veg"}`}>
          {food.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
        </span>
      </div>
      <div className="food-card-body">
        <div className="food-card-top">
          <h3 className="food-name">{food.name}</h3>
          <div className="food-rating">⭐ {food.rating}</div>
        </div>
        <p className="food-desc">{food.description}</p>
        <div className="food-meta">
          <span className="food-category">{food.category}</span>
          <span className="food-time">⏱ {food.prepTime}</span>
        </div>
        <div className="food-card-footer">
          <span className="food-price">₹{food.price}</span>
          <button
            className={`add-btn ${added ? "added" : ""}`}
            onClick={handleAdd}
          >
            {added ? "✓ Added!" : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}