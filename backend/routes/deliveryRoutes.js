import express from "express";
import { assignDelivery } from "../controllers/deliveryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post('/assign', protect, adminOnly, assignDelivery);

export default router;