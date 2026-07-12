/**
 * Akashatools public API.
 *
 * Every function is available as a named export for tree-shaking. Category
 * namespaces are also exported for callers who prefer `array.chunk(...)`.
 */

export * from "./array.js";
export * from "./async.js";
export * from "./browser.js";
export * from "./collection.js";
export * from "./date.js";
export * from "./http.js";
export * from "./number.js";
export * from "./object.js";
export * from "./random.js";
export * from "./sort.js";
export * from "./string.js";
export * from "./validation.js";

export {
  akasha,
  akasha as default,
  array,
  asyncUtils as async,
  browser,
  collection,
  date,
  http,
  number,
  object,
  random,
  sort,
  string,
  validation,
} from "./namespace.js";
