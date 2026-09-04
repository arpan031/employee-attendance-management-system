const cors = require("cors");

const getAllowedOrigins = () => {
  const origins = [
    process.env.CLIENT_URL,
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : null,
    "http://localhost:5173"
  ];

  return [...new Set(
    origins
      .filter(Boolean)
      .flatMap((origin) =>
        origin.split(",").map((value) => value.trim())
      )
  )];
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error(
      `CORS blocked origin: ${origin}`,
      allowedOrigins
    );

    return callback(
      new Error("Origin is not allowed by CORS")
    );
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
