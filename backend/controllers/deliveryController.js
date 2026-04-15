import DeliveryAgent from "../models/DeliveryAgent.js";
import Order from "../models/Order.js";
import Tracking from "../models/Tracking.js";
import axios from "axios";

// Calculate distance using Google Distance Matrix API
const calculateDistance = async (origin, destination) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json`,
      {
        params: {
          origins: `${origin.lat},${origin.lng}`,
          destinations: `${destination.lat},${destination.lng}`,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    );

    if (response.data.rows[0].elements[0].status === "OK") {
      return {
        distance: response.data.rows[0].elements[0].distance.text,
        duration: response.data.rows[0].elements[0].duration.text
      };
    }
    return { distance: "N/A", duration: "N/A" };
  } catch (error) {
    console.error("Distance calculation error:", error);
    return { distance: "N/A", duration: "N/A" };
  }
};

export const assignDelivery = async (req, res) => {
  try {
    const { orderId, customerLocation } = req.body;

    // Find available agents
    const availableAgents = await DeliveryAgent.find({
      isAvailable: true,
      $expr: { $lt: [{ $size: "$currentOrders" }, 3] } // Max 3 concurrent orders
    });

    if (availableAgents.length === 0) {
      return res.status(404).json({ message: "No available agents" });
    }

    // Find nearest agent
    let nearestAgent = availableAgents[0];
    let minDistance = Infinity;

    for (const agent of availableAgents) {
      const result = await calculateDistance(agent.currentLocation, customerLocation);
      const distanceValue = parseFloat(result.distance.replace(/[^0-9.]/g, ''));
      
      if (distanceValue < minDistance) {
        minDistance = distanceValue;
        nearestAgent = agent;
      }
    }

    // Update order with agent
    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        deliveryAgent: nearestAgent.userId,
        orderStatus: "Preparing"
      },
      { new: true }
    );

    // Add order to agent's current orders
    await DeliveryAgent.findByIdAndUpdate(nearestAgent._id, {
      $push: { currentOrders: orderId }
    });

    // Create tracking
    const distanceInfo = await calculateDistance(nearestAgent.currentLocation, customerLocation);
    
    const tracking = await Tracking.create({
      orderId,
      agentId: nearestAgent.userId,
      currentLocation: nearestAgent.currentLocation,
      customerLocation,
      status: "Assigned",
      estimatedTime: distanceInfo.duration,
      distance: distanceInfo.distance
    });

    res.status(200).json({
      success: true,
      message: "Delivery assigned to agent",
      agent: {
        name: nearestAgent.name,
        phone: nearestAgent.phone,
        vehicleType: nearestAgent.vehicleType
      },
      tracking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAvailableAgents = async (req, res) => {
  try {
    const agents = await DeliveryAgent.find({
      isAvailable: true
    }).populate('userId', 'name email');

    res.status(200).json({
      success: true,
      count: agents.length,
      agents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAgentOrders = async (req, res) => {
  try {
    const agentId = req.user.id;

    const agent = await DeliveryAgent.findOne({ userId: agentId })
      .populate({
        path: 'currentOrders',
        populate: { path: 'userId', select: 'name phone' }
      });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.status(200).json({
      success: true,
      orders: agent.currentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};