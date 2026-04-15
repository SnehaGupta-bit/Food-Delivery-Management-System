import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { createGroupOrder, joinGroupOrder, getGroupOrder, addItemToGroup, lockGroupOrder, checkoutGroup } from "../services/api.js";
import { io } from "socket.io-client";

const ALL_FOODS = [
  { _id:"1",  name:"Margherita Pizza",     price:299, emoji:"🍕" },
  { _id:"2",  name:"Pepperoni Pizza",      price:349, emoji:"🍕" },
  { _id:"3",  name:"Classic Smash Burger", price:349, emoji:"🍔" },
  { _id:"4",  name:"BBQ Bacon Burger",     price:399, emoji:"🍔" },
  { _id:"5",  name:"Salmon Sushi Platter", price:599, emoji:"🍣" },
  { _id:"6",  name:"Tuna Roll",            price:449, emoji:"🍣" },
];

export default function GroupOrder() {
  const [searchParams] = useSearchParams();
  const roomCodeParam = searchParams.get("room");
  
  const [mode, setMode] = useState(roomCodeParam ? "join" : "create");
  const [roomCode, setRoomCode] = useState(roomCodeParam || "");
  const [groupOrder, setGroupOrder] = useState(null);
  const [socket, setSocket] = useState(null);
  const [toast, setToast] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (groupOrder) {
      const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:3000");
      setSocket(newSocket);

      newSocket.emit("joinGroupRoom", groupOrder.roomCode);

      newSocket.on("participantJoined", (data) => {
        showToast(`${data.name} joined the group! 🎉`);
        refreshGroupOrder();
      });

      newSocket.on("orderUpdated", (data) => {
        setGroupOrder(data.groupOrder);
      });

      newSocket.on("orderLocked", (data) => {
        setGroupOrder(data.groupOrder);
        showToast("Order locked! Ready for checkout 🔒");
      });

      return () => {
        newSocket.emit("leaveGroupRoom", groupOrder.roomCode);
        newSocket.disconnect();
      };
    }
  }, [groupOrder?.roomCode]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const refreshGroupOrder = async () => {
    if (groupOrder) {
      const data = await getGroupOrder(groupOrder.roomCode);
      setGroupOrder(data.groupOrder);
    }
  };

  const handleCreate = async () => {
    try {
      const data = await createGroupOrder({ deliveryAddress: "Group Address" });
      setGroupOrder(data.groupOrder);
      setRoomCode(data.roomCode);
      showToast(`Group created! Share code: ${data.roomCode}`);
    } catch (error) {
      showToast(error.message);
    }
  };

  const handleJoin = async () => {
    try {
      const data = await joinGroupOrder({ roomCode });
      setGroupOrder(data.groupOrder);
      showToast("Joined group successfully! 🎉");
    } catch (error) {
      showToast(error.message);
    }
  };

  const handleAddItem = async (food) => {
    try {
      await addItemToGroup({
        roomCode: groupOrder.roomCode,
        foodId: food._id,
        name: food.name,
        price: food.price,
        quantity: 1
      });
      showToast(`${food.name} added! 🛒`);
    } catch (error) {
      showToast(error.message);
    }
  };

  const handleLock = async () => {
    try {
      await lockGroupOrder({ roomCode: groupOrder.roomCode });
      showToast("Order locked! 🔒");
    } catch (error) {
      showToast(error.message);
    }
  };

  const handleCheckout = async () => {
    try {
      const data = await checkoutGroup({ 
        roomCode: groupOrder.roomCode,
        splitMethod: "ItemBased"
      });
      showToast("Checkout initiated! 💳");
      navigate(`/orders`);
    } catch (error) {
      showToast(error.message);
    }
  };

  const isHost = groupOrder && user && groupOrder.hostId === user.id;
  const myParticipant = groupOrder?.participants.find(p => p.userId === user?.id);

  if (!groupOrder) {
    return (
      <div className="page">
        <h1 className="section-title">Group Order 👨‍👩‍👧‍👦</h1>
        
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <div className="auth-card">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🍕</div>
            <h2 className="auth-title">Order Together, Split the Bill</h2>
            <p className="auth-sub">Create a group order or join an existing one</p>

            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <button
                className={mode === "create" ? "btn-primary" : "btn-glass"}
                style={{ flex: 1 }}
                onClick={() => setMode("create")}
              >
                Create Group
              </button>
              <button
                className={mode === "join" ? "btn-primary" : "btn-glass"}
                style={{ flex: 1 }}
                onClick={() => setMode("join")}
              >
                Join Group
              </button>
            </div>

            {mode === "create" ? (
              <button className="form-btn" onClick={handleCreate}>
                Create Group Order 🚀
              </button>
            ) : (
              <>
                <input
                  className="form-input"
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  style={{ marginBottom: 16 }}
                />
                <button className="form-btn" onClick={handleJoin}>
                  Join Group 🎉
                </button>
              </>
            )}
          </div>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="section-title">Group Order 👨‍👩‍👧‍👦</h1>

      {/* Room Code */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
          Share this code with friends:
        </div>
        <div className="promo-code" style={{ fontSize: 24, padding: "8px 24px" }}>
          {groupOrder.roomCode}
        </div>
      </div>

      <div className="cart-wrap">
        {/* Left: Food Menu */}
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "white" }}>
            Add Items
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ALL_FOODS.map(food => (
              <div key={food._id} className="cart-item">
                <div className="cart-item-img">{food.emoji}</div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{food.name}</div>
                  <div className="cart-item-price">₹{food.price}</div>
                </div>
                <button
                  className="btn-icon"
                  onClick={() => handleAddItem(food)}
                  disabled={groupOrder.status !== "Active"}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Group Summary */}
        <div className="cart-summary">
          <div className="summary-title">Group Summary</div>

          {/* Participants */}
          <div style={{ marginBottom: 20 }}>
            {groupOrder.participants.map((p, i) => (
              <div key={i} style={{
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: 12,
                marginBottom: 8
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  {p.name} {p.userId === user?.id && "(You)"}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                  {p.items.length} items · ₹{p.subtotal}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>₹{groupOrder.totalAmount}</span>
          </div>

          {isHost && groupOrder.status === "Active" && (
            <button className="btn-primary" style={{ width: "100%", marginTop: 16 }} onClick={handleLock}>
              Lock Order 🔒
            </button>
          )}

          {isHost && groupOrder.status === "Locked" && (
            <button className="btn-primary" style={{ width: "100%", marginTop: 16 }} onClick={handleCheckout}>
              Checkout & Split Bill 💳
            </button>
          )}

          {!isHost && (
            <div style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
              Waiting for host to checkout...
            </div>
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
