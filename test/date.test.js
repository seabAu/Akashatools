import assert from "node:assert/strict";
import test from "node:test";

import {
  differenceInLocalDays,
  fromUnixSeconds,
  isSameLocalDay,
  isWithinInstantRange,
  normalizeInstantRange,
  startOfLocalDay,
} from "akashatools/date";

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
