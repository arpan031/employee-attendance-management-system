const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false
    },

    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true
    },

    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true
    },

    role: {
      type: String,
      enum: ["employee", "hr"],
      default: "employee",
      index: true
    },

    joiningDate: {
      type: Date,
      default: Date.now
    },

    leaveBalance: {
      type: Number,
      default: 18,
      min: 0
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

employeeSchema.index({
  department: 1,
  isActive: 1
});

module.exports = mongoose.model(
  "Employee",
  employeeSchema
);