import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's a user or vendor based on role
    if (decoded.role === 'vendor') {
      const vendor = await Vendor.findById(decoded.id).select('-password');
      if (!vendor) {
        return res.status(401).json({ message: "Vendor not found" });
      }
      req.vendor = vendor;
      req.userType = 'vendor';
    } else {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = user;
      req.userType = 'user';
    }
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Admin only middleware
export const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Admin access required" });
  }
};

// Vendor only middleware
export const vendorAuth = (req, res, next) => {
  if (req.userType === 'vendor') {
    next();
  } else {
    res.status(403).json({ message: "Vendor access required" });
  }
};

// Delivery agent middleware
export const agentAuth = (req, res, next) => {
  if (req.user && req.user.role === 'agent') {
    next();
  } else {
    res.status(403).json({ message: "Delivery agent access required" });
  }
};