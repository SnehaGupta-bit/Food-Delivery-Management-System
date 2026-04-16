import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSocket } from "../context/SocketContext.jsx";

const TRACKING_STEPS = [
  { id: 1, title: "Order Placed", icon: "📋", time: "Just now" },
  { id: 2, title: "Preparing", icon: "👨‍🍳", time: "~10 min" },
  { id: 3, title: "Out for Delivery", icon: "🛵", time: "~20 min" },
  { id: 4, title: "Delivered", icon: "✅", time: "~30 min" },
];

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [currentStep, setCurrentStep] = useState(2); // Simulated starting default
  const [agentLocation, setAgentLocation] = useState(null);

  useEffect(() => {
    if (socket && id) {
      socket.emit("join_tracking", id);

      socket.on("live_location", (data) => {
        setAgentLocation(data);
        if (currentStep < 3) setCurrentStep(3); // Auto-advance to Out for Delivery
      });

      return () => {
        socket.off("live_location");
      };
    }
  }, [socket, id]);

  return (
    <div className="page-padded">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title" style={{ fontSize: 32 }}>
          📍 Track Your Order
        </h1>
        <p className="section-subtitle">
          Order #{(id || "").slice(-6).toUpperCase()} • Estimated delivery in 30 min
        </p>
      </motion.div>

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            height: 250,
            background: "linear-gradient(145deg, var(--bg-tertiary), var(--bg-secondary))",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-xl)",
            marginBottom: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 8,
          }}
        >
          <span style={{ fontSize: 48 }}>🗺️</span>
          {agentLocation ? (
            <span style={{ fontSize: 13, color: "var(--emerald)", fontWeight: 600 }}>
              Live: Agent is moving! ({parseFloat(agentLocation.latitude).toFixed(3)}, {parseFloat(agentLocation.longitude).toFixed(3)})
            </span>
          ) : (
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Connecting to live map stream...</span>
          )}
        </motion.div>

        {/* Delivery Agent */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "16px 20px",
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-lg)",
            marginBottom: 32,
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "var(--grad-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 700, color: "white",
          }}>
            R
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>Rahul S.</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Your delivery partner • ⭐ 4.8</div>
          </div>
          <button className="btn-glass" style={{ padding: "8px 16px", fontSize: 12 }}>📞 Call</button>
        </motion.div>

        {/* Timeline */}
        <div className="tracking-timeline">
          {TRACKING_STEPS.map((step, i) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            return (
              <motion.div
                key={step.id}
                className={`tracking-step${isCompleted ? " completed" : ""}${isActive ? " active" : ""}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="tracking-dot">
                  {isCompleted ? "✓" : step.icon}
                </div>
                <div className="tracking-info">
                  <div className="tracking-title" style={{
                    color: isCompleted ? "var(--emerald)" : isActive ? "var(--accent)" : "var(--text-secondary)",
                  }}>
                    {step.title}
                  </div>
                  <div className="tracking-time">{step.time}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.button
          className="btn-secondary"
          style={{ width: "100%", marginTop: 20 }}
          onClick={() => navigate("/orders")}
          whileHover={{ scale: 1.01 }}
        >
          ← Back to Orders
        </motion.button>
      </div>
    </div>
  );
}
