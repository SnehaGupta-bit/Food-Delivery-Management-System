import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import FoodList from "./pages/FoodList.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";
import Cart from "./pages/Cart.jsx";
import AIAssistant from "./components/AIAssistant.jsx";
import "./index.css";

export default function App() {
  return (
    <Router>
      <div className="app-root">
        <Navbar />
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/menu"     element={<FoodList />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/orders"   element={<OrderHistory />} />
          <Route path="/cart"     element={<Cart />} />
        </Routes>
        <AIAssistant />
      </div>
    </Router>
  );
}