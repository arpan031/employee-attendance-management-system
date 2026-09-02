const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");

const {
  parseDateOnly,
  addDaysToDateKey,
  compareDateKeys
} = require("../utils/dateUtils");

/* Calculate Leave Days */

const calculateDays = (
  startDate,
  endDate
) => {
  const start =
    parseDateOnly(startDate);

  const end =
    parseDateOnly(endDate);

  const difference =
    end.getTime() -
    start.getTime();

  return (
    Math.floor(
      difference / 86400000
    ) + 1
  );
};

/* Apply Leave */

const applyLeave = async (
  req,
  res,
  next
) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      reason
    } = req.body;

    if (
      compareDateKeys(
        startDate,
        endDate
      ) > 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before start date"
      });
    }

    const totalDays =
      calculateDays(
        startDate,
        endDate
      );

    if (totalDays <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave duration"
      });
    }

    const employee =
      await Employee.findById(
        req.employee._id
      );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    if (
      employee.leaveBalance <
      totalDays
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Insufficient leave balance"
      });
    }

    /*
     * Check overlapping pending/approved
     * leave requests.
     */
    const overlappingLeave =
      await Leave.findOne({
        employeeId:
          employee._id,

        status: {
          $in: [
            "Pending",
            "Approved"
          ]
        },

        startDate: {
          $lte:
            parseDateOnly(endDate)
        },

        endDate: {
          $gte:
            parseDateOnly(startDate)
        }
      });

    if (overlappingLeave) {
      return res.status(409).json({
        success: false,
        message:
          "You already have a leave request covering part of these dates"
      });
    }

    const leave =
      await Leave.create({
        employeeId:
          employee._id,
        leaveType,
        startDate:
          parseDateOnly(startDate),
        endDate:
          parseDateOnly(endDate),
        totalDays,
        reason: reason.trim(),
        status: "Pending"
      });

    const populatedLeave =
      await Leave.findById(
        leave._id
      ).populate(
        "employeeId",
        "name employeeId department"
      );

    return res.status(201).json({
      success: true,
      message:
        "Leave request submitted successfully",
      leave: populatedLeave
    });
  } catch (error) {
    next(error);
  }
};

/* My Leaves */

const getMyLeaves = async (
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

    const filter = {
      employeeId:
        req.employee._id
    };

    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    const [
      leaves,
      total
    ] = await Promise.all([
      Leave.find(filter)
        .sort({
          createdAt: -1
        })
        .skip(skip)
        .limit(limit),

      Leave.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      leaves,
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

/* HR - All Leave Requests */

const getAllLeaves = async (
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

    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    const [
      leaves,
      total
    ] = await Promise.all([
      Leave.find(filter)
        .populate(
          "employeeId",
          "name employeeId department designation"
        )
        .populate(
          "approvedBy",
          "name employeeId"
        )
        .sort({
          createdAt: -1
        })
        .skip(skip)
        .limit(limit),

      Leave.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      leaves,
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

/* HR - Approve Leave */

const approveLeave = async (
  req,
  res,
  next
) => {
  try {
    const {
      id
    } = req.params;

    const leave =
      await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found"
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending leave requests can be approved"
      });
    }

    /*
     * Atomic balance deduction.
     *
     * This prevents two HR users from
     * approving leaves simultaneously
     * and pushing the balance below zero.
     */
    const employee =
      await Employee.findOneAndUpdate(
        {
          _id:
            leave.employeeId,

          leaveBalance: {
            $gte:
              leave.totalDays
          }
        },
        {
          $inc: {
            leaveBalance:
              -leave.totalDays
          }
        },
        {
          new: true
        }
      );

    if (!employee) {
      return res.status(400).json({
        success: false,
        message:
          "Insufficient leave balance"
      });
    }

    leave.status = "Approved";

    leave.approvedBy =
      req.employee._id;

    leave.approvedAt =
      new Date();

    await leave.save();

    /*
     * Create Leave attendance records
     * using date-only strings.
     *
     * This avoids:
     *
     * startDate.toISOString()
     *
     * shifting a local date unexpectedly.
     */
    let dateKey =
      leave.startDate
        .toISOString()
        .slice(0, 10);

    const endDateKey =
      leave.endDate
        .toISOString()
        .slice(0, 10);

    while (
      compareDateKeys(
        dateKey,
        endDateKey
      ) <= 0
    ) {
      await Attendance.findOneAndUpdate(
        {
          employeeId:
            leave.employeeId,
          date: dateKey
        },
        {
          $set: {
            status: "Leave",
            checkIn: null,
            checkOut: null,
            workingMinutes: 0,
            overtimeMinutes: 0
          }
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

      dateKey =
        addDaysToDateKey(
          dateKey,
          1
        );
    }

    const updatedLeave =
      await Leave.findById(
        leave._id
      )
        .populate(
          "employeeId",
          "name employeeId department designation"
        )
        .populate(
          "approvedBy",
          "name employeeId"
        );

    return res.status(200).json({
      success: true,
      message:
        "Leave approved successfully",
      leave: updatedLeave,
      remainingLeaveBalance:
        employee.leaveBalance
    });
  } catch (error) {
    next(error);
  }
};

/* HR - Reject Leave */

const rejectLeave = async (
  req,
  res,
  next
) => {
  try {
    const {
      id
    } = req.params;

    const {
      rejectionReason
    } = req.body;

    const leave =
      await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found"
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending leave requests can be rejected"
      });
    }

    leave.status = "Rejected";

    leave.approvedBy =
      req.employee._id;

    leave.approvedAt =
      new Date();

    if (rejectionReason) {
      leave.rejectionReason =
        rejectionReason.trim();
    }

    await leave.save();

    const updatedLeave =
      await Leave.findById(
        leave._id
      )
        .populate(
          "employeeId",
          "name employeeId department designation"
        )
        .populate(
          "approvedBy",
          "name employeeId"
        );

    return res.status(200).json({
      success: true,
      message:
        "Leave rejected successfully",
      leave: updatedLeave
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave
};