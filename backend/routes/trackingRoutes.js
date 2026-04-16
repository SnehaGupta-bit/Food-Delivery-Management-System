import express from "express";
import { updateLocation } from "../controllers/trackingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// You might have a specific middleware for delivery agents here
router.put("/location", protect, updateLocation);

export default router;