require("dotenv").config();

const app = require("../server/app");
const connectDB = require("../server/config/db");

let connectionPromise;

module.exports = async (req, res) => {
  try {
    if (!connectionPromise) {
      connectionPromise = connectDB();
    }

    await connectionPromise;

    return app(req, res);
  } catch (error) {
    console.error("Vercel API error:", error);

    return res.status(500).json({
      success: false,
      message: "Server connection failed"
    });
  }
};
