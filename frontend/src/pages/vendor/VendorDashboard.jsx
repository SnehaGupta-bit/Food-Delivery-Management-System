import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "../../styles/vendor-panel.css";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      toast.error("Please login first");
      navigate("/vendor/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "vendor") {
      toast.error("Access denied");
      navigate("/vendor/login");
      return;
    }

    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/vendor/login");
  };

  if (!user) return null;

  return (
    <div className="vendor-dashboard">
      {/* Header */}
      <div className="vendor-dashboard-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="vendor-dashboard-title">🍽️ Vendor Dashboard</h1>
              <p className="vendor-dashboard-subtitle">Welcome back, {user.name}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="vendor-btn-secondary"
              style={{ padding: '0.75rem 1.5rem' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="vendor-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🚧</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--vendor-text-primary)', marginBottom: '1rem' }}>
            Vendor Dashboard Coming Soon!
          </h2>
          <p style={{ color: 'var(--vendor-text-secondary)', marginBottom: '2rem', maxWidth: '42rem', margin: '0 auto 2rem' }}>
            The complete vendor dashboard with menu management, order tracking, and analytics
            is currently under development. Check back soon!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
            <div className="vendor-card" style={{ background: 'var(--vendor-bg-primary)', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
              <h3 style={{ fontWeight: 700, color: 'var(--vendor-text-primary)', marginBottom: '0.5rem' }}>Menu Management</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--vendor-text-secondary)' }}>Add, edit, and manage your menu items</p>
            </div>
            <div className="vendor-card" style={{ background: '#fee2e2', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
              <h3 style={{ fontWeight: 700, color: 'var(--vendor-text-primary)', marginBottom: '0.5rem' }}>Order Management</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--vendor-text-secondary)' }}>Track and manage incoming orders</p>
            </div>
            <div className="vendor-card" style={{ background: '#fef3c7', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
              <h3 style={{ fontWeight: 700, color: 'var(--vendor-text-primary)', marginBottom: '0.5rem' }}>Analytics</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--vendor-text-secondary)' }}>View sales reports and insights</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/food-management")}
            className="vendor-btn-primary"
            style={{ marginTop: '2rem', maxWidth: '400px', fontSize: '1rem' }}
          >
            Go to Food Management (Temporary)
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
