const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const createEmbedding = async (text) => {
    const response = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: text,
    });

    return response.data.data[0].embedding;
};

module.exports = { createEmbedding };
