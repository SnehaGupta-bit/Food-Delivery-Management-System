import express from "express";
import {
  createGroupOrder,
  joinGroupOrder,
  addItemToGroupOrder,
  lockGroupOrder,
  checkoutGroupOrder,
  getGroupOrder
} from "../controllers/groupOrderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createGroupOrder);
router.post("/join", protect, joinGroupOrder);
router.post("/add-item", protect, addItemToGroupOrder);
router.post("/lock", protect, lockGroupOrder);
router.post("/checkout", protect, checkoutGroupOrder);
router.get("/:roomCode", protect, getGroupOrder);

export default router;
