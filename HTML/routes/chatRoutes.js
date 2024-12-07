import express from "express";
import Chat from "../models/chatModel.js";

const router = express.Router();

/**
 * Save a chat message
 * @route POST /api/chats/saveMessage
 */
router.post("/saveMessage", async (req, res) => {
  const { sessionId, role, content } = req.body;

  if (!sessionId || !role || !content) {
    return res.status(400).json({ error: "Invalid request: Missing fields" });
  }

  try {
    let chat = await Chat.findOne({ sessionId });
    if (!chat) {
      chat = new Chat({ sessionId, messages: [] });
    }
    chat.messages.push({ role, content });
    await chat.save();
    res.status(200).json({ message: "Chat saved successfully" });
  } catch (error) {
    console.error("Error saving chat:", error);
    res.status(500).json({ error: "Failed to save chat" });
  }
});

/**
 * Retrieve chat history by session ID
 * @route GET /api/chats/getHistory/:sessionId
 */
router.get("/getHistory/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: "Invalid request: Missing sessionId" });
  }

  try {
    const chat = await Chat.findOne({ sessionId });
    res.status(200).json(chat ? chat.messages : []);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

/**
 * Retrieve all chat sessions
 * @route GET /api/chats/sessions
 */
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await Chat.find({}, { sessionId: 1, _id: 0 }).lean();
    const formattedSessions = sessions.map((session, index) => ({
      sessionId: session.sessionId,
      title: `Session ${index + 1}`,
    }));
    res.status(200).json(formattedSessions);
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    res.status(500).json({ error: "Failed to fetch chat sessions" });
  }
});

/**
 * Create a new chat session
 * @route POST /api/chats/newSession
 */
router.post("/newSession", async (req, res) => {
  try {
    const newSessionId = Date.now().toString();
    const chat = new Chat({ sessionId: newSessionId, messages: [] });
    await chat.save();
    res.status(201).json({ sessionId: newSessionId });
  } catch (error) {
    console.error("Error creating new chat session:", error);
    res.status(500).json({ error: "Failed to create a new chat session" });
  }
});

/**
 * Delete a chat session by session ID
 * @route DELETE /sessions/:sessionId
 */
// Delete a specific session by sessionId
router.delete("/sessions/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const deletedSession = await Chat.findOneAndDelete({ sessionId });
    if (!deletedSession) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
});


export default router;
