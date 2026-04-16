import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";
import session from "express-session";

// Load environment variables FIRST
dotenv.config();

// Set DNS servers BEFORE any imports that might use DNS
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"]);
dns.setDefaultResultOrder('ipv4first');

import passport from "./config/passport.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import aiAdvancedRoutes from "./routes/aiAdvancedRoutes.js";
import connectDB from "./config/db.js";

import foodRoutes from "./routes/foodRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";

import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3000;

// Database Connection - Connect BEFORE starting server
await connectDB();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'quickbite_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/food", foodRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/ai-advanced", aiAdvancedRoutes);

// Socket.io Logic
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join_group", (roomCode) => {
    socket.join(roomCode);
    console.log(`Socket ${socket.id} joined group ${roomCode}`);
  });

  socket.on("cart_update", (data) => {
    // data = { roomCode, cartItems, participantId }
    socket.to(data.roomCode).emit("group_cart_update", data);
  });

  socket.on("join_tracking", (orderId) => {
    socket.join(`track_${orderId}`);
    console.log(`Socket ${socket.id} tracking order ${orderId}`);
  });

  socket.on("location_update", (data) => {
    // data = { orderId, latitude, longitude }
    socket.to(`track_${data.orderId}`).emit("live_location", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// App level IO for controllers to use
app.set("io", io);

// Test Route
app.get("/", (req, res) => {
  res.send("API is Running...");
});

// Server Start
server.listen(PORT, () => {
  console.log(`Server & Socket.io running on port ${PORT}`);
});