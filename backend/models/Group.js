import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true, unique: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["open", "locked", "completed"], default: "open" }
  },
  { timestamps: true }
);

export default mongoose.model("Group", groupSchema);
