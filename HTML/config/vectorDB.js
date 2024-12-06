const { PineconeClient } = require('@pinecone-database/pinecone');
require('dotenv').config();

const pinecone = new PineconeClient();

const initializePinecone = async () => {
    try {
        await pinecone.init({
            apiKey: process.env.PINECONE_API_KEY,
            environment: process.env.PINECONE_ENVIRONMENT,
        });
        console.log('Pinecone client initialized');
    } catch (error) {
        console.error('Error initializing Pinecone:', error);
    }
};

module.exports = {
    pinecone,
    initializePinecone,
};
