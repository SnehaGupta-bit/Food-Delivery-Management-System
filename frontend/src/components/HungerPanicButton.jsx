import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { HiOutlineLightningBolt } from "react-icons/hi";
import HungerEmergencyMode from "./HungerEmergencyMode.jsx";

export default function HungerPanicButton({ onActivate }) {
  const [active, setActive] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showEmergencyMode, setShowEmergencyMode] = useState(false);

  const handleClick = () => {
    setActive(true);
    setShowEmergencyMode(true);
    onActivate && onActivate();
    setTimeout(() => setActive(false), 30000); // 30s panic mode
  };

  return (
    <>
      <div className="panic-btn-wrap">
        <AnimatePresence>
          {showTooltip && !active && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              style={{
                position: "absolute", bottom: "100%", right: 0,
                marginBottom: 10, padding: "8px 14px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--glass-border)",
                borderRadius: "var(--radius)", fontSize: 12,
                color: "var(--text-primary)", whiteSpace: "nowrap",
                boxShadow: "var(--shadow)",
              }}
            >
              ⚡ Hunger Emergency Mode
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="panic-btn"
          onClick={handleClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          whileTap={{ scale: 0.85 }}
          animate={active ? {
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, -5, 0],
          } : {}}
          transition={active ? { duration: 0.5, repeat: 2 } : {}}
          style={active ? {
            background: "linear-gradient(135deg, #dc2626, #b91c1c)",
            boxShadow: "0 8px 40px rgba(239,68,68,0.6), 0 0 80px rgba(239,68,68,0.3)",
          } : {}}
        >
          <HiOutlineLightningBolt />
        </motion.button>

        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: "absolute", bottom: "100%", right: 0,
                marginBottom: 10, padding: "12px 18px",
                background: "rgba(220, 38, 38, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "var(--radius)", fontSize: 13,
                color: "var(--rose)", fontWeight: 600,
                boxShadow: "var(--shadow)",
                backdropFilter: "blur(12px)",
              }}
            >
              ⚡ HUNGER MODE ACTIVE — Finding fastest delivery!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <HungerEmergencyMode 
        isOpen={showEmergencyMode}
        onClose={() => {
          setShowEmergencyMode(false);
          setActive(false);
        }}
      />
    </>
  );
}
