import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import "../../styles/vendor-panel.css";

const VendorRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    restaurantName: "",
    phone: ""
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
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "vendor",
          restaurantName: formData.restaurantName
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Registration successful! Welcome to QuickBite!");
        navigate("/vendor/dashboard");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
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

        {/* Registration Card */}
        <div className="vendor-login-card">
          {/* Header */}
          <div className="vendor-login-header">
            <div className="text-6xl mb-4">🍽️</div>
            <h1>Vendor Registration</h1>
            <p>Join QuickBite as a Restaurant Partner</p>
          </div>

          {/* Form */}
          <div className="vendor-form-container">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="vendor-form-field">
                <label className="vendor-form-label">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="vendor-form-input"
                  placeholder="John Doe"
                />
              </div>

              <div className="vendor-form-field">
                <label className="vendor-form-label">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  required
                  className="vendor-form-input"
                  placeholder="Your Restaurant Name"
                />
              </div>

              <div className="vendor-form-field">
                <label className="vendor-form-label">
                  Email Address *
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
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="vendor-form-input"
                  placeholder="••••••••"
                />
              </div>

              <div className="vendor-form-field">
                <label className="vendor-form-label">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
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
                    Creating Account...
                  </span>
                ) : (
                  "Register as Vendor"
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/vendor/login"
                  className="vendor-back-button"
                >
                  Login Here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorRegister;