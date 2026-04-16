import { motion } from 'framer-motion';
import { Box, Typography, Grid } from '@mui/material';
import { 
  Psychology, 
  TrendingUp, 
  LocationOn, 
  Restaurant, 
  People, 
  Insights 
} from '@mui/icons-material';

const AIInsights = () => {
  const insights = [
    {
      title: 'Best Selling Category',
      value: 'Italian Cuisine',
      description: '34% of total orders',
      trend: '+12%',
      icon: Restaurant,
      color: '#8b5cf6',
      prediction: 'Expected to grow 18% next month'
    },
    {
      title: 'Peak Order Time',
      value: '8:30 PM',
      description: 'Highest order volume',
      trend: '+8%',
      icon: TrendingUp,
      color: '#06b6d4',
      prediction: 'Weekend peak shifts to 9:15 PM'
    },
    {
      title: 'Most Profitable City',
      value: 'Mumbai',
      description: '₹2.4M monthly revenue',
      trend: '+15%',
      icon: LocationOn,
      color: '#10b981',
      prediction: 'Delhi catching up at 23% growth'
    },
    {
      title: 'Customer Retention',
      value: '78.5%',
      description: 'Monthly retention rate',
      trend: '+5%',
      icon: People,
      color: '#f59e0b',
      prediction: 'Target: 85% by Q4'
    },
    {
      title: 'Predicted Growth',
      value: '+24%',
      description: 'Next month revenue',
      trend: 'High confidence',
      icon: Psychology,
      color: '#ec4899',
      prediction: 'Based on seasonal trends & marketing'
    },
    {
      title: 'Optimization Opportunity',
      value: 'Lunch Hours',
      description: '40% capacity unused',
      trend: 'Action needed',
      icon: Insights,
      color: '#ef4444',
      prediction: 'Launch office lunch campaigns'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="chart-card ai-insights-card"
    >
      <Box className="chart-header">
        <div>
          <Typography variant="h6" className="chart-title">
            🤖 AI Business Insights
          </Typography>
          <Typography variant="body2" className="chart-subtitle">
            Smart analytics & predictive recommendations
          </Typography>
        </div>
      </Box>

      <Box className="chart-content">
        <Grid container spacing={3}>
          {insights.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 5,
                    transition: { duration: 0.3 }
                  }}
                  className="ai-insight-card"
                  style={{
                    background: `linear-gradient(135deg, ${insight.color}15 0%, ${insight.color}05 100%)`,
                    borderColor: `${insight.color}40`
                  }}
                >
                  {/* Header */}
                  <Box className="ai-insight-header">
                    <Box 
                      className="ai-insight-icon"
                      style={{ 
                        background: `linear-gradient(135deg, ${insight.color} 0%, ${insight.color}dd 100%)`,
                        boxShadow: `0 4px 20px ${insight.color}40`
                      }}
                    >
                      <IconComponent />
                    </Box>
                  
                  <Box className="ai-insight-trend">
                    <Typography 
                      variant="caption" 
                      style={{ 
                        color: insight.trend.includes('+') ? '#10b981' : 
                               insight.trend.includes('-') ? '#ef4444' : '#f59e0b'
                      }}
                    >
                      {insight.trend}
                    </Typography>
                  </Box>
                </Box>

                {/* Content */}
                <Box className="ai-insight-content">
                  <Typography variant="body2" className="ai-insight-title">
                    {insight.title}
                  </Typography>
                  
                  <Typography variant="h5" className="ai-insight-value">
                    {insight.value}
                  </Typography>
                  
                  <Typography variant="caption" className="ai-insight-description">
                    {insight.description}
                  </Typography>
                </Box>

                {/* Prediction */}
                <Box className="ai-insight-prediction">
                  <Box className="prediction-indicator">
                    <Psychology style={{ fontSize: '14px', color: insight.color }} />
                    <Typography variant="caption" style={{ color: insight.color }}>
                      AI Prediction
                    </Typography>
                  </Box>
                  <Typography variant="caption" className="prediction-text">
                    {insight.prediction}
                  </Typography>
                </Box>

                {/* Animated Background */}
                <Box 
                  className="ai-insight-bg-animation"
                  style={{ background: `${insight.color}10` }}
                />
              </motion.div>
            </Grid>
          );
          })}
        </Grid>

        {/* AI Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="ai-summary-card"
        >
          <Box className="ai-summary-header">
            <Psychology style={{ color: '#8b5cf6', fontSize: '24px' }} />
            <Typography variant="h6" className="ai-summary-title">
              AI Executive Summary
            </Typography>
          </Box>
          
          <Typography variant="body2" className="ai-summary-text">
            Your platform is performing exceptionally well with <strong>24% predicted growth</strong> next month. 
            Italian cuisine dominance and strong Mumbai market position are key drivers. 
            Consider launching targeted lunch campaigns to optimize daytime capacity utilization.
          </Typography>
          
          <Box className="ai-confidence-meter">
            <Typography variant="caption">Prediction Confidence</Typography>
            <Box className="confidence-bar">
              <motion.div 
                className="confidence-fill"
                initial={{ width: 0 }}
                animate={{ width: '87%' }}
                transition={{ duration: 2, delay: 1 }}
              />
            </Box>
            <Typography variant="caption" style={{ color: '#10b981' }}>87%</Typography>
          </Box>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default AIInsights;