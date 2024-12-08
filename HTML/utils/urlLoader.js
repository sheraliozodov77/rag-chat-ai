import axios from "axios";
import * as cheerio from "cheerio";
import { Document } from "llamaindex";

/**
 * Fetches and processes content from the given URLs.
 * @param {string[]} urls - Array of URLs to fetch content from.
 * @returns {Promise<Document[]>} - Array of LlamaIndex Document objects.
 */
const loadUrlsAsDocuments = async (urls) => {
  const documents = [];

  for (const url of urls) {
    try {
      // Fetch the HTML content of the URL
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      // Extract and clean title and body content
      const title = $("title").text().trim();
      const body = $("body").text().replace(/\s+/g, " ").trim();

      if (!title && !body) {
        console.warn(`No content found for ${url}. Skipping...`);
        continue;
      }

      // Combine title and body content
      const content = `${title}\n\n${body}`;

      // Create a new LlamaIndex Document with metadata
      const document = new Document({
        text: content,
        metadata: { source: url },
      });

      // Add the document to the array
      documents.push(document);
      console.log(`Successfully processed content from ${url}`);
    } catch (error) {
      console.error(`Failed to fetch or process content from ${url}:`, error.message);
    }
  }

  return documents;
};

export default loadUrlsAsDocuments;
