const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const connectDB = () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase'; // Default to local MongoDB if MONGO_URI is not provided

  mongoose
    .connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    });
};

module.exports = connectDB;
