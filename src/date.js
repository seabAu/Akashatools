/**
 * Checks whether a value represents a valid Date object.
 *
 * @param {unknown} value
 * @returns {value is Date}
 */
export function isValidDate(value) {
  try {
    return Number.isFinite(Date.prototype.getTime.call(value));
  } catch {
    return false;
  }
}

/**
 * Converts a Date-compatible value to a fresh Date or returns null.
 *
 * @param {Date | string | number | null | undefined} value
 * @returns {Date | null}
 */
export function toDate(value) {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? new Date(value) : new Date(value);
  return isValidDate(date) ? date : null;
}

/**
 * Returns the number of days in a local calendar month.
 *
 * @param {number | Date} yearOrDate
 * @param {number} [monthIndex]
 * @returns {number}
 */
export function daysInMonth(yearOrDate, monthIndex) {
  const year = yearOrDate instanceof Date ? yearOrDate.getFullYear() : yearOrDate;
  const month = yearOrDate instanceof Date ? yearOrDate.getMonth() : monthIndex;
  if (!Number.isSafeInteger(year) || typeof month !== "number" || !Number.isSafeInteger(month) || month < 0 || month > 11) {
    throw new RangeError("A valid year and zero-based month are required.");
  }
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Returns a new Date at the beginning of the local calendar day.
 *
 * @param {Date | string | number} value
 * @returns {Date}
 */
export function startOfLocalDay(value) {
  const date = requiredDate(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Returns a stable local date key in YYYY-MM-DD format.
 *
 * @param {Date | string | number} value
 * @returns {string}
 */
export function localDateKey(value) {
  const date = requiredDate(value);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * Calculates whole local calendar-day boundaries between two values. This uses
 * UTC representations of local calendar fields to avoid daylight-saving shifts.
 *
 * @param {Date | string | number} later
 * @param {Date | string | number} earlier
 * @returns {number}
 */
export function differenceInLocalDays(later, earlier) {
  const left = requiredDate(later);
  const right = requiredDate(earlier);
  const leftDay = Date.UTC(left.getFullYear(), left.getMonth(), left.getDate());
  const rightDay = Date.UTC(right.getFullYear(), right.getMonth(), right.getDate());
  return Math.trunc((leftDay - rightDay) / 86_400_000);
}

/**
 * Checks whether two values fall on the same local calendar day.
 *
 * @param {Date | string | number} left
 * @param {Date | string | number} right
 * @returns {boolean}
 */
export function isSameLocalDay(left, right) {
  return localDateKey(left) === localDateKey(right);
}

/**
 * Checks whether a value falls on today's local calendar day.
 *
 * @param {Date | string | number} value
 * @param {Date} [now=new Date()]
 * @returns {boolean}
 */
export function isToday(value, now = new Date()) {
  return isSameLocalDay(value, now);
}

/**
 * Converts a date value to whole Unix seconds.
 *
 * @param {Date | string | number} value
 * @returns {number}
 */
export function toUnixSeconds(value) {
  return Math.trunc(requiredDate(value).getTime() / 1000);
}

/**
 * Converts Unix seconds to a Date.
 *
 * @param {number} seconds
 * @returns {Date}
 */
export function fromUnixSeconds(seconds) {
  if (!Number.isFinite(seconds)) throw new TypeError("seconds must be a finite number.");
  const date = new Date(seconds * 1000);
  if (!isValidDate(date)) throw new RangeError("seconds is outside the supported Date range.");
  return date;
}

/**
 * Normalizes two Date-compatible boundaries into fresh Date objects. Boundaries
 * represent absolute instants and are never swapped implicitly.
 *
 * @param {Date | string | number} start
 * @param {Date | string | number} end
 * @returns {{start: Date, end: Date}}
 */
export function normalizeInstantRange(start, end) {
  const normalizedStart = requiredDate(start);
  const normalizedEnd = requiredDate(end);
  if (normalizedStart > normalizedEnd) throw new RangeError("start cannot be after end.");
  return { start: normalizedStart, end: normalizedEnd };
}

/**
 * Checks whether a Date-compatible value is within an absolute instant range.
 * The default range is start-inclusive and end-exclusive.
 *
 * @param {Date | string | number} value
 * @param {Date | string | number} start
 * @param {Date | string | number} end
 * @param {{startInclusive?: boolean, endInclusive?: boolean}} [options]
 * @returns {boolean}
 */
export function isWithinInstantRange(value, start, end, { startInclusive = true, endInclusive = false } = {}) {
  if (typeof startInclusive !== "boolean" || typeof endInclusive !== "boolean") {
    throw new TypeError("Range inclusion options must be booleans.");
  }
  const instant = requiredDate(value).getTime();
  const range = normalizeInstantRange(start, end);
  const startTime = range.start.getTime();
  const endTime = range.end.getTime();
  return (startInclusive ? instant >= startTime : instant > startTime) &&
    (endInclusive ? instant <= endTime : instant < endTime);
}

/**
 * Parses a 24-hour `HH:mm` clock time into minutes after midnight.
 *
 * @param {string} value
 * @returns {number | null}
 */
export function clockTimeToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : null;
}

/**
 * Formats minutes after midnight as 24-hour `HH:mm`, wrapping across days.
 *
 * @param {number} minutes
 * @returns {string}
 */
export function minutesToClockTime(minutes) {
  if (!Number.isFinite(minutes)) throw new TypeError("minutes must be a finite number.");
  const normalized = ((Math.trunc(minutes) % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(normalized / 60))}:${pad2(normalized % 60)}`;
}

/**
 * Converts a 12-hour clock string such as `2:05 PM` to `14:05`.
 *
 * @param {string} value
 * @returns {string | null}
 */
export function clock12To24(value) {
  if (typeof value !== "string") return null;
  const match = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*([AP]M)$/i.exec(value.trim());
  if (!match) return null;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  return `${pad2(hours)}:${match[2]}`;
}

/**
 * Converts a `HH:mm` clock string to a 12-hour form such as `2:05 PM`.
 *
 * @param {string} value
 * @returns {string | null}
 */
export function clock24To12(value) {
  const minutes = clockTimeToMinutes(value);
  if (minutes === null) return null;
  const hours = Math.floor(minutes / 60);
  return `${hours % 12 || 12}:${pad2(minutes % 60)} ${hours < 12 ? "AM" : "PM"}`;
}

/**
 * Formats a date using `Intl.DateTimeFormat`.
 *
 * @param {Date | string | number} value
 * @param {Intl.LocalesArgument} [locales]
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDate(value, locales, options = { dateStyle: "long" }) {
  return new Intl.DateTimeFormat(locales, options).format(requiredDate(value));
}

/**
 * Formats a date and time using `Intl.DateTimeFormat`.
 *
 * @param {Date | string | number} value
 * @param {Intl.LocalesArgument} [locales]
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDateTime(value, locales, options = { dateStyle: "medium", timeStyle: "short" }) {
  return new Intl.DateTimeFormat(locales, options).format(requiredDate(value));
}

/** @param {Date | string | number} value */
function requiredDate(value) {
  const date = toDate(value);
  if (!date) throw new TypeError("value must represent a valid date.");
  return date;
}

/** @param {number} value */
function pad2(value) {
  return String(value).padStart(2, "0");
}
