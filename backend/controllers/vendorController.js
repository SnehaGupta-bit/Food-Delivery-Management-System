import Vendor from "../models/Vendor.js";
import Food from "../models/Food.js";
import Order from "../models/Order.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Vendor Registration
export const registerVendor = async (req, res) => {
  try {
    const {
      name, email, password, phone, restaurantName, cuisine,
      address, businessLicense, fssaiNumber, openingHours
    } = req.body;

    // Validation
    if (!name || !email || !password || !phone || !restaurantName || !cuisine || !address || !businessLicense || !fssaiNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if vendor exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: "Vendor already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create vendor
    const vendor = new Vendor({
      name,
      email,
      password: hashedPassword,
      phone,
      restaurantName,
      cuisine: Array.isArray(cuisine) ? cuisine : [cuisine],
      address,
      businessLicense,
      fssaiNumber,
      openingHours: openingHours || {
        monday: { open: "09:00", close: "22:00", isOpen: true },
        tuesday: { open: "09:00", close: "22:00", isOpen: true },
        wednesday: { open: "09:00", close: "22:00", isOpen: true },
        thursday: { open: "09:00", close: "22:00", isOpen: true },
        friday: { open: "09:00", close: "22:00", isOpen: true },
        saturday: { open: "09:00", close: "22:00", isOpen: true },
        sunday: { open: "09:00", close: "22:00", isOpen: true },
      }
    });

    await vendor.save();

    // Generate token
    const token = jwt.sign(
      { id: vendor._id, role: 'vendor' },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Vendor registered successfully. Awaiting verification.",
      token,
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        restaurantName: vendor.restaurantName,
        isVerified: vendor.isVerified,
        isActive: vendor.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vendor Login
export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find vendor
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if vendor is active
    if (!vendor.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Contact support." });
    }

    // Generate token
    const token = jwt.sign(
      { id: vendor._id, role: 'vendor' },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        restaurantName: vendor.restaurantName,
        isVerified: vendor.isVerified,
        isActive: vendor.isActive,
        rating: vendor.rating
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Vendor Profile
export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor.id).select('-password');
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({ vendor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Vendor Profile
export const updateVendorProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password update here
    delete updates.email; // Don't allow email update
    delete updates.isVerified; // Only admin can verify

    const vendor = await Vendor.findByIdAndUpdate(
      req.vendor.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({
      message: "Profile updated successfully",
      vendor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Vendor Dashboard Stats
export const getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.vendor.id;

    // Get total orders
    const totalOrders = await Order.countDocuments({ 
      'items.vendorId': vendorId 
    });

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      'items.vendorId': vendorId,
      createdAt: { $gte: today }
    });

    // Get total revenue
    const revenueData = await Order.aggregate([
      { $match: { 'items.vendorId': mongoose.Types.ObjectId(vendorId) } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Get total food items
    const totalFoodItems = await Food.countDocuments({ vendorId });

    // Get recent orders
    const recentOrders = await Order.find({
      'items.vendorId': vendorId
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'name email');

    // Get order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      { $match: { 'items.vendorId': mongoose.Types.ObjectId(vendorId) } },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    res.json({
      stats: {
        totalOrders,
        todayOrders,
        totalRevenue,
        totalFoodItems
      },
      recentOrders,
      orderStatusBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Vendor Orders
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    let query = { 'items.vendorId': vendorId };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email phone')
      .populate('deliveryAgent', 'name phone');

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const vendorId = req.vendor.id;

    const validStatuses = ["Confirmed", "Preparing", "Ready for Pickup"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findOne({
      _id: orderId,
      'items.vendorId': vendorId
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;
    await order.save();

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(`track_${orderId}`).emit('status_update', {
      orderId,
      status,
      timestamp: new Date()
    });

    res.json({
      message: "Order status updated successfully",
      order: {
        id: order._id,
        orderStatus: order.orderStatus,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Vendors (for customer app)
export const getAllVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const cuisine = req.query.cuisine;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'rating'; // rating, deliveryTime, minimumOrder
    const skip = (page - 1) * limit;

    let query = { isActive: true, isVerified: true };

    // Filter by cuisine
    if (cuisine) {
      query.cuisine = { $in: [cuisine] };
    }

    // Search by restaurant name
    if (search) {
      query.restaurantName = { $regex: search, $options: 'i' };
    }

    let sortOptions = {};
    switch (sortBy) {
      case 'rating':
        sortOptions = { rating: -1 };
        break;
      case 'deliveryTime':
        sortOptions = { deliveryTime: 1 };
        break;
      case 'minimumOrder':
        sortOptions = { minimumOrder: 1 };
        break;
      default:
        sortOptions = { rating: -1 };
    }

    const vendors = await Vendor.find(query)
      .select('-password -bankDetails -businessLicense -fssaiNumber')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const totalVendors = await Vendor.countDocuments(query);
    const totalPages = Math.ceil(totalVendors / limit);

    res.json({
      vendors,
      pagination: {
        currentPage: page,
        totalPages,
        totalVendors,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Vendor by ID (for customer app)
export const getVendorById = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findOne({
      _id: vendorId,
      isActive: true,
      isVerified: true
    }).select('-password -bankDetails -businessLicense -fssaiNumber');

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Get vendor's food items
    const foodItems = await Food.find({
      vendorId: vendorId,
      isAvailable: true
    });

    res.json({
      vendor,
      foodItems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};