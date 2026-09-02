const cors = require("cors");

const getAllowedOrigins = () => {
  return (
    process.env.CLIENT_URL ||
    "http://localhost:5173,https://attendpro-seven.vercel.app"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow server-to-server requests and Postman
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);

    return callback(new Error("Origin is not allowed by CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization"
  ]
};

module.exports = corsOptions;