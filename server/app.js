const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const corsOptions = require("./config/cors");

const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const hrRoutes = require("./routes/hrRoutes");

const {
  notFound,
  errorHandler
} = require("./middleware/errorMiddleware");

const app = express();

/* Security */

app.disable("x-powered-by");

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    }
  })
);

app.use(cors(corsOptions));

/* Body Parser */

app.use(
  express.json({
    limit: "100kb"
  })
);

/* Rate Limiting */

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

app.use("/api", apiLimiter);

/* Health Check */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Employee Attendance API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

/* API Routes */

app.use("/api/auth", authRoutes);

app.use(
  "/api/attendance",
  attendanceRoutes
);

app.use(
  "/api/leaves",
  leaveRoutes
);

app.use(
  "/api/hr",
  hrRoutes
);

/* Error Handling  */

app.use(notFound);

app.use(errorHandler);

module.exports = app;