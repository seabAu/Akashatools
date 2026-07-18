/**
 * Akashatools public API.
 *
 * Every function is available as a named export for tree-shaking. Category
 * namespaces are also exported for callers who prefer `array.chunk(...)`.
 */
export * from "./array/index.js";
export * from "./async/index.js";
export * from "./browser/index.js";
export * from "./collection/index.js";
export * from "./data/index.js";
export * from "./date/index.js";
export * from "./http/index.js";
export * from "./input/index.js";
export * from "./number/index.js";
export * from "./object/index.js";
export * from "./random/index.js";
export * from "./sort/index.js";
export * from "./string/index.js";
export * from "./validation/index.js";
export { akasha, akasha as default, array, asyncUtils as async, browser, collection, data, date, http, input, number, object, random, sort, string, validation, } from "./namespace.js";
