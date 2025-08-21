const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.MONGO_URI;
console.log("🔍 MONGO_URI from .env:", mongoURI); // Debug log

const connectDB = async () => {
  try {
    console.log("📡 Attempting to connect to MongoDB..."); // Add this
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
