import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Regular");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch product details
    fetch(`http://localhost:3000/api/food/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load product");
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = {
      ...product,
      qty: quantity,
      selectedSize,
    };
    
    for (let i = 0; i < quantity; i++) {
      addToCart(cartItem);
    }
    
    toast.success(`${quantity} × ${product.name} added to cart! 🛒`, {
      style: { background: "#1a0f0f", color: "#fef3c7", border: "1px solid rgba(251, 191, 36, 0.3)" },
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="page-padded">
        <div className="spinner" style={{ margin: "100px auto" }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-padded">
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <div className="empty-title">Product not found</div>
          <button className="btn-primary" onClick={() => navigate("/menu")}>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-padded">
      <motion.button
        className="btn-secondary"
        onClick={() => navigate(-1)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ marginBottom: 24 }}
      >
        ← Back
      </motion.button>

      <div className="product-detail-container">
        {/* Product Image */}
        <motion.div
          className="product-image-section"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="product-main-image">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <span style={{ fontSize: 120 }}>{product.emoji || "🍽️"}</span>
            )}
          </div>
          
          {product.badge && (
            <div className="product-badges">
              <span className={`badge badge-${product.badge}`}>
                {product.badge === "hot" ? "🔥 Hot" : product.badge === "new" ? "✨ New" : "⭐ Popular"}
              </span>
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          className="product-info-section"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {product.restaurant && (
            <div className="product-restaurant">
              <span>🏪</span> {product.restaurant}
            </div>
          )}

          <h1 className="product-title">{product.name}</h1>

          <div className="product-meta">
            <span className="product-rating">⭐ {product.rating || "4.5"}</span>
            {product.prepTime && <span className="product-time">⏱ {product.prepTime}</span>}
            {product.isVeg !== undefined && (
              <span className={`product-diet ${product.isVeg ? "veg" : "nonveg"}`}>
                {product.isVeg ? "🟢 Vegetarian" : "🔴 Non-Veg"}
              </span>
            )}
          </div>

          <div className="product-price-section">
            <div className="product-price">₹{product.price}</div>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <div className="product-original-price">₹{product.originalPrice}</div>
                <div className="product-discount">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </div>
              </>
            )}
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description || "Delicious food item prepared with fresh ingredients and authentic recipes."}</p>
          </div>

          {/* Size Selection */}
          <div className="product-options">
            <h3>Select Size</h3>
            <div className="size-options">
              {["Regular", "Medium", "Large"].map((size) => (
                <button
                  key={size}
                  className={`size-option ${selectedSize === size ? "active" : ""}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="product-quantity">
            <h3>Quantity</h3>
            <div className="qty-ctrl-large">
              <button
                className="qty-btn-large"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </button>
              <span className="qty-num-large">{quantity}</span>
              <button
                className="qty-btn-large"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="product-actions">
            <motion.button
              className="btn-secondary"
              onClick={handleAddToCart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ flex: 1 }}
            >
              🛒 Add to Cart
            </motion.button>
            <motion.button
              className="btn-primary"
              onClick={handleBuyNow}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ flex: 1 }}
            >
              ⚡ Buy Now
            </motion.button>
          </div>

          {/* Additional Info */}
          <div className="product-additional-info">
            <div className="info-item">
              <span className="info-icon">📦</span>
              <div>
                <div className="info-title">Free Delivery</div>
                <div className="info-desc">On orders above ₹499</div>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">🔄</span>
              <div>
                <div className="info-title">Easy Returns</div>
                <div className="info-desc">7-day return policy</div>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">✅</span>
              <div>
                <div className="info-title">Quality Assured</div>
                <div className="info-desc">Fresh & hygienic</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      <motion.div
        className="related-products-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="section-title">You might also like</h2>
        <div className="related-products-grid">
          {/* This would be populated with related products */}
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Related products will appear here
          </p>
        </div>
      </motion.div>
    </div>
  );
}
