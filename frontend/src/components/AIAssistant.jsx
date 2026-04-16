import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext.jsx";
import { useAIChat } from "../context/AIChatContext.jsx";
import toast from "react-hot-toast";

const QUICK_PROMPTS = [
  "🔥 What's popular?",
  "🥗 Vegetarian options",
  "💰 Under ₹300",
  "😢 I'm feeling sad",
  "🌶️ Something spicy",
  "💪 Healthy picks",
];

export default function AIAssistant() {
  const { isOpen: open, toggleChat, closeChat } = useAIChat();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey there! 👋 I'm QuickBite AI. Tell me what you're craving or how you're feeling — I'll find the perfect dish! 🍽️",
      products: []
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [addedMap, setAddedMap] = useState({});
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setHasNew(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    const updated = [...messages, { role: "user", content: userText, products: [] }];
    setMessages(updated);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history: messages }),
      });
      
      const data = await res.json();
      
      const reply = data.reply || data.error || "Hmm, let me think... 🤔";
      const products = data.products || [];
      
      setMessages((prev) => [...prev, { role: "assistant", content: reply, products }]);
      if (!open) setHasNew(true);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: "Oops! Connection issue 😅 Try asking about pizza, burgers, or your mood!",
        products: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleAddToCart = (dish) => {
    addToCart(dish);
    setAddedMap((prev) => ({ ...prev, [dish._id]: true }));
    toast.success(`${dish.name} added! 🛒`, {
      style: { background: "#222236", color: "#f0f0f5", border: "1px solid rgba(255,255,255,0.08)" },
    });
    setTimeout(() => setAddedMap((prev) => ({ ...prev, [dish._id]: false })), 1800);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={toggleChat}
        style={{
          position: "fixed", bottom: 28, right: 28,
          width: 60, height: 60, borderRadius: "50%",
          background: "var(--grad-accent)",
          border: "none",
          boxShadow: "0 8px 32px rgba(255,107,53,0.4)",
          cursor: "pointer", zIndex: 99999,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, color: "white",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: open ? 90 : 0 }}
      >
        {open ? "✕" : "🤖"}
        {hasNew && !open && (
          <span style={{
            position: "absolute", top: 2, right: 2,
            width: 14, height: 14, borderRadius: "50%",
            background: "#ef4444", border: "2px solid var(--bg-primary)",
          }} />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              position: "fixed", bottom: 100, right: 28,
              width: 420, height: 600,
              display: "flex", flexDirection: "column",
              background: "rgba(18, 18, 26, 0.95)",
              backdropFilter: "blur(28px)",
              border: "1px solid var(--glass-border)",
              borderRadius: 24, zIndex: 99998,
              boxShadow: "0 24px 72px rgba(0,0,0,0.5)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "14px 18px",
              background: "var(--glass-bg)",
              borderBottom: "1px solid var(--glass-border)",
              display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "var(--grad-accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
              }}>🤖</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                  QuickBite AI
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--emerald)", display: "inline-block", boxShadow: "0 0 6px var(--emerald)" }} />
                  Online • Food recommendations
                </div>
              </div>
              <button onClick={closeChat} style={{
                background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
                borderRadius: "50%", width: 28, height: 28, color: "var(--text-muted)",
                fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: "auto", padding: "14px 12px",
              display: "flex", flexDirection: "column", gap: 12,
            }}>
              {messages.map((msg, i) => {
                const isBot = msg.role === "assistant";
                const products = msg.products || [];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: "flex", flexDirection: "column", alignItems: isBot ? "flex-start" : "flex-end" }}
                  >
                    <div style={{
                      maxWidth: "87%", padding: "10px 14px",
                      borderRadius: isBot ? "6px 16px 16px 16px" : "16px 6px 16px 16px",
                      background: isBot ? "var(--glass-bg)" : "var(--accent)",
                      border: isBot ? "1px solid var(--glass-border)" : "none",
                      fontSize: 13, lineHeight: 1.6,
                      color: isBot ? "var(--text-primary)" : "white",
                      wordBreak: "break-word",
                    }}>
                      {msg.content}
                    </div>
                    
                    {/* Product Carousel */}
                    {products.length > 0 && (
                      <div style={{ 
                        marginTop: 10, 
                        width: "100%",
                        overflowX: "auto",
                        display: "flex",
                        gap: 10,
                        paddingBottom: 8,
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(255,255,255,0.2) transparent"
                      }}>
                        {products.map((dish) => (
                          <motion.div
                            key={dish._id}
                            whileHover={{ scale: 1.02 }}
                            style={{
                              minWidth: 180,
                              background: "var(--glass-bg)",
                              border: "1px solid var(--glass-border)",
                              borderRadius: 12,
                              padding: 12,
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                              cursor: "pointer"
                            }}
                          >
                            <div style={{
                              fontSize: 32,
                              textAlign: "center",
                              marginBottom: 4
                            }}>
                              {dish.emoji}
                            </div>
                            <div style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--text-primary)",
                              textAlign: "center",
                              lineHeight: 1.3
                            }}>
                              {dish.name}
                            </div>
                            <div style={{
                              fontSize: 11,
                              color: "var(--text-muted)",
                              textAlign: "center",
                              marginBottom: 4
                            }}>
                              {dish.description}
                            </div>
                            <div style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: "var(--accent)",
                              textAlign: "center",
                              marginBottom: 6
                            }}>
                              ₹{dish.price}
                            </div>
                            <motion.button
                              onClick={() => handleAddToCart(dish)}
                              whileTap={{ scale: 0.95 }}
                              style={{
                                padding: "8px 12px",
                                background: addedMap[dish._id] ? "rgba(52,211,153,0.2)" : "var(--accent)",
                                border: "none",
                                borderRadius: 8,
                                color: addedMap[dish._id] ? "var(--emerald)" : "white",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                            >
                              {addedMap[dish._id] ? "✓ Added!" : "Add to Cart"}
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {loading && (
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  <div style={{
                    padding: "12px 16px", background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "6px 16px 16px 16px", display: "flex", gap: 5,
                  }}>
                    {[0, 1, 2].map((j) => (
                      <motion.span
                        key={j}
                        style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", display: "inline-block" }}
                        animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: j * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 2 && (
              <div style={{
                padding: "8px 12px", borderTop: "1px solid var(--glass-border)",
                display: "flex", flexWrap: "wrap", gap: 6, flexShrink: 0,
              }}>
                {QUICK_PROMPTS.map((p) => (
                  <motion.button
                    key={p}
                    onClick={() => sendMessage(p)}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: "5px 12px", background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)", borderRadius: 50,
                      color: "var(--text-secondary)", fontSize: 11, fontWeight: 500,
                      cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    {p}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{
              padding: "10px 12px", background: "var(--glass-bg)",
              borderTop: "1px solid var(--glass-border)",
              display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0,
            }}>
              <textarea
                ref={inputRef} value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about food, moods, diets... 🍽️"
                rows={1}
                style={{
                  flex: 1, background: "var(--bg-secondary)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 14, padding: "10px 14px",
                  color: "var(--text-primary)", fontSize: 13,
                  fontFamily: "var(--font-body)",
                  outline: "none", resize: "none",
                  lineHeight: 1.4, maxHeight: 80,
                }}
              />
              <motion.button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: input.trim() && !loading ? "var(--accent)" : "var(--glass-bg)",
                  border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17, flexShrink: 0, color: "white",
                }}
              >
                {loading ? "⏳" : "➤"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
