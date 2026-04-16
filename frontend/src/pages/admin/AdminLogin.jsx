import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import "../../styles/admin-panel.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          expectedRole: "admin"
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role !== "admin") {
          toast.error("Access denied. Admin credentials required.");
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Welcome back, Admin!");
        navigate("/admin/dashboard");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/panels")}
          className="admin-back-button back-button"
        >
          ← Back to Panel Selection
        </button>

        {/* Login Card */}
        <div className="admin-login-card">
          {/* Header */}
          <div className="admin-login-header">
            <div className="text-6xl mb-4">👨‍💼</div>
            <h1>Admin Login</h1>
            <p>Platform Management</p>
          </div>

          {/* Form */}
          <div className="admin-form-container">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="admin-form-field">
                <label className="admin-form-label">
                  Admin Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="admin-form-input"
                  placeholder="admin@quickbite.com"
                />
              </div>

              <div className="admin-form-field">
                <label className="admin-form-label">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="admin-form-input"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="admin-btn-primary"
              >
                {loading ? (
                  <span className="loading-container">
                    <div className="admin-loading-spinner"></div>
                    Logging in...
                  </span>
                ) : (
                  "Access Admin Panel"
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 admin-warning rounded-lg">
              <p className="text-sm text-center">
                <strong>🔒 Secure Access</strong><br />
                This panel is restricted to authorized administrators only.
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="demo-credentials admin-demo">
              <p>
                <strong>Demo Credentials:</strong><br />
                Email: admin@demo.com<br />
                Password: admin123
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
