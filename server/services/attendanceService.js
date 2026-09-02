const {
  getLocalTimeMinutes
} = require("../utils/dateUtils");

/* Attendance Rules */

const OFFICE_START_MINUTES = 9 * 60; // 09:00

const STANDARD_WORK_MINUTES = 8 * 60; // 8 hours

const HALF_DAY_MINUTES = 4 * 60; // 4 hours

/* Calculate working minutes */

const calculateWorkingMinutes = (
  checkIn,
  checkOut
) => {
  if (
    !checkIn ||
    !checkOut
  ) {
    return 0;
  }

  const start =
    new Date(checkIn).getTime();

  const end =
    new Date(checkOut).getTime();

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    end <= start
  ) {
    return 0;
  }

  return Math.floor(
    (end - start) / 60000
  );
};

/* Calculate overtime */

const calculateOvertimeMinutes = (
  workingMinutes
) => {
  return Math.max(
    0,
    workingMinutes -
      STANDARD_WORK_MINUTES
  );
};

/* Calculate initial attendance status */

const calculateStatus = (
  checkIn
) => {
  if (!checkIn) {
    return "Absent";
  }

  const checkInMinutes =
    getLocalTimeMinutes(checkIn);

  if (
    checkInMinutes >
    OFFICE_START_MINUTES
  ) {
    return "Late";
  }

  return "Present";
};

/* Final status after checkout */

const finalizeStatus = ({
  checkIn,
  workingMinutes
}) => {
  if (!checkIn) {
    return "Absent";
  }

  if (
    workingMinutes < HALF_DAY_MINUTES
  ) {
    return "Half Day";
  }

  return calculateStatus(checkIn);
};

/* Build attendance calculation */

const calculateAttendance = ({
  checkIn,
  checkOut
}) => {
  const workingMinutes =
    calculateWorkingMinutes(
      checkIn,
      checkOut
    );

  const overtimeMinutes =
    calculateOvertimeMinutes(
      workingMinutes
    );

  const status = checkOut
    ? finalizeStatus({
        checkIn,
        workingMinutes
      })
    : calculateStatus(checkIn);

  return {
    workingMinutes,
    overtimeMinutes,
    status
  };
};

module.exports = {
  OFFICE_START_MINUTES,
  STANDARD_WORK_MINUTES,
  HALF_DAY_MINUTES,
  calculateWorkingMinutes,
  calculateOvertimeMinutes,
  calculateStatus,
  finalizeStatus,
  calculateAttendance
};