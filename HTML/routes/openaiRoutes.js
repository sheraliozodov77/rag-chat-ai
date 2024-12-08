import express from "express";
import { pinecone } from "../config/vectorDB.js";
import { createEmbedding } from "../utils/embeddingUtils.js";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/ask", async (req, res) => {
  try {
    const userInput = req.body.question;

    // Step 1: Convert the user's query into an embedding
    const queryEmbedding = await createEmbedding(userInput);

    // Step 2: Query Pinecone for relevant documents
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    const searchResults = await pineconeIndex.query({
      vector: queryEmbedding,
      topK: 5, // Number of most relevant chunks to retrieve
      includeMetadata: true, // Include text metadata in the response
    });

    // Step 3: Extract the retrieved text chunks
    const context = searchResults.matches
      .map((match) => match.metadata.text)
      .join("\n\n"); // Combine the text from the top matches

    if (!context) {
      return res.status(404).json({
        message: "No relevant data found in the provided documents.",
      });
    }

    // Step 4: Pass the context to OpenAI for answering
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Use the following context to answer the user's question within the provided max_tokens limit. Ensure the answer is clear, complete, and makes sense without cutting off. Do not provide answers outside the scope of the text provided in the context, including any general knowledge or assumptions. Only respond based on the information explicitly available in the given text.",
        },
        {
          role: "system",
          content: `Context:\n${context}`,
        },
        {
          role: "user",
          content: userInput,
        },
      ],
      max_tokens: 500, // Limit the length of the response
      temperature: 0.7,
    });

    // Step 5: Send the response back to the user
    const answer = response.choices[0]?.message?.content || "I'm sorry, I couldn't find an answer.";
    res.json({ answer });
  } catch (error) {
    console.error("Error in /ask:", error.message);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
});

export default router;
