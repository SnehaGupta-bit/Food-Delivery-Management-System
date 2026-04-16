import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { placeOrder } from "../services/api.js";
import toast from "react-hot-toast";

export default function Cart() {
  const { cartItems, addToCart, removeFromCart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // Delivery Address Form State
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    instructions: ""
  });

  const [errors, setErrors] = useState({});

  const delivery = cartTotal > 0 ? (cartTotal > 499 ? 0 : 49) : 0;
  const platformFee = 5;
  const gst = Math.round((cartTotal + delivery) * 0.05); // 5% GST
  const discount = promoApplied ? Math.round(cartTotal * 0.3) : 0;
  const total = cartTotal + delivery + platformFee + gst - discount;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "QUICKBITE30") {
      setPromoApplied(true);
      toast.success("🎉 30% discount applied!", {
        style: { background: "#222236", color: "#f0f0f5", border: "1px solid rgba(52,211,153,0.3)" },
      });
    } else {
      toast.error("Invalid promo code", {
        style: { background: "#222236", color: "#f0f0f5", border: "1px solid rgba(251,113,133,0.3)" },
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!deliveryDetails.name.trim()) newErrors.name = "Name is required";
    if (!deliveryDetails.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(deliveryDetails.email)) newErrors.email = "Invalid email";
    
    if (!deliveryDetails.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(deliveryDetails.phone)) newErrors.phone = "Invalid phone number";
    
    if (!deliveryDetails.address.trim()) newErrors.address = "Address is required";
    if (!deliveryDetails.city.trim()) newErrors.city = "City is required";
    if (!deliveryDetails.state.trim()) newErrors.state = "State is required";
    
    if (!deliveryDetails.pincode.trim()) newErrors.pincode = "PIN code is required";
    else if (!/^\d{6}$/.test(deliveryDetails.pincode)) newErrors.pincode = "Invalid PIN code";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleRazorpay = () => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_placeholder",
      amount: total * 100,
      currency: "INR",
      name: "QuickBite",
      description: "Food Order Payment",
      handler: async function (response) {
        toast.success("Payment successful! 🎉");
        await submitOrder("Online", response.razorpay_payment_id);
      },
      prefill: {
        name: deliveryDetails.name,
        email: deliveryDetails.email,
        contact: deliveryDetails.phone
      },
      theme: { color: "#ff6b35" },
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      toast.error("Payment service unavailable. Try COD.");
    }
  };

  const submitOrder = async (method, paymentId) => {
    setPlacing(true);
    try {
      const fullAddress = `${deliveryDetails.address}, ${deliveryDetails.landmark ? deliveryDetails.landmark + ', ' : ''}${deliveryDetails.city}, ${deliveryDetails.state} - ${deliveryDetails.pincode}`;
      
      const orderData = {
        userId: user._id || user.id,
        items: cartItems.map((item) => ({
          foodId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.qty,
          image: item.image || "",
        })),
        totalAmount: total,
        deliveryAddress: fullAddress,
        customerDetails: {
          name: deliveryDetails.name,
          email: deliveryDetails.email,
          phone: deliveryDetails.phone,
          address: deliveryDetails.address,
          city: deliveryDetails.city,
          state: deliveryDetails.state,
          pincode: deliveryDetails.pincode,
          landmark: deliveryDetails.landmark,
          instructions: deliveryDetails.instructions
        },
        paymentMethod: method,
        paymentId: paymentId || null,
        deliveryFee: delivery,
        platformFee: platformFee,
        gst: gst,
        discount: discount
      };

      const response = await placeOrder(orderData);
      clearCart();
      toast.success("Order placed successfully! 🚀", {
        style: { background: "#222236", color: "#f0f0f5", border: "1px solid rgba(52,211,153,0.3)" },
      });
      setTimeout(() => navigate(`/track/${response.order.id}`), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const handleOrder = async () => {
    if (!user) { 
      navigate("/login"); 
      return; 
    }
    
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    if (paymentMethod === "Online") {
      handleRazorpay();
    } else {
      await submitOrder("COD");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-padded">
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="empty-icon">🛒</div>
          <div className="empty-title">Your cart is empty</div>
          <div className="empty-sub">Explore our menu and add delicious items to your cart</div>
          <motion.button
            className="btn-primary"
            onClick={() => navigate("/menu")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Browse Menu →
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-padded">
      <motion.h1
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}
      >
        Your Cart <span style={{ fontSize: 24 }}>🛒</span>
      </motion.h1>

      <div className="cart-wrap">
        {/* Items */}
        <motion.div
          className="cart-items-list"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <AnimatePresence mode="popLayout">
            {cartItems.map((item) => (
              <motion.div
                key={item._id}
                className="cart-item"
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0, padding: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div className="cart-item-img">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span style={{ fontSize: 32 }}>{item.emoji || "🍽️"}</span>
                  )}
                </div>

                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">₹{item.price} each</div>
                  {item.restaurant && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      📍 {item.restaurant}
                    </div>
                  )}
                </div>

                <div className="qty-ctrl">
                  <motion.button
                    className="qty-btn"
                    onClick={() => removeFromCart(item._id)}
                    whileTap={{ scale: 0.85 }}
                  >
                    −
                  </motion.button>
                  <span className="qty-num">{item.qty}</span>
                  <motion.button
                    className="qty-btn"
                    onClick={() => addToCart(item)}
                    whileTap={{ scale: 0.85 }}
                  >
                    +
                  </motion.button>
                </div>

                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, minWidth: 60, textAlign: "right", color: "var(--text-primary)" }}>
                  ₹{item.price * item.qty}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Summary */}
        <motion.div
          className="cart-summary"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="summary-title">Order Summary</div>

          {/* Delivery Address Section */}
          <div style={{
            marginBottom: 20,
            padding: 16,
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12
            }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                📍 Delivery Address
              </span>
              <motion.button
                onClick={() => setShowAddressForm(!showAddressForm)}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '6px 12px',
                  background: showAddressForm ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: showAddressForm ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {showAddressForm ? '✓ Done' : '+ Add'}
              </motion.button>
            </div>

            <AnimatePresence>
              {showAddressForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 12 }}>
                    {/* Name & Email */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <input
                          type="text"
                          name="name"
                          placeholder="Full Name *"
                          value={deliveryDetails.name}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'var(--bg-secondary)',
                            border: `1px solid ${errors.name ? '#ef4444' : 'var(--glass-border)'}`,
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 13,
                            color: 'var(--text-primary)',
                            outline: 'none'
                          }}
                        />
                        {errors.name && <span style={{ fontSize: 10, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.name}</span>}
                      </div>
                      <div>
                        <input
                          type="email"
                          name="email"
                          placeholder="Email *"
                          value={deliveryDetails.email}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'var(--bg-secondary)',
                            border: `1px solid ${errors.email ? '#ef4444' : 'var(--glass-border)'}`,
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 13,
                            color: 'var(--text-primary)',
                            outline: 'none'
                          }}
                        />
                        {errors.email && <span style={{ fontSize: 10, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.email}</span>}
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number (10 digits) *"
                        value={deliveryDetails.phone}
                        onChange={handleInputChange}
                        maxLength={10}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'var(--bg-secondary)',
                          border: `1px solid ${errors.phone ? '#ef4444' : 'var(--glass-border)'}`,
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 13,
                          color: 'var(--text-primary)',
                          outline: 'none'
                        }}
                      />
                      {errors.phone && <span style={{ fontSize: 10, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.phone}</span>}
                    </div>

                    {/* Address */}
                    <div>
                      <textarea
                        name="address"
                        placeholder="House No., Building Name, Street *"
                        value={deliveryDetails.address}
                        onChange={handleInputChange}
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'var(--bg-secondary)',
                          border: `1px solid ${errors.address ? '#ef4444' : 'var(--glass-border)'}`,
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 13,
                          color: 'var(--text-primary)',
                          outline: 'none',
                          resize: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                      {errors.address && <span style={{ fontSize: 10, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.address}</span>}
                    </div>

                    {/* Landmark */}
                    <input
                      type="text"
                      name="landmark"
                      placeholder="Landmark (Optional)"
                      value={deliveryDetails.landmark}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 13,
                        color: 'var(--text-primary)',
                        outline: 'none'
                      }}
                    />

                    {/* City, State, PIN */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 12 }}>
                      <div>
                        <input
                          type="text"
                          name="city"
                          placeholder="City *"
                          value={deliveryDetails.city}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'var(--bg-secondary)',
                            border: `1px solid ${errors.city ? '#ef4444' : 'var(--glass-border)'}`,
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 13,
                            color: 'var(--text-primary)',
                            outline: 'none'
                          }}
                        />
                        {errors.city && <span style={{ fontSize: 10, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.city}</span>}
                      </div>
                      <div>
                        <input
                          type="text"
                          name="state"
                          placeholder="State *"
                          value={deliveryDetails.state}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'var(--bg-secondary)',
                            border: `1px solid ${errors.state ? '#ef4444' : 'var(--glass-border)'}`,
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 13,
                            color: 'var(--text-primary)',
                            outline: 'none'
                          }}
                        />
                        {errors.state && <span style={{ fontSize: 10, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.state}</span>}
                      </div>
                      <div>
                        <input
                          type="text"
                          name="pincode"
                          placeholder="PIN *"
                          value={deliveryDetails.pincode}
                          onChange={handleInputChange}
                          maxLength={6}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'var(--bg-secondary)',
                            border: `1px solid ${errors.pincode ? '#ef4444' : 'var(--glass-border)'}`,
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 13,
                            color: 'var(--text-primary)',
                            outline: 'none'
                          }}
                        />
                        {errors.pincode && <span style={{ fontSize: 10, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.pincode}</span>}
                      </div>
                    </div>

                    {/* Delivery Instructions */}
                    <textarea
                      name="instructions"
                      placeholder="Delivery Instructions (Optional)"
                      value={deliveryDetails.instructions}
                      onChange={handleInputChange}
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 13,
                        color: 'var(--text-primary)',
                        outline: 'none',
                        resize: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showAddressForm && deliveryDetails.address && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {deliveryDetails.name}<br />
                {deliveryDetails.address}, {deliveryDetails.city}<br />
                {deliveryDetails.state} - {deliveryDetails.pincode}<br />
                📞 {deliveryDetails.phone}
              </div>
            )}
          </div>

          {/* Promo */}
          <div className="promo-input-wrap">
            <input
              className="promo-input"
              placeholder="PROMO CODE"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              disabled={promoApplied}
            />
            <button
              className="promo-apply"
              onClick={handleApplyPromo}
              disabled={promoApplied}
              style={promoApplied ? { color: "var(--emerald)", borderColor: "rgba(52,211,153,0.3)" } : {}}
            >
              {promoApplied ? "✓ Applied" : "Apply"}
            </button>
          </div>

          <div className="summary-row">
            <span>Item Total ({cartItems.reduce((s, i) => s + i.qty, 0)} items)</span>
            <span>₹{cartTotal}</span>
          </div>

          <div className="summary-row">
            <span>Delivery Fee</span>
            <span style={delivery === 0 ? { color: "var(--emerald)" } : {}}>
              {delivery === 0 ? "FREE" : `₹${delivery}`}
            </span>
          </div>

          <div className="summary-row">
            <span>Platform Fee</span>
            <span>₹{platformFee}</span>
          </div>

          <div className="summary-row">
            <span>GST (5%)</span>
            <span>₹{gst}</span>
          </div>

          {promoApplied && (
            <div className="summary-row">
              <span className="savings">Discount (30%)</span>
              <span className="savings">−₹{discount}</span>
            </div>
          )}

          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          {/* Payment Method */}
          <div className="payment-methods">
            <div
              className={`payment-method${paymentMethod === "COD" ? " selected" : ""}`}
              onClick={() => setPaymentMethod("COD")}
            >
              <input type="radio" checked={paymentMethod === "COD"} readOnly />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>💵 Cash on Delivery</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Pay when your order arrives</div>
              </div>
            </div>
            <div
              className={`payment-method${paymentMethod === "Online" ? " selected" : ""}`}
              onClick={() => setPaymentMethod("Online")}
            >
              <input type="radio" checked={paymentMethod === "Online"} readOnly />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>💳 Pay Online (Razorpay)</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>UPI, Cards, Net Banking, Wallets</div>
              </div>
            </div>
          </div>

          <motion.button
            className="btn-primary"
            style={{ width: "100%", padding: 15 }}
            onClick={handleOrder}
            disabled={placing || !deliveryDetails.address}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {placing ? "Placing Order..." : user ? `Pay ₹${total} 🚀` : "Login to Order"}
          </motion.button>

          {!deliveryDetails.address && (
            <div style={{ fontSize: 11, color: '#ef4444', textAlign: 'center', marginTop: 8 }}>
              Please add delivery address to continue
            </div>
          )}

          <motion.button
            className="btn-secondary"
            style={{ width: "100%", marginTop: 10 }}
            onClick={() => navigate("/menu")}
            whileHover={{ scale: 1.01 }}
          >
            + Add More Items
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
