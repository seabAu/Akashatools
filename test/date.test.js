import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";

import {
  clock12To24,
  clock24To12,
  clockTimeToMinutes,
  daysInMonth,
  differenceInLocalDays,
  formatDate,
  formatDateTime,
  formatDuration,
  formatRelativeTime,
  fromUnixSeconds,
  isSameLocalDay,
  isToday,
  isValidDate,
  isWithinInstantRange,
  localDateKey,
  minutesToClockTime,
  normalizeInstantRange,
  startOfLocalDay,
  toDate,
  toUnixSeconds,
} from "akashatools/date";

test("duration formatting uses strict minute and rounding contracts", () => {
  assert.equal(formatDuration(0), "0m");
  assert.equal(formatDuration(45), "45m");
  assert.equal(formatDuration(60), "1h");
  assert.equal(formatDuration(125), "2h 5m");
  assert.equal(formatDuration(59.5), "1h");
  assert.equal(formatDuration(59.9, { rounding: "floor" }), "59m");
  assert.equal(formatDuration(60.1, { rounding: "ceil" }), "1h 1m");
  assert.throws(() => formatDuration(-1), RangeError);
  assert.throws(() => formatDuration(Number.NaN), TypeError);
  assert.throws(() => formatDuration(Number.MAX_SAFE_INTEGER + 1), RangeError);
  assert.throws(() => formatDuration(1, { rounding: /** @type {any} */ ("bankers") }), RangeError);
  assert.throws(() => formatDuration(1, /** @type {any} */ ([])), TypeError);
});

test("relative time formatting delegates locale text with fixed automatic units", () => {
  const base = "2026-07-16T12:00:00.000Z";
  assert.equal(formatRelativeTime("2026-07-17T12:00:00.000Z", "en", { base }), "tomorrow");
  assert.equal(formatRelativeTime("2026-07-16T10:30:00.000Z", "en", { base, numeric: "always" }), "2 hours ago");
  assert.equal(formatRelativeTime(base, "en", { base }), "now");
  assert.equal(
    formatRelativeTime("2026-08-15T12:00:00.000Z", "en", { base, numeric: "always" }),
    "in 1 month",
  );
  assert.throws(() => formatRelativeTime("invalid", "en", { base }), TypeError);
  assert.throws(() => formatRelativeTime(base, "en", /** @type {any} */ ([])), TypeError);
});

test("date conversion and calendar helpers reject invalid values without mutation", () => {
  const original = new Date(2024, 1, 29, 18, 30);
  const copy = toDate(original);
  assert.notEqual(copy, original);
  assert.equal(copy?.getTime(), original.getTime());
  assert.equal(toDate(null), null);
  assert.equal(toDate("not a date"), null);
  assert.equal(isValidDate({}), false);
  assert.equal(isValidDate(runInNewContext("new Date(0)")), true);
  assert.equal(daysInMonth(2024, 1), 29);
  assert.equal(daysInMonth(original), 29);
  assert.throws(() => daysInMonth(2024, 12), RangeError);
  assert.throws(() => startOfLocalDay("not a date"), TypeError);
  assert.equal(original.getHours(), 18);
});

test("local calendar and clock helpers use explicit wrapping and invalid-input contracts", () => {
  const local = new Date(2026, 6, 11, 23, 30);
  assert.equal(localDateKey(local), "2026-07-11");
  assert.equal(differenceInLocalDays(new Date(2026, 6, 12), new Date(2026, 6, 10)), 2);
  assert.equal(isToday(local, new Date(2026, 6, 11, 0, 1)), true);
  assert.equal(clockTimeToMinutes("23:59"), 1439);
  assert.equal(clockTimeToMinutes("24:00"), null);
  assert.equal(clockTimeToMinutes(/** @type {any} */ (1200)), null);
  assert.equal(minutesToClockTime(-1), "23:59");
  assert.throws(() => minutesToClockTime(Number.NaN), TypeError);
  assert.equal(clock12To24("12:05 AM"), "00:05");
  assert.equal(clock12To24("13:00 PM"), null);
  assert.equal(clock24To12("14:05"), "2:05 PM");
  assert.equal(clock24To12("noon"), null);
});

test("Unix and Intl format helpers delegate with normalized valid dates", () => {
  const instant = new Date("2026-07-11T14:05:06.000Z");
  const unixSeconds = instant.getTime() / 1_000;
  assert.equal(toUnixSeconds(instant), unixSeconds);
  assert.equal(fromUnixSeconds(unixSeconds).toISOString(), instant.toISOString());
  assert.throws(() => fromUnixSeconds(Number.NaN), TypeError);

  const dateOptions = { timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit" };
  const dateTimeOptions = { ...dateOptions, hour: "2-digit", minute: "2-digit", hourCycle: "h23" };
  assert.equal(formatDate(instant, "en-US", dateOptions), new Intl.DateTimeFormat("en-US", dateOptions).format(instant));
  assert.equal(formatDateTime(instant, "en-US", dateTimeOptions), new Intl.DateTimeFormat("en-US", dateTimeOptions).format(instant));
});

test("instant ranges use explicit start-inclusive and end-exclusive boundaries", () => {
  const start = "2026-01-01T00:00:00.000Z";
  const end = "2026-01-02T00:00:00.000Z";
  const normalized = normalizeInstantRange(start, end);
  assert.equal(normalized.start.toISOString(), start);
  assert.equal(normalized.end.toISOString(), end);
  assert.equal(isWithinInstantRange(start, start, end), true);
  assert.equal(isWithinInstantRange(end, start, end), false);
  assert.equal(isWithinInstantRange(end, start, end, { endInclusive: true }), true);
  assert.equal(isWithinInstantRange(start, start, end, { startInclusive: false }), false);
  assert.throws(() => isWithinInstantRange(start, start, end, { endInclusive: /** @type {any} */ (1) }), TypeError);
  assert.throws(() => normalizeInstantRange(end, start), RangeError);
  assert.throws(() => fromUnixSeconds(Number.MAX_VALUE), RangeError);
});

test("local calendar-day differences survive the America/New_York DST gap", () => {
  const originalTimeZone = process.env.TZ;
  process.env.TZ = "America/New_York";
  try {
    const before = new Date(2026, 2, 8, 0, 0);
    const after = new Date(2026, 2, 9, 0, 0);
    const missing = new Date(2026, 2, 8, 2, 30);
    assert.equal((after.getTime() - before.getTime()) / 3_600_000, 23);
    assert.equal(differenceInLocalDays(after, before), 1);
    assert.equal(missing.getHours(), 3);
    assert.equal(isSameLocalDay(missing, before), true);
    assert.equal(startOfLocalDay(missing).getHours(), 0);
  } finally {
    if (originalTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimeZone;
  }
});

test("local calendar-day differences survive the America/New_York DST overlap", () => {
  const originalTimeZone = process.env.TZ;
  process.env.TZ = "America/New_York";
  try {
    const before = new Date(2026, 10, 1, 0, 0);
    const after = new Date(2026, 10, 2, 0, 0);
    assert.equal((after.getTime() - before.getTime()) / 3_600_000, 25);
    assert.equal(differenceInLocalDays(after, before), 1);
  } finally {
    if (originalTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimeZone;
  }
});
