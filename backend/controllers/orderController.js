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
      foodId: item.foodId,  // Corrected to match frontend and schema
      name: item.name,
      price: item.price,
      quantity: item.quantity,  // Corrected to match schema
      image: item.image
    }));

    const order = new Order({
      userId: userId,  // Corrected to match schema
      items: transformedItems,
      totalAmount: totalAmount,  // Corrected to match schema
      deliveryAddress: deliveryAddress,
      paymentMethod: paymentMethod
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: {
        id: order._id,
        items: order.items,
        total: order.totalAmount,  // Corrected to match frontend expectation
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

    const orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });  // Corrected to match schema

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};