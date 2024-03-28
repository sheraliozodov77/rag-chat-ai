const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();
const router = express.Router();

const openai = new OpenAI({
  api_key: "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"
});

router.post('/ask', async (req, res) => {
    try {
      const userInput = req.body.question;
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: userInput
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
  
      console.log('API Response:', response);
  
      // Check if 'choices' array exists and has elements
      if (Array.isArray(response.choices) && response.choices.length > 0) {
        const answer = response.choices[0].message.content;
        res.json({ answer });
      } else {
        res.status(500).json({ error: 'No valid response from the API.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  });


module.exports = router;
