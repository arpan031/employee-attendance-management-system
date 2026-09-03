const bcrypt = require("bcryptjs");

const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");

const {
  getLocalDateKey,
  getDateRangeForMonth
} = require("../utils/dateUtils");

/* HR Dashboard */

const getDashboard = async (
  req,
  res,
  next
) => {
  try {
    const today = getLocalDateKey(
      new Date()
    );

    const [
      totalEmployees,
      presentToday,
      lateToday,
      pendingLeaves
    ] = await Promise.all([
      Employee.countDocuments({
        role: "employee"
      }),

      Attendance.countDocuments({
        date: today,
        status: {
          $in: [
            "Present",
            "Late",
            "Half Day"
          ]
        }
      }),

      Attendance.countDocuments({
        date: today,
        status: "Late"
      }),

      Leave.countDocuments({
        status: "Pending"
      })
    ]);

    return res.status(200).json({
      success: true,

      dashboard: {
        totalEmployees,
        presentToday,
        lateToday,
        pendingLeaves
      }
    });
  } catch (error) {
    next(error);
  }
};

/*  Monthly Analytics */

const getAnalytics = async (
  req,
  res,
  next
) => {
  try {
    const now = new Date();

    const timezone =
      process.env.APP_TIMEZONE ||
      "Asia/Kolkata";

    const dateFormatter =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone: timezone,
          year: "numeric",
          month: "numeric"
        }
      );

    const parts =
      dateFormatter.formatToParts(now);

    const currentYear = Number(
      parts.find(
        (part) => part.type === "year"
      )?.value
    );

    const currentMonth = Number(
      parts.find(
        (part) => part.type === "month"
      )?.value
    );

    const year =
      Number(req.query.year) ||
      currentYear;

    const month =
      Number(req.query.month) ||
      currentMonth;

    const {
      startDate,
      endDate
    } = getDateRangeForMonth(
      year,
      month
    );

    const analytics =
      await Attendance.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },

        {
          $group: {
            _id: {
              date: "$date",
              status: "$status"
            },

            count: {
              $sum: 1
            },

            workingMinutes: {
              $sum: "$workingMinutes"
            },

            overtimeMinutes: {
              $sum: "$overtimeMinutes"
            }
          }
        },

        {
          $sort: {
            "_id.date": 1
          }
        }
      ]);

    const dailyMap = {};

    const summary = {
      present: 0,
      late: 0,
      absent: 0,
      leave: 0,
      halfDay: 0
    };

    analytics.forEach((item) => {
      const date =
        item._id.date;

      if (!dailyMap[date]) {
        dailyMap[date] = {
          _id: date,
          date,
          present: 0,
          late: 0,
          absent: 0,
          leave: 0,
          halfDay: 0,
          workingMinutes: 0,
          overtimeMinutes: 0
        };
      }

      const count =
        item.count || 0;

      switch (item._id.status) {
        case "Present":
          dailyMap[date].present += count;
          summary.present += count;
          break;

        case "Late":
          dailyMap[date].late += count;
          summary.late += count;
          break;

        case "Absent":
          dailyMap[date].absent += count;
          summary.absent += count;
          break;

        case "Leave":
          dailyMap[date].leave += count;
          summary.leave += count;
          break;

        case "Half Day":
          dailyMap[date].halfDay += count;
          summary.halfDay += count;
          break;

        default:
          break;
      }

      dailyMap[date].workingMinutes +=
        item.workingMinutes || 0;

      dailyMap[date].overtimeMinutes +=
        item.overtimeMinutes || 0;
    });

    const daily =
      Object.values(dailyMap).sort(
        (a, b) =>
          a.date.localeCompare(b.date)
      );

    return res.status(200).json({
      success: true,

      analytics: {
        year,
        month,

        summary,

        daily
      }
    });
  } catch (error) {
    next(error);
  }
};

/* HR - Create Employee */

