export type StructuredTimestamp = {
    seconds: number | string;
    nanoseconds?: number | string;
    nanos?: never;
} | {
    seconds: number | string;
    nanos?: number | string;
    nanoseconds?: never;
};
export type TimestampInput = Date | string | number | StructuredTimestamp;
export type TimestampConversionOptions = {
    /**
     * Interpretation of integer-only strings; nonnumeric strings still use Date parsing.
     */
    numericStringUnit?: "date" | "milliseconds" | "seconds" | "reject";
};
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
export declare function isValidDate(value: unknown): value is Date;
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
export declare function toDate(value: TimestampInput | null | undefined, options?: TimestampConversionOptions): Date | null;
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
export declare function toEpochMilliseconds(value: TimestampInput | null | undefined, options?: TimestampConversionOptions): number | null;
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
export declare function daysInMonth(yearOrDate: number | Date, monthIndex?: number): number;
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
export declare function startOfLocalDay(value: TimestampInput): Date;
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
export declare function localDateKey(value: TimestampInput): string;
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
export declare function differenceInLocalDays(later: TimestampInput, earlier: TimestampInput): number;
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
export declare function isSameLocalDay(left: TimestampInput, right: TimestampInput): boolean;
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
export declare function isToday(value: TimestampInput, now?: Date): boolean;
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
export declare function toUnixSeconds(value: TimestampInput): number;
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
export declare function fromUnixSeconds(seconds: number): Date;
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
export declare function normalizeInstantRange(start: TimestampInput, end: TimestampInput): {
    start: Date;
    end: Date;
};
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
export declare function isWithinInstantRange(value: TimestampInput, start: TimestampInput, end: TimestampInput, { startInclusive, endInclusive }?: {
    startInclusive?: boolean;
    endInclusive?: boolean;
}): boolean;
/**
 * Parses a 24-hour `HH:mm` clock time into minutes after midnight.
 *
 * @param {string} value Trimmed 24-hour clock text in `H:mm` or `HH:mm` form.
 * @returns {number | null} Minutes after midnight, or null for invalid syntax/ranges.
 * @example
 * clockTimeToMinutes("23:59"); // 1439
 * @since 2.0.0
 */
export declare function clockTimeToMinutes(value: string): number | null;
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
export declare function minutesToClockTime(minutes: number): string;
/**
 * Converts a 12-hour clock string such as `2:05 PM` to `14:05`.
 *
 * @param {string} value Trimmed 12-hour `h:mm AM/PM` clock text.
 * @returns {string | null} Zero-padded 24-hour text, or null for invalid input.
 * @example
 * clock12To24("2:05 PM"); // "14:05"
 * @since 2.0.0
 */
export declare function clock12To24(value: string): string | null;
/**
 * Converts a `HH:mm` clock string to a 12-hour form such as `2:05 PM`.
 *
 * @param {string} value Valid 24-hour `H:mm` or `HH:mm` clock text.
 * @returns {string | null} 12-hour clock text, or null for invalid input.
 * @example
 * clock24To12("14:05"); // "2:05 PM"
 * @since 2.0.0
 */
export declare function clock24To12(value: string): string | null;
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
export declare function formatDate(value: TimestampInput, locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions): string;
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
export declare function formatDateTime(value: TimestampInput, locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions): string;
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
export declare function formatDuration(minutes: number, options?: {
    rounding?: "round" | "floor" | "ceil" | "trunc";
}): string;
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
export declare function formatRelativeTime(value: TimestampInput, locales?: Intl.LocalesArgument, options?: Intl.RelativeTimeFormatOptions & {
    base?: TimestampInput;
}): string;
