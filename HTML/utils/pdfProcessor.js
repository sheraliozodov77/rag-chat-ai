import axios from "axios";
import pdfParse from "pdf-parse";

export const fetchAndExtractPDF = async (url) => {
  try {
    // Fetch the PDF as a binary array buffer
    const response = await axios.get(url, { responseType: "arraybuffer" });

    // Pass the PDF data to pdf-parse
    const pdfData = await pdfParse(response.data);

    // Return the extracted text
    return pdfData.text;
  } catch (error) {
    console.error(`Error fetching or parsing PDF: ${error.message}`);
    throw new Error(`Failed to process PDF at ${url}`);
  }
};
