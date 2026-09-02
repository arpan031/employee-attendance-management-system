const TIME_ZONE =
  process.env.APP_TIMEZONE || "Asia/Kolkata";

/* Get date/time parts in configured timezone */

const getZonedParts = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }
  );

  const parts = formatter.formatToParts(date);

  const result = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }
  }

  return result;
};

/* YYYY-MM-DD local date key */

const getLocalDateKey = (date = new Date()) => {
  const parts = getZonedParts(date);

  return `${parts.year}-${parts.month}-${parts.day}`;
};

/* Local time in minutes */

const getLocalTimeMinutes = (date = new Date()) => {
  const parts = getZonedParts(date);

  return (
    Number(parts.hour) * 60 +
    Number(parts.minute)
  );
};

/* Convert date-only string into a safe UTC date
* Example:
* "2026-09-02"
* becomes:
* 2026-09-02T00:00:00.000Z */

const parseDateOnly = (dateString) => {
  if (
    typeof dateString !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    throw new Error(
      "Date must use YYYY-MM-DD format"
    );
  }

  const date = new Date(
    `${dateString}T00:00:00.000Z`
  );

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  return date;
};

/* Add days to YYYY-MM-DD without timezone problems */

const addDaysToDateKey = (
  dateKey,
  days = 1
) => {
  const date = parseDateOnly(dateKey);

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return date.toISOString().slice(0, 10);
};

/* Get date range for a month */

const getDateRangeForMonth = (
  year,
  month
) => {
  const numericYear = Number(year);
  const numericMonth = Number(month);

  if (
    !Number.isInteger(numericYear) ||
    !Number.isInteger(numericMonth) ||
    numericMonth < 1 ||
    numericMonth > 12
  ) {
    throw new Error(
      "Invalid year or month"
    );
  }

  const startDate = new Date(
    Date.UTC(
      numericYear,
      numericMonth - 1,
      1
    )
  );

  const endDate = new Date(
    Date.UTC(
      numericYear,
      numericMonth,
      0,
      23,
      59,
      59,
      999
    )
  );

  return {
    startDate,
    endDate
  };
};

/* Compare date-only strings */

const compareDateKeys = (
  first,
  second
) => {
  if (first < second) return -1;
  if (first > second) return 1;

  return 0;
};

module.exports = {
  TIME_ZONE,
  getZonedParts,
  getLocalDateKey,
  getLocalTimeMinutes,
  parseDateOnly,
  addDaysToDateKey,
  getDateRangeForMonth,
  compareDateKeys
};
