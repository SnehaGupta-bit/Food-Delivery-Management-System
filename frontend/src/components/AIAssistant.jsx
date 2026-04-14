import { useState, useRef, useEffect } from "react";
import { useCart } from "../context/CartContext.jsx";

const SYSTEM_PROMPT = `You are QuickBite AI, a friendly food recommendation assistant for a food delivery app called QuickBite.
You help users discover dishes, suggest meals based on mood, craving, or diet, and answer food-related questions.

Our full menu:
PIZZA: Margherita Pizza (₹299), Pepperoni Pizza (₹349)
BURGERS: Classic Smash Burger (₹349), BBQ Bacon Burger (₹399)
SUSHI: Salmon Sushi Platter (₹599), Tuna Roll (₹449)
NOODLES: Spicy Ramen Bowl (₹389), Pad Thai Noodles (₹329)
TACOS: Street Tacos 3pcs (₹259), Beef Burrito (₹299)
SALADS: Caesar Salad (₹229), Greek Salad (₹219)
DESSERTS: Tiramisu Slice (₹199), Chocolate Lava Cake (₹229)
DRINKS: Mango Lassi (₹129), Cold Brew Coffee (₹149)

Rules:
- Be warm, fun and concise — 2 to 4 sentences max
- Always recommend specific dishes with prices
- Respect dietary needs (vegetarian, vegan, budget, etc.)
- Use food emojis naturally
- Never invent dishes not on the menu
- If asked something unrelated to food, politely redirect`;

const DISHES = [
  { _id:"1",  name:"Margherita Pizza",     emoji:"🍕", price:299, category:"Pizza",    badge:"hot"     },
  { _id:"2",  name:"Pepperoni Pizza",       emoji:"🍕", price:349, category:"Pizza",    badge:"popular" },
  { _id:"3",  name:"Classic Smash Burger",  emoji:"🍔", price:349, category:"Burgers",  badge:"popular" },
  { _id:"4",  name:"BBQ Bacon Burger",      emoji:"🍔", price:399, category:"Burgers",  badge:"hot"     },
  { _id:"5",  name:"Salmon Sushi Platter",  emoji:"🍣", price:599, category:"Sushi",    badge:"new"     },
  { _id:"6",  name:"Tuna Roll",             emoji:"🍣", price:449, category:"Sushi"                     },
  { _id:"7",  name:"Spicy Ramen Bowl",      emoji:"🍜", price:389, category:"Noodles",  badge:"hot"     },
  { _id:"8",  name:"Pad Thai Noodles",      emoji:"🍜", price:329, category:"Noodles"                   },
  { _id:"9",  name:"Street Tacos",          emoji:"🌮", price:259, category:"Tacos",    badge:"popular" },
  { _id:"10", name:"Beef Burrito",          emoji:"🌯", price:299, category:"Tacos"                     },
  { _id:"11", name:"Caesar Salad",          emoji:"🥗", price:229, category:"Salads",   badge:"new"     },
  { _id:"12", name:"Greek Salad",           emoji:"🥗", price:219, category:"Salads"                    },
  { _id:"13", name:"Tiramisu Slice",        emoji:"🍰", price:199, category:"Desserts", badge:"new"     },
  { _id:"14", name:"Chocolate Lava Cake",   emoji:"🍫", price:229, category:"Desserts", badge:"popular" },
  { _id:"15", name:"Mango Lassi",           emoji:"🥤", price:129, category:"Drinks"                    },
  { _id:"16", name:"Cold Brew Coffee",      emoji:"☕", price:149, category:"Drinks",   badge:"new"     },
];

const QUICK_PROMPTS = [
  "🔥 What's popular?",
  "🥗 I'm vegetarian",
  "💰 Under ₹300",
  "🌹 Date night picks",
  "🌶️ Something spicy",
  "💪 Healthy options",
];

