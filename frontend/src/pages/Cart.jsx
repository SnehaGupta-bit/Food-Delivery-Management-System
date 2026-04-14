import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { placeOrder } from "../services/api.js";

export default function Cart() {
  const { cartItems, addToCart, removeFromCart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState(null);

  const delivery = cartTotal > 0 ? 49 : 0;
  const total = cartTotal + delivery;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleOrder = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setPlacing(true);

    try {
      const orderData = {
        userId: user._id,
        items: cartItems.map((item) => ({
          foodId: item._id,  // Matches backend schema
          name: item.name,
          price: item.price,
          quantity: item.qty,  // Corrected to match schema
          image: item.image || ""
        })),
        totalAmount: total,  // Matches backend expectation
        deliveryAddress: "Customer Address",
        paymentMethod: "COD"
      };

      await placeOrder(orderData);

      clearCart();
      showToast("Order placed successfully! 🎉");

      setTimeout(() => {
        navigate("/orders");
      }, 1800);

    } catch (error) {
      console.log(error);
      showToast("Could not place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <div className="empty-title">Your cart is empty</div>
          <div className="empty-sub">
            Looks like you haven't added anything yet
          </div>

          <button
            className="btn-primary"
            onClick={() => navigate("/menu")}
          >
            Browse Menu →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="section-title" style={{ marginBottom: 32 }}>
        Your Cart 🛒
      </h1>

      <div className="cart-wrap">

        {/* LEFT SIDE */}
        <div className="cart-items-list">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">

              <div className="cart-item-img">
                {item.emoji || "🍽️"}
              </div>

              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">
                  ₹{item.price} each
                </div>
              </div>

              <div className="qty-ctrl">
                <button
                  className="qty-btn"
                  onClick={() => removeFromCart(item._id)}
                >
                  −
                </button>

                <span className="qty-num">{item.qty}</span>

                <button
                  className="qty-btn"
                  onClick={() => addToCart(item)}
                >
                  +
                </button>
              </div>

              <div
                style={{
                  fontWeight: 700,
                  minWidth: 60,
                  textAlign: "right"
                }}
              >
                ₹{item.price * item.qty}
              </div>

            </div>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="cart-summary">

          <div className="summary-title">
            Order Summary
          </div>

          <div className="summary-row">
            <span>
              Subtotal ({cartItems.reduce((s, i) => s + i.qty, 0)} items)
            </span>
            <span>₹{cartTotal}</span>
          </div>

          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>₹{delivery}</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <button
            className="btn-primary"
            style={{ width: "100%", padding: 15 }}
            onClick={handleOrder}
            disabled={placing}
          >
            {placing
              ? "Placing Order..."
              : user
              ? "Place Order 🚀"
              : "Login to Order"}
          </button>

          <button
            className="btn-glass"
            style={{ width: "100%", marginTop: 10 }}
            onClick={() => navigate("/menu")}
          >
            + Add More Items
          </button>

        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}