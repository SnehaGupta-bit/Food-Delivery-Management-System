import { motion } from 'framer-motion';
import { Box, Grid, Typography } from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  AttachMoney, 
  ShoppingCart, 
  People, 
  Store, 
  DeliveryDining,
  Timer,
  Star,
  Cancel
} from '@mui/icons-material';

const KPICards = () => {
  console.log('🟢 KPICards Rendering - NO ERRORS VERSION');
  
  const kpiData = [
    {
      title: 'Total Revenue',
      value: '₹28,47,650',
      growth: 12.5,
      IconComponent: AttachMoney,
      color: '#8b5cf6',
    },
    {
      title: 'Monthly Revenue',
      value: '₹4,85,320',
      growth: 8.3,
      IconComponent: TrendingUp,
      color: '#06b6d4',
    },
    {
      title: 'Total Orders',
      value: '15,847',
      growth: 15.2,
      IconComponent: ShoppingCart,
      color: '#10b981',
    },
    {
      title: 'Completed Orders',
      value: '14,523',
      growth: 14.8,
      IconComponent: ShoppingCart,
      color: '#22c55e',
    },
    {
      title: 'Cancelled Orders',
      value: '324',
      growth: -2.1,
      IconComponent: Cancel,
      color: '#ef4444',
    },
    {
      title: 'Active Users',
      value: '8,945',
      growth: 18.7,
      IconComponent: People,
      color: '#f59e0b',
    },
    {
      title: 'Vendors Registered',
      value: '342',
      growth: 6.4,
      IconComponent: Store,
      color: '#ec4899',
    },
    {
      title: 'Delivery Partners',
      value: '156',
      growth: 9.2,
      IconComponent: DeliveryDining,
      color: '#8b5cf6',
    },
    {
      title: 'Avg Delivery Time',
      value: '28 min',
      growth: -5.3,
      IconComponent: Timer,
      color: '#06b6d4',
    },
    {
      title: 'Customer Satisfaction',
      value: '4.7/5',
      growth: 3.2,
      IconComponent: Star,
      color: '#fbbf24',
    },
  ];

  return (
    <Grid container spacing={3} className="kpi-cards-container" sx={{ mb: 4 }}>
      {kpiData.map((kpi, index) => {
        const IconComp = kpi.IconComponent;
        
        return (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={`kpi-${index}`}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="kpi-card"
              style={{ 
                background: `linear-gradient(135deg, ${kpi.color}15 0%, ${kpi.color}05 100%)`,
                borderColor: `${kpi.color}40`,
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box 
                  className="kpi-icon"
                  sx={{ 
                    background: `linear-gradient(135deg, ${kpi.color} 0%, ${kpi.color}dd 100%)`,
                    boxShadow: `0 4px 20px ${kpi.color}40`,
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}
                >
                  <IconComp />
                </Box>
              
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    color: kpi.growth >= 0 ? '#10b981' : '#ef4444',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {kpi.growth >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                  <span>{Math.abs(kpi.growth)}%</span>
                </Box>
              </Box>

              <Typography variant="body2" sx={{ color: '#a0a9c0', mb: 1, fontSize: '0.875rem' }}>
                {kpi.title}
              </Typography>

              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, fontSize: '2rem' }}>
                {kpi.value}
              </Typography>

              <Box sx={{ height: '30px', mt: 2, display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  width: '100%', 
                  height: '2px', 
                  background: `linear-gradient(90deg, transparent, ${kpi.color}60, transparent)` 
                }} />
              </Box>
            </motion.div>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default KPICards;
