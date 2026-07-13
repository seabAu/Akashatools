/**
 * Checks whether a value represents a valid Date object.
 *
 * @param {unknown} value Candidate from any JavaScript realm.
 * @returns {value is Date} Whether Date.prototype can read a finite timestamp from value.
 * @example
 * isValidDate(new Date()); // true
 * @since 2.0.0
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
 * @param {Date | string | number | null | undefined} value Date-compatible input; nullish/empty string means absent.
 * @returns {Date | null} Fresh valid Date, or null for absent/invalid input.
 * @example
 * toDate("2026-07-12T00:00:00Z");
 * @since 2.0.0
 */
export function toDate(value) {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(value);
  return isValidDate(date) ? date : null;
}

/**
 * Returns the number of days in a local calendar month.
 *
 * @param {number | Date} yearOrDate Safe-integer year or valid local-calendar Date.
 * @param {number} [monthIndex] Zero-based month required when the first argument is a year.
 * @returns {number} Number of local calendar days in the selected month.
 * @throws {RangeError} If year/month fields are invalid or outside 0-11 for the month.
 * @example
 * daysInMonth(2024, 1); // 29
 * @since 2.0.0
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
 * @param {Date | string | number} value Valid Date-compatible local instant.
 * @returns {Date} Fresh Date set to 00:00:00.000 in the local timezone.
 * @throws {TypeError} If value does not represent a valid Date.
 * @example
 * startOfLocalDay(new Date());
 * @since 2.0.0
 */
