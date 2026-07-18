import { plainObjectOptionsErrorMessage } from "./internal/error-messages.js";
import { cloneJson, isPlainObject } from "./object.js";
import { safeFilename, utf8ByteLength } from "./string.js";

/**
 * @typedef {object} InputControlOptions
 * @property {number} [maximumItems=100000] Greatest FileList or multiple-selection length.
 */

/**
 * @typedef {object} MediaQueryEnvironment
 * @property {(query: string) => Pick<MediaQueryList, "matches">} [matchMedia] Injectable media-query evaluator.
 */

/**
 * @typedef {object} JsonStorageOptions
 * @property {number} [maximumBytes=1000000] Greatest exact UTF-8 JSON size read or written.
 * @property {unknown} [fallback] Value returned by reads when the key is absent.
 */

/** @param {unknown} value */
const identityValue = (value) => value;

/**
 * Triggers a browser download for a Blob. The temporary anchor is removed
 * synchronously; object URL revocation is deferred to the next timer turn so
 * the browser can consume the click. Click/scheduling failures revoke at once.
 * Browser globals and the scheduler can be injected for testing.
 *
 * @param {string} filename Non-blank filename presented to the browser.
 * @param {Blob} blob Browser-native Blob to download.
 * @param {{document?: Document, url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">, schedule?: (callback: () => void) => unknown}} [environment] Optional browser capabilities for testing or alternate realms.
 * @returns {void} Performs the download effect synchronously and schedules URL cleanup.
 * @throws {TypeError} If filename, blob, or the injected scheduler is invalid.
 * @throws {Error} If required document or object-URL capabilities are unavailable.
 * @example
 * downloadBlob("report.pdf", new Blob([bytes], { type: "application/pdf" }));
 * @since 2.0.0
 */
export function downloadBlob(filename, blob, environment = {}) {
  if (typeof filename !== "string" || filename.trim() === "")
    throw new TypeError("filename must be a non-empty string.");
  if (!(blob instanceof Blob)) throw new TypeError("blob must be a Blob.");

  const documentRef = environment.document ?? globalThis.document;
  const urlApi = environment.url ?? globalThis.URL;
  const schedule = environment.schedule ?? ((callback) => globalThis.setTimeout(callback, 0));
  if (!documentRef?.createElement || !urlApi?.createObjectURL || !urlApi?.revokeObjectURL) {
    throw new Error("downloadBlob requires a browser-like environment.");
  }
  if (typeof schedule !== "function") throw new TypeError("schedule must be a function.");

  const objectUrl = urlApi.createObjectURL(blob);
  let clicked = false;
  let revokeScheduled = false;
  /** @type {HTMLAnchorElement | undefined} */
  let anchor;
  try {
    anchor = documentRef.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.style.display = "none";
    documentRef.body?.append(anchor);
    anchor.click();
    clicked = true;
    schedule(() => urlApi.revokeObjectURL(objectUrl));
    revokeScheduled = true;
  } finally {
    anchor?.remove();
    if (!clicked || !revokeScheduled) urlApi.revokeObjectURL(objectUrl);
  }
}

/**
 * Downloads string content as a file in a browser.
 *
 * @param {string} filename Non-blank filename presented to the browser.
 * @param {string} content Text encoded into the downloaded Blob.
 * @param {{contentType?: string, document?: Document, url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">, schedule?: (callback: () => void) => unknown}} [options] Media type and optional injected browser capabilities.
 * @returns {void} Performs the download effect.
 * @throws {TypeError} If content or delegated Blob arguments are invalid.
 * @throws {Error} If required browser capabilities are unavailable.
 * @example
 * downloadTextFile("notes.txt", "Remember the milk");
 * @since 2.0.0
 */
export function downloadTextFile(filename, content, { contentType = "text/plain;charset=utf-8", ...environment } = {}) {
  if (typeof content !== "string") throw new TypeError("content must be a string.");
  downloadBlob(filename, new Blob([content], { type: contentType }), environment);
}

/**
 * Creates a safe filename and downloads JSON content.
 *
 * @param {string} filename Filename stem or name ending in one case-insensitive `.json` extension.
 * @param {unknown} value Value serialized with JSON.stringify.
 * @param {{space?: number | string, document?: Document, url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">, schedule?: (callback: () => void) => unknown}} [options] JSON indentation and optional injected browser capabilities.
 * @returns {void} Performs a JSON download using a normalized safe filename.
 * @throws {TypeError} If JSON.stringify returns undefined or delegated arguments are invalid.
 * @throws {Error} If serialization or required browser capabilities fail.
 * @example
 * downloadJson("settings", { theme: "dark" });
 * @since 2.0.0
 */
