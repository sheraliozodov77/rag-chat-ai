import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { initializePinecone } from "./config/vectorDB.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import openaiRoutes from "./routes/openaiRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import authenticate from "./middleware/authenticate.js";

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
    mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1/mydatabase_new', // Use environment variable for MongoDB URI
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

// Simulate `__dirname` in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the chat page
app.get("/chat", authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Start HTTP server locally
const PORT = process.env.PORT || 3000; // Use environment variable for port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
