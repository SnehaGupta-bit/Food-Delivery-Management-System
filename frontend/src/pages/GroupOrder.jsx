import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import { createGroupOrder, joinGroupOrder, getGroupOrder } from "../services/api.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function GroupOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // "create" or "join"
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [participants, setParticipants] = useState([]);
  const [isActive, setIsActive] = useState(false);

  if (!user) {
    return (
      <div className="page-padded">
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div className="empty-title">Login Required</div>
          <div className="empty-sub">Sign in to start or join a group order</div>
          <button className="btn-primary" onClick={() => navigate("/login")}>Sign In →</button>
        </div>
      </div>
    );
  }

  const socket = useSocket();

  useEffect(() => {
    if (socket && isActive && roomCode) {
      socket.emit("join_group", roomCode);

      socket.on("user_joined", (data) => {
        setParticipants((prev) => {
          if (prev.find(p => p.name === data.participant.name)) return prev;
          return [...prev, { name: data.participant.name, isHost: false }];
        });
        toast(`${data.participant.name} joined!`, { icon: "👋" });
      });

      return () => {
        socket.off("user_joined");
      };
    }
  }, [socket, isActive, roomCode]);

  const createRoom = async () => {
    try {
      const data = await createGroupOrder({});
      setRoomCode(data.roomCode);
      setParticipants([{ name: user.name || "You", isHost: true }]);
      setIsActive(true);
      setMode("create");
      toast.success("Group created! Share the code with friends 🎉");
    } catch (err) {
      toast.error(err.message || "Failed to create group");
    }
  };

  const joinRoom = async () => {
    if (joinCode.length < 4) {
      toast.error("Enter a valid room code");
      return;
    }
    try {
      const data = await joinGroupOrder(joinCode.toUpperCase());
      setRoomCode(data.roomCode);
      
      const parts = data.participants.map(p => ({
        name: p.name,
        isHost: p._id === data.host._id
      }));
      setParticipants(parts);
      
      setIsActive(true);
      setMode("join");
      toast.success("Joined the group! 🎉");
    } catch (err) {
      toast.error(err.message || "Invalid or locked room");
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success("Code copied! 📋", {
      style: { background: "#222236", color: "#f0f0f5", border: "1px solid rgba(255,255,255,0.08)" },
    });
  };

  return (
    <div className="page-padded">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title" style={{ fontSize: 36 }}>
          👥 Group Order
        </h1>
        <p className="section-subtitle">Order together, split the bill — real-time collaboration</p>
      </motion.div>

      <div className="group-container">
        {!isActive ? (
          <>
            <motion.div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div
                style={{
                  padding: "36px 24px", textAlign: "center",
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius-xl)",
                  cursor: "pointer",
                }}
                whileHover={{ y: -4, borderColor: "var(--accent)" }}
                whileTap={{ scale: 0.98 }}
                onClick={createRoom}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: 18,
                  fontWeight: 700, marginBottom: 8,
                }}>Create Group</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Start a new group and invite friends
                </div>
              </motion.div>

              <motion.div
                style={{
                  padding: "36px 24px", textAlign: "center",
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius-xl)",
                }}
                whileHover={{ y: -4, borderColor: "var(--accent)" }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: 18,
                  fontWeight: 700, marginBottom: 12,
                }}>Join Group</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="form-input"
                    placeholder="Enter code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    style={{ textTransform: "uppercase", textAlign: "center", letterSpacing: 3, fontSize: 16, fontWeight: 700 }}
                  />
                  <motion.button
                    className="btn-primary"
                    onClick={joinRoom}
                    whileTap={{ scale: 0.95 }}
                    style={{ padding: "10px 20px" }}
                  >
                    Join
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Room Code */}
            <div
              className="room-code"
              onClick={copyCode}
              style={{ cursor: "pointer" }}
              title="Click to copy"
            >
              {roomCode}
              <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: 0, fontWeight: 400, marginTop: 8 }}>
                Click to copy • Share with friends
              </div>
            </div>

            {/* Participants */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--text-secondary)" }}>
                Participants ({participants.length})
              </div>
              <div className="participant-list">
                {participants.map((p, i) => (
                  <motion.div
                    key={i}
                    className="participant-chip"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="participant-avatar">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    {p.name}
                    {p.isHost && (
                      <span style={{
                        fontSize: 9, background: "var(--accent-subtle)",
                        color: "var(--accent)", padding: "2px 8px",
                        borderRadius: 50, fontWeight: 700,
                      }}>HOST</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
              <motion.button
                className="btn-primary"
                style={{ width: "100%" }}
                onClick={() => navigate("/menu")}
                whileHover={{ scale: 1.01 }}
              >
                🍽️ Add Items to Group Cart
              </motion.button>

              {mode === "create" && (
                <motion.button
                  className="btn-secondary"
                  style={{ width: "100%", borderColor: "rgba(239,68,68,0.3)", color: "var(--rose)" }}
                  onClick={() => { setIsActive(false); setMode(null); setParticipants([]); }}
                  whileHover={{ scale: 1.01 }}
                >
                  🔒 Lock & Checkout
                </motion.button>
              )}
            </div>

            {/* Bill Split Preview */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                marginTop: 28, padding: 20,
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
                💰 Bill Split Calculator
              </div>
              <div className="summary-row">
                <span>Group Total</span>
                <span>₹0</span>
              </div>
              <div className="summary-row">
                <span>Per Person ({participants.length})</span>
                <span>₹0</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                Add items from the menu to see the split
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
