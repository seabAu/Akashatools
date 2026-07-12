import { safeFilename } from "./string.js";

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
  if (typeof filename !== "string" || filename.trim() === "") throw new TypeError("filename must be a non-empty string.");
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
