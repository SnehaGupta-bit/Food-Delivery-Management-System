# 🔗 Analytics Dashboard Integration Guide

## Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
cd frontend
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material framer-motion recharts react-countup react-sparklines @react-three/fiber @react-three/drei three
```

### Step 2: Add Route to Your App

**Option A: Direct Integration**
```jsx
// src/App.jsx
import Dashboard from './components/admin/analytics/Dashboard';

function App() {
  return <Dashboard />;
}
```

**Option B: With React Router**
```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/admin/analytics/Dashboard';
import AdminDashboard from './pages/AdminDashboard'; // Your existing admin

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Option C: Add to Existing Admin Panel**
```jsx
// src/pages/AdminDashboard.jsx
import { useState } from 'react';
import AnalyticsDashboard from '../components/admin/analytics/Dashboard';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div>
      {/* Your existing admin navigation */}
      <nav>
        <button onClick={() => setActiveTab('overview')}>Overview</button>
        <button onClick={() => setActiveTab('analytics')}>Analytics</button>
        <button onClick={() => setActiveTab('users')}>Users</button>
      </nav>

      {/* Render analytics when tab is active */}
      {activeTab === 'analytics' && <AnalyticsDashboard />}
    </div>
  );
}
```

### Step 3: Test It!
```bash
npm run dev
```

Navigate to: `http://localhost:5173/admin/analytics`

---

## 🔌 Backend API Integration

### Create Analytics Controller

```javascript
// backend/controllers/analyticsController.js
export const getKPIMetrics = async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalOrders = await Order.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const vendors = await Vendor.countDocuments();

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      activeUsers,
      vendors,
      // Add more metrics...
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRevenueData = async (req, res) => {
  try {
    const { range } = req.query; // 'daily', 'weekly', 'monthly'
    
    // Aggregate revenue by date range
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(revenueData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrdersAnalytics = async (req, res) => {
  try {
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(ordersByStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVendorPerformance = async (req, res) => {
  try {
    const topVendors = await Order.aggregate([
      {
        $group: {
          _id: '$vendorId',
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor'
        }
      }
    ]);

    res.json(topVendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### Create Analytics Routes

```javascript
// backend/routes/analyticsRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getKPIMetrics,
  getRevenueData,
  getOrdersAnalytics,
  getVendorPerformance
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/kpi', protect, admin, getKPIMetrics);
router.get('/revenue', protect, admin, getRevenueData);
router.get('/orders', protect, admin, getOrdersAnalytics);
router.get('/vendors', protect, admin, getVendorPerformance);

export default router;
```

### Add to Server

```javascript
// backend/server.js
import analyticsRoutes from './routes/analyticsRoutes.js';

app.use('/api/analytics', analyticsRoutes);
```

---

## 🔄 Connect Frontend to Backend

### Update KPICards Component

```jsx
// src/components/admin/analytics/KPICards.jsx
import { useState, useEffect } from 'react';

const KPICards = ({ refreshing }) => {
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIData();
  }, [refreshing]);

  const fetchKPIData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/analytics/kpi', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Transform API data to component format
        const transformedData = [
          {
            title: 'Total Revenue',
            value: data.totalRevenue,
            prefix: '₹',
            growth: data.revenueGrowth,
            icon: AttachMoney,
            color: '#8b5cf6',
            sparkline: data.revenueSparkline || []
          },
          // Map other metrics...
        ];
        
        setKpiData(transformedData);
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <SkeletonLoader />;

  return (
    // Your existing JSX...
  );
};
```

### Update RevenueChart Component

```jsx
// src/components/admin/analytics/RevenueChart.jsx
import { useState, useEffect } from 'react';

const RevenueChart = ({ dateRange }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchRevenueData();
  }, [dateRange]);

  const fetchRevenueData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/api/analytics/revenue?range=${dateRange}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const apiData = await response.json();
        setData(apiData);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  return (
    // Your existing JSX...
  );
};
```

---

## 🎨 Customization Examples

### Change Primary Color

```css
/* src/components/styles/analytics-dashboard.css */
:root {
  --analytics-primary: #your-color;
}
```

### Add New KPI Card

```jsx
// In KPICards.jsx, add to kpiData array:
{
  title: 'New Metric',
  value: 1234,
  prefix: '',
  suffix: '',
  growth: 10.5,
  icon: YourIcon,
  color: '#your-color',
  sparkline: [10, 20, 15, 25, 30]
}
```

### Modify Chart Colors

```jsx
// In any chart component:
<Area 
  stroke="#your-color"
  fill="url(#yourGradient)"
/>

<defs>
  <linearGradient id="yourGradient">
    <stop offset="5%" stopColor="#your-color" stopOpacity={0.3}/>
    <stop offset="95%" stopColor="#your-color" stopOpacity={0}/>
  </linearGradient>
</defs>
```

---

## 🚀 Production Deployment

### Environment Variables

```env
# .env
VITE_API_URL=https://your-api.com
VITE_ENABLE_ANALYTICS=true
```

### Use in Components

```jsx
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const response = await fetch(`${API_URL}/api/analytics/kpi`);
```

### Build for Production

```bash
npm run build
```

---

## 📊 Sample Data Structure

### KPI Response
```json
{
  "totalRevenue": 2847650,
  "monthlyRevenue": 485320,
  "totalOrders": 15847,
  "completedOrders": 14523,
  "cancelledOrders": 324,
  "activeUsers": 8945,
  "vendors": 342,
  "deliveryPartners": 156,
  "avgDeliveryTime": 28,
  "customerSatisfaction": 4.7,
  "revenueGrowth": 12.5,
  "revenueSparkline": [20, 35, 30, 45, 40, 55, 50, 65, 60, 75]
}
```

### Revenue Response
```json
[
  { "date": "Mon", "revenue": 45000, "orders": 120 },
  { "date": "Tue", "revenue": 52000, "orders": 145 },
  { "date": "Wed", "revenue": 48000, "orders": 132 }
]
```

---

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Components copied to project
- [ ] CSS file added
- [ ] Route configured
- [ ] Backend API created
- [ ] Frontend connected to API
- [ ] Authentication added
- [ ] Tested on localhost
- [ ] Customized colors/branding
- [ ] Ready for production

---

## 🎉 You're Done!

Your professional analytics dashboard is now integrated and ready to use!

Visit: `http://localhost:5173/admin/analytics`
