import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getOrders } from "../services/api.js";

const STATUS_CLASS = {
  delivered: "order-status status-delivered",
  pending:   "order-status status-pending",
  cancelled: "order-status status-cancelled",
};

const FALLBACK = [
  { _id:"ord001abc", status:"delivered", createdAt: new Date(Date.now()-86400000*2), total:748,
    items:[{ name:"Margherita Pizza", emoji:"🍕", qty:2 }, { name:"Mango Lassi", emoji:"🥤", qty:1 }] },
  { _id:"ord002xyz", status:"pending", createdAt: new Date(), total:399,
    items:[{ name:"Smash Burger", emoji:"🍔", qty:1 }, { name:"Cold Brew Coffee", emoji:"☕", qty:1 }] },
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
            <span className={STATUS_CLASS[order.orderStatus] || "order-status status-pending"}>  // Corrected to match schema
              {(order.orderStatus||"placed").charAt(0).toUpperCase()+(order.orderStatus||"placed").slice(1)}  // Corrected to match schema
            </span>
          </div>
          <div className="order-items">
            {(order.items||[]).map((item,i) => (
              <span key={i} className="order-item-chip">{item.emoji||"🍽️"} {item.name} × {item.quantity}</span>  // Corrected to match schema
            ))}
          </div>
          <div className="order-total">Total: ₹{order.totalAmount}</div>  // Corrected to match schema
        </div>
      ))}
    </div>
  );
}