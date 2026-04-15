import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getOrders } from "../services/api.js";

const STATUS_CLASS = {
  Delivered: "order-status status-delivered",
  Placed: "order-status status-pending",
  Preparing: "order-status status-pending",
  "Out for Delivery": "order-status status-pending",
  Cancelled: "order-status status-cancelled",
};

const FALLBACK = [
  { _id:"ord001abc", orderStatus:"Delivered", createdAt: new Date(Date.now()-86400000*2), totalAmount:748,
    items:[{ name:"Margherita Pizza", emoji:"🍕", quantity:2 }, { name:"Mango Lassi", emoji:"🥤", quantity:1 }] },
  { _id:"ord002xyz", orderStatus:"Placed", createdAt: new Date(), totalAmount:399,
    items:[{ name:"Smash Burger", emoji:"🍔", quantity:1 }, { name:"Cold Brew Coffee", emoji:"☕", quantity:1 }] },
];

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    getOrders().then(setOrders).catch(() => setOrders(FALLBACK)).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <h1 className="section-title" style={{ marginBottom:8 }}>My Orders 📦</h1>
      <p style={{ color:"rgba(255,255,255,0.65)", marginBottom:36, fontSize:15 }}>
        {orders.length} order{orders.length !== 1 ? "s" : ""} total
      </p>
      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div className="empty-title">No orders yet</div>
          <div className="empty-sub">Your order history will appear here</div>
          <button className="btn-primary" onClick={() => navigate("/menu")}>Start ordering →</button>
        </div>
      ) : orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <div>
              <div className="order-id">Order #{order._id.slice(-6).toUpperCase()}</div>
              <div className="order-date">
                {new Date(order.createdAt || order.date).toLocaleDateString("en-IN", {
                  day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit",
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className={STATUS_CLASS[order.orderStatus] || "order-status status-pending"}>
                {(order.orderStatus||"Placed").charAt(0).toUpperCase()+(order.orderStatus||"Placed").slice(1)}
              </span>
              {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && (
                <Link to={`/tracking/${order._id}`}>
                  <button className="btn-glass" style={{ padding: "6px 14px", fontSize: 12 }}>
                    Track 📍
                  </button>
                </Link>
              )}
            </div>
          </div>
          <div className="order-items">
            {(order.items||[]).map((item,i) => (
              <span key={i} className="order-item-chip">{item.emoji||"🍽️"} {item.name} × {item.quantity}</span>
            ))}
          </div>
          <div className="order-total">Total: ₹{order.totalAmount}</div>
        </div>
      ))}
    </div>
  );
}