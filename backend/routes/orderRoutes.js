import express from "express";
import { 
  placeOrder, 
  getUserOrders, 
  getOrderById, 
  updateOrderStatus, 
  cancelOrder 
} from "../controllers/orderController.js";

const router = express.Router();

// Place a new order
router.post("/", placeOrder);

// Get user's orders with pagination
router.get("/my", getUserOrders);

// Get specific order by ID
router.get("/:orderId", getOrderById);

// Update order status (admin/agent only)
router.put("/:orderId/status", updateOrderStatus);

// Cancel order
router.put("/:orderId/cancel", cancelOrder);

export default router;