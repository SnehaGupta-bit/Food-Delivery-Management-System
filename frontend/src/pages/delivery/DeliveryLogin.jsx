import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import "../../styles/delivery-panel.css";

const DeliveryLogin = () => {
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
          expectedRole: "delivery_partner"
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role !== "delivery_partner") {
          toast.error("Access denied. This is the delivery partner panel.");
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Welcome back, " + data.user.name + "!");
        navigate("/delivery/dashboard");
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
    <div className="delivery-login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/panels")}
          className="delivery-back-button back-button"
        >
          ← Back to Panel Selection
        </button>

        {/* Login Card */}
        <div className="delivery-login-card">
          {/* Header */}
          <div className="delivery-login-header">
            <div className="text-6xl mb-4">🏍️</div>
            <h1>Delivery Partner Login</h1>
            <p>Start earning today</p>
          </div>

          {/* Form */}
          <div className="delivery-form-container">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="delivery-form-field">
                <label className="delivery-form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="delivery-form-input"
                  placeholder="partner@delivery.com"
                />
              </div>

              <div className="delivery-form-field">
                <label className="delivery-form-label">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="delivery-form-input"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="delivery-btn-primary"
              >
                {loading ? (
                  <span className="loading-container">
                    <div className="delivery-loading-spinner"></div>
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
                Want to become a delivery partner?{" "}
                <Link
                  to="/delivery/register"
                  className="delivery-back-button"
                >
                  Register Now
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="demo-credentials delivery-demo">
              <p>
                <strong>Demo Credentials:</strong><br />
                Email: delivery@demo.com<br />
                Password: delivery123
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeliveryLogin;
