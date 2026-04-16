import { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const RevenueChart = ({ dateRange }) => {
  const [view, setView] = useState('daily');

  const dailyData = [
    { date: 'Mon', revenue: 45000, orders: 120 },
    { date: 'Tue', revenue: 52000, orders: 145 },
    { date: 'Wed', revenue: 48000, orders: 132 },
    { date: 'Thu', revenue: 61000, orders: 168 },
    { date: 'Fri', revenue: 73000, orders: 195 },
    { date: 'Sat', revenue: 89000, orders: 234 },
    { date: 'Sun', revenue: 95000, orders: 256 },
  ];

  const weeklyData = [
    { date: 'Week 1', revenue: 285000, orders: 780 },
    { date: 'Week 2', revenue: 312000, orders: 845 },
    { date: 'Week 3', revenue: 298000, orders: 812 },
    { date: 'Week 4', revenue: 345000, orders: 923 },
  ];

  const monthlyData = [
    { date: 'Jan', revenue: 1200000, orders: 3200 },
    { date: 'Feb', revenue: 1350000, orders: 3600 },
    { date: 'Mar', revenue: 1280000, orders: 3400 },
    { date: 'Apr', revenue: 1450000, orders: 3850 },
    { date: 'May', revenue: 1520000, orders: 4100 },
    { date: 'Jun', revenue: 1680000, orders: 4500 },
  ];

  const data = view === 'daily' ? dailyData : view === 'weekly' ? weeklyData : monthlyData;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box className="custom-tooltip">
          <Typography variant="body2" className="tooltip-label">
            {payload[0].payload.date}
          </Typography>
          <Typography variant="body2" style={{ color: '#8b5cf6', fontWeight: 600 }}>
            Revenue: ₹{payload[0].value.toLocaleString()}
          </Typography>
          <Typography variant="body2" style={{ color: '#06b6d4', fontWeight: 600 }}>
            Orders: {payload[1].value}
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
            💰 Revenue Analytics
          </Typography>
          <Typography variant="body2" className="chart-subtitle">
            Track your revenue performance over time
          </Typography>
        </div>

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(e, newView) => newView && setView(newView)}
          className="chart-toggle"
        >
          <ToggleButton value="daily">Daily</ToggleButton>
          <ToggleButton value="weekly">Weekly</ToggleButton>
          <ToggleButton value="monthly">Monthly</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box className="chart-content">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              dataKey="date" 
              stroke="#ffffff60"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#ffffff60"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              name="Revenue (₹)"
            />
            <Area 
              type="monotone" 
              dataKey="orders" 
              stroke="#06b6d4" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorOrders)" 
              name="Orders"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </motion.div>
  );
};

export default RevenueChart;
