import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';

const OrdersChart = () => {
  const data = [
    { month: 'Jan', completed: 2800, cancelled: 120, pending: 180 },
    { month: 'Feb', completed: 3200, cancelled: 140, pending: 200 },
    { month: 'Mar', completed: 2900, cancelled: 110, pending: 170 },
    { month: 'Apr', completed: 3500, cancelled: 150, pending: 220 },
    { month: 'May', completed: 3800, cancelled: 130, pending: 190 },
    { month: 'Jun', completed: 4200, cancelled: 160, pending: 240 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box className="custom-tooltip">
          <Typography variant="body2" className="tooltip-label">
            {payload[0].payload.month}
          </Typography>
          {payload.map((entry, index) => (
            <Typography 
              key={index}
              variant="body2" 
              style={{ color: entry.color, fontWeight: 600 }}
            >
              {entry.name}: {entry.value}
            </Typography>
          ))}
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
            📦 Orders Analytics
          </Typography>
          <Typography variant="body2" className="chart-subtitle">
            Order status breakdown by month
          </Typography>
        </div>
      </Box>

      <Box className="chart-content">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              dataKey="month" 
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
            <Bar 
              dataKey="completed" 
              fill="#10b981" 
              radius={[8, 8, 0, 0]}
              name="Completed"
            />
            <Bar 
              dataKey="pending" 
              fill="#f59e0b" 
              radius={[8, 8, 0, 0]}
              name="Pending"
            />
            <Bar 
              dataKey="cancelled" 
              fill="#ef4444" 
              radius={[8, 8, 0, 0]}
              name="Cancelled"
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </motion.div>
  );
};

export default OrdersChart;
