import GroupOrder from "../models/GroupOrder.js";
import Order from "../models/Order.js";
import { nanoid } from "nanoid";

export const createGroupOrder = async (req, res) => {
  try {
    const hostId = req.user.id;
    const { deliveryAddress } = req.body;

    const roomCode = nanoid(8).toUpperCase();

    const groupOrder = await GroupOrder.create({
      roomCode,
      hostId,
      deliveryAddress,
      participants: [{
        userId: hostId,
        name: req.user.name || "Host",
        items: [],
        subtotal: 0
      }]
    });

    res.status(201).json({
      success: true,
      groupOrder,
      roomCode
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinGroupOrder = async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user.id;

    const groupOrder = await GroupOrder.findOne({ roomCode });

    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    if (groupOrder.status !== "Active") {
      return res.status(400).json({ message: "Group order is no longer accepting participants" });
    }

    // Check if user already joined
    const alreadyJoined = groupOrder.participants.some(
      p => p.userId.toString() === userId
    );

    if (alreadyJoined) {
      return res.status(400).json({ message: "You have already joined this group order" });
    }

    groupOrder.participants.push({
      userId,
      name: req.user.name || "Guest",
      items: [],
      subtotal: 0
    });

    await groupOrder.save();

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').to(`group_${roomCode}`).emit('participantJoined', {
        userId,
        name: req.user.name
      });
    }

    res.status(200).json({
      success: true,
      groupOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addItemToGroupOrder = async (req, res) => {
  try {
    const { roomCode, foodId, name, price, quantity } = req.body;
    const userId = req.user.id;

    const groupOrder = await GroupOrder.findOne({ roomCode });

    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    if (groupOrder.status !== "Active") {
      return res.status(400).json({ message: "Group order is locked" });
    }

    const participant = groupOrder.participants.find(
      p => p.userId.toString() === userId
    );

    if (!participant) {
      return res.status(403).json({ message: "You are not part of this group order" });
    }

    // Add or update item
    const existingItem = participant.items.find(item => item.foodId === foodId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      participant.items.push({ foodId, name, price, quantity });
    }

    // Recalculate subtotal
    participant.subtotal = participant.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );

    // Recalculate total
    groupOrder.totalAmount = groupOrder.participants.reduce(
      (sum, p) => sum + p.subtotal, 
      0
    );

    await groupOrder.save();

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').to(`group_${roomCode}`).emit('orderUpdated', {
        groupOrder
      });
    }

    res.status(200).json({
      success: true,
      groupOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const lockGroupOrder = async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user.id;

    const groupOrder = await GroupOrder.findOne({ roomCode });

    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    if (groupOrder.hostId.toString() !== userId) {
      return res.status(403).json({ message: "Only host can lock the order" });
    }

    groupOrder.status = "Locked";
    await groupOrder.save();

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').to(`group_${roomCode}`).emit('orderLocked', {
        groupOrder
      });
    }

    res.status(200).json({
      success: true,
      groupOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkoutGroupOrder = async (req, res) => {
  try {
    const { roomCode, splitMethod } = req.body;
    const userId = req.user.id;

    const groupOrder = await GroupOrder.findOne({ roomCode });

    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    if (groupOrder.hostId.toString() !== userId) {
      return res.status(403).json({ message: "Only host can checkout" });
    }

    if (groupOrder.status !== "Locked") {
      return res.status(400).json({ message: "Please lock the order first" });
    }

    // Calculate split amounts
    const participantCount = groupOrder.participants.length;
    let splitAmounts = [];

    if (splitMethod === "Equal") {
      const amountPerPerson = groupOrder.totalAmount / participantCount;
      splitAmounts = groupOrder.participants.map(p => ({
        userId: p.userId,
        name: p.name,
        amount: Math.round(amountPerPerson)
      }));
    } else {
      // Item-based split
      splitAmounts = groupOrder.participants.map(p => ({
        userId: p.userId,
        name: p.name,
        amount: p.subtotal
      }));
    }

    // Create main order
    const allItems = groupOrder.participants.flatMap(p => p.items);

    const order = await Order.create({
      userId: groupOrder.hostId,
      items: allItems,
      totalAmount: groupOrder.totalAmount,
      deliveryAddress: groupOrder.deliveryAddress,
      paymentMethod: "Online",
      paymentStatus: "Pending"
    });

    groupOrder.orderId = order._id;
    groupOrder.status = "Completed";
    groupOrder.splitMethod = splitMethod;
    await groupOrder.save();

    // Emit socket event with payment links
    if (req.app.get('io')) {
      req.app.get('io').to(`group_${roomCode}`).emit('checkoutReady', {
        orderId: order._id,
        splitAmounts
      });
    }

    res.status(200).json({
      success: true,
      order,
      splitAmounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupOrder = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const groupOrder = await GroupOrder.findOne({ roomCode })
      .populate('hostId', 'name email')
      .populate('participants.userId', 'name email');

    if (!groupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    res.status(200).json({
      success: true,
      groupOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
