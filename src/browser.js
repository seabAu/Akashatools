import { safeFilename } from "./string.js";

/**
 * Triggers a browser download for a Blob and always revokes its object URL.
 * Browser globals can be injected for testing.
 *
 * @param {string} filename
 * @param {Blob} blob
 * @param {{document?: Document, url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">}} [environment]
 * @returns {void}
 */
export function downloadBlob(filename, blob, environment = {}) {
  if (typeof filename !== "string" || filename.trim() === "") throw new TypeError("filename must be a non-empty string.");
  if (!(blob instanceof Blob)) throw new TypeError("blob must be a Blob.");

  const documentRef = environment.document ?? globalThis.document;
  const urlApi = environment.url ?? globalThis.URL;
  if (!documentRef || !urlApi?.createObjectURL) throw new Error("downloadBlob requires a browser-like environment.");

  const objectUrl = urlApi.createObjectURL(blob);
  try {
    const anchor = documentRef.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
  } finally {
    urlApi.revokeObjectURL(objectUrl);
  }
}

/**
 * Downloads string content as a file in a browser.
 *
 * @param {string} filename
 * @param {string} content
 * @param {{contentType?: string, document?: Document, url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">}} [options]
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
 * @param {{space?: number | string, document?: Document, url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">}} [options]
 * @returns {void}
 */
export function downloadJson(filename, value, { space = 2, ...environment } = {}) {
  const serialized = JSON.stringify(value, null, space);
  if (serialized === undefined) throw new TypeError("value is not JSON-serializable.");
  downloadTextFile(`${safeFilename(filename)}.json`, serialized, {
    contentType: "application/json;charset=utf-8",
    ...environment,
  });
}
