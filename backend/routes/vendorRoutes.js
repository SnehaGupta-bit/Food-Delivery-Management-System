import express from "express";
import {
  registerVendor,
  loginVendor,
  getVendorProfile,
  updateVendorProfile,
  getVendorDashboard,
  getVendorOrders,
  updateOrderStatus,
  getAllVendors,
  getVendorById
} from "../controllers/vendorController.js";
import { protect, vendorAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerVendor);
router.post("/login", loginVendor);
router.get("/all", getAllVendors); // For customer app
router.get("/:vendorId", getVendorById); // For customer app

// Protected vendor routes
router.get("/profile/me", protect, vendorAuth, getVendorProfile);
router.put("/profile/me", protect, vendorAuth, updateVendorProfile);
router.get("/dashboard/stats", protect, vendorAuth, getVendorDashboard);
router.get("/orders/my", protect, vendorAuth, getVendorOrders);
router.put("/orders/:orderId/status", protect, vendorAuth, updateOrderStatus);

export default router;