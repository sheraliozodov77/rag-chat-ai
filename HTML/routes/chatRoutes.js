import express from "express";
import Chat from "../models/chatModel.js";
import setupLlamaIndex from "../utils/llamaIndexSetup.js";

const router = express.Router();
let llamaIndex;

// Initialize LlamaIndex on server startup
(async () => {
  try {
    llamaIndex = await setupLlamaIndex();
    console.log("LlamaIndex initialized successfully.");
  } catch (error) {
    console.error("Error initializing LlamaIndex:", error.message);
  }
})();

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
      // Generate a title for the new chat session
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      const title = `Session - ${formattedTime}`;

      chat = new Chat({ sessionId, title, messages: [] });
    }
    chat.messages.push({ role, content });
    await chat.save();
    res.status(200).json({ message: "Chat saved successfully" });
  } catch (error) {
    console.error("Error saving chat:", error.message);
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
    console.error("Error fetching chat history:", error.message);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

/**
 * Retrieve all chat sessions
 * @route GET /api/chats/sessions
 */
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await Chat.find({}, { sessionId: 1, title: 1, _id: 0 }).sort({ createdAt: -1 });
    res.status(200).json(sessions); // Return session ID and title directly
  } catch (error) {
    console.error("Error fetching sessions:", error.message);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

/**
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
    const newSessionTitle = `Session - ${formattedTime}`;

    const chat = new Chat({
      sessionId: newSessionId,
      title: newSessionTitle,
      messages: [],
    });
    await chat.save();

    res.status(201).json({ sessionId: newSessionId, title: newSessionTitle });
  } catch (error) {
    console.error("Error creating new chat session:", error.message);
    res.status(500).json({ error: "Failed to create a new chat session" });
  }
});

/**
 * Delete a chat session by session ID
 * @route DELETE /api/chats/sessions/:sessionId
 */
router.delete("/sessions/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const deletedSession = await Chat.findOneAndDelete({ sessionId });
    if (!deletedSession) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error.message);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

/**
 * Rename a chat session by session ID
 * @route PATCH /api/chats/sessions/:sessionId/rename
 */
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
    console.error("Error renaming session:", error.message);
    res.status(500).json({ error: "Failed to rename session." });
  }
});

/**
 * Ask LlamaIndex a question
 * @route POST /api/chats/ask
 */
router.post("/ask", async (req, res) => {
  try {
    const userInput = req.body.question;
    console.log(`Processing user query: "${userInput}" with LlamaIndex`);
    // Query LlamaIndex
    const response = await llamaIndex.query(userInput, {
      retriever: { topK: 5 }, // Retrieve top 5 results
    });
    console.log("LlamaIndex query response:", response.result);
    const answer = response?.result || "I'm sorry, I couldn't find an answer.";
    res.json({ answer });
  } catch (error) {
    console.error("Error querying LlamaIndex:", error.message);
    res.status(500).json({ error: "Failed to process your request." });
  }
});

/**
 * Refresh LlamaIndex with updated data
 * @route POST /api/chats/refreshIndex
 */
router.post("/refreshIndex", async (req, res) => {
  try {
    llamaIndex = await setupLlamaIndex();
    res.status(200).json({ message: "Index refreshed successfully!" });
  } catch (error) {
    console.error("Error refreshing index:", error.message);
    res.status(500).json({ error: "Failed to refresh the index." });
  }
});

export default router;
