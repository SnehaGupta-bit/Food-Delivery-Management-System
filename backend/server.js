import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import connectDB from "./config/db.js";

import foodRoutes from "./routes/foodRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import groupOrderRoutes from "./routes/groupOrderRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// Database Connection
connectDB();

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Socket.io Connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join order tracking room
  socket.on("joinOrderRoom", (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} joined order room: ${orderId}`);
  });

  // Join group order room
  socket.on("joinGroupRoom", (roomCode) => {
    socket.join(`group_${roomCode}`);
    console.log(`Socket ${socket.id} joined group room: ${roomCode}`);
  });

  // Leave rooms
  socket.on("leaveOrderRoom", (orderId) => {
    socket.leave(`order_${orderId}`);
  });

  socket.on("leaveGroupRoom", (roomCode) => {
    socket.leave(`group_${roomCode}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Routes
app.use("/api/food", apiLimiter, foodRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/orders", apiLimiter, orderRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);
app.use("/api/tracking", apiLimiter, trackingRoutes);
app.use("/api/delivery", apiLimiter, deliveryRoutes);
app.use("/api/group", apiLimiter, groupOrderRoutes);
app.use("/api/health", apiLimiter, healthRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("QuickBite API is Running... 🍕");
});

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Server Start
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io enabled`);
  console.log(`🔒 Security middleware active`);
});

export default app;