export function downloadJson(filename, value, { space = 2, ...environment } = {}) {
  const serialized = JSON.stringify(value, null, space);
  if (serialized === undefined) throw new TypeError("value is not JSON-serializable.");
  const stem = filename.trim().toLowerCase().endsWith(".json") ? filename.trim().slice(0, -5) : filename;
  downloadTextFile(`${safeFilename(stem)}.json`, serialized, {
    contentType: "application/json;charset=utf-8",
    ...environment,
  });
}

/**
 * Extracts the semantic value from an input, select, or textarea control and
 * optionally applies a precompiled pure parser. Checkboxes yield booleans,
 * unchecked radios and empty file controls yield `undefined`, single file
 * controls yield one File, multiple file controls and multiple selects yield
 * arrays, and ordinary controls yield their string value. Unchecked/empty
 * controls return before invoking parser.
 *
 * Pass a parser returned by `createInputValueParser` for efficient repeated
 * handlers; keeping parser construction outside this browser adapter avoids
 * descriptor work and keeps extraction independently testable.
 *
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} control Browser form control.
 * @param {(value: unknown) => unknown} [parser] Optional precompiled conversion applied to extracted data.
 * @param {InputControlOptions} [options] File/selection work bound.
 * @returns {unknown} Extracted raw value or parser result.
 * @throws {TypeError | RangeError} If control, parser, options, or extracted work violate the contract.
 * @example
 * inputValueFromControl(event.currentTarget, createInputValueParser(Number));
 * @since 2.0.0
 */
export function inputValueFromControl(control, parser = identityValue, options = {}) {
  if (control === null || typeof control !== "object") throw new TypeError("control must be a browser form control.");
  if (typeof parser !== "function") throw new TypeError("parser must be a function.");
  if (!isPlainObject(options)) throw new TypeError(plainObjectOptionsErrorMessage);
  const maximumItems = options.maximumItems ?? 100_000;
  if (!Number.isSafeInteger(maximumItems) || maximumItems < 0) {
    throw new RangeError("maximumItems must be a non-negative safe integer.");
  }

  const type = typeof control.type === "string" ? control.type.toLowerCase() : "";
  if (type === "checkbox" || type === "radio") {
    if (!("checked" in control) || typeof control.checked !== "boolean") {
      throw new TypeError("checkbox and radio controls must expose checked.");
    }
    if (type === "checkbox") return parser(control.checked);
    if (!control.checked) return undefined;
  }
  if (type === "file") {
    if (!("files" in control)) throw new TypeError("file controls must expose files.");
    const files = control.files;
    if (files === null || files === undefined) return undefined;
    if (!Number.isSafeInteger(files.length) || files.length < 0)
      throw new TypeError("control.files must be array-like.");
    if (files.length > maximumItems) throw new RangeError("File input exceeded maximumItems.");
    if (control.multiple) return parser(Array.from(files));
    return files.length === 0 ? undefined : parser(files[0]);
  }
  if ("multiple" in control && control.multiple && "selectedOptions" in control) {
    const selectedOptions = control.selectedOptions;
    if (!Number.isSafeInteger(selectedOptions.length) || selectedOptions.length < 0) {
      throw new TypeError("control.selectedOptions must be array-like.");
    }
    if (selectedOptions.length > maximumItems) throw new RangeError("Selected options exceeded maximumItems.");
    return parser(Array.from(selectedOptions, (option) => option.value));
  }
  if (typeof control.value !== "string") throw new TypeError("control.value must be a string.");
  return parser(control.value);
}

/**
 * Evaluates a CSS media query on demand. No browser global is read during module
 * import; callers may inject `matchMedia` for tests or alternate realms.
 *
 * @param {string} query Nonblank CSS media query no longer than 10000 UTF-16 code units.
 * @param {MediaQueryEnvironment} [environment] Optional media-query implementation.
 * @returns {boolean} Current media-query match state.
 * @throws {TypeError | RangeError | Error} If query, environment, or browser capability is invalid.
 * @example
 * matchesMediaQuery("(prefers-reduced-motion: reduce)");
 * @since 2.0.0
 */
export function matchesMediaQuery(query, environment = {}) {
  if (typeof query !== "string" || query.trim() === "") throw new TypeError("query must be a nonblank string.");
  if (query.length > 10_000) throw new RangeError("query cannot exceed 10000 code units.");
  if (!isPlainObject(environment)) throw new TypeError("environment must be a plain object.");
  const matchMedia = environment.matchMedia ?? globalThis.matchMedia;
  if (typeof matchMedia !== "function")
    throw new Error("matchesMediaQuery requires a browser-like matchMedia function.");
  const result = matchMedia.call(environment.matchMedia === undefined ? globalThis : environment, query);
  if (result === null || typeof result !== "object" || typeof result.matches !== "boolean") {
    throw new TypeError("matchMedia must return an object with a boolean matches property.");
  }
  return result.matches;
}

/**
 * Checks the current browser preference for a light or dark color scheme without
 * evaluating it at import time.
 *
 * @param {"dark" | "light"} [scheme="dark"] Color scheme to query.
 * @param {MediaQueryEnvironment} [environment] Optional media-query implementation.
 * @returns {boolean} Whether the requested color scheme currently matches.
 * @throws {TypeError | RangeError | Error} If scheme or browser capability is invalid.
 * @example
 * prefersColorScheme("dark");
 * @since 2.0.0
 */
export function prefersColorScheme(scheme = "dark", environment = {}) {
  if (scheme !== "dark" && scheme !== "light") throw new TypeError('scheme must be "dark" or "light".');
  return matchesMediaQuery(`(prefers-color-scheme: ${scheme})`, environment);
}

/**
 * Reads and parses one strict JSON value from an explicit Web Storage-like
 * object. Missing keys return the optional fallback. Storage security errors,
 * quota errors, malformed JSON, and size violations remain visible.
 *
 * @param {Pick<Storage, "getItem">} storage Explicit Storage-like implementation.
 * @param {string} key Storage key, including the empty string when intentionally used.
 * @param {JsonStorageOptions} [options] Exact UTF-8 read bound and missing-key fallback.
 * @returns {unknown} Parsed JSON value or fallback when the key is absent.
 * @throws {TypeError | RangeError} If arguments, stored text, or JSON violate the contract.
 * @example
 * readJsonStorage(localStorage, "settings", { fallback: {} });
 * @since 2.0.0
 */
export function readJsonStorage(storage, key, options = {}) {
  assertStorage(storage, "getItem");
  assertStorageKey(key);
  const maximumBytes = jsonStorageMaximumBytes(options);
  const source = storage.getItem(key);
  if (source === null) return options.fallback;
  if (typeof source !== "string") throw new TypeError("storage.getItem must return a string or null.");
  if (utf8ByteLength(source) > maximumBytes) throw new RangeError("Stored JSON exceeded maximumBytes.");
  try {
    return cloneJson(JSON.parse(source), { maximumBytes });
  } catch (error) {
    if (error instanceof RangeError) throw error;
    throw new TypeError("Stored value must contain valid JSON.", { cause: error });
  }
}

/**
 * Strictly clones, serializes, and writes one plain JSON value to an explicit Web
 * Storage-like object. Accessors, `toJSON`, cycles, sparse/custom arrays,
 * non-finite numbers, and non-JSON brands are rejected before `setItem` runs.
 * The exact stored string is returned for diagnostics or equality checks; its
 * UTF-8 size is not presented as a browser quota measurement.
 *
 * @param {Pick<Storage, "setItem">} storage Explicit Storage-like implementation.
 * @param {string} key Storage key, including the empty string when intentionally used.
 * @param {unknown} value Strict plain JSON value.
 * @param {JsonStorageOptions} [options] Exact UTF-8 serialization bound.
 * @returns {string} Exact JSON text passed to storage.setItem.
 * @throws {TypeError | RangeError} If arguments or value violate the strict JSON contract.
 * @example
 * writeJsonStorage(localStorage, "settings", { theme: "dark" });
 * @since 2.0.0
 */
export function writeJsonStorage(storage, key, value, options = {}) {
  assertStorage(storage, "setItem");
  assertStorageKey(key);
  const maximumBytes = jsonStorageMaximumBytes(options);
  const cloned = cloneJson(value, { maximumBytes });
  const serialized = JSON.stringify(cloned);
  storage.setItem(key, serialized);
  return serialized;
}

/** @param {unknown} storage @param {"getItem" | "setItem"} method */
function assertStorage(storage, method) {
  if (
    storage === null ||
    typeof storage !== "object" ||
    typeof (/** @type {Record<string, unknown>} */ (storage)[method]) !== "function"
  ) {
    throw new TypeError(`storage must provide ${method}.`);
  }
}

/** @param {unknown} key */
function assertStorageKey(key) {
  if (typeof key !== "string") throw new TypeError("key must be a string.");
  if (key.length > 10_000) throw new RangeError("key cannot exceed 10000 code units.");
}

/** @param {JsonStorageOptions} options */
function jsonStorageMaximumBytes(options) {
  if (!isPlainObject(options)) throw new TypeError(plainObjectOptionsErrorMessage);
  const maximumBytes = options.maximumBytes ?? 1_000_000;
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 0) {
    throw new RangeError("maximumBytes must be a non-negative safe integer.");
  }
  return maximumBytes;
}
