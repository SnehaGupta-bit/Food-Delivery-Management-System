import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { getOrders } from "../services/api.js";

const STATUS_CLASS = {
  delivered: "order-status status-delivered",
  Delivered: "order-status status-delivered",
  pending: "order-status status-pending",
  Placed: "order-status status-pending",
  Preparing: "order-status status-preparing",
  cancelled: "order-status status-cancelled",
  Cancelled: "order-status status-cancelled",
  "Out for Delivery": "order-status status-preparing",
};

const FALLBACK = [
  {
    _id: "ord001abc", orderStatus: "Delivered", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), totalAmount: 748,
    items: [{ name: "Margherita Pizza", emoji: "🍕", quantity: 2, price: 299 }, { name: "Mango Lassi", emoji: "🥤", quantity: 1, price: 129 }]
  },
  {
    _id: "ord002xyz", orderStatus: "Placed", createdAt: new Date().toISOString(), totalAmount: 399,
    items: [{ name: "Smash Burger", emoji: "🍔", quantity: 1, price: 349 }, { name: "Cold Brew Coffee", emoji: "☕", quantity: 1, price: 149 }]
  },
];

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    getOrders()
      .then((data) => setOrders(data.length > 0 ? data : FALLBACK))
      .catch(() => setOrders(FALLBACK))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="page-padded"><div className="spinner" /></div>;

  return (
    <div className="page-padded">
      <motion.h1
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 8 }}
      >
        My Orders <span style={{ fontSize: 24 }}>📦</span>
      </motion.h1>
      <p className="section-subtitle">
        {orders.length} order{orders.length !== 1 ? "s" : ""} total
      </p>

      {orders.length === 0 ? (
        <motion.div className="empty-state" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="empty-icon">📦</div>
          <div className="empty-title">No orders yet</div>
          <div className="empty-sub">Your order history will appear here</div>
          <button className="btn-primary" onClick={() => navigate("/menu")}>Start ordering →</button>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {orders.map((order) => (
            <motion.div
              key={order._id}
              className="order-card"
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              layout
              onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
              style={{ cursor: "pointer" }}
            >
              <div className="order-header">
                <div>
                  <div className="order-id">Order #{(order._id || "").slice(-6).toUpperCase()}</div>
                  <div className="order-date">
                    {new Date(order.createdAt || order.date).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
                <span className={STATUS_CLASS[order.orderStatus] || "order-status status-pending"}>
                  {order.orderStatus || "Placed"}
                </span>
              </div>

              <div className="order-items">
                {(order.items || []).map((item, i) => (
                  <span key={i} className="order-item-chip">
                    {item.emoji || "🍽️"} {item.name} × {item.quantity || item.qty || 1}
                  </span>
                ))}
              </div>

              <AnimatePresence>
                {expandedId === order._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{
                      marginTop: 16, padding: "16px 0",
                      borderTop: "1px solid var(--glass-border)",
                      display: "flex", flexDirection: "column", gap: 8,
                    }}>
                      {(order.items || []).map((item, i) => (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between",
                          fontSize: 13, color: "var(--text-secondary)",
                        }}>
                          <span>{item.name} × {item.quantity || item.qty || 1}</span>
                          <span>₹{(item.price || 0) * (item.quantity || item.qty || 1)}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="order-total">Total: ₹{order.totalAmount || order.total}</div>
                <div className="order-actions">
                  {(order.orderStatus === "Placed" || order.orderStatus === "Preparing") && (
                    <button
                      className="btn-glass"
                      style={{ padding: "6px 14px", fontSize: 12 }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/track/${order._id}`); }}
                    >
                      📍 Track
                    </button>
                  )}
                  <button
                    className="btn-glass"
                    style={{ padding: "6px 14px", fontSize: 12 }}
                    onClick={(e) => { e.stopPropagation(); navigate("/menu"); }}
                  >
                    🔄 Reorder
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}