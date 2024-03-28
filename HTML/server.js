const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const cookieParser = require('cookie-parser');
const OpenAI = require('openai');
require('dotenv').config();

// Importing configurations and middleware
const connectDB = require('./config/db');
const authenticate = require('./middleware/authenticate');

// Importing routes
const authRoutes = require('./routes/authRoutes');
const openaiRoutes = require('./routes/openaiRoutes');

// Initializing the Express application
const app = express();

// Database Connection
connectDB();

// Middleware Configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session Configuration
app.use(session({
  secret: 'yourSecretKey121212',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: 'mongodb://localhost:27017/mydatabase'
  }),
  cookie: {
    maxAge: 2*600000, // Session expires after 20 minutes of inactivity
    secure: false,
    httpOnly: true
  }
}));

// Routes
app.use('/auth', authRoutes);
// Use the OpenAI routes
app.use(openaiRoutes);

// Protected route example (using the authenticate middleware to protect the route)
app.get('/chat.html', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Serving Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Start the Server
const PORT =  80;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));