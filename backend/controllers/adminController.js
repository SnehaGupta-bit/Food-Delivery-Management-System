import User from "../models/User.js";
import Order from "../models/Order.js";
import Food from "../models/Food.js";
import Review from "../models/Review.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find admin user
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Admin login successful",
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayUsers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: today }
    });
    
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });
    
    const todayRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top vendors by orders (using Food model to get vendor info)
    const topVendors = await Food.aggregate([
      {
        $lookup: {
          from: 'orders',
          let: { foodId: '$_id' },
          pipeline: [
            { $unwind: '$items' },
            { $match: { $expr: { $eq: ['$items.foodId', '$$foodId'] } } }
          ],
          as: 'orders'
        }
      },
      {
        $group: {
          _id: '$vendorId',
          orderCount: { $sum: { $size: '$orders' } }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      { $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          restaurantName: { $ifNull: ['$vendor.restaurantName', 'Unknown Restaurant'] },
          orderCount: 1,
          rating: { $ifNull: ['$vendor.rating', 5.0] }
        }
      }
    ]);

    res.json({
      totalStats: {
        totalUsers,
        totalVendors,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      todayStats: {
        todayUsers,
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0
      },
      orderStatusBreakdown,
      monthlyRevenue,
      topVendors
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    let query = { role: 'customer' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Vendors
export const getAllVendorsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const status = req.query.status; // verified, unverified, active, inactive
    const skip = (page - 1) * limit;

    let query = { role: 'vendor' };
    
    if (search) {
      query.$or = [
        { restaurantName: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'verified') query.isVerified = true;
    if (status === 'unverified') query.isVerified = false;

    const vendors = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalVendors = await User.countDocuments(query);
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

// Verify Vendor
export const verifyVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { isVerified } = req.body;

    const vendor = await User.findOneAndUpdate(
      { _id: vendorId, role: 'vendor' },
      { isVerified },
      { new: true }
    ).select('-password');

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({
      message: `Vendor ${isVerified ? 'verified' : 'unverified'} successfully`,
      vendor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Vendor Status
export const toggleVendorStatus = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await User.findOne({ _id: vendorId, role: 'vendor' });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Toggle isVerified status (since we don't have isActive in User model)
    vendor.isVerified = !vendor.isVerified;
    await vendor.save();

    res.json({
      message: `Vendor ${vendor.isVerified ? 'activated' : 'deactivated'} successfully`,
      vendor: {
        _id: vendor._id,
        restaurantName: vendor.restaurantName,
        isVerified: vendor.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Orders
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .populate('deliveryAgent', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

// Get All Reviews
export const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
      .populate('userId', 'name email')
      .populate('vendorId', 'restaurantName')
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments();
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Vendor
export const deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Also delete vendor's food items
    await Food.deleteMany({ vendorId });
    
    const vendor = await User.findOneAndDelete({ _id: vendorId, role: 'vendor' });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({ message: "Vendor and associated food items deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};