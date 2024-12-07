import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, required: true }, // 'user' or 'ai'
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  sessionId: { type: String, required: true }, // Unique session identifier
  messages: [messageSchema], // Array of messages
  createdAt: { type: Date, default: Date.now },
});

// Index for efficient session lookup
chatSchema.index({ sessionId: 1 }, { unique: true });

export default mongoose.model("Chat", chatSchema);