const createEmployee = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      email,
      password,
      employeeId,
      department,
      designation,
      role,
      leaveBalance
    } = req.body;

    const normalizedEmail =
      email.toLowerCase().trim();

    const normalizedEmployeeId =
      employeeId.toUpperCase().trim();

    const existingEmployee =
      await Employee.findOne({
        $or: [
          { email: normalizedEmail },
          {
            employeeId:
              normalizedEmployeeId
          }
        ]
      });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message:
          existingEmployee.email ===
          normalizedEmail
            ? "Email is already registered"
            : "Employee ID is already registered"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const employee =
      await Employee.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        employeeId: normalizedEmployeeId,
        department: department.trim(),
        designation: designation.trim(),
        role:
          role === "hr" ? "hr" : "employee",
        ...(leaveBalance !== undefined && {
          leaveBalance: Number(leaveBalance)
        })
      });

    return res.status(201).json({
      success: true,
      message:
        "Employee added successfully",

      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        department: employee.department,
        designation: employee.designation,
        role: employee.role,
        joiningDate: employee.joiningDate,
        leaveBalance: employee.leaveBalance,
        isActive: employee.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

/* HR - Employees */

const getEmployees = async (
  req,
  res,
  next
) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      100
    );

    const skip =
      (page - 1) * limit;

    const filter = {};

    if (req.query.status === "active") {
      filter.isActive = true;
    }

    if (req.query.status === "inactive") {
      filter.isActive = false;
    }

    if (req.query.search) {
      const search =
        req.query.search.trim();

      if (search) {
        const regex =
          new RegExp(
            search.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            ),
            "i"
          );

        filter.$or = [
          {
            name: regex
          },
          {
            email: regex
          },
          {
            employeeId: regex
          },
          {
            department: regex
          },
          {
            designation: regex
          }
        ];
      }
    }

    const [
      employees,
      total
    ] = await Promise.all([
      Employee.find(filter)
        .select(
          "-password"
        )
        .sort({
          createdAt: -1
        })
        .skip(skip)
        .limit(limit),

      Employee.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(
          total / limit
        )
      }
    });
  } catch (error) {
    next(error);
  }
};

/* HR - Attendance */

const getAllAttendance = async (
  req,
  res,
  next
) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      100
    );

    const skip =
      (page - 1) * limit;

    const filter = {};

    /*
     * Date filter
     */
    if (req.query.date) {
      filter.date =
        req.query.date;
    }

    /*
     * Status filter
     */
    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    /*
     * Employee filter
     */
    if (req.query.employeeId) {
      filter.employeeId =
        req.query.employeeId;
    }

    /*
     * Server-side search
     *
     * This fixes the previous problem
     * where the frontend searched only
     * the current page.
     */
    if (req.query.search) {
      const search =
        req.query.search.trim();

      if (search) {
        const regex =
          new RegExp(
            search.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            ),
            "i"
          );

        const employees =
          await Employee.find({
            $or: [
              {
                name: regex
              },
              {
                email: regex
              },
              {
                employeeId: regex
              },
              {
                department: regex
              }
            ]
          }).select("_id");

        filter.employeeId = {
          $in: employees.map(
            (employee) =>
              employee._id
          )
        };
      }
    }

    const [
      attendance,
      total
    ] = await Promise.all([
      Attendance.find(filter)
        .populate(
          "employeeId",
          "name employeeId department designation"
        )
        .sort({
          date: -1,
          createdAt: -1
        })
        .skip(skip)
        .limit(limit),

      Attendance.countDocuments(
        filter
      )
    ]);

    return res.status(200).json({
      success: true,
      attendance,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(
          total / limit
        )
      }
    });
  } catch (error) {
    next(error);
  }
};

/* HR - Toggle Employee Status */

const toggleEmployeeStatus = async (
  req,
  res,
  next
) => {
  try {
    const {
      id
    } = req.params;

    if (
      id ===
      req.employee._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot deactivate your own HR account"
      });
    }

    const employee =
      await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message:
          "Employee not found"
      });
    }

    employee.isActive =
      !employee.isActive;

    await employee.save();

    return res.status(200).json({
      success: true,
      message:
        employee.isActive
          ? "Employee activated successfully"
          : "Employee deactivated successfully",

      employee: {
        id: employee._id,
        name: employee.name,
        employeeId:
          employee.employeeId,
        isActive:
          employee.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

/* HR - Delete Employee */

const deleteEmployee = async (
  req,
  res,
  next
) => {
  try {
    const {
      id
    } = req.params;

    if (
      id ===
      req.employee._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own HR account"
      });
    }

    const employee =
      await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message:
          "Employee not found"
      });
    }

    await Promise.all([
      Attendance.deleteMany({
        employeeId: employee._id
      }),

      Leave.deleteMany({
        employeeId: employee._id
      }),

      Employee.findByIdAndDelete(
        employee._id
      )
    ]);

    return res.status(200).json({
      success: true,
      message:
        "Employee deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getAnalytics,
  createEmployee,
  getEmployees,
  getAllAttendance,
  toggleEmployeeStatus,
  deleteEmployee
};
