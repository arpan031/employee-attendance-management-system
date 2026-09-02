const jwt = require("jsonwebtoken");

const generateToken = (employeeId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured"
    );
  }

  return jwt.sign(
    {
      id: employeeId
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
};

module.exports = generateToken;