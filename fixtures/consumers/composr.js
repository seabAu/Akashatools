import { fulfilledValues, mapSettledWithConcurrency } from "akashatools/async";
import { excludeIds, upsertById } from "akashatools/collection";
import { summarizeNumbers } from "akashatools/number";
import { slugify, stableJson } from "akashatools/string";

/** Representative COMPOSR bounded batch execution and fulfilled projection. */
export async function settleComposrWork(values, concurrency, mapper) {
  const settled = await mapSettledWithConcurrency(values, concurrency, mapper);
  return { settled, fulfilled: fulfilledValues(settled) };
}

/** Representative immutable COMPOSR record upsert followed by exclusion. */
export function updateComposrRecords(records, nextRecord, excludedIds = new Set()) {
  return excludeIds(upsertById(records, nextRecord), excludedIds);
}

/** Deterministic checkpoint text independent of object insertion order. */
export function serializeComposrCheckpoint(value) {
  return stableJson(value);
}

/** Strict replacement for COMPOSR transition distribution summaries. */
export function summarizeComposrTransitions(values) {
  return summarizeNumbers(values);
}

/** Preserves COMPOSR's lowercase filename-slug presentation as composition. */
export function toComposrSafeFilename(value, fallback = "download") {
  return slugify(value, { fallback });
}
