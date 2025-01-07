# RAG Chatbot

A **Retrieval-Augmented Generation (RAG)** chatbot that integrates **LlamaIndex**, **Pinecone**, and **OpenAI GPT** to provide accurate and contextually relevant answers. The project features a clean and intuitive user interface with advanced session management capabilities.

## 📖 Features

- **Retrieval-Augmented Generation (RAG):** Combines document retrieval with generative AI for enhanced accuracy.
- **LlamaIndex Integration:** Indexes content from URLs for efficient document retrieval.
- **Pinecone Vector Database:** Stores embeddings and supports fast similarity searches.

## 🛠️ Technologies Used

### Backend
- **Node.js**: Server-side runtime.
- **Express.js**: Backend framework for API routing.
- **MongoDB**: Database for storing session and chat data.
- **LlamaIndex**: Processes and indexes content from web pages.
- **Pinecone**: Vector database for similarity searches.
- **Cheerio**: Web scraping library for content extraction.
- **OpenAI API**: GPT model for generating chatbot responses.

⚙️ Setup Instructions

1. Clone the Repository
git clone https://github.com/your-username/rag-chatbot.git
cd rag-chatbot
2. Install Dependencies
npm install
3. Configure Environment Variables
Create a .env file in the root directory and add the following variables:

MONGO_URI=<your-mongodb-uri>
OPENAI_API_KEY=<your-openai-api-key>
PINECONE_API_KEY=<your-pinecone-api-key>
PINECONE_INDEX_NAME=<your-pinecone-index-name>
PINECONE_ENVIRONMENT=<your-pinecone-environment>

4. Run the Application
npm start
Access the application at http://localhost:3000.
