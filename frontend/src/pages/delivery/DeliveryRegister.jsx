import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import "../../styles/delivery-panel.css";

const DeliveryRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    vehicleType: "bike",
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
          role: "delivery_partner",
          vehicleType: formData.vehicleType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Registration successful! Welcome to QuickBite!");
        navigate("/delivery/dashboard");
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

        {/* Registration Card */}
        <div className="delivery-login-card">
          {/* Header */}
          <div className="delivery-login-header">
            <div className="text-6xl mb-4">🏍️</div>
            <h1>Delivery Partner Registration</h1>
            <p>Start earning with QuickBite</p>
          </div>

          {/* Form */}
          <div className="delivery-form-container">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="delivery-form-field">
                <label className="delivery-form-label">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="delivery-form-input"
                  placeholder="John Doe"
                />
              </div>

              <div className="delivery-form-field">
                <label className="delivery-form-label">
                  Email Address *
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
                  Vehicle Type *
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  required
                  className="delivery-form-input"
                >
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="car">Car</option>
                </select>
              </div>

              <div className="delivery-form-field">
                <label className="delivery-form-label">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="delivery-form-input"
                  placeholder="••••••••"
                />
              </div>

              <div className="delivery-form-field">
                <label className="delivery-form-label">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
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
                    Creating Account...
                  </span>
                ) : (
                  "Register as Delivery Partner"
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/delivery/login"
                  className="delivery-back-button"
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

export default DeliveryRegister;