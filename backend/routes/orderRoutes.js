import express from "express";
import { placeOrder, getUserOrders } from "../controllers/orderController.js";

const router = express.Router();

// Place a new order
router.post("/", placeOrder);

// Get user's orders
router.get("/my", getUserOrders);

module.exports = router;