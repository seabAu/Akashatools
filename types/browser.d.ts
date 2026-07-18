export type InputControlOptions = {
    /**
     * Greatest FileList or multiple-selection length.
     */
    maximumItems?: number;
};
export type MediaQueryEnvironment = {
    /**
     * Injectable media-query evaluator.
     */
    matchMedia?: (query: string) => Pick<MediaQueryList, "matches">;
};
export type JsonStorageOptions = {
    /**
     * Greatest exact UTF-8 JSON size read or written.
     */
    maximumBytes?: number;
    /**
     * Value returned by reads when the key is absent.
     */
    fallback?: unknown;
};
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
export declare function inputValueFromControl(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, parser?: (value: unknown) => unknown, options?: InputControlOptions): unknown;
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
export declare function matchesMediaQuery(query: string, environment?: MediaQueryEnvironment): boolean;
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
export declare function prefersColorScheme(scheme?: "dark" | "light", environment?: MediaQueryEnvironment): boolean;
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
export declare function readJsonStorage(storage: Pick<Storage, "getItem">, key: string, options?: JsonStorageOptions): unknown;
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
export declare function writeJsonStorage(storage: Pick<Storage, "setItem">, key: string, value: unknown, options?: JsonStorageOptions): string;
