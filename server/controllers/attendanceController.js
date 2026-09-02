const Attendance = require("../models/Attendance");

const {
  getLocalDateKey
} = require("../utils/dateUtils");

const {
  calculateAttendance
} = require("../services/attendanceService");

/* Check In */

const checkIn = async (
  req,
  res,
  next
) => {
  try {
    const employeeId =
      req.employee._id;

    const now = new Date();

    const date =
      getLocalDateKey(now);

    const existing =
      await Attendance.findOne({
        employeeId,
        date
      });

    if (existing?.checkIn) {
      return res.status(409).json({
        success: false,
        message:
          "You have already checked in today"
      });
    }

    const calculation =
      calculateAttendance({
        checkIn: now,
        checkOut: null
      });

    const attendance =
      await Attendance.findOneAndUpdate(
        {
          employeeId,
          date
        },
        {
          $set: {
            checkIn: now,
            status:
              calculation.status
          }
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true
        }
      );

    return res.status(200).json({
      success: true,
      message: "Check-in successful",
      attendance
    });
  } catch (error) {
    next(error);
  }
};

/* Check Out */

const checkOut = async (
  req,
  res,
  next
) => {
  try {
    const employeeId =
      req.employee._id;

    const now = new Date();

    const date =
      getLocalDateKey(now);

    const attendance =
      await Attendance.findOne({
        employeeId,
        date
      });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message:
          "Please check in before checking out"
      });
    }

    if (!attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message:
          "Please check in before checking out"
      });
    }

    if (attendance.checkOut) {
      return res.status(409).json({
        success: false,
        message:
          "You have already checked out today"
      });
    }

    const calculation =
      calculateAttendance({
        checkIn:
          attendance.checkIn,
        checkOut: now
      });

    attendance.checkOut = now;
    attendance.workingMinutes =
      calculation.workingMinutes;
    attendance.overtimeMinutes =
      calculation.overtimeMinutes;
    attendance.status =
      calculation.status;

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Check-out successful",
      attendance
    });
  } catch (error) {
    next(error);
  }
};

/* Today's Attendance */

const getTodayAttendance = async (
  req,
  res,
  next
) => {
  try {
    const date =
      getLocalDateKey(new Date());

    const attendance =
      await Attendance.findOne({
        employeeId: req.employee._id,
        date
      });

    return res.status(200).json({
      success: true,
      date,
      attendance
    });
  } catch (error) {
    next(error);
  }
};

/* Employee Attendance */

const getMyAttendance = async (
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

    if (req.query.date) {
      filter.date =
        req.query.date;
    }

    const [
      attendance,
      total
    ] = await Promise.all([
      Attendance.find(filter)
        .sort({
          date: -1
        })
        .skip(skip)
        .limit(limit),

      Attendance.countDocuments(filter)
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

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendance
};