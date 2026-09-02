const express = require("express");

const {
  register,
  login,
  getMe
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const validate = require("../middleware/validateMiddleware");

const {
  registerValidator,
  loginValidator
} = require("../validators/authValidator");

const router = express.Router();

/* Public Routes */

router.post(
  "/register",
  registerValidator,
  validate,
  register
);

router.post(
  "/login",
  loginValidator,
  validate,
  login
);

/* Protected Routes */

router.get(
  "/me",
  protect,
  getMe
);

module.exports = router;