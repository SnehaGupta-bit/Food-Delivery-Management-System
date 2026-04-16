import express from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  googleAuth,
  updateProfile,
  getUserProfile,
  googleCallback
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.put("/update-profile", updateProfile);
router.get("/profile", getUserProfile);

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }), googleCallback);

export default router;