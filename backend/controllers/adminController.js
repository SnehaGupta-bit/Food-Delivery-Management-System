import Order from "../models/Order.js";
import User from "../models/User.js";
import Food from "../models/Food.js";
import DeliveryAgent from "../models/DeliveryAgent.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Get date range for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total counts
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    // Today's stats
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayRevenue = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: today, $lt: tomorrow },
          paymentStatus: "Paid"
        } 
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    // Order status breakdown
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
    ]);

    // Popular foods
    const popularFoods = await Order.aggregate([
      { $unwind: "$items" },
      { 
        $group: { 
          _id: "$items.foodId", 
          name: { $first: "$items.name" },
          count: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Active delivery agents
    const activeAgents = await DeliveryAgent.countDocuments({ isAvailable: true });
    const totalAgents = await DeliveryAgent.countDocuments();

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .populate('deliveryAgent', 'name phone');

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalUsers,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        ordersByStatus,
        popularFoods,
        agents: {
          active: activeAgents,
          total: totalAgents
        }
      },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};