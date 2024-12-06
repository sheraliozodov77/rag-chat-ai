import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const initializePinecone = async () => {
  try {
    const indexes = await pinecone.listIndexes();
    console.log("Pinecone initialized successfully. Available indexes:", indexes);
  } catch (error) {
    console.error("Failed to initialize Pinecone:", error.message);
    process.exit(1);
  }
};

export { pinecone };