function getMentionedDishes(text) {
  return DISHES.filter((d) => {
    const words = d.name.toLowerCase().split(" ");
    return words.some((w) => w.length > 3 && text.toLowerCase().includes(w));
  }).slice(0, 3);
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey there! 👋 I'm QuickBite AI. Tell me what you're craving and I'll find the perfect dish for you! 🍽️",
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

  const updated = [...messages, { role: "user", content: userText }];
  setMessages(updated);
  setLoading(true);

  try {
    const res = await fetch("http://localhost:3000/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userText,
        history: messages, // send previous chat
      }),
    });

    const data = await res.json();

    const reply = data.reply || "No response 😅";

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: reply },
    ]);

    if (!open) setHasNew(true);
  } catch (error) {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Oops! AI failed 😅 Try again.",
      },
    ]);
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
    setTimeout(() => setAddedMap((prev) => ({ ...prev, [dish._id]: false })), 1800);
  };

  return (
    <>
      {/* ── FLOATING BUTTON ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: 28, right: 28,
          width: 60, height: 60,
          borderRadius: "50%",
          background: "white",
          border: "2.5px solid #ff6b35",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25), 0 0 0 4px rgba(255,107,53,0.15)",
          cursor: "pointer",
          zIndex: 99999,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26,
          transition: "transform 0.25s, box-shadow 0.25s",
          transform: open ? "rotate(90deg) scale(1.08)" : "scale(1)",
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.transform = "scale(1.12)"; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.transform = "scale(1)"; }}
      >
        {open ? "✕" : "🤖"}
        {hasNew && !open && (
          <span style={{
            position: "absolute", top: 1, right: 1,
            width: 14, height: 14, borderRadius: "50%",
            background: "#ff6b35", border: "2px solid white",
          }} />
        )}
      </button>

      {/* ── CHAT WINDOW ── */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: 100, right: 28,
          width: 375, height: 570,
          display: "flex", flexDirection: "column",
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.38)",
          borderRadius: 26,
          zIndex: 99998,
          boxShadow: "0 24px 72px rgba(0,0,0,0.22)",
          overflow: "hidden",
          animation: "aiPopIn 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        }}>

          {/* HEADER */}
          <div style={{
            padding: "14px 18px",
            background: "rgba(255,255,255,0.2)",
            borderBottom: "1px solid rgba(255,255,255,0.22)",
            display: "flex", alignItems: "center", gap: 12,
            flexShrink: 0,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "rgba(255,255,255,0.28)",
              border: "1.5px solid rgba(255,255,255,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, flexShrink: 0,
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700, fontSize: 15, color: "white",
              }}>
                QuickBite AI
              </div>
              <div style={{
                fontSize: 11, color: "rgba(255,255,255,0.68)",
                display: "flex", alignItems: "center", gap: 5, marginTop: 2,
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#4ade80", display: "inline-block",
                  boxShadow: "0 0 6px #4ade80",
                }} />
                Online · Food recommendations
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "50%", width: 30, height: 30,
                color: "white", fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          </div>

          {/* MESSAGES */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "14px 12px",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            {messages.map((msg, i) => {
              const isBot = msg.role === "assistant";
              const mentioned = isBot ? getMentionedDishes(msg.content) : [];
              return (
                <div key={i} style={{
                  display: "flex", flexDirection: "column",
                  alignItems: isBot ? "flex-start" : "flex-end",
                }}>
                  {/* Bubble */}
                  <div style={{
                    maxWidth: "87%",
                    padding: "10px 14px",
                    borderRadius: isBot ? "6px 18px 18px 18px" : "18px 6px 18px 18px",
                    background: isBot
                      ? "rgba(255,255,255,0.22)"
                      : "rgba(255,255,255,0.92)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    fontSize: 13, lineHeight: 1.6,
                    color: isBot ? "white" : "#1a1a1a",
                    wordBreak: "break-word",
                  }}>
                    {msg.content}
                  </div>

                  {/* Add to cart chips */}
                  {mentioned.length > 0 && (
                    <div style={{
                      display: "flex", flexWrap: "wrap", gap: 6,
                      marginTop: 8, maxWidth: "87%",
                    }}>
                      {mentioned.map((dish) => (
                        <button
                          key={dish._id}
                          onClick={() => handleAddToCart(dish)}
                          style={{
                            padding: "5px 12px",
                            background: addedMap[dish._id]
                              ? "rgba(74,222,128,0.35)"
                              : "rgba(255,255,255,0.26)",
                            border: "1px solid rgba(255,255,255,0.45)",
                            borderRadius: 50,
                            color: "white", fontSize: 11, fontWeight: 600,
                            cursor: "pointer", transition: "all 0.2s",
                          }}
                        >
                          {addedMap[dish._id]
                            ? `✓ Added!`
                            : `${dish.emoji} ${dish.name.split(" ")[0]} · ₹${dish.price}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing dots */}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={{
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.22)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "6px 18px 18px 18px",
                  display: "flex", gap: 5, alignItems: "center",
                }}>
                  {[0, 1, 2].map((j) => (
                    <span key={j} style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "rgba(255,255,255,0.75)",
                      display: "inline-block",
                      animation: `aiBounce 1.2s ease-in-out ${j * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* QUICK PROMPTS — shown only at start */}
          {messages.length <= 2 && (
            <div style={{
              padding: "8px 12px",
              borderTop: "1px solid rgba(255,255,255,0.15)",
              display: "flex", flexWrap: "wrap", gap: 6,
              flexShrink: 0,
            }}>
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  style={{
                    padding: "5px 12px",
                    background: "rgba(255,255,255,0.16)",
                    border: "1px solid rgba(255,255,255,0.28)",
                    borderRadius: 50, color: "white",
                    fontSize: 11, fontWeight: 500,
                    cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* INPUT */}
          <div style={{
            padding: "10px 12px",
            background: "rgba(255,255,255,0.12)",
            borderTop: "1px solid rgba(255,255,255,0.18)",
            display: "flex", gap: 8, alignItems: "flex-end",
            flexShrink: 0,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything about food... 🍽️"
              rows={1}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.28)",
                borderRadius: 14, padding: "10px 14px",
                color: "white", fontSize: 13,
                fontFamily: "var(--font-body)",
                outline: "none", resize: "none",
                lineHeight: 1.4, maxHeight: 80, overflowY: "auto",
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: input.trim() && !loading
                  ? "white"
                  : "rgba(255,255,255,0.2)",
                border: "none",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17, flexShrink: 0,
                transition: "all 0.2s",
                color: input.trim() && !loading ? "#ff6b35" : "rgba(255,255,255,0.5)",
              }}
            >
              {loading ? "⏳" : "➤"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes aiPopIn {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes aiBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
          40%           { transform: translateY(-7px); opacity: 1; }
        }
      `}</style>
    </>
  );
}