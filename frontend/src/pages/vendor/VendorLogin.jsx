import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import "../../styles/vendor-panel.css";

const VendorLogin = () => {
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
          expectedRole: "vendor"
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role !== "vendor") {
          toast.error("Access denied. This is the vendor panel.");
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Welcome back, " + data.user.name + "!");
        navigate("/vendor/dashboard");
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
    <div className="vendor-login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/panels")}
          className="vendor-back-button back-button"
        >
          ← Back to Panel Selection
        </button>

        {/* Login Card */}
        <div className="vendor-login-card">
          {/* Header */}
          <div className="vendor-login-header">
            <div className="text-6xl mb-4">🍽️</div>
            <h1>Vendor Login</h1>
            <p>Manage your restaurant</p>
          </div>

          {/* Form */}
          <div className="vendor-form-container">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="vendor-form-field">
                <label className="vendor-form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="vendor-form-input"
                  placeholder="vendor@restaurant.com"
                />
              </div>

              <div className="vendor-form-field">
                <label className="vendor-form-label">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="vendor-form-input"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="vendor-btn-primary"
              >
                {loading ? (
                  <span className="loading-container">
                    <div className="vendor-loading-spinner"></div>
                    Logging in...
                  </span>
                ) : (
                  "Login to Dashboard"
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have a vendor account?{" "}
                <Link
                  to="/vendor/register"
                  className="vendor-back-button"
                >
                  Register Now
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="demo-credentials vendor-demo">
              <p>
                <strong>Demo Credentials:</strong><br />
                Email: vendor@demo.com<br />
                Password: vendor123
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorLogin;
