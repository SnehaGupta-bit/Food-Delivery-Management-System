import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const CustomerPie = () => {
  const data = [
    { name: 'New Customers', value: 2845, color: '#8b5cf6' },
    { name: 'Returning Customers', value: 4523, color: '#06b6d4' },
    { name: 'Premium Users', value: 1577, color: '#f59e0b' },
  ];

  const COLORS = data.map(item => item.color);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box className="custom-tooltip">
          <Typography variant="body2" style={{ color: payload[0].payload.color, fontWeight: 600 }}>
            {payload[0].name}: {payload[0].value.toLocaleString()}
          </Typography>
          <Typography variant="body2" style={{ color: '#ffffff80' }}>
            {((payload[0].value / data.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ fontSize: '14px', fontWeight: 600 }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
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
            👥 Customer Analytics
          </Typography>
          <Typography variant="body2" className="chart-subtitle">
            Customer segmentation breakdown
          </Typography>
        </div>
      </Box>

      <Box className="chart-content">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>

        <Box className="customer-stats">
          {data.map((item, index) => (
            <Box key={index} className="customer-stat-item">
              <Box 
                className="stat-color-dot" 
                style={{ backgroundColor: item.color }}
              />
              <Typography variant="body2" className="stat-name">
                {item.name}
              </Typography>
              <Typography variant="h6" className="stat-value">
                {item.value.toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </motion.div>
  );
};

export default CustomerPie;
