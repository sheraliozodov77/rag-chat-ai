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
 * @route GET /api/chats/sessio/**
 * Create a new chat session
 * @route POST /api/chats/newSession
 */
router.post("/newSession", async (req, res) => {
  try {
    const newSessionId = Date.now().toString(); // Unique session ID
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const newSessionTitle = `Session - ${formattedTime}`; // Add time with seconds only

    const chat = new Chat({
      sessionId: newSessionId,
      title: newSessionTitle, // Pass the title
      messages: [],
    });
    await chat.save();

    res.status(201).json({ sessionId: newSessionId, title: newSessionTitle });
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

router.get("/sessions", async (req, res) => {
  try {
      const sessions = await Chat.find({}, { sessionId: 1, title: 1, _id: 0 }).sort({ createdAt: -1 });
      res.status(200).json(sessions); // Return session ID and title directly
  } catch (error) {
      console.error("Error fetching sessions:", error.message);
      res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

router.patch("/sessions/:sessionId/rename", async (req, res) => {
  try {
      const { sessionId } = req.params;
      const { title } = req.body;

      if (!title || title.trim() === "") {
          return res.status(400).json({ error: "Invalid title provided." });
      }

      const updatedSession = await Chat.findOneAndUpdate(
          { sessionId },
          { title },
          { new: true }
      );

      if (!updatedSession) {
          return res.status(404).json({ error: "Session not found." });
      }

      res.status(200).json({ message: "Session renamed successfully." });
  } catch (error) {
      console.error("Error renaming session:", error);
      res.status(500).json({ error: "Failed to rename session." });
  }
});



export default router;
