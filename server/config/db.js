const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured");
    }

    const connection = await mongoose.connect(process.env.MONGODB_URI);

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );

    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;