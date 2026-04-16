import { motion } from "framer-motion";

const PARTICLES = [
  "🍕", "🍔", "🍜", "🌮", "🍣", "🍰", "🥤", "☕",
  "🍟", "🥗", "🌯", "🍩", "🧁", "🍫", "🥤", "🍱"
];

export default function ParticleBackground() {
  const items = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    emoji: PARTICLES[i % PARTICLES.length],
    left: `${5 + Math.random() * 90}%`,
    duration: 18 + Math.random() * 25,
    delay: Math.random() * 20,
    size: 18 + Math.random() * 16,
  }));

  return (
    <div className="particles-container">
      {items.map((p) => (
        <motion.div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            fontSize: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}
