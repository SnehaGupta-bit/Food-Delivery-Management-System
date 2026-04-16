import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AIChatProvider } from "./context/AIChatContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AIAssistant from "./components/AIAssistant.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import ParticleBackground from "./components/ParticleBackground.jsx";
import Home from "./pages/Home.jsx";
import FoodList from "./pages/FoodList.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Profile from "./pages/Profile.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";
import Cart from "./pages/Cart.jsx";
import MoodOrder from "./pages/MoodOrder.jsx";
import OrderTracking from "./pages/OrderTracking.jsx";
import GroupOrder from "./pages/GroupOrder.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import VendorDashboard from "./pages/VendorDashboard.jsx";
import FoodManagement from "./pages/FoodManagement.jsx";
import GoogleAuthSuccess from "./pages/GoogleAuthSuccess.jsx";

// Panel Selection & Login Pages
import PanelSelection from "./pages/PanelSelection.jsx";
import VendorLogin from "./pages/vendor/VendorLogin.jsx";
import VendorRegister from "./pages/vendor/VendorRegister.jsx";
import VendorDashboardPage from "./pages/vendor/VendorDashboard.jsx";
import DeliveryLogin from "./pages/delivery/DeliveryLogin.jsx";
import DeliveryRegister from "./pages/delivery/DeliveryRegister.jsx";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";

import "./index.css";

function AnimatedRoutes() {
  const location = useLocation();
  
  // Routes that should not show Navbar/Footer/AI Assistant
  const noLayoutRoutes = [
    '/panels',
    '/vendor/login',
    '/vendor/register',
    '/vendor/dashboard',
    '/delivery/login',
    '/delivery/register',
    '/delivery/dashboard',
    '/admin/login',
    '/admin/dashboard'
  ];
  
  const showLayout = !noLayoutRoutes.some(route => location.pathname.startsWith(route));

  return (
    <>
      {showLayout && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <Routes location={location}>
            {/* Panel Selection */}
            <Route path="/panels" element={<PanelSelection />} />
            
            {/* Customer Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<FoodList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/mood" element={<MoodOrder />} />
            <Route path="/track/:id" element={<OrderTracking />} />
            <Route path="/group" element={<GroupOrder />} />
            
            {/* Vendor Routes */}
            <Route path="/vendor/login" element={<VendorLogin />} />
            <Route path="/vendor/register" element={<VendorRegister />} />
            <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
            <Route path="/vendor" element={<VendorDashboard />} />
            <Route path="/food-management" element={<FoodManagement />} />
            
            {/* Delivery Partner Routes */}
            <Route path="/delivery/login" element={<DeliveryLogin />} />
            <Route path="/delivery/register" element={<DeliveryRegister />} />
            <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      {showLayout && <Footer />}
      {showLayout && <AIAssistant />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AIChatProvider>
        <div className="app-root">
          <ParticleBackground />
          <CustomCursor />
          <AnimatedRoutes />
        </div>
      </AIChatProvider>
    </Router>
  );
}