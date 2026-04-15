import express from "express";
import {
  createHealthProfile,
  getHealthProfile,
  getHealthyRecommendations,
  scanFoodLabel
} from "../controllers/healthController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/profile", protect, createHealthProfile);
router.get("/profile", protect, getHealthProfile);
router.get("/recommendations", protect, getHealthyRecommendations);
router.post("/scan", protect, scanFoodLabel);

export default router;
