import { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Container, Grid, IconButton, Typography } from '@mui/material';
import { Refresh, Download, Fullscreen, Settings } from '@mui/icons-material';
import KPICards from './KPICards';
import RevenueChart from './RevenueChart';
import OrdersChart from './OrdersChart';
import VendorChart from './VendorChart';
import CustomerPie from './CustomerPie';
import DeliveryMetrics from './DeliveryMetrics';
import AIInsights from './AIInsights';
import RealtimePanel from './RealtimePanel';
import ThreeDSection from './ThreeDSection';
import DateRangeFilter from './DateRangeFilter';
import '../../../styles/analytics-dashboard.css';

const Dashboard = ({ onBack }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('month');

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleExport = () => {
    console.log('Exporting data...');
  };

  console.log('✅ Analytics Dashboard Rendering - Version 2.0');

  return (
    <Box 
      className="analytics-dashboard" 
      sx={{ 
        minHeight: '100vh', 
        width: '100%',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        padding: 0,
        margin: 0,
        position: 'relative',
        zIndex: 1
      }}
    >
      {/* Top Control Bar */}
      <Box className="analytics-header" sx={{ position: 'relative', zIndex: 10 }}>
        <Box className="analytics-header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {onBack && (
              <IconButton 
                className="control-btn"
                onClick={onBack}
                sx={{ 
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: '#fff',
                  '&:hover': { background: 'rgba(139, 92, 246, 0.2)' }
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>←</span>
              </IconButton>
            )}
            <div>
              <Typography variant="h4" className="analytics-title">
                📊 Analytics Dashboard
              </Typography>
              <Typography variant="body2" className="analytics-subtitle">
                Real-time business intelligence & insights
              </Typography>
            </div>
          </div>

          <Box className="analytics-controls">
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
            
            <IconButton 
              className="control-btn"
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ color: '#fff' }}
            >
              <Refresh className={refreshing ? 'rotating' : ''} />
            </IconButton>

            <IconButton className="control-btn" onClick={handleExport} sx={{ color: '#fff' }}>
              <Download />
            </IconButton>

            <IconButton className="control-btn" sx={{ color: '#fff' }}>
              <Fullscreen />
            </IconButton>

            <IconButton className="control-btn" sx={{ color: '#fff' }}>
              <Settings />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Container maxWidth="xl" className="analytics-container" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        {/* KPI Cards Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ 
            mb: 3, 
            pb: 2,
            borderBottom: '2px solid rgba(139, 92, 246, 0.2)',
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}>
            <Box sx={{ 
              width: '6px', 
              height: '40px', 
              background: 'linear-gradient(180deg, #8b5cf6, #06b6d4)',
              borderRadius: '3px',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
            }} />
            <div>
              <Typography variant="h4" sx={{ 
                color: '#fff', 
                fontWeight: 700, 
                mb: 0.5,
                letterSpacing: '-0.5px'
              }}>
                📊 Key Performance Indicators
              </Typography>
              <Typography variant="body2" sx={{ color: '#a0a9c0', fontSize: '0.95rem' }}>
                Real-time metrics and growth indicators across all operations
              </Typography>
            </div>
          </Box>
          <KPICards refreshing={refreshing} />
        </Box>

        {/* Revenue & Realtime Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ 
            mb: 3, 
            pb: 2,
            borderBottom: '2px solid rgba(16, 185, 129, 0.2)',
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}>
            <Box sx={{ 
              width: '6px', 
              height: '40px', 
              background: 'linear-gradient(180deg, #10b981, #06b6d4)',
              borderRadius: '3px',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
            }} />
            <div>
              <Typography variant="h4" sx={{ 
                color: '#fff', 
                fontWeight: 700, 
                mb: 0.5,
                letterSpacing: '-0.5px'
              }}>
                💰 Revenue & Live Activity
              </Typography>
              <Typography variant="body2" sx={{ color: '#a0a9c0', fontSize: '0.95rem' }}>
                Financial performance tracking and real-time platform updates
              </Typography>
            </div>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <RevenueChart dateRange={dateRange} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <RealtimePanel />
            </Grid>
          </Grid>
        </Box>

        {/* Orders & Customers Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ 
            mb: 3, 
            pb: 2,
            borderBottom: '2px solid rgba(245, 158, 11, 0.2)',
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}>
            <Box sx={{ 
              width: '6px', 
              height: '40px', 
              background: 'linear-gradient(180deg, #f59e0b, #ec4899)',
              borderRadius: '3px',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)'
            }} />
            <div>
              <Typography variant="h4" sx={{ 
                color: '#fff', 
                fontWeight: 700, 
                mb: 0.5,
                letterSpacing: '-0.5px'
              }}>
                📦 Orders & Customer Analytics
              </Typography>
              <Typography variant="body2" sx={{ color: '#a0a9c0', fontSize: '0.95rem' }}>
                Order trends, status breakdown, and customer segmentation insights
              </Typography>
            </div>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <OrdersChart />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomerPie />
            </Grid>
          </Grid>
        </Box>

        {/* Vendor & Delivery Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ 
            mb: 3, 
            pb: 2,
            borderBottom: '2px solid rgba(139, 92, 246, 0.2)',
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}>
            <Box sx={{ 
              width: '6px', 
              height: '40px', 
              background: 'linear-gradient(180deg, #8b5cf6, #ec4899)',
              borderRadius: '3px',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
            }} />
            <div>
              <Typography variant="h4" sx={{ 
                color: '#fff', 
                fontWeight: 700, 
                mb: 0.5,
                letterSpacing: '-0.5px'
              }}>
                🏪 Vendor & Delivery Performance
              </Typography>
              <Typography variant="body2" sx={{ color: '#a0a9c0', fontSize: '0.95rem' }}>
                Top performing vendors and delivery efficiency metrics
              </Typography>
            </div>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}>
              <VendorChart />
            </Grid>
            <Grid item xs={12} lg={5}>
              <DeliveryMetrics />
            </Grid>
          </Grid>
        </Box>

        {/* AI Insights Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            mb: 3, 
            pb: 2,
            borderBottom: '2px solid rgba(139, 92, 246, 0.3)',
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}>
            <Box sx={{ 
              width: '6px', 
              height: '40px', 
              background: 'linear-gradient(180deg, #8b5cf6, #7c3aed)',
              borderRadius: '3px',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)'
            }} />
            <div>
              <Typography variant="h4" sx={{ 
                color: '#fff', 
                fontWeight: 700, 
                mb: 0.5,
                letterSpacing: '-0.5px'
              }}>
                🤖 AI-Powered Business Insights
              </Typography>
              <Typography variant="body2" sx={{ color: '#a0a9c0', fontSize: '0.95rem' }}>
                Predictive analytics, smart recommendations, and growth opportunities
              </Typography>
            </div>
          </Box>
          <AIInsights />
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
