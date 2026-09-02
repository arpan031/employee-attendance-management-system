const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true
    },

    /*
     * Date is stored as a local date key:
     *
     * YYYY-MM-DD
     *
     * Example:
     * 2026-09-02
     *
     * This prevents UTC date conversion problems.
     */
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },

    checkIn: {
      type: Date,
      default: null
    },

    checkOut: {
      type: Date,
      default: null
    },

    workingMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    overtimeMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    status: {
      type: String,
      enum: [
        "Present",
        "Absent",
        "Late",
        "Half Day",
        "Leave"
      ],
      default: "Absent",
      index: true
    }
  },
  {
    timestamps: true
  }
);

/* Prevent duplicate attendance for one employee on one date */

attendanceSchema.index(
  {
    employeeId: 1,
    date: 1
  },
  {
    unique: true
  }
);

/* Common HR queries */

attendanceSchema.index({
  date: 1,
  status: 1
});

attendanceSchema.index({
  employeeId: 1,
  date: -1
});

module.exports = mongoose.model(
  "Attendance",
  attendanceSchema
);