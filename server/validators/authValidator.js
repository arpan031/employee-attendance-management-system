
const {
  body
} = require("express-validator");

/* Validation */

const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({
      min: 2,
      max: 100
    })
    .withMessage(
      "Name must be between 2 and 100 characters"
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({
      min: 8
    })
    .withMessage(
      "Password must contain at least 8 characters"
    ),

  body("employeeId")
    .trim()
    .notEmpty()
    .withMessage("Employee ID is required")
    .isLength({
      min: 2,
      max: 30
    })
    .withMessage(
      "Employee ID must be between 2 and 30 characters"
    )
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage(
      "Employee ID can contain letters, numbers, hyphens and underscores only"
    ),

  body("department")
    .trim()
    .notEmpty()
    .withMessage("Department is required")
    .isLength({
      max: 100
    })
    .withMessage(
      "Department cannot exceed 100 characters"
    ),

  body("designation")
    .trim()
    .notEmpty()
    .withMessage("Designation is required")
    .isLength({
      max: 100
    })
    .withMessage(
      "Designation cannot exceed 100 characters"
    )
];

/* Login Validation */

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
];

module.exports = {
  registerValidator,
  loginValidator
};