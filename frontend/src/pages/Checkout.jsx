import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { placeOrder, createPaymentOrder, verifyPayment } from "../services/api.js";
import toast from "react-hot-toast";

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    instructions: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }

    // Pre-fill user details
    setCustomerDetails({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",
      landmark: "",
      instructions: "",
    });
  }, [user, cartItems, navigate]);

  const delivery = cartTotal > 0 ? (cartTotal > 499 ? 0 : 49) : 0;
  const discount = promoApplied ? Math.round(cartTotal * 0.3) : 0;
  const total = cartTotal + delivery - discount;

  const handleChange = (e) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "QUICKBITE30") {
      setPromoApplied(true);
      toast.success("🎉 30% discount applied!");
    } else {
      toast.error("Invalid promo code");
    }
  };

  const validateStep1 = () => {
    const required = ["name", "email", "phone", "address", "city", "state", "pincode"];
    for (let field of required) {
      if (!customerDetails[field].trim()) {
        toast.error(`Please fill in ${field}`);
        return false;
      }
    }
    
    // Validate phone number
    if (!/^[6-9]\d{9}$/.test(customerDetails.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }

    // Validate pincode
    if (!/^\d{6}$/.test(customerDetails.pincode)) {
      toast.error("Please enter a valid 6-digit PIN code");
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);
      
      // Create Razorpay order
      const orderData = await createPaymentOrder({ amount: total });
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_placeholder",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "QuickBite",
        description: "Food Order Payment",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // Verify payment
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            
            await submitOrder("Online", response.razorpay_payment_id);
          } catch (error) {
            toast.error("Payment verification failed");
            setLoading(false);
          }
        },
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        theme: { color: "#dc2626" },
        modal: {
          ondismiss: () => setLoading(false)
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error("Payment service unavailable. Try COD.");
        setLoading(false);
      }
    } catch (error) {
      toast.error("Failed to initiate payment");
      setLoading(false);
    }
  };

  const submitOrder = async (method, paymentId = null) => {
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          foodId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.qty,
          image: item.image || "",
        })),
        totalAmount: total,
        deliveryAddress: `${customerDetails.address}, ${customerDetails.landmark ? customerDetails.landmark + ', ' : ''}${customerDetails.city}, ${customerDetails.state} - ${customerDetails.pincode}`,
        paymentMethod: method,
        paymentId: paymentId,
        customerDetails: customerDetails,
      };

      await placeOrder(orderData);
      clearCart();
      setStep(3);
      
      toast.success("Order placed successfully! 🚀");
    } catch (error) {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === "Online") {
      await handleRazorpayPayment();
    } else {
      setLoading(true);
      await submitOrder("COD");
    }
  };

  if (step === 3) {
    return (
      <div className="page-padded">
        <motion.div
          className="checkout-success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="success-icon">🎉</div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your order. We'll start preparing it right away.</p>
          <div className="success-actions">
            <button className="btn-primary" onClick={() => navigate("/orders")}>
              View Orders
            </button>
            <button className="btn-secondary" onClick={() => navigate("/menu")}>
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-padded">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">Checkout</h1>
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? "active" : ""}`}>
            <span>1</span> Details
          </div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>
            <span>2</span> Payment
          </div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>
            <span>3</span> Confirmation
          </div>
        </div>
      </motion.div>

      <div className="checkout-container">
        {/* Main Content */}
        <div className="checkout-main">
          {step === 1 && (
            <motion.div
              className="checkout-section"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2>Delivery Details</h2>
              <form className="checkout-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      className="form-input"
                      type="text"
                      name="name"
                      value={customerDetails.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      className="form-input"
                      type="email"
                      name="email"
                      value={customerDetails.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    className="form-input"
                    type="tel"
                    name="phone"
                    value={customerDetails.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Complete Address *</label>
                  <textarea
                    className="form-input"
                    name="address"
                    value={customerDetails.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="House/Flat No., Street, Area"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      className="form-input"
                      type="text"
                      name="city"
                      value={customerDetails.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      className="form-input"
                      type="text"
                      name="state"
                      value={customerDetails.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">PIN Code *</label>
                    <input
                      className="form-input"
                      type="text"
                      name="pincode"
                      value={customerDetails.pincode}
                      onChange={handleChange}
                      maxLength="6"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Landmark (Optional)</label>
                  <input
                    className="form-input"
                    type="text"
                    name="landmark"
                    value={customerDetails.landmark}
                    onChange={handleChange}
                    placeholder="Near hospital, mall, etc."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Instructions (Optional)</label>
                  <textarea
                    className="form-input"
                    name="instructions"
                    value={customerDetails.instructions}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Any special instructions for delivery"
                  />
                </div>
              </form>

              <button className="btn-primary checkout-next-btn" onClick={handleNextStep}>
                Continue to Payment →
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              className="checkout-section"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2>Payment Method</h2>
              
              <div className="payment-methods">
                <div
                  className={`payment-method ${paymentMethod === "COD" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("COD")}
                >
                  <input type="radio" checked={paymentMethod === "COD"} readOnly />
                  <div className="payment-info">
                    <div className="payment-title">💵 Cash on Delivery</div>
                    <div className="payment-desc">Pay when your order arrives</div>
                  </div>
                  <div className="payment-badge">Recommended</div>
                </div>

                <div
                  className={`payment-method ${paymentMethod === "Online" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("Online")}
                >
                  <input type="radio" checked={paymentMethod === "Online"} readOnly />
                  <div className="payment-info">
                    <div className="payment-title">💳 Pay Online</div>
                    <div className="payment-desc">UPI, Cards, Net Banking, Wallets</div>
                  </div>
                  <div className="payment-badge secure">Secure</div>
                </div>
              </div>

              <div className="checkout-actions">
                <button className="btn-secondary" onClick={() => setStep(1)}>
                  ← Back to Details
                </button>
                <button
                  className="btn-primary"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? "Processing..." : `Place Order - ₹${total}`}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <motion.div
          className="checkout-sidebar"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="order-summary">
            <h3>Order Summary</h3>

            {/* Items */}
            <div className="summary-items">
              {cartItems.map((item) => (
                <div key={item._id} className="summary-item">
                  <div className="item-info">
                    <span className="item-emoji">{item.emoji || "🍽️"}</span>
                    <div>
                      <div className="item-name">{item.name}</div>
                      <div className="item-qty">Qty: {item.qty}</div>
                    </div>
                  </div>
                  <div className="item-price">₹{item.price * item.qty}</div>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            <div className="promo-section">
              <div className="promo-input-wrap">
                <input
                  className="promo-input"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                />
                <button
                  className="promo-apply"
                  onClick={handleApplyPromo}
                  disabled={promoApplied}
                >
                  {promoApplied ? "✓" : "Apply"}
                </button>
              </div>
            </div>

            {/* Bill Details */}
            <div className="bill-details">
              <div className="bill-row">
                <span>Subtotal ({cartItems.reduce((s, i) => s + i.qty, 0)} items)</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="bill-row">
                <span>Delivery Fee</span>
                <span className={delivery === 0 ? "free" : ""}>
                  {delivery === 0 ? "FREE" : `₹${delivery}`}
                </span>
              </div>
              {promoApplied && (
                <div className="bill-row discount">
                  <span>Discount (30%)</span>
                  <span>−₹{discount}</span>
                </div>
              )}
              <div className="bill-row total">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>

            {delivery === 0 && (
              <div className="delivery-info">
                🎉 Congratulations! You saved ₹49 on delivery
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}