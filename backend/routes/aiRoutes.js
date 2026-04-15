import express from "express";
import { getAIResponse, getMoodBasedRecommendations, getHungerEmergencyMode } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/", aiLimiter, getAIResponse);
router.post("/mood", protect, getMoodBasedRecommendations);
router.post("/emergency", getHungerEmergencyMode);

export default router;