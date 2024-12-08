import { Document, VectorStoreIndex } from "llamaindex";
import loadUrlsAsDocuments from "./urlLoader.js";
import dataUrls from "../config/dataUrls.js";

/**
 * Sets up LlamaIndex with data from the given URLs.
 * @returns {Promise<VectorStoreIndex>} - Initialized LlamaIndex instance.
 */
const setupLlamaIndex = async () => {
  try {
    // Load documents from URLs
    const documents = await loadUrlsAsDocuments(dataUrls);

    if (documents.length === 0) {
      throw new Error("No documents were loaded. Ensure your URLs are valid and accessible.");
    }

    // Initialize the GPTSimpleVectorIndex with documents
    const index = await VectorStoreIndex.fromDocuments(documents);

    console.log("LlamaIndex setup completed successfully.");
    return index;
  } catch (error) {
    console.error("Error setting up LlamaIndex:", error.message);
    throw error;
  }
};

export default setupLlamaIndex;
