import axios from "axios";
import pdfParse from "pdf-parse";
import puppeteer from "puppeteer";
import * as cheerio from "cheerio"; // For static HTML content

const fetchAndExtractContent = async (url) => {
  try {
    if (url.endsWith(".pdf")) {
      // Handle PDFs
      console.log(`Processing PDF: ${url}`);
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const pdfData = await pdfParse(response.data);
      return pdfData.text.trim();
    } else {
      console.log(`Processing Website: ${url}`);
      const response = await axios.get(url);
      const $ = cheerio.load(response.data); // Load HTML into cheerio

      // Extract the main content using a generic selector
      const mainContent = $("body").text(); // Adjust selector for specific sites
      return mainContent.trim();
    }
  } catch (error) {
    console.error(`Error extracting content from ${url}:`, error.message);
    return null; // Skip URLs that fail
  }
};

export default fetchAndExtractContent;
