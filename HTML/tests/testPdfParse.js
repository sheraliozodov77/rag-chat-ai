import axios from "axios";
import pdfParse from "pdf-parse";

const testPdfParse = async () => {
  try {
    const response = await axios.get("https://www.example.com/sample.pdf", { responseType: "arraybuffer" });
    const pdfData = await pdfParse(response.data);
    console.log("Extracted PDF Text:", pdfData.text);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

testPdfParse();
