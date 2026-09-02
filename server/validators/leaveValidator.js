
const {
  body
} = require("express-validator");

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().startsWith(value)
  );
};

const leaveValidator = [
  body("leaveType")
    .trim()
    .notEmpty()
    .withMessage("Leave type is required")
    .isIn([
      "Casual Leave",
      "Sick Leave",
      "Annual Leave",
      "Emergency Leave"
    ])
    .withMessage("Invalid leave type"),

  body("startDate")
    .trim()
    .notEmpty()
    .withMessage("Start date is required")
    .custom(isValidDate)
    .withMessage(
      "Start date must be a valid YYYY-MM-DD date"
    ),

  body("endDate")
    .trim()
    .notEmpty()
    .withMessage("End date is required")
    .custom(isValidDate)
    .withMessage(
      "End date must be a valid YYYY-MM-DD date"
    ),

  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Reason is required")
    .isLength({
      min: 3,
      max: 500
    })
    .withMessage(
      "Reason must be between 3 and 500 characters"
    )
];

module.exports = {
  leaveValidator
};