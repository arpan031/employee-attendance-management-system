const bcrypt = require("bcryptjs");

const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");

const {
  getLocalDateKey,
  getDateRangeForMonth,
  addDaysToDateKey,
  daysBetweenDateKeys,
  formatWeekRangeLabel,
  parseDateOnly
} = require("../utils/dateUtils");

/* Percentage change vs a previous value.
 * Returns 0 when there is nothing to compare against
 * and the current value is also zero, and +100 when
 * something appeared where there was previously nothing. */

const computeTrend = (
  current,
  previous
) => {
  if (!previous) {
    return current > 0 ? 100 : 0;
  }

  return (
    Math.round(
      ((current - previous) /
        previous) *
        1000
    ) / 10
  );
};

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

    const lastWeekDay =
      addDaysToDateKey(today, -7);

    const lastWeekDayEnd =
      addDaysToDateKey(lastWeekDay, 1);

    const [
      totalEmployees,
      totalEmployeesLastWeek,

      presentToday,
      presentLastWeek,

      lateToday,

      halfDayToday,
      halfDayLastWeek,

      absentToday,
      absentLastWeek,

      pendingLeaves
    ] = await Promise.all([
      Employee.countDocuments({
        role: "employee"
      }),

      Employee.countDocuments({
        role: "employee",
        joiningDate: {
          $lt: parseDateOnly(
            lastWeekDayEnd
          )
        }
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
        date: lastWeekDay,
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

      Attendance.countDocuments({
        date: today,
        status: "Half Day"
      }),

      Attendance.countDocuments({
        date: lastWeekDay,
        status: "Half Day"
      }),

      Attendance.countDocuments({
        date: today,
        status: "Absent"
      }),

      Attendance.countDocuments({
        date: lastWeekDay,
        status: "Absent"
      }),

      Leave.countDocuments({
        status: "Pending"
      })
    ]);

    const attendanceRate =
      totalEmployees > 0
        ? Math.round(
            (presentToday /
              totalEmployees) *
              1000
          ) / 10
        : 0;

    const attendanceRateLastWeek =
      totalEmployeesLastWeek > 0
        ? Math.round(
            (presentLastWeek /
              totalEmployeesLastWeek) *
              1000
          ) / 10
        : 0;

    const trends = {
      totalEmployees: computeTrend(
        totalEmployees,
        totalEmployeesLastWeek
      ),

      presentToday: computeTrend(
        presentToday,
        presentLastWeek
      ),

      halfDayToday: computeTrend(
        halfDayToday,
        halfDayLastWeek
      ),

      absentToday: computeTrend(
        absentToday,
        absentLastWeek
      ),

      attendanceRate: computeTrend(
        attendanceRate,
        attendanceRateLastWeek
      )
    };

    return res.status(200).json({
      success: true,

      dashboard: {
        totalEmployees,
        presentToday,
        lateToday,
        halfDayToday,
        absentToday,
        pendingLeaves,
        attendanceRate,
        trends
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

    /*
     * Trailing 14-week window (independent of the
     * calendar-month view above) used to build:
     *  - last7Days: exact rolling 7-day series for
     *    the "Attendance Overview" chart
     *  - weeklyTrend: 7 weekly presence-rate buckets
     *    plus a comparison against the previous 7
     *    weeks, for the "Attendance Trend" chart
     */

    const today = getLocalDateKey(
      new Date()
    );

    const trendRangeStart =
      addDaysToDateKey(today, -97);

    const trendRecords =
      await Attendance.aggregate([
        {
          $match: {
            date: {
              $gte: trendRangeStart,
              $lte: today
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
            }
          }
        }
      ]);

    const dateCounts = {};

    trendRecords.forEach((item) => {
      const date = item._id.date;

      if (!dateCounts[date]) {
        dateCounts[date] = {
          present: 0,
          late: 0,
          halfDay: 0,
          absent: 0,
          leave: 0
        };
      }

      const count = item.count || 0;

      switch (item._id.status) {
        case "Present":
          dateCounts[date].present +=
            count;
          break;

        case "Late":
          dateCounts[date].late +=
            count;
          break;

        case "Half Day":
          dateCounts[date].halfDay +=
            count;
          break;

        case "Absent":
          dateCounts[date].absent +=
            count;
          break;

        case "Leave":
          dateCounts[date].leave +=
            count;
          break;

        default:
          break;
      }
    });

    const emptyDay = () => ({
      present: 0,
      late: 0,
      halfDay: 0,
      absent: 0,
      leave: 0
    });

    /* Last 7 calendar days, oldest first */

    const last7Days = [];

    for (let i = 6; i >= 0; i -= 1) {
      const date = addDaysToDateKey(
        today,
        -i
      );

      const counts =
        dateCounts[date] || emptyDay();

      last7Days.push({
        date,
        ...counts
      });
    }

    /* Bucket every date in the 14-week window
     * into which "week" it belongs (0 = most
     * recent 7 days, 13 = oldest) */

    const weekBuckets = Array.from(
      { length: 14 },
      () => emptyDay()
    );

    Object.keys(dateCounts).forEach(
      (date) => {
        const dayDiff =
          daysBetweenDateKeys(
            date,
            today
          );

        const weekIndex = Math.floor(
          dayDiff / 7
        );

        if (
          weekIndex >= 0 &&
          weekIndex < 14
        ) {
          const bucket =
            weekBuckets[weekIndex];

          const counts =
            dateCounts[date];

          bucket.present +=
            counts.present;
          bucket.late += counts.late;
          bucket.halfDay +=
            counts.halfDay;
          bucket.absent +=
            counts.absent;
          bucket.leave += counts.leave;
        }
      }
    );

    const presenceRateFor = (
      bucket
    ) => {
      const tracked =
        bucket.present +
        bucket.late +
        bucket.halfDay +
        bucket.absent +
        bucket.leave;

      if (tracked === 0) {
        return 0;
      }

      return (
        Math.round(
          ((bucket.present +
            bucket.late +
            bucket.halfDay) /
            tracked) *
            1000
        ) / 10
      );
    };

    /* Weeks 0-6 = current 7 weeks, oldest first */

    const currentWeeks = [];

    for (let index = 6; index >= 0; index -= 1) {
      const weekEnd = addDaysToDateKey(
        today,
        -(7 * index)
      );

      const weekStart =
        addDaysToDateKey(
          weekEnd,
          -6
        );

      const bucket = weekBuckets[index];

      currentWeeks.push({
        weekStart,
        weekEnd,
        label: formatWeekRangeLabel(
          weekStart,
          weekEnd
        ),
        presenceRate:
          presenceRateFor(bucket),
        present: bucket.present,
        late: bucket.late,
        halfDay: bucket.halfDay,
        absent: bucket.absent,
        leave: bucket.leave
      });
    }

    const previousWeekRates =
      weekBuckets
        .slice(7, 14)
        .map(presenceRateFor)
        .filter(
          (rate, index) =>
            weekBuckets[7 + index]
              .present +
              weekBuckets[7 + index]
                .late +
              weekBuckets[7 + index]
                .halfDay +
              weekBuckets[7 + index]
                .absent +
              weekBuckets[7 + index]
                .leave >
            0
        );

    const previousAverageRate =
      previousWeekRates.length > 0
        ? Math.round(
            (previousWeekRates.reduce(
              (sum, rate) =>
                sum + rate,
              0
            ) /
              previousWeekRates.length) *
              10
          ) / 10
        : 0;

    const averageRate =
      Math.round(
        (currentWeeks.reduce(
          (sum, week) =>
            sum + week.presenceRate,
          0
        ) /
          currentWeeks.length) *
          10
      ) / 10;

    const bestWeek = currentWeeks.reduce(
      (best, week) =>
        !best ||
        week.presenceRate >
          best.presenceRate
          ? week
          : best,
      null
    );

    const weeklyTrend = {
      weeks: currentWeeks,
      bestWeek,
      averageRate,
      previousAverageRate,
      trendVsPrevious: computeTrend(
        averageRate,
        previousAverageRate
      )
    };

    return res.status(200).json({
      success: true,

      analytics: {
        year,
        month,

        summary,

        daily,

        last7Days,
        weeklyTrend
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
