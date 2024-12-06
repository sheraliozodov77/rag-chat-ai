const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const cookieParser = require('cookie-parser');
const OpenAI = require('openai');
require('dotenv').config();

const connectDB = require('./config/db');
const { initializePinecone } = require('./config/vectorDB'); // Import Pinecone initialization
const authenticate = require('./middleware/authenticate');
const authRoutes = require('./routes/authRoutes'); 
const openaiRoutes = require('./routes/openaiRoutes');
const pdfRoutes = require('./routes/pdfRoutes'); // Import PDF routes

const app = express();

// Connect to the database
connectDB();

// Initialize Pinecone
(async () => {
  try {
    await initializePinecone(); // Initialize Pinecone before starting the server
    console.log('Pinecone initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Pinecone:', error);
    process.exit(1); // Exit if Pinecone initialization fails
  }
})();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKey121212', // Use environment variable for session secret
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1/mydatabase', // Use environment variable for MongoDB URI
  }),
  cookie: {
    maxAge: 2 * 60000,
    secure: false,
    httpOnly: true,
  },
}));

// Routes
app.use('/auth', authRoutes);
app.use('/pdf', pdfRoutes); // Add PDF ingestion routes
app.use(openaiRoutes);

app.get('/chat', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Start HTTP server locally
const PORT = process.env.PORT || 3000; // Use environment variable for port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
