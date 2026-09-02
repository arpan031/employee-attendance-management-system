const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true
    },

    leaveType: {
      type: String,
      enum: [
        "Casual Leave",
        "Sick Leave",
        "Annual Leave",
        "Emergency Leave"
      ],
      required: true
    },

    /*
     * These are date-only values.
     *
     * We intentionally store them at UTC midnight
     * and use date keys for attendance records.
     */
    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    totalDays: {
      type: Number,
      required: true,
      min: 1
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 500
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected"
      ],
      default: "Pending",
      index: true
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null
    },

    approvedAt: {
      type: Date,
      default: null
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null
    }
  },
  {
    timestamps: true
  }
);

leaveSchema.index({
  employeeId: 1,
  status: 1
});

leaveSchema.index({
  startDate: 1,
  endDate: 1
});

module.exports = mongoose.model(
  "Leave",
  leaveSchema
);