/**
 * Checks whether a value represents a valid Date object.
 *
 * @param {unknown} value
 * @returns {value is Date}
 * @since 2.0.0
 */
export declare function isValidDate(value: unknown): value is Date;
/**
 * Converts a Date-compatible value to a fresh Date or returns null.
 *
 * @param {Date | string | number | null | undefined} value
 * @returns {Date | null}
 * @since 2.0.0
 */
export declare function toDate(value: Date | string | number | null | undefined): Date | null;
/**
 * Returns the number of days in a local calendar month.
 *
 * @param {number | Date} yearOrDate
 * @param {number} [monthIndex]
 * @returns {number}
 * @since 2.0.0
 */
export declare function daysInMonth(yearOrDate: number | Date, monthIndex?: number): number;
/**
 * Returns a new Date at the beginning of the local calendar day.
 *
 * @param {Date | string | number} value
 * @returns {Date}
 * @since 2.0.0
 */
export declare function startOfLocalDay(value: Date | string | number): Date;
/**
 * Returns a stable local date key in YYYY-MM-DD format.
 *
 * @param {Date | string | number} value
 * @returns {string}
 * @since 2.0.0
 */
export declare function localDateKey(value: Date | string | number): string;
/**
 * Calculates whole local calendar-day boundaries between two values. This uses
 * UTC representations of local calendar fields to avoid daylight-saving shifts.
 *
 * @param {Date | string | number} later
 * @param {Date | string | number} earlier
 * @returns {number}
 * @since 2.0.0
 */
export declare function differenceInLocalDays(later: Date | string | number, earlier: Date | string | number): number;
/**
 * Checks whether two values fall on the same local calendar day.
 *
 * @param {Date | string | number} left
 * @param {Date | string | number} right
 * @returns {boolean}
 * @since 2.0.0
 */
export declare function isSameLocalDay(left: Date | string | number, right: Date | string | number): boolean;
/**
 * Checks whether a value falls on today's local calendar day.
 *
 * @param {Date | string | number} value
 * @param {Date} [now=new Date()]
 * @returns {boolean}
 * @since 2.0.0
 */
export declare function isToday(value: Date | string | number, now?: Date): boolean;
/**
 * Converts a date value to whole Unix seconds.
 *
 * @param {Date | string | number} value
 * @returns {number}
 * @since 2.0.0
 */
export declare function toUnixSeconds(value: Date | string | number): number;
/**
 * Converts Unix seconds to a Date.
 *
 * @param {number} seconds
 * @returns {Date}
 * @since 2.0.0
 */
export declare function fromUnixSeconds(seconds: number): Date;
/**
 * Normalizes two Date-compatible boundaries into fresh Date objects. Boundaries
 * represent absolute instants and are never swapped implicitly.
 *
 * @param {Date | string | number} start
 * @param {Date | string | number} end
 * @returns {{start: Date, end: Date}}
 * @since 2.0.0
 */
export declare function normalizeInstantRange(start: Date | string | number, end: Date | string | number): {
    start: Date;
    end: Date;
};
/**
 * Checks whether a Date-compatible value is within an absolute instant range.
 * The default range is start-inclusive and end-exclusive.
 *
 * @param {Date | string | number} value
 * @param {Date | string | number} start
 * @param {Date | string | number} end
 * @param {{startInclusive?: boolean, endInclusive?: boolean}} [options]
 * @returns {boolean}
 * @since 2.0.0
 */
export declare function isWithinInstantRange(value: Date | string | number, start: Date | string | number, end: Date | string | number, { startInclusive, endInclusive }?: {
    startInclusive?: boolean;
    endInclusive?: boolean;
}): boolean;
/**
 * Parses a 24-hour `HH:mm` clock time into minutes after midnight.
 *
 * @param {string} value
 * @returns {number | null}
 * @since 2.0.0
 */
export declare function clockTimeToMinutes(value: string): number | null;
/**
 * Formats minutes after midnight as 24-hour `HH:mm`, wrapping across days.
 *
 * @param {number} minutes
 * @returns {string}
 * @since 2.0.0
 */
export declare function minutesToClockTime(minutes: number): string;
/**
 * Converts a 12-hour clock string such as `2:05 PM` to `14:05`.
 *
 * @param {string} value
 * @returns {string | null}
 * @since 2.0.0
 */
export declare function clock12To24(value: string): string | null;
/**
 * Converts a `HH:mm` clock string to a 12-hour form such as `2:05 PM`.
 *
 * @param {string} value
 * @returns {string | null}
 * @since 2.0.0
 */
export declare function clock24To12(value: string): string | null;
/**
 * Formats a date using `Intl.DateTimeFormat`.
 *
 * @param {Date | string | number} value
 * @param {Intl.LocalesArgument} [locales]
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 * @since 2.0.0
 */
export declare function formatDate(value: Date | string | number, locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions): string;
/**
 * Formats a date and time using `Intl.DateTimeFormat`.
 *
 * @param {Date | string | number} value
 * @param {Intl.LocalesArgument} [locales]
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 * @since 2.0.0
 */
export declare function formatDateTime(value: Date | string | number, locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions): string;
