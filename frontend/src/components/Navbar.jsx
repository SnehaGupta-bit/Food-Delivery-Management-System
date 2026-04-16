import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineMenuAlt3, HiX } from "react-icons/hi";

export default function Navbar() {
  const { user, setUser } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/menu", label: "Menu" },
    { path: "/mood", label: "Mood Order" },
  ];

  return (
    <>
      <motion.nav
        className={`navbar${scrolled ? " scrolled" : ""}`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
      >
        <Link to="/" className="navbar-logo">
          <span>🍕</span> QuickBite<span className="logo-dot" />
        </Link>

        {/* Desktop Links */}
        <ul className="navbar-links">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-link${isActive(item.path) ? " active" : ""}`}
              >
                {item.label}
              </Link>
            </li>
          ))}

          {user ? (
            <>
              <li>
                <Link
                  to="/orders"
                  className={`nav-link${isActive("/orders") ? " active" : ""}`}
                >
                  My Orders
                </Link>
              </li>
              <li>
                <button className="nav-btn nav-btn-ghost" onClick={handleLogout}>
                  Logout
                </button>
              </li>
              <li>
                <div className="user-avatar" title={user.name || "User"}>
                  {(user.name || "U").charAt(0).toUpperCase()}
                </div>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">
                  <button className="nav-btn nav-btn-ghost">Login</button>
                </Link>
              </li>
              <li>
                <Link to="/register">
                  <button className="nav-btn nav-btn-accent">Sign Up</button>
                </Link>
              </li>
            </>
          )}

          <li>
            <Link to="/cart">
              <button className="cart-btn">
                🛒
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      className="cart-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </Link>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <HiX /> : <HiOutlineMenuAlt3 />}
        </button>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", top: 65, right: 0, bottom: 0,
              width: "280px", background: "rgba(10,10,15,0.98)",
              backdropFilter: "blur(24px)",
              borderLeft: "1px solid var(--glass-border)",
              zIndex: 499, padding: "24px",
              display: "flex", flexDirection: "column", gap: "8px",
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link${isActive(item.path) ? " active" : ""}`}
                style={{ display: "block", padding: "12px 16px", fontSize: "16px" }}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/orders" className="nav-link" style={{ display: "block", padding: "12px 16px" }}>
                  My Orders
                </Link>
                <Link to="/cart" className="nav-link" style={{ display: "block", padding: "12px 16px" }}>
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
                <button className="btn-secondary" style={{ marginTop: 16 }} onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ marginTop: 16 }}>
                  <button className="btn-secondary" style={{ width: "100%" }}>Login</button>
                </Link>
                <Link to="/register">
                  <button className="btn-primary" style={{ width: "100%", marginTop: 8 }}>Sign Up</button>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}