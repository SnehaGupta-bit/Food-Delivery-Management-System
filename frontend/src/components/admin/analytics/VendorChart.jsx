import { motion } from 'framer-motion';
import { Box, Typography, LinearProgress } from '@mui/material';
import { Star } from '@mui/icons-material';

const VendorChart = () => {
  const vendors = [
    { name: 'Pizza Paradise', revenue: 285000, orders: 1245, rating: 4.8, color: '#8b5cf6' },
    { name: 'Burger Kingdom', revenue: 245000, orders: 1089, rating: 4.7, color: '#06b6d4' },
    { name: 'Sushi Master', revenue: 198000, orders: 876, rating: 4.9, color: '#10b981' },
    { name: 'Taco Fiesta', revenue: 176000, orders: 765, rating: 4.6, color: '#f59e0b' },
    { name: 'Pasta House', revenue: 154000, orders: 654, rating: 4.5, color: '#ec4899' },
    { name: 'Curry Express', revenue: 142000, orders: 598, rating: 4.7, color: '#8b5cf6' },
  ];

  const maxRevenue = Math.max(...vendors.map(v => v.revenue));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="chart-card"
    >
      <Box className="chart-header">
        <div>
          <Typography variant="h6" className="chart-title">
            🏪 Top Vendor Performance
          </Typography>
          <Typography variant="body2" className="chart-subtitle">
            Highest revenue generating restaurants
          </Typography>
        </div>
      </Box>

      <Box className="chart-content">
        <Box className="vendor-list">
          {vendors.map((vendor, index) => (
            <motion.div
              key={index}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="vendor-item-analytics"
              whileHover={{ scale: 1.02, x: 10 }}
            >
              <Box className="vendor-rank-badge" style={{ background: vendor.color }}>
                #{index + 1}
              </Box>

              <Box className="vendor-info">
                <Typography variant="body1" className="vendor-name">
                  {vendor.name}
                </Typography>
                <Box className="vendor-meta">
                  <Typography variant="caption" className="vendor-orders">
                    {vendor.orders} orders
                  </Typography>
                  <Box className="vendor-rating">
                    <Star style={{ fontSize: '14px', color: '#fbbf24' }} />
                    <Typography variant="caption">{vendor.rating}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box className="vendor-revenue-section">
                <Typography variant="h6" className="vendor-revenue">
                  ₹{(vendor.revenue / 1000).toFixed(0)}K
                </Typography>
                <Box className="vendor-progress-bar">
                  <LinearProgress 
                    variant="determinate" 
                    value={(vendor.revenue / maxRevenue) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: `${vendor.color}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: vendor.color,
                        borderRadius: 3,
                      }
                    }}
                  />
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Box>
    </motion.div>
  );
};

export default VendorChart;
