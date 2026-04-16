import express from "express";
import { createRoom, joinRoom, getRoom, lockRoom } from "../controllers/groupController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRoom);
router.post("/:roomCode/join", protect, joinRoom);
router.get("/:roomCode", protect, getRoom);
router.put("/:roomCode/lock", protect, lockRoom);

export default router;
