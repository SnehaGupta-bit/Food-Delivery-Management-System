import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Chip, Avatar } from '@mui/material';
import { 
  FiberManualRecord, 
  ShoppingCart, 
  DeliveryDining, 
  Restaurant, 
  TrendingUp,
  People
} from '@mui/icons-material';

const RealtimePanel = () => {
  const [liveRevenue, setLiveRevenue] = useState(2847650);
  const [activeUsers, setActiveUsers] = useState(1247);
  const [recentOrders, setRecentOrders] = useState([]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update revenue
      setLiveRevenue(prev => prev + Math.floor(Math.random() * 500) + 100);
      
      // Update active users
      setActiveUsers(prev => prev + Math.floor(Math.random() * 10) - 5);
      
      // Add new order
      const newOrder = {
        id: Date.now(),
        customer: `Customer ${Math.floor(Math.random() * 1000)}`,
        restaurant: ['Pizza Palace', 'Burger King', 'Sushi Master', 'Taco Bell'][Math.floor(Math.random() * 4)],
        amount: Math.floor(Math.random() * 800) + 200,
        status: ['confirmed', 'preparing', 'out_for_delivery'][Math.floor(Math.random() * 3)],
        time: new Date().toLocaleTimeString()
      };
      
      setRecentOrders(prev => [newOrder, ...prev.slice(0, 4)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const liveActivities = [
    { type: 'order', message: 'New order from Ankit Sharma', time: '2s ago', color: '#10b981' },
    { type: 'rider', message: 'Rider assigned to Order #1234', time: '5s ago', color: '#06b6d4' },
    { type: 'vendor', message: 'Pizza Palace accepted order', time: '8s ago', color: '#f59e0b' },
    { type: 'delivery', message: 'Order delivered successfully', time: '12s ago', color: '#8b5cf6' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="chart-card realtime-panel"
    >
      <Box className="chart-header">
        <div>
          <Typography variant="h6" className="chart-title">
            ⚡ Real-time Dashboard
          </Typography>
          <Box className="live-indicator">
            <FiberManualRecord className="live-dot" />
            <Typography variant="caption">Live Updates</Typography>
          </Box>
        </div>
      </Box>

      <Box className="chart-content">
        {/* Live Revenue Ticker */}
        <motion.div
          className="live-revenue-ticker"
          whileHover={{ scale: 1.02 }}
        >
          <Box className="ticker-header">
            <TrendingUp style={{ color: '#10b981' }} />
            <Typography variant="body2">Live Revenue</Typography>
          </Box>
          <Typography variant="h4" className="ticker-value">
            ₹{liveRevenue.toLocaleString()}
          </Typography>
          <Typography variant="caption" className="ticker-growth">
            +₹{Math.floor(Math.random() * 500) + 100} in last minute
          </Typography>
        </motion.div>

        {/* Active Users Counter */}
        <motion.div
          className="active-users-counter"
          whileHover={{ scale: 1.02 }}
        >
          <Box className="counter-header">
            <People style={{ color: '#8b5cf6' }} />
            <Typography variant="body2">Active Users</Typography>
          </Box>
          <Typography variant="h4" className="counter-value">
            {activeUsers.toLocaleString()}
          </Typography>
          <Typography variant="caption" className="counter-status">
            Online right now
          </Typography>
        </motion.div>

        {/* Recent Orders */}
        <Box className="recent-orders-section">
          <Typography variant="subtitle2" className="section-title">
            Recent Orders
          </Typography>
          <AnimatePresence>
            {recentOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                className="recent-order-item"
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <Avatar className="order-avatar">
                  <ShoppingCart style={{ fontSize: '16px' }} />
                </Avatar>
                
                <Box className="order-details">
                  <Typography variant="body2" className="order-customer">
                    {order.customer}
                  </Typography>
                  <Typography variant="caption" className="order-restaurant">
                    {order.restaurant} • ₹{order.amount}
                  </Typography>
                </Box>

                <Chip 
                  label={order.status.replace('_', ' ')}
                  size="small"
                  className={`order-status ${order.status}`}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>

        {/* Live Activity Feed */}
        <Box className="live-activity-section">
          <Typography variant="subtitle2" className="section-title">
            Live Activity
          </Typography>
          <Box className="activity-feed">
            {liveActivities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="activity-item"
                whileHover={{ x: 5 }}
              >
                <Box 
                  className="activity-dot"
                  style={{ backgroundColor: activity.color }}
                />
                <Box className="activity-content">
                  <Typography variant="caption" className="activity-message">
                    {activity.message}
                  </Typography>
                  <Typography variant="caption" className="activity-time">
                    {activity.time}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>

        {/* System Status */}
        <Box className="system-status">
          <Typography variant="subtitle2" className="section-title">
            System Status
          </Typography>
          <Box className="status-indicators">
            <Box className="status-item">
              <Box className="status-dot online" />
              <Typography variant="caption">API Server</Typography>
            </Box>
            <Box className="status-item">
              <Box className="status-dot online" />
              <Typography variant="caption">Database</Typography>
            </Box>
            <Box className="status-item">
              <Box className="status-dot online" />
              <Typography variant="caption">Payment Gateway</Typography>
            </Box>
            <Box className="status-item">
              <Box className="status-dot warning" />
              <Typography variant="caption">SMS Service</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default RealtimePanel;