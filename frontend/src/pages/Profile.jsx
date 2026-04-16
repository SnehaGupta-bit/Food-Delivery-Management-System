import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Load user profile data
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",
    });
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser({ ...user, ...formData });
        localStorage.setItem("user", JSON.stringify({ ...user, ...formData }));
        toast.success("Profile updated successfully! ✅");
        setEditing(false);
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page-padded">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="section-title">My Profile</h1>
        <p className="section-subtitle">Manage your account information</p>
      </motion.div>

      <div className="profile-container">
        {/* Profile Header */}
        <motion.div
          className="profile-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="profile-avatar-large">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <span>{(user.name || "U").charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="profile-header-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            {user.authProvider === "google" && (
              <span className="profile-badge">
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google Account
              </span>
            )}
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          className="profile-form-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="profile-form-header">
            <h3>Personal Information</h3>
            {!editing ? (
              <button className="btn-secondary" onClick={() => setEditing(true)}>
                ✏️ Edit Profile
              </button>
            ) : (
              <button className="btn-secondary" onClick={() => setEditing(false)}>
                ✕ Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={true}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-input"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Address</label>
                <textarea
                  className="form-input"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!editing}
                  rows="3"
                  placeholder="Street address, apartment, suite, etc."
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  className="form-input"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  className="form-input"
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              <div className="form-group">
                <label className="form-label">PIN Code</label>
                <input
                  className="form-input"
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  disabled={!editing}
                  maxLength="6"
                />
              </div>
            </div>

            {editing && (
              <motion.button
                type="submit"
                className="btn-primary"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ marginTop: 24, width: "100%" }}
              >
                {loading ? "Saving..." : "💾 Save Changes"}
              </motion.button>
            )}
          </form>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="profile-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-value">0</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">₹0</div>
            <div className="stat-label">Total Spent</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">0</div>
            <div className="stat-label">Reviews</div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="profile-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button className="action-card" onClick={() => navigate("/orders")}>
            <span className="action-icon">📦</span>
            <div>
              <div className="action-title">My Orders</div>
              <div className="action-desc">View order history</div>
            </div>
            <span className="action-arrow">→</span>
          </button>

          <button className="action-card" onClick={() => navigate("/cart")}>
            <span className="action-icon">🛒</span>
            <div>
              <div className="action-title">My Cart</div>
              <div className="action-desc">View cart items</div>
            </div>
            <span className="action-arrow">→</span>
          </button>

          <button className="action-card">
            <span className="action-icon">❤️</span>
            <div>
              <div className="action-title">Favorites</div>
              <div className="action-desc">Saved items</div>
            </div>
            <span className="action-arrow">→</span>
          </button>

          <button className="action-card">
            <span className="action-icon">🎁</span>
            <div>
              <div className="action-title">Rewards</div>
              <div className="action-desc">Loyalty points</div>
            </div>
            <span className="action-arrow">→</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
