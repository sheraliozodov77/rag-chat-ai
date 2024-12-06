const express = require('express');
const { fetchAndExtractPDF } = require('../utils/pdfProcessor');
const { pinecone, indexName } = require('../config/vectorDB');
const Vector = require('../models/vectorModel');
const { createEmbedding } = require('../utils/embeddingUtils');

const router = express.Router();

router.post('/ingest', async (req, res) => {
    const { url } = req.body;

    try {
        // Fetch and process PDF
        const text = await fetchAndExtractPDF(url);
        if (!text) throw new Error('Failed to extract text');

        // Generate embedding
        const embedding = await createEmbedding(text);

        // Save to MongoDB
        const document = await Vector.findOneAndUpdate(
            { url },
            { text, embedding, updatedAt: new Date() },
            { upsert: true, new: true }
        );

        // Upsert to Pinecone
        const pineconeIndex = pinecone.Index(indexName);
        await pineconeIndex.upsert([
            { id: document._id.toString(), values: embedding, metadata: { url } },
        ]);

        res.status(200).json({ message: 'Document processed successfully', document });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
