import express from "express";
import { pinecone } from "../config/vectorDB.js";
import { createEmbedding } from "../utils/embeddingUtils.js";
import { fetchAndExtractPDF } from "../utils/pdfProcessor.js";
import pdfUrls from "../config/pdfUrls.js"; // Import URLs
import Vector from "../models/vectorModel.js";

const router = express.Router();

router.post("/ingest-all", async (req, res) => {
  try {
    const results = [];
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    for (const url of pdfUrls) {
      // Fetch and process PDF
      const text = await fetchAndExtractPDF(url);
      if (!text) throw new Error(`Failed to extract text from PDF at ${url}`);

      console.log(`Extracted text for URL ${url}:`, text.slice(0, 100), "..."); // Log first 100 chars

      // Generate embedding
      const embedding = await createEmbedding(text);
      console.log(`Generated embedding for URL ${url}:`, embedding.slice(0, 10), "..."); // Log first 10 values

      // Save to MongoDB
      const document = await Vector.findOneAndUpdate(
        { url },
        { text, embedding, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      console.log(`Document saved to MongoDB for URL ${url}:`, document._id);

      // Upsert into Pinecone
      await pineconeIndex.upsert([
        {
          id: document._id.toString(),
          values: embedding,
          metadata: { url, text },
        },
      ]);
      console.log(`Upserted vector into Pinecone for URL ${url}`);

      results.push({ url, status: "processed" });
    }

    // Fetch Pinecone index stats for debugging
    const stats = await pineconeIndex.describeIndexStats();
    console.log("Pinecone Index Stats after ingestion:", stats);

    res.status(200).json({ message: "All PDFs processed successfully", results });
  } catch (error) {
    console.error("Error processing PDFs:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
