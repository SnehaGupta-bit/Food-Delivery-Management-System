import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import "../styles/admin-panel.css";
import AnalyticsDashboard from "../components/admin/analytics/Dashboard";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileType, setProfileType] = useState(null);

  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Sync tab with URL on mount and URL changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Check if user is logged in and is admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'admin') {
      toast.error('Access denied. Admin credentials required.');
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/admin/login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        const errorData = await response.json();
        console.error('Dashboard API error:', errorData);
        toast.error(errorData.message || 'Failed to fetch dashboard data');
        // Set default stats so UI still shows
        setStats({
          totalStats: { totalUsers: 0, totalVendors: 0, totalOrders: 0, totalRevenue: 0 },
          todayStats: { todayUsers: 0, todayOrders: 0, todayRevenue: 0 },
          orderStatusBreakdown: [],
          topVendors: []
        });
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Error connecting to server');
      // Set default stats so UI still shows
      setStats({
        totalStats: { totalUsers: 0, totalVendors: 0, totalOrders: 0, totalRevenue: 0 },
        todayStats: { todayUsers: 0, todayOrders: 0, todayRevenue: 0 },
        orderStatusBreakdown: [],
        topVendors: []
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/vendors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVendors(data.vendors || []);
      } else {
        console.error('Failed to fetch vendors');
        setVendors([]);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const verifyVendor = async (vendorId, isVerified) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/vendors/${vendorId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerified })
      });

      if (response.ok) {
        toast.success(`Vendor ${isVerified ? 'verified' : 'unverified'} successfully`);
        fetchVendors();
      } else {
        toast.error('Failed to update vendor status');
      }
    } catch (error) {
      toast.error('Error updating vendor status');
    }
  };

  const toggleVendorStatus = async (vendorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/vendors/${vendorId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Vendor status updated successfully');
        fetchVendors();
      } else {
        toast.error('Failed to update vendor status');
      }
    } catch (error) {
      toast.error('Error updating vendor status');
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'vendors') fetchVendors();
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="admin-login-page" style={{ position: 'relative', zIndex: 1 }}>
        <div className="loading-container" style={{ minHeight: '400px' }}>
          <div className="admin-loading-spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }}></div>
          <p style={{ marginLeft: '1rem', color: '#1f2937', fontWeight: 600, fontSize: '1rem' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const openProfile = (profile, type) => {
    setSelectedProfile(profile);
    setProfileType(type);
  };

  const closeProfile = () => {
    setSelectedProfile(null);
    setProfileType(null);
  };

  return (
    <div className="admin-login-page" style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      {/* Analytics Tab - Full Screen */}
      {activeTab === 'analytics' ? (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          overflow: 'auto',
          background: '#0f172a'
        }}>
          <AnalyticsDashboard onBack={() => handleTabChange('dashboard')} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '80rem', margin: '0 auto', padding: '1.5rem', position: 'relative', zIndex: 2 }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>
                👨‍💼 Admin Dashboard
              </h1>
              <p style={{ color: '#374151', fontSize: '1rem' }}>Manage your platform</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/panels')}
                className="admin-back-button"
              >
                ← Back to Panels
              </button>
              <button
                onClick={handleLogout}
                className="admin-btn-primary"
                style={{ width: 'auto', padding: '0.75rem 1.5rem', fontSize: '1rem' }}
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="admin-nav">
            {['dashboard', 'analytics', 'users', 'vendors', 'orders'].map((tab) => (
              <button
                key={tab}
                className={`admin-nav-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

        {/* Dashboard Stats */}
        {activeTab === 'dashboard' && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-dashboard"
          >
            {/* Stats Cards */}
            <div className="stats-grid">
              <motion.div 
                className="stat-card stat-card-clickable"
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTabChange('users')}
              >
                <div className="stat-icon">👥</div>
                <div className="stat-value" style={{ color: '#8b5cf6' }}>{stats.totalStats.totalUsers}</div>
                <div className="stat-label" style={{ color: '#374151' }}>Total Users</div>
                <div className="stat-change" style={{ color: '#059669' }}>+{stats.todayStats.todayUsers} today</div>
              </motion.div>
              
              <motion.div 
                className="stat-card stat-card-clickable"
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTabChange('vendors')}
              >
                <div className="stat-icon">🏪</div>
                <div className="stat-value" style={{ color: '#8b5cf6' }}>{stats.totalStats.totalVendors}</div>
                <div className="stat-label" style={{ color: '#374151' }}>Total Vendors</div>
              </motion.div>
              
              <motion.div 
                className="stat-card stat-card-clickable"
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTabChange('orders')}
              >
                <div className="stat-icon">📦</div>
                <div className="stat-value" style={{ color: '#8b5cf6' }}>{stats.totalStats.totalOrders}</div>
                <div className="stat-label" style={{ color: '#374151' }}>Total Orders</div>
                <div className="stat-change" style={{ color: '#059669' }}>+{stats.todayStats.todayOrders} today</div>
              </motion.div>
              
              <motion.div 
                className="stat-card"
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <div className="stat-icon">💰</div>
                <div className="stat-value" style={{ color: '#8b5cf6' }}>₹{stats.totalStats.totalRevenue.toLocaleString()}</div>
                <div className="stat-label" style={{ color: '#374151' }}>Total Revenue</div>
                <div className="stat-change" style={{ color: '#059669' }}>+₹{stats.todayStats.todayRevenue} today</div>
              </motion.div>
            </div>

            {/* Order Status Breakdown */}
            <div className="admin-section">
              <h3 style={{ color: '#1f2937' }}>Order Status Breakdown</h3>
              <div className="status-grid">
                {stats.orderStatusBreakdown && stats.orderStatusBreakdown.length > 0 ? (
                  stats.orderStatusBreakdown.map((status) => (
                    <div key={status._id} className="status-item">
                      <span className="status-name" style={{ color: '#1f2937' }}>{status._id || 'Unknown'}</span>
                      <span className="status-count" style={{ color: '#8b5cf6' }}>{status.count}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#6b7280' }}>No orders yet</p>
                )}
              </div>
            </div>

            {/* Top Vendors */}
            <div className="admin-section">
              <h3 style={{ color: '#1f2937' }}>Top Vendors</h3>
              <div className="top-vendors">
                {stats.topVendors && stats.topVendors.length > 0 ? (
                  stats.topVendors.map((vendor, index) => (
                    <motion.div 
                      key={vendor._id} 
                      className="vendor-item vendor-item-clickable"
                      whileHover={{ scale: 1.02, x: 8 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openProfile(vendor, 'vendor')}
                    >
                      <span className="vendor-rank" style={{ color: '#8b5cf6' }}>#{index + 1}</span>
                      <span className="vendor-name" style={{ color: '#1f2937' }}>{vendor.restaurantName}</span>
                      <span className="vendor-orders" style={{ color: '#374151' }}>{vendor.orderCount} orders</span>
                      <span className="vendor-rating" style={{ color: '#f59e0b' }}>⭐ {vendor.rating}</span>
                    </motion.div>
                  ))
                ) : (
                  <p style={{ color: '#6b7280' }}>No vendor data available</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-table-container"
          >
            <h3 style={{ color: '#1f2937' }}>Users Management</h3>
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th style={{ color: '#1f2937' }}>Name</th>
                    <th style={{ color: '#1f2937' }}>Email</th>
                    <th style={{ color: '#1f2937' }}>Phone</th>
                    <th style={{ color: '#1f2937' }}>Joined</th>
                    <th style={{ color: '#1f2937' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <motion.tr 
                        key={user._id}
                        whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
                        style={{ cursor: 'pointer' }}
                        onClick={() => openProfile(user, 'user')}
                      >
                        <td style={{ color: '#374151' }}>{user.name}</td>
                        <td style={{ color: '#374151' }}>{user.email}</td>
                        <td style={{ color: '#374151' }}>{user.phone || 'N/A'}</td>
                        <td style={{ color: '#374151' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn-danger-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Delete functionality
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-table-container"
          >
            <h3 style={{ color: '#1f2937' }}>Vendors Management</h3>
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th style={{ color: '#1f2937' }}>Restaurant</th>
                    <th style={{ color: '#1f2937' }}>Owner</th>
                    <th style={{ color: '#1f2937' }}>Email</th>
                    <th style={{ color: '#1f2937' }}>Verified</th>
                    <th style={{ color: '#1f2937' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors && vendors.length > 0 ? (
                    vendors.map((vendor) => (
                      <motion.tr 
                        key={vendor._id}
                        whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
                        style={{ cursor: 'pointer' }}
                        onClick={() => openProfile(vendor, 'vendor')}
                      >
                        <td style={{ color: '#374151' }}>{vendor.restaurantName || 'N/A'}</td>
                        <td style={{ color: '#374151' }}>{vendor.name}</td>
                        <td style={{ color: '#374151' }}>{vendor.email}</td>
                        <td>
                          <span className={`status-badge ${vendor.isVerified ? 'verified' : 'unverified'}`}>
                            {vendor.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className={`btn-sm ${vendor.isVerified ? 'btn-warning' : 'btn-success'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                verifyVendor(vendor._id, !vendor.isVerified);
                              }}
                            >
                              {vendor.isVerified ? 'Unverify' : 'Verify'}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                        No vendors found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-table-container"
          >
            <h3 style={{ color: '#1f2937' }}>Orders Management</h3>
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th style={{ color: '#1f2937' }}>Order ID</th>
                    <th style={{ color: '#1f2937' }}>Customer</th>
                    <th style={{ color: '#1f2937' }}>Amount</th>
                    <th style={{ color: '#1f2937' }}>Status</th>
                    <th style={{ color: '#1f2937' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders && orders.length > 0 ? (
                    orders.map((order) => (
                      <motion.tr 
                        key={order._id}
                        whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
                        style={{ cursor: 'pointer' }}
                        onClick={() => openProfile(order, 'order')}
                      >
                        <td style={{ color: '#374151' }}>#{order._id.slice(-8)}</td>
                        <td style={{ color: '#374151' }}>{order.userId?.name || 'N/A'}</td>
                        <td style={{ color: '#374151' }}>₹{order.totalAmount}</td>
                        <td>
                          <span className={`status-badge ${order.orderStatus.toLowerCase().replace(' ', '-')}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td style={{ color: '#374151' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        </motion.div>
      )}

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <motion.div
            className="admin-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProfile}
          >
            <motion.div
              className="admin-profile-modal"
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">
                  {profileType === 'vendor' && '🏪 Vendor Profile'}
                  {profileType === 'user' && '👤 User Profile'}
                  {profileType === 'order' && '📦 Order Details'}
                </h2>
                <button className="admin-modal-close" onClick={closeProfile}>✕</button>
              </div>

              <div className="admin-profile-content">
                {/* Vendor Profile */}
                {profileType === 'vendor' && (
                  <div className="profile-details">
                    <div className="profile-header">
                      <div className="profile-avatar">
                        {selectedProfile.restaurantName?.charAt(0) || 'V'}
                      </div>
                      <div className="profile-header-info">
                        <h3>{selectedProfile.restaurantName || 'N/A'}</h3>
                        <p>{selectedProfile.email}</p>
                        <span className={`status-badge ${selectedProfile.isVerified ? 'verified' : 'unverified'}`}>
                          {selectedProfile.isVerified ? '✓ Verified' : '⚠ Unverified'}
                        </span>
                      </div>
                    </div>

                    <div className="profile-section">
                      <h4 style={{ color: '#8b5cf6' }}>📋 Basic Information</h4>
                      <div className="profile-grid">
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Owner Name</label>
                          <p style={{ color: '#1f2937' }}>{selectedProfile.name || 'N/A'}</p>
                        </div>
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Email</label>
                          <p style={{ color: '#1f2937' }}>{selectedProfile.email}</p>
                        </div>
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Phone</label>
                          <p style={{ color: '#1f2937' }}>{selectedProfile.phone || 'N/A'}</p>
                        </div>
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Rating</label>
                          <p style={{ color: '#1f2937' }}>⭐ {selectedProfile.rating || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-section">
                      <h4 style={{ color: '#8b5cf6' }}>📍 Location Details</h4>
                      <div className="profile-grid">
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Address</label>
                          <p style={{ color: '#1f2937' }}>{selectedProfile.address || 'N/A'}</p>
                        </div>
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>City</label>
                          <p style={{ color: '#1f2937' }}>{selectedProfile.city || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-section">
                      <h4 style={{ color: '#8b5cf6' }}>📊 Statistics</h4>
                      <div className="profile-grid">
                        <div className="profile-field stat-highlight">
                          <label style={{ color: '#8b5cf6' }}>Total Orders</label>
                          <p style={{ color: '#8b5cf6', fontWeight: 700, fontSize: '2rem' }}>{selectedProfile.orderCount || 0}</p>
                        </div>
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Member Since</label>
                          <p style={{ color: '#1f2937' }}>{selectedProfile.createdAt ? new Date(selectedProfile.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-actions">
                      <button
                        className={`admin-btn-primary ${selectedProfile.isVerified ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => {
                          verifyVendor(selectedProfile._id, !selectedProfile.isVerified);
                          closeProfile();
                        }}
                      >
                        {selectedProfile.isVerified ? 'Unverify Vendor' : 'Verify Vendor'}
                      </button>
                      <button className="admin-btn-secondary" onClick={closeProfile}>
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {/* User Profile */}
                {profileType === 'user' && (
                  <div className="profile-details">
                    <div className="profile-header">
                      <div className="profile-avatar">
                        {selectedProfile.name?.charAt(0) || 'U'}
                      </div>
                      <div className="profile-header-info">
                        <h3>{selectedProfile.name}</h3>
                        <p>{selectedProfile.email}</p>
                        <span className="status-badge active">Active User</span>
                      </div>
                    </div>

                    <div className="profile-section">
                      <h4 style={{ color: '#8b5cf6' }}>📋 Basic Information</h4>
                      <div className="profile-grid">
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Full Name</label>
                          <p style={{ color: '#1f2937' }}>{selectedProfile.name}</p>
                        </div>
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Email</label>
                          <p style={{ color: '#1f2937' }}>{selectedProfile.email}</p>
                        </div>
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Phone</label>
                          <p style={{ color: '#1f2937' }}>{selectedProfile.phone || 'N/A'}</p>
                        </div>
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Role</label>
                          <p style={{ color: '#1f2937', textTransform: 'capitalize' }}>{selectedProfile.role || 'User'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-section">
                      <h4 style={{ color: '#8b5cf6' }}>📍 Address Information</h4>
                      <div className="profile-grid">
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Address</label>
                          <p style={{ color: '#1f2937' }}>{selectedProfile.address || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-section">
                      <h4 style={{ color: '#8b5cf6' }}>📊 Account Details</h4>
                      <div className="profile-grid">
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Member Since</label>
                          <p style={{ color: '#1f2937' }}>{new Date(selectedProfile.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Last Updated</label>
                          <p style={{ color: '#1f2937' }}>{new Date(selectedProfile.updatedAt || selectedProfile.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-actions">
                      <button className="admin-btn-secondary" onClick={closeProfile}>
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {/* Order Details */}
                {profileType === 'order' && (
                  <div className="profile-details">
                    <div className="profile-header">
                      <div className="profile-avatar">📦</div>
                      <div className="profile-header-info">
                        <h3>Order #{selectedProfile._id?.slice(-8)}</h3>
                        <p>Placed on {new Date(selectedProfile.createdAt).toLocaleString()}</p>
                        <span className={`status-badge ${selectedProfile.orderStatus?.toLowerCase().replace(' ', '-')}`}>
                          {selectedProfile.orderStatus}
                        </span>
                      </div>
                    </div>

                    <div className="profile-section">
                      <h4 style={{ color: '#8b5cf6' }}>👤 Customer Information</h4>
                      <div className="profile-grid">
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Customer Name</label>
                          <p style={{ color: '#1f2937' }}>{selectedProfile.userId?.name || 'N/A'}</p>
                        </div>
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Email</label>
                          <p style={{ color: '#1f2937' }}>{selectedProfile.userId?.email || 'N/A'}</p>
                        </div>
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Phone</label>
                          <p style={{ color: '#1f2937' }}>{selectedProfile.userId?.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-section">
                      <h4 style={{ color: '#8b5cf6' }}>📍 Delivery Address</h4>
                      <div className="profile-grid">
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Address</label>
                          <p style={{ color: '#1f2937' }}>{selectedProfile.deliveryAddress || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-section">
                      <h4 style={{ color: '#8b5cf6' }}>🍽️ Order Items</h4>
                      <div className="order-items-list">
                        {selectedProfile.items && selectedProfile.items.length > 0 ? (
                          selectedProfile.items.map((item, index) => (
                            <div key={index} className="order-item">
                              <div style={{ flex: 1 }}>
                                <p style={{ color: '#1f2937', fontWeight: 600 }}>{item.foodId?.name || 'Item'}</p>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Qty: {item.quantity}</p>
                              </div>
                              <p style={{ color: '#8b5cf6', fontWeight: 700 }}>₹{item.price * item.quantity}</p>
                            </div>
                          ))
                        ) : (
                          <p style={{ color: '#6b7280' }}>No items found</p>
                        )}
                      </div>
                    </div>

                    <div className="profile-section">
                      <h4 style={{ color: '#8b5cf6' }}>💰 Payment Details</h4>
                      <div className="profile-grid">
                        <div className="profile-field stat-highlight">
                          <label style={{ color: '#8b5cf6' }}>Total Amount</label>
                          <p style={{ color: '#8b5cf6', fontWeight: 700, fontSize: '2rem' }}>₹{selectedProfile.totalAmount}</p>
                        </div>
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Payment Method</label>
                          <p style={{ color: '#1f2937' }}>{selectedProfile.paymentMethod || 'N/A'}</p>
                        </div>
                        <div className="profile-field">
                          <label style={{ color: '#8b5cf6' }}>Payment Status</label>
                          <p style={{ color: '#1f2937' }}>{selectedProfile.paymentStatus || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-actions">
                      <button className="admin-btn-secondary" onClick={closeProfile}>
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}