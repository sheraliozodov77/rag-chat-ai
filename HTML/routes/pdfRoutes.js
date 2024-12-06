import express from "express";
import { pinecone } from "../config/vectorDB.js";
import { createEmbedding } from "../utils/embeddingUtils.js";
import fetchAndExtractContent from "../utils/fetchAndExtractContent.js"; // Handles both PDFs and websites
import dataUrls from "../config/dataUrls.js"; // Includes both PDF and website URLs
import Vector from "../models/vectorModel.js";
import { splitTextIntoChunks } from "../utils/textUtils.js"; // Utility to split large content

const router = express.Router();

router.post("/ingest-all", async (req, res) => {
  try {
    const results = [];
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    for (const url of dataUrls) {
      console.log(`Processing URL: ${url}`);

      // Fetch and process content
      const text = await fetchAndExtractContent(url);
      if (!text) {
        console.error(`Failed to extract text for URL: ${url}`);
        results.push({ url, status: "failed", reason: "Content extraction failed" });
        continue;
      }

      console.log(`Extracted content for URL ${url}:`, text.slice(0, 100), "...");

      // Split content into chunks
      const chunks = splitTextIntoChunks(text, 800); // Limit each chunk to 800 tokens
      console.log(`Split content into ${chunks.length} chunks for URL: ${url}`);

      // Process each chunk
      for (let index = 0; index < chunks.length; index++) {
        const chunk = chunks[index];
        try {
          // Generate embedding for each chunk
          const embedding = await createEmbedding(chunk);
          console.log(`Generated embedding for chunk ${index + 1}/${chunks.length} of URL ${url}`);

          // Save to MongoDB with `chunkIndex`
          const document = await Vector.findOneAndUpdate(
            { url, chunkIndex: index }, // Composite identifier
            { url, chunkIndex: index, text: chunk, embedding, updatedAt: new Date() },
            { upsert: true, new: true }
          );
          console.log(`Document saved to MongoDB for URL ${url}, Chunk ${index + 1}`);

          // Upsert into Pinecone
          await pineconeIndex.upsert([
            {
              id: `${url}-${index}`, // Unique ID for Pinecone (URL + chunkIndex)
              values: embedding,
              metadata: { url, chunkIndex: index, text: chunk },
            },
          ]);
          console.log(`Upserted chunk ${index + 1}/${chunks.length} into Pinecone for URL: ${url}`);

          results.push({ url, chunk: index + 1, status: "processed" });
        } catch (chunkError) {
          console.error(
            `Error processing chunk ${index + 1} for URL ${url}:`,
            chunkError.message
          );
          results.push({
            url,
            chunk: index + 1,
            status: "failed",
            reason: chunkError.message,
          });
        }
      }
    }

    // Fetch Pinecone index stats for debugging
    const stats = await pineconeIndex.describeIndexStats();
    console.log("Pinecone Index Stats after ingestion:", stats);

    res.status(200).json({ message: "All URLs processed successfully", results });
  } catch (error) {
    console.error("Error processing URLs:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
