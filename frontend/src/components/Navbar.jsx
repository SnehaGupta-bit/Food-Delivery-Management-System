import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, setUser } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">🍕 QuickBite</Link>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/menu">Menu</Link></li>
        {user ? (
          <>
            <li><Link to="/orders">My Orders</Link></li>
            <li>
              <button className="btn-glass" style={{ padding: "8px 18px" }} onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li>
              <Link to="/register">
                <button className="btn-primary" style={{ padding: "9px 22px" }}>Sign Up</button>
              </Link>
            </li>
          </>
        )}
        <li>
          <Link to="/cart">
            <button className="cart-btn">
              🛒
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </Link>
        </li>
      </ul>
    </nav>
  );
}