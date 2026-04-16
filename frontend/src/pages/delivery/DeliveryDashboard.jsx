import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import "../../styles/delivery-panel.css";

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('available');
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    totalDeliveries: 0,
    rating: 5.0,
    activeOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      toast.error("Please login first");
      navigate("/delivery/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "delivery_partner") {
      toast.error("Access denied");
      navigate("/delivery/login");
      return;
    }

    setUser(parsedUser);
    fetchOrders();
    fetchMyOrders();
    fetchStats();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter orders that need delivery (status: confirmed, preparing, ready)
        const availableOrders = data.filter(order => 
          ['Confirmed', 'Preparing', 'Ready'].includes(order.orderStatus) && 
          !order.deliveryAgent
        );
        setOrders(availableOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:3000/api/orders?deliveryAgent=${userData._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyOrders(data);
      }
    } catch (error) {
      console.error('Error fetching my orders:', error);
    }
  };

  const fetchStats = () => {
    // Mock stats - in real app, fetch from API
    setStats({
      todayEarnings: 450,
      totalDeliveries: 23,
      rating: 4.8,
      activeOrders: 2
    });
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Order accepted! 🎉');
        fetchOrders();
        fetchMyOrders();
        fetchStats();
      } else {
        toast.error('Failed to accept order');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Network error');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });

      if (response.ok) {
        toast.success(`Order status updated to ${newStatus}! ✅`);
        fetchMyOrders();
        fetchStats();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Network error');
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    toast.success(isOnline ? 'You are now offline' : 'You are now online! 🟢');
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/delivery/login");
  };

  if (!user) return null;

  return (
    <div className="delivery-dashboard">
      {/* Header */}
      <div className="delivery-dashboard-header">
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="delivery-dashboard-title">🏍️ Delivery Partner Dashboard</h1>
              <p className="delivery-dashboard-subtitle">Welcome back, {user.name}!</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={toggleOnlineStatus}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: isOnline ? '#10b981' : '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s'
                }}
              >
                <span style={{ 
                  width: '0.75rem', 
                  height: '0.75rem', 
                  borderRadius: '50%', 
                  background: isOnline ? '#dcfce7' : '#e5e7eb' 
                }}></span>
                {isOnline ? 'Online' : 'Offline'}
              </button>
              <button
                onClick={() => navigate('/panels')}
                className="delivery-btn-secondary"
                style={{ 
                  padding: '0.75rem 1.5rem',
                  background: 'white',
                  color: 'var(--delivery-primary)',
                  fontWeight: 600
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleLogout}
                className="delivery-btn-secondary"
                style={{ 
                  padding: '0.75rem 1.5rem',
                  background: 'white',
                  color: 'var(--delivery-primary)',
                  fontWeight: 600
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '1rem',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.08)',
            borderLeft: '4px solid #10b981'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💰</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>₹{stats.todayEarnings}</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600 }}>Today's Earnings</div>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '1rem',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.08)',
            borderLeft: '4px solid #059669'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#059669' }}>{stats.totalDeliveries}</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600 }}>Total Deliveries</div>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '1rem',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.08)',
            borderLeft: '4px solid #eab308'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⭐</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#eab308' }}>{stats.rating}</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600 }}>Rating</div>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '1rem',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.08)',
            borderLeft: '4px solid #3b82f6'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚚</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>{stats.activeOrders}</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600 }}>Active Orders</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '2rem',
          background: 'white',
          padding: '0.5rem',
          borderRadius: '1rem',
          boxShadow: '0 2px 10px rgba(16, 185, 129, 0.08)'
        }}>
          <button
            onClick={() => setActiveTab('available')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeTab === 'available' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
              color: activeTab === 'available' ? 'white' : '#6b7280',
              fontWeight: 600,
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Available Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('myorders')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeTab === 'myorders' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
              color: activeTab === 'myorders' ? 'white' : '#6b7280',
              fontWeight: 600,
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            My Orders ({myOrders.length})
          </button>
        </div>

        {/* Orders List */}
        <div style={{ 
          background: 'white', 
          borderRadius: '1rem', 
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.08)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ 
                width: '3rem', 
                height: '3rem', 
                border: '4px solid #d1fae5',
                borderTopColor: '#10b981',
                borderRadius: '50%',
                margin: '0 auto',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading orders...</p>
            </div>
          ) : activeTab === 'available' ? (
            orders.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>No available orders at the moment</p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Check back soon for new delivery opportunities!
                </p>
              </div>
            ) : (
              <div style={{ padding: '1.5rem' }}>
                {orders.map((order) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '1.5rem',
                      border: '1px solid #d1fae5',
                      borderRadius: '0.75rem',
                      marginBottom: '1rem',
                      background: '#f0fdf4'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#1f2937', marginBottom: '0.25rem' }}>
                          Order #{order._id?.slice(-8)}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          {order.items?.length || 0} items • ₹{order.totalAmount}
                        </div>
                      </div>
                      <span style={{
                        padding: '0.375rem 0.875rem',
                        background: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {order.orderStatus}
                      </span>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        📍 Delivery Address:
                      </div>
                      <div style={{ fontWeight: 600, color: '#1f2937' }}>
                        {order.deliveryAddress || 'Address not provided'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAcceptOrder(order._id)}
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      Accept Order 🚀
                    </button>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            myOrders.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚚</div>
                <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>No active deliveries</p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Accept orders from the Available Orders tab to start delivering!
                </p>
              </div>
            ) : (
              <div style={{ padding: '1.5rem' }}>
                {myOrders.map((order) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '1.5rem',
                      border: '1px solid #d1fae5',
                      borderRadius: '0.75rem',
                      marginBottom: '1rem',
                      background: '#f0fdf4'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#1f2937', marginBottom: '0.25rem' }}>
                          Order #{order._id?.slice(-8)}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          {order.items?.length || 0} items • ₹{order.totalAmount}
                        </div>
                      </div>
                      <span style={{
                        padding: '0.375rem 0.875rem',
                        background: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {order.orderStatus}
                      </span>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        📍 Delivery Address:
                      </div>
                      <div style={{ fontWeight: 600, color: '#1f2937' }}>
                        {order.deliveryAddress || 'Address not provided'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {order.orderStatus === 'Ready' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')}
                          style={{
                            flex: 1,
                            padding: '0.875rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Start Delivery 🚀
                        </button>
                      )}
                      {order.orderStatus === 'Out for Delivery' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                          style={{
                            flex: 1,
                            padding: '0.875rem',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Mark as Delivered ✅
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
