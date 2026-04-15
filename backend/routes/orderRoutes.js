import express from "express";
import { placeOrder, getUserOrders, updateOrderStatus, getAllOrders } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, placeOrder);
router.get("/my", protect, getUserOrders);
router.put("/:orderId/status", protect, updateOrderStatus);
router.get("/all", protect, adminOnly, getAllOrders);

export default router;