export function startOfLocalDay(value) {
  const date = requiredDate(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Returns a stable local date key in YYYY-MM-DD format.
 *
 * @param {Date | string | number} value Valid Date-compatible local instant.
 * @returns {string} Local calendar key formatted `YYYY-MM-DD`.
 * @throws {TypeError} If value does not represent a valid Date.
 * @example
 * localDateKey(new Date(2026, 6, 12)); // "2026-07-12"
 * @since 2.0.0
 */
export function localDateKey(value) {
  const date = requiredDate(value);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * Calculates whole local calendar-day boundaries between two values. This uses
 * UTC representations of local calendar fields to avoid daylight-saving shifts.
 *
 * @param {Date | string | number} later Later valid local-calendar instant.
 * @param {Date | string | number} earlier Earlier valid local-calendar instant.
 * @returns {number} Signed count of crossed local calendar-day boundaries.
 * @throws {TypeError} If either value does not represent a valid Date.
 * @example
 * differenceInLocalDays(new Date(2026, 6, 12), new Date(2026, 6, 10)); // 2
 * @since 2.0.0
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
 * @param {Date | string | number} left First valid local-calendar instant.
 * @param {Date | string | number} right Second valid local-calendar instant.
 * @returns {boolean} Whether both values share one local calendar date.
 * @throws {TypeError} If either value does not represent a valid Date.
 * @example
 * isSameLocalDay(new Date(), new Date()); // true
 * @since 2.0.0
 */
export function isSameLocalDay(left, right) {
  return localDateKey(left) === localDateKey(right);
}

/**
 * Checks whether a value falls on today's local calendar day.
 *
 * @param {Date | string | number} value Valid local-calendar instant to compare.
 * @param {Date} [now=new Date()] Injectable valid current instant.
 * @returns {boolean} Whether value shares now's local calendar date.
 * @throws {TypeError} If either value does not represent a valid Date.
 * @example
 * isToday(new Date()); // true
 * @since 2.0.0
 */
export function isToday(value, now = new Date()) {
  return isSameLocalDay(value, now);
}

/**
 * Converts a date value to whole Unix seconds.
 *
 * @param {Date | string | number} value Valid absolute instant.
 * @returns {number} Truncated whole seconds since the Unix epoch.
 * @throws {TypeError} If value does not represent a valid Date.
 * @example
 * toUnixSeconds(new Date("1970-01-01T00:00:01Z")); // 1
 * @since 2.0.0
 */
export function toUnixSeconds(value) {
  return Math.trunc(requiredDate(value).getTime() / 1000);
}

/**
 * Converts Unix seconds to a Date.
 *
 * @param {number} seconds Finite Unix seconds, including fractional seconds.
 * @returns {Date} Fresh Date at seconds times 1,000 milliseconds.
 * @throws {TypeError} If seconds is not finite.
 * @throws {RangeError} If the resulting timestamp is outside the Date range.
 * @example
 * fromUnixSeconds(1).toISOString(); // "1970-01-01T00:00:01.000Z"
 * @since 2.0.0
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
 * @param {Date | string | number} start Valid absolute starting instant.
 * @param {Date | string | number} end Valid absolute ending instant at or after start.
 * @returns {{start: Date, end: Date}} Fresh normalized boundary Dates.
 * @throws {TypeError} If either boundary does not represent a valid Date.
 * @throws {RangeError} If start is after end.
 * @example
 * normalizeInstantRange("2026-01-01", "2026-02-01");
 * @since 2.0.0
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
 * @param {Date | string | number} value Valid absolute instant to test.
 * @param {Date | string | number} start Valid absolute starting boundary.
 * @param {Date | string | number} end Valid absolute ending boundary.
 * @param {{startInclusive?: boolean, endInclusive?: boolean}} [options] Literal boundary-inclusion policy.
 * @returns {boolean} Whether value satisfies both range boundaries.
 * @throws {TypeError | RangeError} If options or Date/range boundaries are invalid.
 * @example
 * isWithinInstantRange(value, start, end); // start-inclusive, end-exclusive
 * @since 2.0.0
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
 * @param {string} value Trimmed 24-hour clock text in `H:mm` or `HH:mm` form.
 * @returns {number | null} Minutes after midnight, or null for invalid syntax/ranges.
 * @example
 * clockTimeToMinutes("23:59"); // 1439
 * @since 2.0.0
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
 * @param {number} minutes Finite minute count, truncated and wrapped across days.
 * @returns {string} Zero-padded 24-hour `HH:mm` clock text.
 * @throws {TypeError} If minutes is not finite.
 * @example
 * minutesToClockTime(-1); // "23:59"
 * @since 2.0.0
 */
export function minutesToClockTime(minutes) {
  if (!Number.isFinite(minutes)) throw new TypeError("minutes must be a finite number.");
  const normalized = ((Math.trunc(minutes) % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(normalized / 60))}:${pad2(normalized % 60)}`;
}

/**
 * Converts a 12-hour clock string such as `2:05 PM` to `14:05`.
 *
 * @param {string} value Trimmed 12-hour `h:mm AM/PM` clock text.
 * @returns {string | null} Zero-padded 24-hour text, or null for invalid input.
 * @example
 * clock12To24("2:05 PM"); // "14:05"
 * @since 2.0.0
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
 * @param {string} value Valid 24-hour `H:mm` or `HH:mm` clock text.
 * @returns {string | null} 12-hour clock text, or null for invalid input.
 * @example
 * clock24To12("14:05"); // "2:05 PM"
 * @since 2.0.0
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
 * @param {Date | string | number} value Valid Date-compatible instant.
 * @param {Intl.LocalesArgument} [locales] Locale preferences accepted by Intl.DateTimeFormat.
 * @param {Intl.DateTimeFormatOptions} [options] Date formatting policy; defaults to long date style.
 * @returns {string} Locale-formatted date text.
 * @throws {TypeError | RangeError} If value, locales, or options are invalid.
 * @example
 * formatDate("2026-07-12T00:00:00Z", "en-US", { timeZone: "UTC" });
 * @since 2.0.0
 */
export function formatDate(value, locales, options = { dateStyle: "long" }) {
  return new Intl.DateTimeFormat(locales, options).format(requiredDate(value));
}

/**
 * Formats a date and time using `Intl.DateTimeFormat`.
 *
 * @param {Date | string | number} value Valid Date-compatible instant.
 * @param {Intl.LocalesArgument} [locales] Locale preferences accepted by Intl.DateTimeFormat.
 * @param {Intl.DateTimeFormatOptions} [options] Date/time policy; defaults to medium date and short time.
 * @returns {string} Locale-formatted date-and-time text.
 * @throws {TypeError | RangeError} If value, locales, or options are invalid.
 * @example
 * formatDateTime(new Date(), "en-US");
 * @since 2.0.0
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
