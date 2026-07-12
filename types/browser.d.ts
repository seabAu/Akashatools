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
export declare function downloadBlob(filename: string, blob: Blob, environment?: {
    document?: Document;
    url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
    schedule?: (callback: () => void) => unknown;
}): void;
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
export declare function downloadTextFile(filename: string, content: string, { contentType, ...environment }?: {
    contentType?: string;
    document?: Document;
    url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
    schedule?: (callback: () => void) => unknown;
}): void;
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
export declare function downloadJson(filename: string, value: unknown, { space, ...environment }?: {
    space?: number | string;
    document?: Document;
    url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
    schedule?: (callback: () => void) => unknown;
}): void;
