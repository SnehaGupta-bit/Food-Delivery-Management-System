import { motion } from "framer-motion";

export function CardSkeleton() {
  return (
    <motion.div
      className="skeleton skeleton-card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ background: "var(--bg-tertiary)", borderRadius: "var(--radius-lg)" }}
    >
      <div style={{ height: 180, background: "var(--bg-secondary)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0" }} />
      <div style={{ padding: 20 }}>
        <div className="skeleton skeleton-text" style={{ width: "70%", height: 16 }} />
        <div className="skeleton skeleton-text" style={{ width: "90%", height: 12, marginTop: 8 }} />
        <div className="skeleton skeleton-text short" style={{ width: "40%", height: 12, marginTop: 8 }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 8 }} />
          <div className="skeleton" style={{ width: 80, height: 36, borderRadius: 100 }} />
        </div>
      </div>
    </motion.div>
  );
}

export function CategorySkeleton() {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ minWidth: 100, height: 90, borderRadius: "var(--radius)" }} />
      ))}
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <div className="skeleton" style={{ height: 160, borderRadius: "var(--radius-xl)", margin: "0 48px 48px" }} />
  );
}
