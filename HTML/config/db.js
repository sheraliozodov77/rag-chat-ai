import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const connectDB = () => {
  const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase_new"; // Default to local MongoDB if MONGO_URI is not provided

  mongoose
    .connect(mongoURI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      process.exit(1);
    });
};

export default connectDB;
