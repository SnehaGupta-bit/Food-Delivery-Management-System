import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getOrderTracking } from "../services/api.js";
import { io } from "socket.io-client";

const STATUS_STEPS = [
  { key: "Assigned", label: "Assigned", icon: "📋" },
  { key: "Picked Up", label: "Picked Up", icon: "📦" },
  { key: "On The Way", label: "On The Way", icon: "🚴" },
  { key: "Reached", label: "Reached", icon: "📍" },
  { key: "Delivered", label: "Delivered", icon: "✅" }
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Fetch initial tracking data
    getOrderTracking(orderId)
      .then(data => {
        setTracking(data.tracking);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Connect to socket for real-time updates
    const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:3000");
    setSocket(newSocket);

    newSocket.emit("joinOrderRoom", orderId);

    newSocket.on("locationUpdate", (data) => {
      setTracking(prev => ({
        ...prev,
        currentLocation: { lat: data.lat, lng: data.lng },
        status: data.status
      }));
    });

    newSocket.on("orderStatusUpdate", (data) => {
      setTracking(prev => ({
        ...prev,
        status: data.status
      }));
    });

    return () => {
      newSocket.emit("leaveOrderRoom", orderId);
      newSocket.disconnect();
    };
  }, [orderId]);

  if (loading) return <div className="page"><div className="spinner" /></div>;

  if (!tracking) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div className="empty-title">Tracking not available</div>
          <div className="empty-sub">This order hasn't been assigned to a delivery agent yet</div>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === tracking.status);

  return (
    <div className="page">
      <h1 className="section-title">Track Your Order 📍</h1>
      
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Order Info */}
        <div className="order-card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="order-id">Order #{orderId.slice(-6).toUpperCase()}</div>
              <div className="order-date">Estimated: {tracking.estimatedTime}</div>
              <div className="order-date">Distance: {tracking.distance}</div>
            </div>
            <div className="order-status status-pending">{tracking.status}</div>
          </div>
        </div>

        {/* Status Timeline */}
        <div style={{
          background: "rgba(255,255,255,0.16)",
          border: "1px solid rgba(255,255,255,0.28)",
          borderRadius: "var(--radius)",
          padding: "32px 28px",
          backdropFilter: "blur(12px)",
          marginBottom: 24
        }}>
          <div style={{ position: "relative" }}>
            {STATUS_STEPS.map((step, index) => (
              <div key={step.key} style={{
                display: "flex",
                alignItems: "center",
                marginBottom: index < STATUS_STEPS.length - 1 ? 32 : 0,
                position: "relative"
              }}>
                {/* Icon */}
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: index <= currentStepIndex 
                    ? "rgba(74,222,128,0.35)" 
                    : "rgba(255,255,255,0.14)",
                  border: `2px solid ${index <= currentStepIndex ? "#4ade80" : "rgba(255,255,255,0.3)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                  zIndex: 2
                }}>
                  {step.icon}
                </div>

                {/* Label */}
                <div style={{ marginLeft: 20, flex: 1 }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: index <= currentStepIndex ? "white" : "rgba(255,255,255,0.5)"
                  }}>
                    {step.label}
                  </div>
                  {index === currentStepIndex && (
                    <div style={{ fontSize: 13, color: "#4ade80", marginTop: 4 }}>
                      Current Status
                    </div>
                  )}
                </div>

                {/* Connecting Line */}
                {index < STATUS_STEPS.length - 1 && (
                  <div style={{
                    position: "absolute",
                    left: 24,
                    top: 50,
                    width: 2,
                    height: 32,
                    background: index < currentStepIndex 
                      ? "#4ade80" 
                      : "rgba(255,255,255,0.2)"
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Map Placeholder */}
        <div style={{
          background: "rgba(255,255,255,0.16)",
          border: "1px solid rgba(255,255,255,0.28)",
          borderRadius: "var(--radius)",
          padding: "48px 28px",
          backdropFilter: "blur(12px)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 8 }}>
            Live Map Coming Soon
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
            Google Maps integration will show real-time delivery agent location
          </div>
          <div style={{ marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            Current Location: {tracking.currentLocation.lat.toFixed(4)}, {tracking.currentLocation.lng.toFixed(4)}
          </div>
        </div>
      </div>
    </div>
  );
}
