import Order from "../models/Order.js";
import jwt from "jsonwebtoken";

export const placeOrder = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { items, totalAmount, deliveryAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount || !deliveryAddress || !paymentMethod) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // Transform items to match Order schema
    const transformedItems = items.map(item => ({
      foodId: item.foodId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));

    const order = new Order({
      userId: userId,
      items: transformedItems,
      totalAmount: totalAmount,
      deliveryAddress: deliveryAddress,
      paymentMethod: paymentMethod
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: {
        id: order._id,
        items: order.items,
        total: order.totalAmount,
        status: order.orderStatus,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const orders = await Order.find({ userId: userId })
      .sort({ createdAt: -1 })
      .populate('deliveryAgent', 'name phone');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["Placed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').to(`order_${orderId}`).emit('orderStatusUpdate', {
        orderId,
        status
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = status ? { orderStatus: status } : {};

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email phone')
      .populate('deliveryAgent', 'name phone');

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};