require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const connectDB = require("../config/db");

const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");

const {
  getLocalDateKey,
  addDaysToDateKey,
  parseDateOnly
} = require("./dateUtils");

const seedDemo = async () => {
  try {
    await connectDB();

    console.log("Clearing demo data...");

    await Employee.deleteMany({
      email: {
        $in: [
          "hr@company.com",
          "employee@company.com"
        ]
      }
    });

    const hrPassword =
      await bcrypt.hash(
        "Admin@123",
        12
      );

    const employeePassword =
      await bcrypt.hash(
        "Employee@123",
        12
      );

    /* HR User  */

    const hr =
      await Employee.create({
        name: "HR Administrator",
        email: "hr@company.com",
        password: hrPassword,
        employeeId: "HR001",
        department: "Human Resources",
        designation: "HR Manager",
        role: "hr",
        leaveBalance: 18,
        isActive: true
      });

    /* Employee User */

    const employee =
      await Employee.create({
        name: "Demo Employee",
        email: "employee@company.com",
        password: employeePassword,
        employeeId: "EMP001",
        department: "Engineering",
        designation: "Software Developer",
        role: "employee",
        leaveBalance: 18,
        isActive: true
      });

    /* Demo Attendance */

    const today =
      getLocalDateKey(new Date());

    const yesterday =
      addDaysToDateKey(
        today,
        -1
      );

    const dayBefore =
      addDaysToDateKey(
        today,
        -2
      );

    await Attendance.deleteMany({
      employeeId:
        employee._id
    });

    await Attendance.insertMany([
      {
        employeeId:
          employee._id,

        date:
          yesterday,

        checkIn:
          new Date(
            `${yesterday}T03:30:00.000Z`
          ),

        checkOut:
          new Date(
            `${yesterday}T12:15:00.000Z`
          ),

        workingMinutes: 525,

        overtimeMinutes: 45,

        status: "Present"
      },

      {
        employeeId:
          employee._id,

        date:
          dayBefore,

        checkIn:
          new Date(
            `${dayBefore}T04:00:00.000Z`
          ),

        checkOut:
          new Date(
            `${dayBefore}T11:30:00.000Z`
          ),

        workingMinutes: 450,

        overtimeMinutes: 0,

        status: "Late"
      }
    ]);

    /* Demo Pending Leave */

    await Leave.deleteMany({
      employeeId:
        employee._id
    });

    const leaveStart =
      addDaysToDateKey(
        today,
        3
      );

    const leaveEnd =
      addDaysToDateKey(
        today,
        4
      );

    await Leave.create({
      employeeId:
        employee._id,

      leaveType:
        "Casual Leave",

      startDate:
        parseDateOnly(
          leaveStart
        ),

      endDate:
        parseDateOnly(
          leaveEnd
        ),

      totalDays: 2,

      reason:
        "Personal work",

      status: "Pending"
    });

    console.log("");
    console.log(
      "======================================"
    );
    console.log(
      "Demo data created successfully"
    );
    console.log(
      "======================================"
    );

    console.log("");
    console.log(
      "HR Login:"
    );
    console.log(
      "Email: hr@company.com"
    );
    console.log(
      "Password: Admin@123"
    );

    console.log("");
    console.log(
      "Employee Login:"
    );
    console.log(
      "Email: employee@company.com"
    );
    console.log(
      "Password: Employee@123"
    );

    console.log("");
    console.log(
      "IMPORTANT: Change these passwords before production."
    );

    console.log("");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error(
      "Seed failed:",
      error
    );

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedDemo();