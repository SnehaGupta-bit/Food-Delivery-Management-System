import express from "express";
import { getAIResponse, getMoodSuggestion, getEmergencyFood } from "../controllers/aiController.js";

const router = express.Router();

router.post("/", getAIResponse);
router.post("/mood", getMoodSuggestion);
router.post("/emergency", getEmergencyFood);

export default router;