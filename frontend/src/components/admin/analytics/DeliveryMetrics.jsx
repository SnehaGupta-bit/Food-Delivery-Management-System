import { motion } from 'framer-motion';
import { Box, Typography, Chip } from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { DeliveryDining, Timer, TrendingUp } from '@mui/icons-material';

const DeliveryMetrics = () => {
  const deliveryData = [
    { time: '6AM', avgTime: 35, orders: 12 },
    { time: '9AM', avgTime: 28, orders: 45 },
    { time: '12PM', avgTime: 32, orders: 89 },
    { time: '3PM', avgTime: 25, orders: 67 },
    { time: '6PM', avgTime: 30, orders: 156 },
    { time: '9PM', avgTime: 27, orders: 234 },
    { time: '12AM', avgTime: 22, orders: 98 },
  ];

  const riderStats = [
    { name: 'Rajesh Kumar', deliveries: 45, rating: 4.9, status: 'online' },
    { name: 'Amit Singh', deliveries: 38, rating: 4.8, status: 'online' },
    { name: 'Priya Sharma', deliveries: 42, rating: 4.7, status: 'busy' },
    { name: 'Vikash Yadav', deliveries: 35, rating: 4.6, status: 'offline' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box className="custom-tooltip">
          <Typography variant="body2" className="tooltip-label">
            {payload[0].payload.time}
          </Typography>
          <Typography variant="body2" style={{ color: '#06b6d4', fontWeight: 600 }}>
            Avg Time: {payload[0].value} min
          </Typography>
          <Typography variant="body2" style={{ color: '#8b5cf6', fontWeight: 600 }}>
            Orders: {payload[0].payload.orders}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="chart-card"
    >
      <Box className="chart-header">
        <div>
          <Typography variant="h6" className="chart-title">
            🚚 Delivery Analytics
          </Typography>
          <Typography variant="body2" className="chart-subtitle">
            Delivery performance & rider efficiency
          </Typography>
        </div>
      </Box>

      <Box className="chart-content">
        {/* Delivery Time Chart */}
        <Box className="delivery-chart-section">
          <Typography variant="subtitle2" className="section-title">
            Average Delivery Time by Hour
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={deliveryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis 
                dataKey="time" 
                stroke="#ffffff60"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#ffffff60"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="avgTime" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Top Riders */}
        <Box className="riders-section">
          <Typography variant="subtitle2" className="section-title">
            Top Delivery Partners
          </Typography>
          <Box className="riders-list">
            {riderStats.map((rider, index) => (
              <motion.div
                key={index}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="rider-item"
                whileHover={{ scale: 1.02 }}
              >
                <Box className="rider-avatar">
                  <DeliveryDining style={{ fontSize: '20px' }} />
                </Box>
                
                <Box className="rider-info">
                  <Typography variant="body2" className="rider-name">
                    {rider.name}
                  </Typography>
                  <Typography variant="caption" className="rider-deliveries">
                    {rider.deliveries} deliveries
                  </Typography>
                </Box>

                <Box className="rider-stats">
                  <Typography variant="caption" className="rider-rating">
                    ⭐ {rider.rating}
                  </Typography>
                  <Chip 
                    label={rider.status}
                    size="small"
                    className={`rider-status ${rider.status}`}
                  />
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>

        {/* Quick Stats */}
        <Box className="delivery-quick-stats">
          <Box className="quick-stat-item">
            <Timer style={{ color: '#06b6d4' }} />
            <div>
              <Typography variant="h6">28 min</Typography>
              <Typography variant="caption">Avg Delivery</Typography>
            </div>
          </Box>
          
          <Box className="quick-stat-item">
            <DeliveryDining style={{ color: '#10b981' }} />
            <div>
              <Typography variant="h6">156</Typography>
              <Typography variant="caption">Active Riders</Typography>
            </div>
          </Box>
          
          <Box className="quick-stat-item">
            <TrendingUp style={{ color: '#f59e0b' }} />
            <div>
              <Typography variant="h6">94.2%</Typography>
              <Typography variant="caption">On-Time Rate</Typography>
            </div>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default DeliveryMetrics;