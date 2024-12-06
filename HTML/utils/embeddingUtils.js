import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const createEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding; // Extract the embedding from the response
  } catch (error) {
    console.error("Error creating embedding:", error.message);
    throw new Error("Failed to create embedding");
  }
};
