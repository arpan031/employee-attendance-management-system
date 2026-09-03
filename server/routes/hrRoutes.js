const express = require("express");

const {
  getDashboard,
  getAnalytics,
  createEmployee,
  getEmployees,
  getAllAttendance,
  toggleEmployeeStatus,
  deleteEmployee
} = require("../controllers/hrController");

const protect = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const validate = require("../middleware/validateMiddleware");

const {
  createEmployeeValidator
} = require("../validators/hrValidator");

const router = express.Router();

/* HR Authorization */

router.use(protect);

router.use(
  authorize("hr")
);

/* Dashboard */

router.get(
  "/dashboard",
  getDashboard
);

/* Analytics */

router.get(
  "/analytics",
  getAnalytics
);

/* Employee Management */

router.post(
  "/employees",
  createEmployeeValidator,
  validate,
  createEmployee
);

router.get(
  "/employees",
  getEmployees
);

router.patch(
  "/employees/:id/status",
  toggleEmployeeStatus
);

router.delete(
  "/employees/:id",
  deleteEmployee
);

/* Attendance Management */

router.get(
  "/attendance",
  getAllAttendance
);

module.exports = router;