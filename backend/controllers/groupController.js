import Group from "../models/Group.js";
import User from "../models/User.js";

export const createRoom = async (req, res) => {
  try {
    const hostId = req.user._id;
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const group = new Group({
      roomCode,
      host: hostId,
      participants: [hostId]
    });

    await group.save();
    
    // Populate user info for frontend
    const populated = await Group.findById(group._id).populate("host", "name avatar").populate("participants", "name avatar");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const userId = req.user._id;

    const group = await Group.findOne({ roomCode });
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.status !== "open") return res.status(400).json({ message: "Group is locked or completed" });

    if (!group.participants.includes(userId)) {
      group.participants.push(userId);
      await group.save();
      
      // Emit socket event to notify others
      const io = req.app.get("io");
      const user = await User.findById(userId).select("name avatar");
      io.to(roomCode).emit("user_joined", { participant: user });
    }

    const populated = await Group.findById(group._id).populate("host", "name avatar").populate("participants", "name avatar");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const group = await Group.findOne({ roomCode }).populate("host", "name avatar").populate("participants", "name avatar");
    if (!group) return res.status(404).json({ message: "Group not found" });
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const lockRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const userId = req.user._id;

    const group = await Group.findOne({ roomCode });
    if (!group) return res.status(404).json({ message: "Group not found" });
    
    if (group.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only host can lock the group" });
    }

    group.status = "locked";
    await group.save();

    const io = req.app.get("io");
    io.to(roomCode).emit("room_locked");

    res.json({ message: "Room locked", status: "locked" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
