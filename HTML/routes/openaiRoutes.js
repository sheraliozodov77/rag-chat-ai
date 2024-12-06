const express = require('express');
const OpenAI = require('openai');
const { pinecone, indexName } = require('../config/vectorDB'); // Import Pinecone setup
const { createEmbedding } = require('../utils/embeddingUtils'); // Embedding utility
require('dotenv').config();

const router = express.Router();

const openai = new OpenAI({
  api_key: process.env.OPENAI_API_KEY
});

router.post('/ask', async (req, res) => {
  try {
    const userInput = req.body.question;

    // Step 1: Generate embedding for the user query
    const queryEmbedding = await createEmbedding(userInput);

    // Step 2: Query the Pinecone index for relevant documents
    const pineconeIndex = pinecone.Index(indexName);
    const searchResults = await pineconeIndex.query({
      vector: queryEmbedding,
      topK: 5, // Number of top results to retrieve
      includeMetadata: true,
    });

    // Step 3: Extract relevant document text from the search results
    const context = searchResults.matches
      .map((match) => match.metadata.text)
      .join('\n---\n'); // Join relevant results with a separator

    // Step 4: Send the query and retrieved context to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a legal assistant. Use the provided legal documents to answer user questions accurately.",
        },
        {
          role: "system",
          content: `Relevant legal context:\n${context}`,
        },
        {
          role: "user",
          content: userInput,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    console.log('API Response:', response);

    // Step 5: Return the AI's answer to the user
    if (Array.isArray(response.choices) && response.choices.length > 0) {
      const answer = response.choices[0].message.content;
      res.json({ answer });
    } else {
      res.status(500).json({ error: 'No valid response from the API.' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

module.exports = router;
