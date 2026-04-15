import express from "express";
import { updateLocation, getOrderTracking, createTracking } from "../controllers/trackingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put('/location', protect, updateLocation);
router.get('/order/:orderId', protect, getOrderTracking);
router.post('/create', protect, createTracking);

export default router;