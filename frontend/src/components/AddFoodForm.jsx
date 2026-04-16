import { useState } from "react";
import toast from "react-hot-toast";

const AddFoodForm = ({ onFoodAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    description: "",
    emoji: "",
    badge: "",
    rating: "4.0",
    isVeg: false,
    prepTime: "",
    restaurant: "",
    image: "",
    isAvailable: true
  });

  const [loading, setLoading] = useState(false);

  const categories = [
    "Pizza", "Burgers", "Sushi", "Noodles", "Tacos", "Salads", 
    "Desserts", "Drinks", "Indian", "Chinese", "Italian", "Mexican",
    "Thai", "Continental", "Biryani", "Appetizer", "Beverage"
  ];

  const badges = ["", "hot", "popular", "new"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/food/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Food item added successfully! 🎉");
        setFormData({
          name: "",
          price: "",
          originalPrice: "",
          category: "",
          description: "",
          emoji: "",
          badge: "",
          rating: "4.0",
          isVeg: false,
          prepTime: "",
          restaurant: "",
          image: "",
          isAvailable: true
        });
        if (onFoodAdded) onFoodAdded(data.food);
      } else {
        toast.error(data.message || "Failed to add food item");
      }
    } catch (error) {
      console.error("Error adding food:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '64rem',
      margin: '0 auto',
      padding: '2rem',
      background: 'white',
      borderRadius: '1rem',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #ef4444 0%, #eab308 100%)',
        margin: '-2rem -2rem 1.5rem -2rem',
        padding: '1.5rem 2rem',
        borderRadius: '1rem 1rem 0 0'
      }}>
        <h2 style={{
          fontSize: '1.875rem',
          fontWeight: 700,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.5rem'
        }}>
          ➕ Add New Food Item
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginTop: '0.5rem' }}>
          Fill in the details to add a delicious new item to your menu
        </p>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
              🍽️ Food Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                transition: 'all 0.3s'
              }}
              placeholder="e.g., Margherita Pizza"
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Emoji */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
              😊 Emoji
            </label>
            <input
              type="text"
              name="emoji"
              value={formData.emoji}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1.5rem',
                textAlign: 'center',
                transition: 'all 0.3s'
              }}
              placeholder="🍕"
              maxLength="2"
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Price */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
              💰 Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="1"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                transition: 'all 0.3s'
              }}
              placeholder="299"
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Original Price */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
              💸 Original Price (₹)
            </label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              min="1"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                transition: 'all 0.3s'
              }}
              placeholder="399"
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
              📂 Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                transition: 'all 0.3s',
                background: 'white'
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Badge */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
              🏷️ Badge
            </label>
            <select
              name="badge"
              value={formData.badge}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                transition: 'all 0.3s',
                background: 'white'
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              {badges.map(badge => (
                <option key={badge} value={badge}>
                  {badge || "None"}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
              ⭐ Rating
            </label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              min="1"
              max="5"
              step="0.1"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Prep Time */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
              ⏱️ Prep Time
            </label>
            <input
              type="text"
              name="prepTime"
              value={formData.prepTime}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                transition: 'all 0.3s'
              }}
              placeholder="15-20 min"
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Restaurant */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
              🏪 Restaurant
            </label>
            <input
              type="text"
              name="restaurant"
              value={formData.restaurant}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                transition: 'all 0.3s'
              }}
              placeholder="QuickBite Kitchen"
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Image URL */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
              🖼️ Image URL
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                transition: 'all 0.3s'
              }}
              placeholder="https://images.unsplash.com/..."
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
            📝 Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '2px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              transition: 'all 0.3s',
              resize: 'vertical'
            }}
            placeholder="Delicious food description..."
            onFocus={(e) => {
              e.target.style.outline = 'none';
              e.target.style.borderColor = '#ef4444';
              e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Checkboxes */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          background: 'linear-gradient(135deg, #fef2f2 0%, #fef3c7 100%)',
          padding: '1rem',
          borderRadius: '0.5rem'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="isVeg"
              checked={formData.isVeg}
              onChange={handleChange}
              style={{ marginRight: '0.75rem', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#374151' }}>🥗 Vegetarian</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              style={{ marginRight: '0.75rem', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#374151' }}>✅ Available</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #ef4444 0%, #eab308 100%)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            fontWeight: 700,
            fontSize: '1.125rem',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'scale(1.02)';
              e.target.style.boxShadow = '0 15px 35px rgba(239, 68, 68, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 10px 25px rgba(239, 68, 68, 0.3)';
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '1.5rem',
                height: '1.5rem',
                border: '2px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Adding Item...
            </span>
          ) : (
            "✨ Add Food Item to Menu"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddFoodForm;