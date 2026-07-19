import { plainObjectOptionsErrorMessage } from "./internal/error-messages.js";
import { isPlainObject } from "./object.js";

const durationRoundingModes = new Set(["round", "floor", "ceil", "trunc"]);
const numericTimestampStringUnits = new Set(["date", "milliseconds", "seconds", "reject"]);
const protobufMinimumSeconds = -62_135_596_800;
const protobufMaximumSeconds = 253_402_300_799;

/**
 * @typedef {{seconds: number | string, nanoseconds?: number | string, nanos?: never} | {seconds: number | string, nanos?: number | string, nanoseconds?: never}} StructuredTimestamp
 * A Firestore-style `seconds`/`nanoseconds` record or Protobuf-message-style
 * `seconds`/`nanos` record. Supplying both fractional fields is invalid.
 */

/** @typedef {Date | string | number | StructuredTimestamp} TimestampInput */

/**
 * @typedef {object} TimestampConversionOptions
 * @property {"date" | "milliseconds" | "seconds" | "reject"} [numericStringUnit] Interpretation of integer-only strings; nonnumeric strings still use Date parsing.
 */

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
 * Converts a Date-compatible or structured timestamp value to a fresh Date or
 * returns null. Integer-only strings retain host Date parsing by default;
 * select a numeric unit explicitly when consuming serialized timestamps.
 *
 * @param {TimestampInput | null | undefined} value Date-compatible or structured timestamp input; nullish/empty strings mean absent.
 * @param {TimestampConversionOptions} [options] Integer-string interpretation policy; defaults to Date-string parsing.
 * @returns {Date | null} Fresh valid Date, or null for absent/invalid input.
 * @throws {TypeError} If options or numericStringUnit violates its literal contract.
 * @example
 * toDate("2026-07-12T00:00:00Z");
 * @since 2.0.0
 */
export function toDate(value, options = {}) {
  const timestamp = resolveEpochMilliseconds(value, timestampStringUnit(options, "date"));
  return timestamp === null ? null : new Date(timestamp);
}

/**
 * Normalizes a Date-compatible value, Firestore-style `seconds`/`nanoseconds`
 * record, or Protobuf-message-style `seconds`/`nanos` record to whole Unix epoch
 * milliseconds. Structured fields must be own data properties, so accessors
 * and `toDate`/coercion methods are never invoked. Integer-only strings are
 * milliseconds by default; choose an explicit unit or `date` to retain host
 * Date-string parsing.
 *
 * @param {TimestampInput | null | undefined} value Timestamp input; nullish/empty strings mean absent.
 * @param {TimestampConversionOptions} [options] Integer-string interpretation policy.
 * @returns {number | null} Whole Date-compatible epoch milliseconds, or null for absent/invalid input.
 * @throws {TypeError} If options or numericStringUnit violates its literal contract.
 * @example
 * toEpochMilliseconds({ seconds: 1, nanoseconds: 500_000_000 }); // 1500
 * @since 2.0.0
 */
export function toEpochMilliseconds(value, options = {}) {
  return resolveEpochMilliseconds(value, timestampStringUnit(options, "milliseconds"));
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
  if (
    !Number.isSafeInteger(year) ||
    typeof month !== "number" ||
    !Number.isSafeInteger(month) ||
    month < 0 ||
    month > 11
  ) {
    throw new RangeError("A valid year and zero-based month are required.");
  }
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Returns a new Date at the beginning of the local calendar day.
 *
 * @param {TimestampInput} value Valid Date-compatible or structured local instant.
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
 * @param {TimestampInput} value Valid Date-compatible or structured local instant.
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
 * @param {TimestampInput} later Later valid local-calendar instant.
 * @param {TimestampInput} earlier Earlier valid local-calendar instant.
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
 * @param {TimestampInput} left First valid local-calendar instant.
 * @param {TimestampInput} right Second valid local-calendar instant.
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
 * @param {TimestampInput} value Valid local-calendar instant to compare.
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
 * @param {TimestampInput} value Valid absolute instant.
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
 * @param {TimestampInput} start Valid absolute starting instant.
 * @param {TimestampInput} end Valid absolute ending instant at or after start.
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
 * @param {TimestampInput} value Valid absolute instant to test.
 * @param {TimestampInput} start Valid absolute starting boundary.
 * @param {TimestampInput} end Valid absolute ending boundary.
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
  return (
    (startInclusive ? instant >= startTime : instant > startTime) &&
    (endInclusive ? instant <= endTime : instant < endTime)
  );
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
 * @param {TimestampInput} value Valid Date-compatible or structured instant.
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
 * @param {TimestampInput} value Valid Date-compatible or structured instant.
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

/**
 * Formats a non-negative minute duration as compact, locale-independent hours
 * and minutes. Fractional input uses an explicit whole-minute rounding policy;
 * zero components are omitted except for the canonical `0m` result.
 *
 * @param {number} minutes Finite non-negative minute duration no greater than Number.MAX_SAFE_INTEGER.
 * @param {{rounding?: "round" | "floor" | "ceil" | "trunc"}} [options] Whole-minute rounding method; defaults to nearest.
 * @returns {string} Compact `0m`, `45m`, `2h`, or `2h 5m`-style label.
 * @throws {TypeError} If minutes or options violates its literal contract.
 * @throws {RangeError} If minutes is negative/unsafe or rounding is unsupported.
 * @example
 * formatDuration(125); // "2h 5m"
 * @since 2.0.0
 */
export function formatDuration(minutes, options = {}) {
  if (!Number.isFinite(minutes)) throw new TypeError("minutes must be a finite number.");
  if (!isPlainObject(options)) throw new TypeError(plainObjectOptionsErrorMessage);
  const { rounding = "round" } = options;
  if (minutes < 0 || minutes > Number.MAX_SAFE_INTEGER) {
    throw new RangeError("minutes must be between 0 and Number.MAX_SAFE_INTEGER.");
  }
  if (!durationRoundingModes.has(rounding)) throw new RangeError("rounding is unsupported.");
  const totalMinutes = roundDurationMinutes(minutes, rounding);
  const hours = Math.floor(totalMinutes / 60);
  const remainder = totalMinutes % 60;
  if (hours === 0) return `${remainder}m`;
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

/**
 * Formats a Date-compatible instant relative to an injectable base through
 * `Intl.RelativeTimeFormat`. Automatic units use fixed thresholds of 60
 * seconds, 60 minutes, 24 hours, 30 days, and 365 days; month/year values are
 * therefore presentation approximations rather than calendar arithmetic.
 *
 * @param {TimestampInput} value Valid target instant.
 * @param {Intl.LocalesArgument} [locales] Locale preferences accepted by Intl.RelativeTimeFormat.
 * @param {Intl.RelativeTimeFormatOptions & {base?: TimestampInput}} [options] Intl presentation options plus the comparison instant; numeric defaults to `auto`.
 * @returns {string} Locale-formatted relative time such as `yesterday` or `in 2 hours`.
 * @throws {TypeError | RangeError} If dates, locales, options, or Intl values are invalid.
 * @example
 * formatRelativeTime("2026-07-17T00:00:00Z", "en", { base: "2026-07-16T00:00:00Z" }); // "tomorrow"
 * @since 2.0.0
 */
export function formatRelativeTime(value, locales, options = {}) {
  if (!isPlainObject(options)) throw new TypeError(plainObjectOptionsErrorMessage);
  const { base = new Date(), ...formatOptions } = options;
  const difference = requiredDate(value).getTime() - requiredDate(/** @type {TimestampInput} */ (base)).getTime();
  const absolute = Math.abs(difference);
  let divisor;
  /** @type {Intl.RelativeTimeFormatUnit} */
  let unit;
  if (absolute < 60_000) [divisor, unit] = [1_000, "second"];
  else if (absolute < 3_600_000) [divisor, unit] = [60_000, "minute"];
  else if (absolute < 86_400_000) [divisor, unit] = [3_600_000, "hour"];
  else if (absolute < 2_592_000_000) [divisor, unit] = [86_400_000, "day"];
  else if (absolute < 31_536_000_000) [divisor, unit] = [2_592_000_000, "month"];
  else [divisor, unit] = [31_536_000_000, "year"];
  const amount = difference === 0 ? 0 : Math.sign(difference) * Math.round(absolute / divisor);
  return new Intl.RelativeTimeFormat(locales, { numeric: "auto", ...formatOptions }).format(amount, unit);
}

/** @param {TimestampInput} value */
function requiredDate(value) {
  const date = toDate(value);
  if (!date) throw new TypeError("value must represent a valid date.");
  return date;
}

/** @param {unknown} value @param {"date" | "milliseconds" | "seconds" | "reject"} numericStringUnit */
function resolveEpochMilliseconds(value, numericStringUnit) {
  if (value === null || value === undefined || value === "") return null;
  if (isValidDate(value)) return Date.prototype.getTime.call(value);
  if (typeof value === "number") return clippedEpochMilliseconds(value);

  if (typeof value === "string") {
    const source = value.trim();
    if (source === "") return null;
    if (/^-?\d+$/u.test(source)) {
      if (numericStringUnit === "reject") return null;
      if (numericStringUnit !== "date") {
        const numeric = Number(source);
        return clippedEpochMilliseconds(numericStringUnit === "seconds" ? numeric * 1_000 : numeric);
      }
    }
    return clippedEpochMilliseconds(new Date(source).getTime());
  }

  if (typeof value !== "object" || value === null) return null;
  return structuredTimestampMilliseconds(value);
}

/** @param {object} value */
function structuredTimestampMilliseconds(value) {
  let secondsDescriptor;
  let nanosecondsDescriptor;
  let nanosDescriptor;
  try {
    secondsDescriptor = Object.getOwnPropertyDescriptor(value, "seconds");
    nanosecondsDescriptor = Object.getOwnPropertyDescriptor(value, "nanoseconds");
    nanosDescriptor = Object.getOwnPropertyDescriptor(value, "nanos");
  } catch {
    return null;
  }
  if (!secondsDescriptor || !Object.hasOwn(secondsDescriptor, "value")) return null;
  if (nanosecondsDescriptor && nanosDescriptor) return null;
  const fractionDescriptor = nanosecondsDescriptor ?? nanosDescriptor;
  if (fractionDescriptor && !Object.hasOwn(fractionDescriptor, "value")) return null;

  const seconds = structuredTimestampInteger(secondsDescriptor.value);
  const nanoseconds = fractionDescriptor ? structuredTimestampInteger(fractionDescriptor.value) : 0;
  if (
    seconds === null ||
    nanoseconds === null ||
    seconds < protobufMinimumSeconds ||
    seconds > protobufMaximumSeconds ||
    nanoseconds < 0 ||
    nanoseconds > 999_999_999
  ) {
    return null;
  }
  const nanosecondMilliseconds =
    seconds < 0 && nanoseconds > 0 ? Math.ceil(nanoseconds / 1_000_000) : Math.floor(nanoseconds / 1_000_000);
  return clippedEpochMilliseconds(seconds * 1_000 + nanosecondMilliseconds);
}

/** @param {unknown} value */
function structuredTimestampInteger(value) {
  if (typeof value === "number") return Number.isSafeInteger(value) ? value : null;
  if (typeof value !== "string" || !/^-?\d+$/u.test(value.trim())) return null;
  const numeric = Number(value);
  return Number.isSafeInteger(numeric) ? numeric : null;
}

/** @param {number} value */
function clippedEpochMilliseconds(value) {
  if (!Number.isFinite(value)) return null;
  const date = new Date(value);
  return isValidDate(date) ? date.getTime() : null;
}

/** @param {TimestampConversionOptions} options @param {"date" | "milliseconds"} fallback */
function timestampStringUnit(options, fallback) {
  if (!isPlainObject(options)) throw new TypeError(plainObjectOptionsErrorMessage);
  const unit = options.numericStringUnit ?? fallback;
  if (!numericTimestampStringUnits.has(unit)) {
    throw new TypeError('numericStringUnit must be "date", "milliseconds", "seconds", or "reject".');
  }
  return unit;
}

/** @param {number} value */
function pad2(value) {
  return String(value).padStart(2, "0");
}

/** @param {number} minutes @param {string} rounding */
function roundDurationMinutes(minutes, rounding) {
  switch (rounding) {
    case "floor":
      return Math.floor(minutes);
    case "ceil":
      return Math.ceil(minutes);
    case "trunc":
      return Math.trunc(minutes);
    default:
      return Math.round(minutes);
  }
}
