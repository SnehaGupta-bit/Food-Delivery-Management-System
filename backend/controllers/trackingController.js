import Tracking from "../models/Tracking.js";
import DeliveryAgent from "../models/DeliveryAgent.js";
import Order from "../models/Order.js";

export const updateLocation = async (req, res) => {
  try {
    const { orderId, lat, lng } = req.body;
    const agentId = req.user.id;

    if (!lat || !lng || !orderId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Update agent location
    await DeliveryAgent.findOneAndUpdate(
      { userId: agentId },
      { currentLocation: { lat, lng } }
    );

    // Update tracking
    const tracking = await Tracking.findOneAndUpdate(
      { orderId, agentId },
      { currentLocation: { lat, lng } },
      { new: true }
    );

    if (!tracking) {
      return res.status(404).json({ message: "Tracking not found" });
    }

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').to(`order_${orderId}`).emit('locationUpdate', {
        lat,
        lng,
        status: tracking.status
      });
    }

    res.status(200).json({
      success: true,
      message: "Location updated",
      tracking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    const tracking = await Tracking.findOne({ orderId })
      .populate('agentId', 'name phone')
      .populate('orderId', 'orderStatus totalAmount');

    if (!tracking) {
      return res.status(404).json({ message: "Tracking not found" });
    }

    res.status(200).json({
      success: true,
      tracking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTracking = async (req, res) => {
  try {
    const { orderId, agentId, customerLocation } = req.body;

    // Get agent's current location
    const agent = await DeliveryAgent.findOne({ userId: agentId });
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const tracking = await Tracking.create({
      orderId,
      agentId,
      currentLocation: agent.currentLocation,
      customerLocation,
      status: "Assigned"
    });

    res.status(201).json({
      success: true,
      tracking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};