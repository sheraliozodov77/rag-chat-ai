const axios = require('axios');
const pdfParse = require('pdf-parse');

const fetchAndExtractPDF = async (url) => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const pdfText = await pdfParse(response.data);
        return pdfText.text; // Extracted text from PDF
    } catch (error) {
        console.error(`Error fetching or parsing PDF: ${error.message}`);
        return null;
    }
};

module.exports = { fetchAndExtractPDF };
