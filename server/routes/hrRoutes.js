const express = require("express");

const {
  getDashboard,
  getAnalytics,
  getEmployees,
  getAllAttendance,
  toggleEmployeeStatus
} = require("../controllers/hrController");

const protect = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

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

router.get(
  "/employees",
  getEmployees
);

router.patch(
  "/employees/:id/status",
  toggleEmployeeStatus
);

/* Attendance Management */

router.get(
  "/attendance",
  getAllAttendance
);

module.exports = router;