import { safeFilename } from "./string.js";

/**
 * Triggers a browser download for a Blob. The temporary anchor is removed
 * synchronously; object URL revocation is deferred to the next timer turn so
 * the browser can consume the click. Click/scheduling failures revoke at once.
 * Browser globals and the scheduler can be injected for testing.
 *
 * @param {string} filename
 * @param {Blob} blob
 * @param {{document?: Document, url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">, schedule?: (callback: () => void) => unknown}} [environment]
 * @returns {void}
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
 * @param {string} filename
 * @param {string} content
 * @param {{contentType?: string, document?: Document, url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">, schedule?: (callback: () => void) => unknown}} [options]
 * @returns {void}
 */
export function downloadTextFile(filename, content, { contentType = "text/plain;charset=utf-8", ...environment } = {}) {
  if (typeof content !== "string") throw new TypeError("content must be a string.");
  downloadBlob(filename, new Blob([content], { type: contentType }), environment);
}

/**
 * Creates a safe filename and downloads JSON content.
 *
 * @param {string} filename
 * @param {unknown} value
 * @param {{space?: number | string, document?: Document, url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">, schedule?: (callback: () => void) => unknown}} [options]
 * @returns {void}
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
