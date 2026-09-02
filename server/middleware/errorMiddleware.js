
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;

  let message =
    err.message || "Internal server error";

  /* Mongoose Duplicate Key */

  if (err.code === 11000) {
    statusCode = 409;

    const fields = Object.keys(
      err.keyPattern || {}
    );

    message = `Duplicate value for: ${fields.join(", ")}`;
  }

  /* Mongoose Validation */

  if (err.name === "ValidationError") {
    statusCode = 400;

    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  /* Error */

  if (err.name === "CastError") {
    statusCode = 400;

    message = `Invalid ${err.path}: ${err.value}`;
  }

  /* JWT Errors */

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired";
  }

  res.status(statusCode).json({
    success: false,
    message,

    ...(process.env.NODE_ENV === "development"
      ? {
          stack: err.stack
        }
      : {})
  });
};

module.exports = {
  notFound,
  errorHandler
};