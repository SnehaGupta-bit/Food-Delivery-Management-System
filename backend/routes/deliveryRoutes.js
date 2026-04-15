import express from "express";
import { assignDelivery, getAvailableAgents, getAgentOrders } from "../controllers/deliveryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post('/assign', protect, adminOnly, assignDelivery);
router.get('/agents/available', protect, adminOnly, getAvailableAgents);
router.get('/agent/orders', protect, getAgentOrders);

export default router;