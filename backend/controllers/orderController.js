import Order from "../models/Order.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const placeOrder = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { items, totalAmount, deliveryAddress, paymentMethod, paymentId, customerDetails } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Valid total amount is required" });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    if (!customerDetails) {
      return res.status(400).json({ message: "Customer details are required" });
    }

    // Validate customer details
    const { name, email, phone, address, city, state, pincode } = customerDetails;
    if (!name || !email || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({ message: "All customer details are required" });
    }

    // Validate phone number
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: "Please enter a valid 10-digit phone number" });
    }

    // Validate pincode
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: "Please enter a valid 6-digit PIN code" });
    }

    // Transform and validate items
    const transformedItems = items.map(item => {
      if (!item.foodId || !item.name || !item.price || !item.quantity) {
        throw new Error("Invalid item data");
      }
      
      return {
        foodId: item.foodId,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image || "",
        selectedSize: item.selectedSize || "Regular"
      };
    });

    // Set payment status based on method
    let paymentStatus = "Pending";
    if (paymentMethod === "Online" && paymentId) {
      paymentStatus = "Paid";
    }

    const order = new Order({
      userId: userId,
      items: transformedItems,
      totalAmount: Number(totalAmount),
      deliveryAddress: deliveryAddress,
      customerDetails: customerDetails,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentStatus,
      paymentId: paymentId || null
    });

    await order.save();

    // Populate user details for response
    await order.populate('userId', 'name email');

    res.status(201).json({
      message: "Order placed successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        deliveryAddress: order.deliveryAddress,
        customerDetails: order.customerDetails,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Order placement error:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('deliveryAgent', 'name phone');

    const totalOrders = await Order.countDocuments({ userId });
    const totalPages = Math.ceil(totalOrders / limit);

    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      items: order.items,
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      customerDetails: order.customerDetails,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      actualDeliveryTime: order.actualDeliveryTime,
      deliveryAgent: order.deliveryAgent,
      rating: order.rating,
      review: order.review,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    res.json({
      orders: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalOrders: totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get orders error:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, userId })
      .populate('deliveryAgent', 'name phone')
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        deliveryAddress: order.deliveryAddress,
        customerDetails: order.customerDetails,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentId: order.paymentId,
        orderStatus: order.orderStatus,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        actualDeliveryTime: order.actualDeliveryTime,
        deliveryAgent: order.deliveryAgent,
        rating: order.rating,
        review: order.review,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error("Get order error:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["Placed", "Confirmed", "Preparing", "Ready for Pickup", "Out for Delivery", "Delivered", "Cancelled"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;
    
    // Set actual delivery time when delivered
    if (status === "Delivered") {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    res.json({
      message: "Order status updated successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        actualDeliveryTime: order.actualDeliveryTime,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order can be cancelled
    if (["Delivered", "Cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    order.orderStatus = "Cancelled";
    order.cancellationReason = reason || "Cancelled by customer";
    
    // Refund if payment was made online
    if (order.paymentMethod === "Online" && order.paymentStatus === "Paid") {
      order.paymentStatus = "Refunded";
    }

    await order.save();

    res.json({
      message: "Order cancelled successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        cancellationReason: order.cancellationReason,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: error.message });
  }
};