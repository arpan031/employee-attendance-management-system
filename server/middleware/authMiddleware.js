const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing"
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const employee = await Employee.findById(
      decoded.id
    );

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Employee account not found"
      });
    }

    if (!employee.isActive) {
      return res.status(403).json({
        success: false,
        message: "Employee account is inactive"
      });
    }

    req.employee = employee;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          error.name === "TokenExpiredError"
            ? "Authentication token has expired"
            : "Invalid authentication token"
      });
    }

    next(error);
  }
};

module.exports = protect;