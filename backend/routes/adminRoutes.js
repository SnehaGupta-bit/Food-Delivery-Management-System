import express from "express";
import {
  adminLogin,
  getDashboardStats,
  getAllUsers,
  getAllVendorsAdmin,
  verifyVendor,
  toggleVendorStatus,
  getAllOrders,
  getAllReviews,
  deleteUser,
  deleteVendor
} from "../controllers/adminController.js";
import { protect, adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin login
router.post("/login", adminLogin);

// Protected admin routes
router.get("/dashboard", protect, adminAuth, getDashboardStats);
router.get("/users", protect, adminAuth, getAllUsers);
router.get("/vendors", protect, adminAuth, getAllVendorsAdmin);
router.get("/orders", protect, adminAuth, getAllOrders);
router.get("/reviews", protect, adminAuth, getAllReviews);

// Vendor management
router.put("/vendors/:vendorId/verify", protect, adminAuth, verifyVendor);
router.put("/vendors/:vendorId/toggle-status", protect, adminAuth, toggleVendorStatus);

// Delete operations
router.delete("/users/:userId", protect, adminAuth, deleteUser);
router.delete("/vendors/:vendorId", protect, adminAuth, deleteVendor);

export default router;