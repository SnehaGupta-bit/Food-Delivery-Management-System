import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, restaurantName, vehicleType } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Create user object with role
    const userData = { 
      name, 
      email, 
      password,
      role: role || "customer" // Default to customer if no role specified
    };
    
    // Add vendor-specific fields
    if (role === "vendor" && restaurantName) {
      userData.restaurantName = restaurantName;
    }
    
    // Add delivery partner-specific fields
    if (role === "delivery_partner" && vehicleType) {
      userData.vehicleType = vehicleType;
    }
    
    const user = new User(userData);
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { 
        _id: user._id, 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Auto-fix demo user roles if they're incorrect
    if (email === "vendor@demo.com" && user.role !== "vendor") {
      user.role = "vendor";
      user.restaurantName = "Demo Restaurant";
      await user.save();
    } else if (email === "delivery@demo.com" && user.role !== "delivery_partner") {
      user.role = "delivery_partner";
      user.vehicleType = "bike";
      await user.save();
    } else if (email === "admin@demo.com" && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({
      message: "Login successful",
      token,
      user: { 
        _id: user._id, 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        avatar: user.avatar,
        role: user.role 
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { name, email, googleId, avatar } = req.body;
    if (!email || !googleId) {
      return res.status(400).json({ message: "Google auth data required" });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "google";
        if (avatar) user.avatar = avatar;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        name: name || email.split("@")[0],
        email,
        googleId,
        avatar,
        authProvider: "google",
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({
      message: "Google auth successful",
      token,
      user: { _id: user._id, id: user._id, name: user.name, email: user.email, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { name, phone, address, city, state, pincode } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Validate phone number if provided
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: "Please enter a valid 10-digit phone number" });
    }

    // Validate pincode if provided
    if (pincode && !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: "Please enter a valid 6-digit PIN code" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user profile
    user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (pincode !== undefined) user.pincode = pincode;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        avatar: user.avatar,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        avatar: user.avatar,
        authProvider: user.authProvider,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};