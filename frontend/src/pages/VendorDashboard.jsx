import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function VendorDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [newFood, setNewFood] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    emoji: '',
    isVeg: true,
    prepTime: '20-30 min'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/vendors/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/vendors/orders/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      toast.error('Error fetching orders');
    }
  };

  const fetchFoodItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/food', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFoodItems(data);
      }
    } catch (error) {
      toast.error('Error fetching food items');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/vendors/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success('Order status updated successfully');
        fetchOrders();
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      toast.error('Error updating order status');
    }
  };

  const addFoodItem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/food', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFood)
      });

      if (response.ok) {
        toast.success('Food item added successfully');
        setNewFood({
          name: '',
          price: '',
          category: '',
          description: '',
          emoji: '',
          isVeg: true,
          prepTime: '20-30 min'
        });
        fetchFoodItems();
      } else {
        toast.error('Failed to add food item');
      }
    } catch (error) {
      toast.error('Error adding food item');
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'menu') fetchFoodItems();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="page-padded">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-padded">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="section-title">Vendor Dashboard</h1>
        
        {/* Navigation Tabs */}
        <div className="admin-nav">
          {['dashboard', 'orders', 'menu', 'add-food'].map((tab) => (
            <button
              key={tab}
              className={`admin-nav-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Dashboard Stats */}
        {activeTab === 'dashboard' && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="vendor-dashboard"
          >
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-value">{stats.stats.totalOrders}</div>
                <div className="stat-label">Total Orders</div>
                <div className="stat-change">+{stats.stats.todayOrders} today</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-value">₹{stats.stats.totalRevenue.toLocaleString()}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🍽️</div>
                <div className="stat-value">{stats.stats.totalFoodItems}</div>
                <div className="stat-label">Food Items</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-value">4.5</div>
                <div className="stat-label">Average Rating</div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="admin-section">
              <h3>Recent Orders</h3>
              <div className="recent-orders">
                {stats.recentOrders.map((order) => (
                  <div key={order._id} className="order-item">
                    <div className="order-info">
                      <span className="order-id">#{order._id.slice(-8)}</span>
                      <span className="order-customer">{order.userId?.name}</span>
                      <span className="order-amount">₹{order.totalAmount}</span>
                    </div>
                    <span className={`status-badge ${order.orderStatus.toLowerCase().replace(' ', '-')}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="vendor-orders"
          >
            <h3>Orders Management</h3>
            <div className="orders-grid">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">#{order._id.slice(-8)}</span>
                    <span className={`status-badge ${order.orderStatus.toLowerCase().replace(' ', '-')}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  
                  <div className="order-customer-info">
                    <strong>{order.userId?.name}</strong>
                    <span>{order.userId?.phone}</span>
                  </div>
                  
                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item-detail">
                        <span>{item.name} x{item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-total">
                    <strong>Total: ₹{order.totalAmount}</strong>
                  </div>
                  
                  <div className="order-actions">
                    {order.orderStatus === 'Placed' && (
                      <button
                        className="btn-success-sm"
                        onClick={() => updateOrderStatus(order._id, 'Confirmed')}
                      >
                        Confirm
                      </button>
                    )}
                    {order.orderStatus === 'Confirmed' && (
                      <button
                        className="btn-warning-sm"
                        onClick={() => updateOrderStatus(order._id, 'Preparing')}
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.orderStatus === 'Preparing' && (
                      <button
                        className="btn-primary-sm"
                        onClick={() => updateOrderStatus(order._id, 'Ready for Pickup')}
                      >
                        Ready for Pickup
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="vendor-menu"
          >
            <h3>Menu Management</h3>
            <div className="food-items-grid">
              {foodItems.map((item) => (
                <div key={item._id} className="food-item-card">
                  <div className="food-item-emoji">{item.emoji}</div>
                  <div className="food-item-info">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                    <div className="food-item-meta">
                      <span className="price">₹{item.price}</span>
                      <span className={`diet ${item.isVeg ? 'veg' : 'nonveg'}`}>
                        {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                      </span>
                    </div>
                  </div>
                  <div className="food-item-actions">
                    <button className="btn-secondary-sm">Edit</button>
                    <button className="btn-danger-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Add Food Tab */}
        {activeTab === 'add-food' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="add-food-form"
          >
            <h3>Add New Food Item</h3>
            <form onSubmit={addFoodItem} className="food-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Food Name *</label>
                  <input
                    className="form-input"
                    type="text"
                    value={newFood.name}
                    onChange={(e) => setNewFood({...newFood, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    className="form-input"
                    type="number"
                    value={newFood.price}
                    onChange={(e) => setNewFood({...newFood, price: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-input"
                    value={newFood.category}
                    onChange={(e) => setNewFood({...newFood, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Burger">Burger</option>
                    <option value="Indian">Indian</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Emoji</label>
                  <input
                    className="form-input"
                    type="text"
                    value={newFood.emoji}
                    onChange={(e) => setNewFood({...newFood, emoji: e.target.value})}
                    placeholder="🍕"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={newFood.description}
                  onChange={(e) => setNewFood({...newFood, description: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Preparation Time</label>
                  <input
                    className="form-input"
                    type="text"
                    value={newFood.prepTime}
                    onChange={(e) => setNewFood({...newFood, prepTime: e.target.value})}
                    placeholder="20-30 min"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Diet Type</label>
                  <select
                    className="form-input"
                    value={newFood.isVeg}
                    onChange={(e) => setNewFood({...newFood, isVeg: e.target.value === 'true'})}
                  >
                    <option value={true}>Vegetarian</option>
                    <option value={false}>Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{marginTop: '24px'}}>
                Add Food Item
              </button>
            </form>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}