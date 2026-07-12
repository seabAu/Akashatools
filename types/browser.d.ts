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
 * @param {string} filename
 * @param {string} content
 * @param {{contentType?: string, document?: Document, url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">, schedule?: (callback: () => void) => unknown}} [options]
 * @returns {void}
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
 * @param {string} filename
 * @param {unknown} value
 * @param {{space?: number | string, document?: Document, url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">, schedule?: (callback: () => void) => unknown}} [options]
 * @returns {void}
 * @since 2.0.0
 */
export declare function downloadJson(filename: string, value: unknown, { space, ...environment }?: {
    space?: number | string;
    document?: Document;
    url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
    schedule?: (callback: () => void) => unknown;
}): void;
