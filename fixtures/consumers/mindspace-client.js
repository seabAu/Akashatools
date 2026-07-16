import { chunk, groupBy, moveItem, unique } from "akashatools/array";
import { formatDuration, formatRelativeTime } from "akashatools/date";
import { secureRandomUuid } from "akashatools/random";

/**
 * Representative Mindspace client composition for deduplicating, reordering,
 * grouping, and paging task-like records without mutating store state.
 */
export function prepareMindspaceTaskView(tasks, pageSize, fromIndex, toIndex) {
  const deduplicated = unique(tasks, ({ id }) => id);
  const ordered = moveItem(deduplicated, fromIndex, toIndex);
  return {
    groups: groupBy(ordered, ({ status }) => status ?? "unassigned"),
    pages: chunk(ordered, pageSize),
  };
}

/** Representative replacement for Mindspace duration and time-ago formatters. */
export function presentMindspaceTime(minutes, dueAt, base) {
  return {
    duration: formatDuration(minutes),
    relative: formatRelativeTime(dueAt, "en", { base }),
  };
}

/** Keeps Mindspace's prefix convention outside the generic UUID primitive. */
export function createMindspaceClientId(prefix = "") {
  if (typeof prefix !== "string") throw new TypeError("prefix must be a string.");
  const normalizedPrefix = prefix
    .trim()
    .replace(/[^A-Za-z0-9_-]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
  const token = secureRandomUuid();
  return normalizedPrefix === "" ? token : `${normalizedPrefix}-${token}`;
}
