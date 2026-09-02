const express = require("express");

const {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendance
} = require("../controllers/attendanceController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

/* All attendance routes require authentication */

router.use(protect);

/* Employee Attendance */

router.post(
  "/check-in",
  checkIn
);

router.post(
  "/check-out",
  checkOut
);

router.get(
  "/today",
  getTodayAttendance
);

router.get(
  "/my",
  getMyAttendance
);

module.exports = router;