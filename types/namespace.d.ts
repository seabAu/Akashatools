import * as arrayModule from "./array/index.js";
import * as asyncModule from "./async/index.js";
import * as browserModule from "./browser/index.js";
import * as collectionModule from "./collection/index.js";
import * as dataModule from "./data/index.js";
import * as dateModule from "./date/index.js";
import * as httpModule from "./http/index.js";
import * as hashModule from "./hash/index.js";
import * as geoModule from "./geo/index.js";
import * as inputModule from "./input/index.js";
import * as functionModule from "./function/index.js";
import * as numberModule from "./number/index.js";
import * as objectModule from "./object/index.js";
import * as randomModule from "./random/index.js";
import * as sortModule from "./sort/index.js";
import * as stringModule from "./string/index.js";
import * as validationModule from "./validation/index.js";
/** Frozen array utilities for namespace-style discovery. */
export declare const array: Readonly<{
    asArray<T>(value: unknown, fallback?: readonly T[]): T[];
    isNonEmptyArray<T>(value: unknown): value is T[];
    compact<T>(values: readonly (T | null | undefined)[]): T[];
    chunk<T>(values: readonly T[], size: number): T[][];
    unique<T>(values: readonly T[], toKey?: (value: T, index: number) => unknown): T[];
    flatten<T>(values: readonly T[], depth?: number): unknown[];
    moveItem<T>(values: readonly T[], fromIndex: number, toIndex: number): T[];
    insertItem<T>(values: readonly T[], index: number, item: T): T[];
    removeFromArray<T>(values: readonly T[], selector: number | T | ((value: T, index: number, values: readonly T[]) => boolean), options?: {
        mode?: arrayModule.RemovalMode;
        all?: boolean;
    }): T[];
    groupBy<T, K>(values: readonly T[], toKey: (value: T, index: number) => K): Map<K, T[]>;
    keyBy<T, K>(values: readonly T[], toKey: (value: T, index: number, values: readonly T[]) => K, options?: {
        onDuplicate?: arrayModule.DuplicateKeyPolicy;
    }): Map<K, T>;
    countBy<T>(values: readonly T[]): Map<T, number>;
    countBy<T, K>(values: readonly T[], toKey: (value: T, index: number, values: readonly T[]) => K): Map<K, number>;
    partition<T>(values: readonly T[], predicate: (value: T, index: number, values: readonly T[]) => boolean): [T[], T[]];
    lowerBound<T, U>(values: readonly T[], needle: U, compare?: (value: T, needle: U) => number): number;
    upperBound<T, U>(values: readonly T[], needle: U, compare?: (value: T, needle: U) => number): number;
    binarySearch<T, U>(values: readonly T[], needle: U, compare?: (value: T, needle: U) => number): number;
    intersection<T>(...arrays: (readonly T[])[]): T[];
    range(start: number, end?: number, step?: number): number[];
    zip(...arrays: (readonly unknown[])[]): unknown[][];
    shuffle<T>(values: readonly T[], random?: () => number): T[];
}>;
/** Frozen asynchronous utilities for namespace-style discovery. */
export declare const asyncUtils: Readonly<{
    createSingleFlight<T>(loader: () => T | PromiseLike<T>, options?: {
        ttl?: number;
        now?: () => number;
        shouldCache?: (value: T) => boolean;
    }): Readonly<{
        load: () => Promise<T>;
        invalidate: () => void;
    }>;
    createKeyedSingleFlight<K, V>(loader: (key: K) => V | PromiseLike<V>, options?: {
        ttl?: number;
        now?: () => number;
        shouldCache?: (value: V) => boolean;
        maximumSize?: number;
    }): Readonly<{
        load: (key: K) => Promise<V>;
        invalidate: (key: K) => boolean;
        invalidateAll: () => number;
        readonly size: number;
    }>;
    createConcurrencyLimiter(maximumConcurrency: number, options?: {
        maximumPending?: number;
    }): Readonly<{
        run: <T>(operation: () => T | PromiseLike<T>, options?: {
            signal?: AbortSignal;
        }) => Promise<T>;
        readonly activeCount: number;
        readonly pendingCount: number;
    }>;
    createKeyedConcurrencyLimiter(maximumConcurrency: number, maximumConcurrencyPerKey: number, options?: {
        maximumPending?: number;
    }): Readonly<{
        run: <K, T>(key: K, operation: () => T | PromiseLike<T>, options?: {
            signal?: AbortSignal;
        }) => Promise<T>;
        activeFor: (key: unknown) => number;
        pendingFor: (key: unknown) => number;
        readonly activeCount: number;
        readonly pendingCount: number;
    }>;
    mapSettledWithConcurrency<T, R>(values: readonly T[], concurrency: number, mapper: (value: T, index: number) => R | PromiseLike<R>): Promise<PromiseSettledResult<R>[]>;
    fulfilledValues<T>(results: readonly PromiseSettledResult<T>[]): T[];
    delay(milliseconds: number, { signal }?: {
        signal?: AbortSignal;
    }): Promise<void>;
}>;
/** Frozen browser utilities for namespace-style discovery. */
export declare const browser: Readonly<{
    downloadBlob(filename: string, blob: Blob, environment?: {
        document?: Document;
        url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
        schedule?: (callback: () => void) => unknown;
    }): void;
    downloadTextFile(filename: string, content: string, { contentType, ...environment }?: {
        contentType?: string;
        document?: Document;
        url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
        schedule?: (callback: () => void) => unknown;
    }): void;
    downloadJson(filename: string, value: unknown, { space, ...environment }?: {
        space?: number | string;
        document?: Document;
        url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
        schedule?: (callback: () => void) => unknown;
    }): void;
    inputValueFromControl(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, parser?: (value: unknown) => unknown, options?: browserModule.InputControlOptions): unknown;
    matchesMediaQuery(query: string, environment?: browserModule.MediaQueryEnvironment): boolean;
    prefersColorScheme(scheme?: "dark" | "light", environment?: browserModule.MediaQueryEnvironment): boolean;
    readJsonStorage(storage: Pick<Storage, "getItem">, key: string, options?: browserModule.JsonStorageOptions): unknown;
    writeJsonStorage(storage: Pick<Storage, "setItem">, key: string, value: unknown, options?: browserModule.JsonStorageOptions): string;
}>;
/** Frozen collection utilities for namespace-style discovery. */
export declare const collection: Readonly<{
    jaccardSimilarity<L, R>(left: Iterable<L>, right: Iterable<R>, options?: {
        maximumItems?: number;
    }): number;
    upsertBy<T, K>(values: readonly T[], nextValue: T, toKey?: (value: T) => K, { prepend }?: {
        prepend?: boolean;
    }): T[];
    excludeBy<T, K>(values: readonly T[], excluded: ReadonlySet<K>, toKey?: (value: T) => K): T[];
    upsertById: <T extends {
        id: unknown;
    }>(values: readonly T[], nextValue: T) => T[];
    excludeIds: <T extends {
        id: K;
    }, K>(values: readonly T[], excluded: ReadonlySet<K>) => T[];
}>;
/** Frozen data introspection and initialization utilities. */
export declare const data: Readonly<{
    DATA_TYPES: dataModule.DataTypeMap;
    normalizeDataType(descriptor: string | Function): string;
    analyzeArrayTypes(values: readonly unknown[]): {
        length: number;
        empty: boolean;
        homogeneous: boolean;
        primaryType: string | undefined;
        types: readonly string[];
        counts: Readonly<Record<string, number>>;
    };
    defaultValueForType(descriptor: string | Function, options?: dataModule.DefaultValueOptions): unknown;
    defaultValueFor(value: unknown, options?: dataModule.DefaultValueOptions): unknown;
    initializeLike(value: unknown, options?: dataModule.InitializeLikeOptions): unknown;
}>;
/** Frozen date and time utilities for namespace-style discovery. */
export declare const date: Readonly<{
    isValidDate(value: unknown): value is Date;
    toDate(value: Date | string | number | null | undefined): Date | null;
    daysInMonth(yearOrDate: number | Date, monthIndex?: number): number;
    startOfLocalDay(value: Date | string | number): Date;
    localDateKey(value: Date | string | number): string;
    differenceInLocalDays(later: Date | string | number, earlier: Date | string | number): number;
    isSameLocalDay(left: Date | string | number, right: Date | string | number): boolean;
    isToday(value: Date | string | number, now?: Date): boolean;
    toUnixSeconds(value: Date | string | number): number;
    fromUnixSeconds(seconds: number): Date;
    normalizeInstantRange(start: Date | string | number, end: Date | string | number): {
        start: Date;
        end: Date;
    };
    isWithinInstantRange(value: Date | string | number, start: Date | string | number, end: Date | string | number, { startInclusive, endInclusive }?: {
        startInclusive?: boolean;
        endInclusive?: boolean;
    }): boolean;
    clockTimeToMinutes(value: string): number | null;
    minutesToClockTime(minutes: number): string;
    clock12To24(value: string): string | null;
    clock24To12(value: string): string | null;
    formatDate(value: Date | string | number, locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions): string;
    formatDateTime(value: Date | string | number, locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions): string;
    formatDuration(minutes: number, options?: {
        rounding?: "round" | "floor" | "ceil" | "trunc";
    }): string;
    formatRelativeTime(value: Date | string | number, locales?: Intl.LocalesArgument, options?: Intl.RelativeTimeFormatOptions & {
        base?: Date | string | number;
    }): string;
}>;
/** Frozen HTTP request and error utilities. */
export declare const http: Readonly<{
    HttpError: typeof httpModule.HttpError;
    request<T>(input: string | URL, options?: RequestInit & {
        responseType?: "auto" | "json" | "text" | "blob" | "arrayBuffer" | "response";
        timeoutMs?: number;
        maxResponseBytes?: number;
        includeErrorBody?: boolean;
        sensitiveHeaderNames?: readonly string[];
        fetchFn?: typeof fetch;
    }): Promise<T>;
    redactHeaders(headers: HeadersInit, additionalSensitiveNames?: readonly string[]): Record<string, string>;
    parseRetryAfter(value: string | null | undefined, options?: {
        now?: number;
        maximumDelaySeconds?: number;
        maximumHeaderLength?: number;
        allowFractionalSeconds?: boolean;
    }): number | undefined;
    parseContentDispositionFilename(value: string | null | undefined, options?: {
        fallback?: string;
        maximumHeaderLength?: number;
        maximumLength?: number;
    }): string | undefined;
}>;
/** Frozen checksum and deterministic hashing utilities. */
export declare const hash: Readonly<{
    sha256Hex(value: hashModule.HashInput, options?: hashModule.Sha256Options): Promise<string>;
    crc32(value: hashModule.HashInput, options?: {
        maximumBytes?: number;
    }): number;
    sha256Json(value: unknown, options?: hashModule.JsonHashOptions): Promise<string>;
    stableJsonId(prefix: string, value: unknown, options?: hashModule.JsonHashOptions & {
        hashLength?: number;
    }): Promise<string>;
}>;
/** Frozen geospatial and GeoJSON utilities. */
export declare const geo: Readonly<{
    normalizeGeoPosition(value: unknown, options?: geoModule.GeoPositionOptions): [number, number] | [number, number, number];
    isGeoPosition(value: unknown, options?: geoModule.GeoPositionOptions): boolean;
    geoPositionToObject(value: unknown, options?: geoModule.GeoPositionOptions & {
        objectKeys?: "canonical" | "short";
    }): {
        longitude: number;
        latitude: number;
        altitude?: number;
    } | {
        lng: number;
        lat: number;
        alt?: number;
    };
    haversineDistance(left: unknown, right: unknown, options?: geoModule.GeoDistanceOptions): number;
    isWithinGeoDistance(left: unknown, right: unknown, maximumDistance: number, options?: geoModule.GeoDistanceOptions): boolean;
    hasPositionWithinDistance(target: unknown, positions: readonly unknown[], maximumDistance: number, options?: geoModule.GeoSearchOptions): boolean;
    filterPositionsWithinDistance(target: unknown, positions: readonly unknown[], maximumDistance: number, options?: geoModule.GeoSearchOptions): unknown[];
    createGeoJsonFeature(geometryType: "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon", coordinates: unknown, options?: geoModule.GeoJsonFeatureOptions): {
        type: "Feature";
        geometry: {
            type: string;
            coordinates: unknown;
        };
        properties: Record<PropertyKey, unknown> | null;
        id?: string | number;
    };
    createGeoJsonFeatureCollection(features: readonly unknown[], options?: geoModule.GeoJsonCollectionOptions): {
        type: "FeatureCollection";
        features: ReturnType<typeof geoModule.createGeoJsonFeature>[];
    };
}>;
/** Frozen form-input inference and descriptor utilities. */
export declare const input: Readonly<{
    INPUT_TYPES: inputModule.InputTypeMap;
    CONTROL_TYPES: inputModule.ControlTypeMap;
    inputTypeForType(descriptor: string | Function, options?: inputModule.InputTypeOptions): inputModule.InputType | string | undefined;
    inputTypeForValue(value: unknown, options?: inputModule.InputTypeOptions): inputModule.InputType | string | undefined;
    controlTypeForType(descriptor: string | Function, options?: inputModule.InputTypeOptions): inputModule.ControlType;
    controlTypeForValue(value: unknown, options?: inputModule.InputTypeOptions): inputModule.ControlType;
    fieldDescriptorFor(name: string, value: unknown, options?: inputModule.InputFieldOptions): Readonly<{
        name: string;
        label: string;
        path: readonly (string | number)[];
        dataType: string;
        inputType: inputModule.InputType | string | undefined;
        controlType: ReturnType<typeof inputModule.controlTypeForValue>;
        defaultValue: unknown;
        arrayAnalysis: ReturnType<typeof dataModule.analyzeArrayTypes> | undefined;
    }>;
    fieldsFromData(value: Record<PropertyKey, unknown> | readonly unknown[], options?: inputModule.FieldsFromDataOptions): readonly ReturnType<typeof inputModule.fieldDescriptorFor>[];
    createInputValueParser(descriptor: string | Function, options?: inputModule.InputValueParserOptions): (value: unknown) => unknown;
    parseInputValue(value: unknown, descriptor: string | Function, options?: inputModule.InputValueParserOptions): unknown;
}>;
/** Frozen function-control utilities for namespace-style discovery. */
export declare const functionUtils: Readonly<{
    once<This, Args extends unknown[], Result>(callback: (this: This, ...args: Args) => Result, options?: functionModule.OnceOptions): (this: This, ...args: Args) => Result;
    memoize<This, Args extends unknown[], Result, Key>(callback: (this: This, ...args: Args) => Result, toKey: (this: This, ...args: Args) => Key, options?: functionModule.MemoizeOptions): ((this: This, ...args: Args) => Result) & functionModule.MemoizedControls<Key>;
    debounce<This, Args extends unknown[], Result>(callback: (this: This, ...args: Args) => Result, wait: number, options?: functionModule.DebounceOptions): ((this: This, ...args: Args) => Promise<Awaited<Result>>) & functionModule.ScheduledControls<Result>;
    throttle<This, Args extends unknown[], Result>(callback: (this: This, ...args: Args) => Result, wait: number, options?: functionModule.ThrottleOptions): ((this: This, ...args: Args) => Promise<Awaited<Result>>) & functionModule.ScheduledControls<Result>;
}>;
/** Frozen numeric utilities for namespace-style discovery. */
export declare const number: Readonly<{
    clamp(value: number, minimum: number, maximum: number): number;
    wrap(value: number, minimum: number, maximum: number): number;
    roundTo(value: number, digits?: number): number;
    sum(...values: number[]): number;
    subtract(first: number, ...rest: number[]): number;
    distance(left: number, right: number): number;
    distance2d(left: readonly [number, number], right: readonly [number, number]): number;
    fibonacci(index: number): number;
    toBinary(value: number): string;
    formatBytes(bytes: number, options?: {
        system?: "decimal" | "binary";
        maximumFractionDigits?: number;
    }): string;
    summarizeNumbers(values: readonly number[]): {
        count: number;
        minimum: number | null;
        maximum: number | null;
        median: number | null;
        p75: number | null;
        p95: number | null;
        mean: number | null;
        standardDeviation: number | null;
    };
}>;
/** Frozen object utilities for namespace-style discovery. */
export declare const object: Readonly<{
    isPlainObject(value: unknown): value is Record<PropertyKey, unknown>;
    parsePath(path: string | readonly (string | number)[]): (string | number)[];
    getAtPath<T>(value: unknown, path: string | readonly (string | number)[], fallback?: T): unknown | T;
    hasAtPath(value: unknown, path: string | readonly (string | number)[]): boolean;
    parseJsonPointer(pointer: string): string[];
    getAtJsonPointer<T>(value: unknown, pointer: string, fallback?: T): unknown | T;
    hasAtJsonPointer(value: unknown, pointer: string): boolean;
    setAtPath<T>(value: T, path: string | readonly (string | number)[], nextValue: unknown): T;
    traverseObject(value: Record<PropertyKey, unknown> | unknown[], options?: objectModule.ObjectTraversalOptions): objectModule.ObjectTraversalEntry[];
    findDeep(value: Record<PropertyKey, unknown> | unknown[], predicate: (entry: objectModule.ObjectTraversalEntry) => boolean, options?: objectModule.ObjectTraversalOptions): objectModule.ObjectTraversalEntry | undefined;
    findAllDeep(value: Record<PropertyKey, unknown> | unknown[], predicate: (entry: objectModule.ObjectTraversalEntry) => boolean, options?: objectModule.ObjectTraversalOptions & {
        maxMatches?: number;
    }): objectModule.ObjectTraversalEntry[];
    hasDeep(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: objectModule.DeepSearchOptions): boolean;
    findDeepMatch(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: objectModule.DeepSearchOptions): objectModule.ObjectTraversalEntry | undefined;
    findDeepValue(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: objectModule.DeepSearchOptions): unknown;
    findDeepParent(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: objectModule.DeepSearchOptions): objectModule.ObjectTraversalEntry["parent"];
    findAllDeepMatches(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: objectModule.DeepMatchCollectionOptions): objectModule.ObjectTraversalEntry[];
    findAllDeepValues(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: objectModule.DeepMatchCollectionOptions): unknown[];
    findAllDeepParents(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: objectModule.DeepMatchCollectionOptions): objectModule.ObjectTraversalEntry["parent"][];
    deepQuery(value: Record<PropertyKey, unknown> | unknown[], options?: objectModule.ObjectTraversalOptions): Readonly<objectModule.DeepQueryView>;
    pick<T extends object>(value: T, keys: readonly (keyof T)[]): Partial<T>;
    omit<T extends object>(value: T, keys: readonly (keyof T)[]): Partial<T>;
    deepClone<T>(value: T, options?: StructuredSerializeOptions): T;
    cloneJson<T>(value: T, options?: objectModule.JsonCloneOptions): T;
    deepMerge<T extends Record<PropertyKey, unknown>, U extends Record<PropertyKey, unknown>>(base: T, override: U): T & U;
    pickAllowed(value: unknown, allowedKeys: readonly string[], { rejectUnknown }?: {
        rejectUnknown?: boolean;
    }): Record<string, unknown>;
}>;
/** Frozen pseudo-random utilities for namespace-style discovery. */
export declare const random: Readonly<{
    randomFloat(minimum?: number, maximum?: number, random?: () => number): number;
    randomInt(minimum: number, maximum: number, options?: {
        inclusiveMaximum?: boolean;
        random?: () => number;
    }): number;
    randomBoolean(random?: () => number): boolean;
    randomString(length: number, characters?: string, random?: () => number): string;
    secureRandomUuid(): string;
    secureRandomString(length: number, alphabet?: string): string;
    randomDate(start: Date | string | number, end?: Date | string | number, random?: () => number): Date;
}>;
/** Frozen sorting utilities for namespace-style discovery. */
export declare const sort: Readonly<{
    sortBy<T, K>(values: readonly T[], toKey?: (value: T, index: number) => K, options?: {
        direction?: sortModule.SortDirection;
        nulls?: sortModule.NullPlacement;
        compare?: (left: K, right: K) => number;
    }): T[];
    sortByMany<T>(values: readonly T[], criteria: ReadonlyArray<{
        toKey: (value: T, index: number) => unknown;
        direction?: sortModule.SortDirection;
        nulls?: sortModule.NullPlacement;
        compare?: (left: any, right: any) => number;
    }>): T[];
    createCollatorComparator(locales?: Intl.LocalesArgument, options?: Intl.CollatorOptions): (left: unknown, right: unknown) => number;
    compareValues(left: unknown, right: unknown): number;
    compareNumericOrder(left: Record<string, unknown>, right: Record<string, unknown>, keys?: readonly string[]): number;
    sortByNumericOrder<T extends Record<string, unknown>>(values: readonly T[], keys?: readonly string[]): T[];
}>;
/** Frozen string utilities for namespace-style discovery. */
export declare const string: Readonly<{
    capitalize(value: string, locales?: string | string[]): string;
    kebabCase(value: string): string;
    camelCase(value: string): string;
    pascalCase(value: string): string;
    sentenceCase(value: string): string;
    includesText(value: string, search: string, { caseSensitive, locales }?: {
        caseSensitive?: boolean;
        locales?: string | string[];
    }): boolean;
    replaceMany(value: string, replacements: ReadonlyMap<string, string> | Record<string, string>): string;
    replaceRegex(value: string, pattern: RegExp, replacement: string | ((substring: string, ...args: any[]) => string)): string;
    longestStringLength(value: unknown): number;
    utf8ByteLength(value: string): number;
    countWords(value: string): number;
    splitTextByLimits(value: string, options?: {
        maximumBytes?: number | null;
        maximumWords?: number | null;
        maximumCost?: number | null;
        measureCost?: (value: string) => number;
        maximumInputLength?: number;
        maximumChunks?: number;
    }): string[];
    safeFilename(value: string, { fallback, maximumLength }?: {
        fallback?: string;
        maximumLength?: number;
    }): string;
    slugify(value: string, { fallback, maximumLength }?: {
        fallback?: string;
        maximumLength?: number;
    }): string;
    escapeHtml(value: unknown): string;
    prettyJson(value: unknown, space?: number | string): string;
    stableJson(value: unknown, options?: {
        maximumDepth?: number;
        maximumNodes?: number;
        maximumLength?: number;
    }): string;
}>;
/** Frozen validation utilities for namespace-style discovery. */
export declare const validation: Readonly<{
    isDefined<T>(value: T | null | undefined): value is T;
    isArray(value: unknown): value is unknown[];
    isString(value: unknown): value is string;
    isNumber(value: unknown): value is number;
    isBoolean(value: unknown): value is boolean;
    isNonArrayObject(value: unknown): value is object;
    isBlank(value: unknown): boolean;
    defaultIfBlank<T, U>(value: T, fallback: U): T | U;
    isEmpty(value: unknown): boolean;
    isFiniteNumber(value: unknown): value is number;
    isFiniteNonInteger(value: unknown): value is number;
    isSafeInteger(value: unknown): value is number;
    isMap(value: unknown): value is Map<unknown, unknown>;
    isSet(value: unknown): value is Set<unknown>;
    isTypedArray(value: unknown): value is Exclude<ArrayBufferView, DataView>;
    isPlainObjectArray(value: unknown): value is Record<PropertyKey, unknown>[];
    isBlob(value: unknown): value is Blob;
    isFile(value: unknown): value is File;
    typeOf(value: unknown): string;
    isJson(value: unknown): value is string;
    isEmail(value: unknown): value is string;
    normalizeNanpPhone(value: unknown): string | null;
    formatNanpPhone(value: unknown): string | null;
    normalizePortableRelativePath(value: string, options?: validationModule.PortableRelativePathOptions): string;
    normalizePortableRelativePaths(values: readonly string[], options?: validationModule.PortableRelativePathOptions & {
        maximumPaths?: number;
        caseSensitive?: boolean;
    }): ReadonlyArray<string>;
    validateJsonContract(value: unknown, schema: validationModule.JsonContract): string[];
    assertJsonContract<T>(value: T, schema: validationModule.JsonContract): T;
}>;
/**
 * Akashatools' discoverable convenience namespace.
 *
 * Utilities appear both as flat properties (`akasha.chunk`) and within frozen
 * categories (`akasha.array.chunk`). Focused named and subpath imports remain the
 * recommended choice when bundle size is the primary concern.
 *
 * @example
 * import akasha from "akashatools";
 * akasha.array.chunk([1, 2, 3], 2);
 * akasha.chunk([1, 2, 3], 2);
 */
export declare const akasha: Readonly<{
    isPlainObject: typeof objectModule.isPlainObject;
    parsePath: typeof objectModule.parsePath;
    getAtPath: typeof objectModule.getAtPath;
    hasAtPath: typeof objectModule.hasAtPath;
    parseJsonPointer: typeof objectModule.parseJsonPointer;
    getAtJsonPointer: typeof objectModule.getAtJsonPointer;
    hasAtJsonPointer: typeof objectModule.hasAtJsonPointer;
    setAtPath: typeof objectModule.setAtPath;
    traverseObject: typeof objectModule.traverseObject;
    findDeep: typeof objectModule.findDeep;
    findAllDeep: typeof objectModule.findAllDeep;
    hasDeep: typeof objectModule.hasDeep;
    findDeepMatch: typeof objectModule.findDeepMatch;
    findDeepValue: typeof objectModule.findDeepValue;
    findDeepParent: typeof objectModule.findDeepParent;
    findAllDeepMatches: typeof objectModule.findAllDeepMatches;
    findAllDeepValues: typeof objectModule.findAllDeepValues;
    findAllDeepParents: typeof objectModule.findAllDeepParents;
    deepQuery: typeof objectModule.deepQuery;
    pick: typeof objectModule.pick;
    omit: typeof objectModule.omit;
    deepClone: typeof objectModule.deepClone;
    cloneJson: typeof objectModule.cloneJson;
    deepMerge: typeof objectModule.deepMerge;
    pickAllowed: typeof objectModule.pickAllowed;
    sortBy: typeof sortModule.sortBy;
    sortByMany: typeof sortModule.sortByMany;
    createCollatorComparator: typeof sortModule.createCollatorComparator;
    compareValues: typeof sortModule.compareValues;
    compareNumericOrder: typeof sortModule.compareNumericOrder;
    sortByNumericOrder: typeof sortModule.sortByNumericOrder;
    asArray: typeof arrayModule.asArray;
    isNonEmptyArray: typeof arrayModule.isNonEmptyArray;
    compact: typeof arrayModule.compact;
    chunk: typeof arrayModule.chunk;
    unique: typeof arrayModule.unique;
    flatten: typeof arrayModule.flatten;
    moveItem: typeof arrayModule.moveItem;
    insertItem: typeof arrayModule.insertItem;
    removeFromArray: typeof arrayModule.removeFromArray;
    groupBy: typeof arrayModule.groupBy;
    keyBy: typeof arrayModule.keyBy;
    countBy: typeof arrayModule.countBy;
    partition: typeof arrayModule.partition;
    lowerBound: typeof arrayModule.lowerBound;
    upperBound: typeof arrayModule.upperBound;
    binarySearch: typeof arrayModule.binarySearch;
    intersection: typeof arrayModule.intersection;
    range: typeof arrayModule.range;
    zip: typeof arrayModule.zip;
    shuffle: typeof arrayModule.shuffle;
    createSingleFlight: typeof asyncModule.createSingleFlight;
    createKeyedSingleFlight: typeof asyncModule.createKeyedSingleFlight;
    createConcurrencyLimiter: typeof asyncModule.createConcurrencyLimiter;
    createKeyedConcurrencyLimiter: typeof asyncModule.createKeyedConcurrencyLimiter;
    mapSettledWithConcurrency: typeof asyncModule.mapSettledWithConcurrency;
    fulfilledValues: typeof asyncModule.fulfilledValues;
    delay: typeof asyncModule.delay;
    capitalize: typeof stringModule.capitalize;
    kebabCase: typeof stringModule.kebabCase;
    camelCase: typeof stringModule.camelCase;
    pascalCase: typeof stringModule.pascalCase;
    sentenceCase: typeof stringModule.sentenceCase;
    includesText: typeof stringModule.includesText;
    replaceMany: typeof stringModule.replaceMany;
    replaceRegex: typeof stringModule.replaceRegex;
    longestStringLength: typeof stringModule.longestStringLength;
    utf8ByteLength: typeof stringModule.utf8ByteLength;
    countWords: typeof stringModule.countWords;
    splitTextByLimits: typeof stringModule.splitTextByLimits;
    safeFilename: typeof stringModule.safeFilename;
    slugify: typeof stringModule.slugify;
    escapeHtml: typeof stringModule.escapeHtml;
    prettyJson: typeof stringModule.prettyJson;
    stableJson: typeof stringModule.stableJson;
    downloadBlob: typeof browserModule.downloadBlob;
    downloadTextFile: typeof browserModule.downloadTextFile;
    downloadJson: typeof browserModule.downloadJson;
    inputValueFromControl: typeof browserModule.inputValueFromControl;
    matchesMediaQuery: typeof browserModule.matchesMediaQuery;
    prefersColorScheme: typeof browserModule.prefersColorScheme;
    readJsonStorage: typeof browserModule.readJsonStorage;
    writeJsonStorage: typeof browserModule.writeJsonStorage;
    jaccardSimilarity: typeof collectionModule.jaccardSimilarity;
    upsertBy: typeof collectionModule.upsertBy;
    excludeBy: typeof collectionModule.excludeBy;
    upsertById: <T extends {
        id: unknown;
    }>(values: readonly T[], nextValue: T) => T[];
    excludeIds: <T extends {
        id: K;
    }, K>(values: readonly T[], excluded: ReadonlySet<K>) => T[];
    isDefined: typeof validationModule.isDefined;
    isArray: typeof validationModule.isArray;
    isString: typeof validationModule.isString;
    isNumber: typeof validationModule.isNumber;
    isBoolean: typeof validationModule.isBoolean;
    isNonArrayObject: typeof validationModule.isNonArrayObject;
    isBlank: typeof validationModule.isBlank;
    defaultIfBlank: typeof validationModule.defaultIfBlank;
    isEmpty: typeof validationModule.isEmpty;
    isFiniteNumber: typeof validationModule.isFiniteNumber;
    isFiniteNonInteger: typeof validationModule.isFiniteNonInteger;
    isSafeInteger: typeof validationModule.isSafeInteger;
    isMap: typeof validationModule.isMap;
    isSet: typeof validationModule.isSet;
    isTypedArray: typeof validationModule.isTypedArray;
    isPlainObjectArray: typeof validationModule.isPlainObjectArray;
    isBlob: typeof validationModule.isBlob;
    isFile: typeof validationModule.isFile;
    typeOf: typeof validationModule.typeOf;
    isJson: typeof validationModule.isJson;
    isEmail: typeof validationModule.isEmail;
    normalizeNanpPhone: typeof validationModule.normalizeNanpPhone;
    formatNanpPhone: typeof validationModule.formatNanpPhone;
    normalizePortableRelativePath: typeof validationModule.normalizePortableRelativePath;
    normalizePortableRelativePaths: typeof validationModule.normalizePortableRelativePaths;
    validateJsonContract: typeof validationModule.validateJsonContract;
    assertJsonContract: typeof validationModule.assertJsonContract;
    DATA_TYPES: dataModule.DataTypeMap;
    normalizeDataType: typeof dataModule.normalizeDataType;
    analyzeArrayTypes: typeof dataModule.analyzeArrayTypes;
    defaultValueForType: typeof dataModule.defaultValueForType;
    defaultValueFor: typeof dataModule.defaultValueFor;
    initializeLike: typeof dataModule.initializeLike;
    isValidDate: typeof dateModule.isValidDate;
    toDate: typeof dateModule.toDate;
    daysInMonth: typeof dateModule.daysInMonth;
    startOfLocalDay: typeof dateModule.startOfLocalDay;
    localDateKey: typeof dateModule.localDateKey;
    differenceInLocalDays: typeof dateModule.differenceInLocalDays;
    isSameLocalDay: typeof dateModule.isSameLocalDay;
    isToday: typeof dateModule.isToday;
    toUnixSeconds: typeof dateModule.toUnixSeconds;
    fromUnixSeconds: typeof dateModule.fromUnixSeconds;
    normalizeInstantRange: typeof dateModule.normalizeInstantRange;
    isWithinInstantRange: typeof dateModule.isWithinInstantRange;
    clockTimeToMinutes: typeof dateModule.clockTimeToMinutes;
    minutesToClockTime: typeof dateModule.minutesToClockTime;
    clock12To24: typeof dateModule.clock12To24;
    clock24To12: typeof dateModule.clock24To12;
    formatDate: typeof dateModule.formatDate;
    formatDateTime: typeof dateModule.formatDateTime;
    formatDuration: typeof dateModule.formatDuration;
    formatRelativeTime: typeof dateModule.formatRelativeTime;
    once: typeof functionModule.once;
    memoize: typeof functionModule.memoize;
    debounce: typeof functionModule.debounce;
    throttle: typeof functionModule.throttle;
    normalizeGeoPosition: typeof geoModule.normalizeGeoPosition;
    isGeoPosition: typeof geoModule.isGeoPosition;
    geoPositionToObject: typeof geoModule.geoPositionToObject;
    haversineDistance: typeof geoModule.haversineDistance;
    isWithinGeoDistance: typeof geoModule.isWithinGeoDistance;
    hasPositionWithinDistance: typeof geoModule.hasPositionWithinDistance;
    filterPositionsWithinDistance: typeof geoModule.filterPositionsWithinDistance;
    createGeoJsonFeature: typeof geoModule.createGeoJsonFeature;
    createGeoJsonFeatureCollection: typeof geoModule.createGeoJsonFeatureCollection;
    sha256Hex: typeof hashModule.sha256Hex;
    crc32: typeof hashModule.crc32;
    sha256Json: typeof hashModule.sha256Json;
    stableJsonId: typeof hashModule.stableJsonId;
    HttpError: typeof httpModule.HttpError;
    request: typeof httpModule.request;
    redactHeaders: typeof httpModule.redactHeaders;
    parseRetryAfter: typeof httpModule.parseRetryAfter;
    parseContentDispositionFilename: typeof httpModule.parseContentDispositionFilename;
    INPUT_TYPES: inputModule.InputTypeMap;
    CONTROL_TYPES: inputModule.ControlTypeMap;
    inputTypeForType: typeof inputModule.inputTypeForType;
    inputTypeForValue: typeof inputModule.inputTypeForValue;
    controlTypeForType: typeof inputModule.controlTypeForType;
    controlTypeForValue: typeof inputModule.controlTypeForValue;
    fieldDescriptorFor: typeof inputModule.fieldDescriptorFor;
    fieldsFromData: typeof inputModule.fieldsFromData;
    createInputValueParser: typeof inputModule.createInputValueParser;
    parseInputValue: typeof inputModule.parseInputValue;
    clamp: typeof numberModule.clamp;
    wrap: typeof numberModule.wrap;
    roundTo: typeof numberModule.roundTo;
    sum: typeof numberModule.sum;
    subtract: typeof numberModule.subtract;
    distance: typeof numberModule.distance;
    distance2d: typeof numberModule.distance2d;
    fibonacci: typeof numberModule.fibonacci;
    toBinary: typeof numberModule.toBinary;
    formatBytes: typeof numberModule.formatBytes;
    summarizeNumbers: typeof numberModule.summarizeNumbers;
    randomFloat: typeof randomModule.randomFloat;
    randomInt: typeof randomModule.randomInt;
    randomBoolean: typeof randomModule.randomBoolean;
    randomString: typeof randomModule.randomString;
    secureRandomUuid: typeof randomModule.secureRandomUuid;
    secureRandomString: typeof randomModule.secureRandomString;
    randomDate: typeof randomModule.randomDate;
    array: Readonly<{
        asArray<T>(value: unknown, fallback?: readonly T[]): T[];
        isNonEmptyArray<T>(value: unknown): value is T[];
        compact<T>(values: readonly (T | null | undefined)[]): T[];
        chunk<T>(values: readonly T[], size: number): T[][];
        unique<T>(values: readonly T[], toKey?: (value: T, index: number) => unknown): T[];
        flatten<T>(values: readonly T[], depth?: number): unknown[];
        moveItem<T>(values: readonly T[], fromIndex: number, toIndex: number): T[];
        insertItem<T>(values: readonly T[], index: number, item: T): T[];
        removeFromArray<T>(values: readonly T[], selector: number | T | ((value: T, index: number, values: readonly T[]) => boolean), options?: {
            mode?: arrayModule.RemovalMode;
            all?: boolean;
        }): T[];
        groupBy<T, K>(values: readonly T[], toKey: (value: T, index: number) => K): Map<K, T[]>;
        keyBy<T, K>(values: readonly T[], toKey: (value: T, index: number, values: readonly T[]) => K, options?: {
            onDuplicate?: arrayModule.DuplicateKeyPolicy;
        }): Map<K, T>;
        countBy<T>(values: readonly T[]): Map<T, number>;
        countBy<T, K>(values: readonly T[], toKey: (value: T, index: number, values: readonly T[]) => K): Map<K, number>;
        partition<T>(values: readonly T[], predicate: (value: T, index: number, values: readonly T[]) => boolean): [T[], T[]];
        lowerBound<T, U>(values: readonly T[], needle: U, compare?: (value: T, needle: U) => number): number;
        upperBound<T, U>(values: readonly T[], needle: U, compare?: (value: T, needle: U) => number): number;
        binarySearch<T, U>(values: readonly T[], needle: U, compare?: (value: T, needle: U) => number): number;
        intersection<T>(...arrays: (readonly T[])[]): T[];
        range(start: number, end?: number, step?: number): number[];
        zip(...arrays: (readonly unknown[])[]): unknown[][];
        shuffle<T>(values: readonly T[], random?: () => number): T[];
    }>;
    async: Readonly<{
        createSingleFlight<T>(loader: () => T | PromiseLike<T>, options?: {
            ttl?: number;
            now?: () => number;
            shouldCache?: (value: T) => boolean;
        }): Readonly<{
            load: () => Promise<T>;
            invalidate: () => void;
        }>;
        createKeyedSingleFlight<K, V>(loader: (key: K) => V | PromiseLike<V>, options?: {
            ttl?: number;
            now?: () => number;
            shouldCache?: (value: V) => boolean;
            maximumSize?: number;
        }): Readonly<{
            load: (key: K) => Promise<V>;
            invalidate: (key: K) => boolean;
            invalidateAll: () => number;
            readonly size: number;
        }>;
        createConcurrencyLimiter(maximumConcurrency: number, options?: {
            maximumPending?: number;
        }): Readonly<{
            run: <T>(operation: () => T | PromiseLike<T>, options?: {
                signal?: AbortSignal;
            }) => Promise<T>;
            readonly activeCount: number;
            readonly pendingCount: number;
        }>;
        createKeyedConcurrencyLimiter(maximumConcurrency: number, maximumConcurrencyPerKey: number, options?: {
            maximumPending?: number;
        }): Readonly<{
            run: <K, T>(key: K, operation: () => T | PromiseLike<T>, options?: {
                signal?: AbortSignal;
            }) => Promise<T>;
            activeFor: (key: unknown) => number;
            pendingFor: (key: unknown) => number;
            readonly activeCount: number;
            readonly pendingCount: number;
        }>;
        mapSettledWithConcurrency<T, R>(values: readonly T[], concurrency: number, mapper: (value: T, index: number) => R | PromiseLike<R>): Promise<PromiseSettledResult<R>[]>;
        fulfilledValues<T>(results: readonly PromiseSettledResult<T>[]): T[];
        delay(milliseconds: number, { signal }?: {
            signal?: AbortSignal;
        }): Promise<void>;
    }>;
    browser: Readonly<{
        downloadBlob(filename: string, blob: Blob, environment?: {
            document?: Document;
            url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
            schedule?: (callback: () => void) => unknown;
        }): void;
        downloadTextFile(filename: string, content: string, { contentType, ...environment }?: {
            contentType?: string;
            document?: Document;
            url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
            schedule?: (callback: () => void) => unknown;
        }): void;
        downloadJson(filename: string, value: unknown, { space, ...environment }?: {
            space?: number | string;
            document?: Document;
            url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
            schedule?: (callback: () => void) => unknown;
        }): void;
        inputValueFromControl(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, parser?: (value: unknown) => unknown, options?: browserModule.InputControlOptions): unknown;
        matchesMediaQuery(query: string, environment?: browserModule.MediaQueryEnvironment): boolean;
        prefersColorScheme(scheme?: "dark" | "light", environment?: browserModule.MediaQueryEnvironment): boolean;
        readJsonStorage(storage: Pick<Storage, "getItem">, key: string, options?: browserModule.JsonStorageOptions): unknown;
        writeJsonStorage(storage: Pick<Storage, "setItem">, key: string, value: unknown, options?: browserModule.JsonStorageOptions): string;
    }>;
    collection: Readonly<{
        jaccardSimilarity<L, R>(left: Iterable<L>, right: Iterable<R>, options?: {
            maximumItems?: number;
        }): number;
        upsertBy<T, K>(values: readonly T[], nextValue: T, toKey?: (value: T) => K, { prepend }?: {
            prepend?: boolean;
        }): T[];
        excludeBy<T, K>(values: readonly T[], excluded: ReadonlySet<K>, toKey?: (value: T) => K): T[];
        upsertById: <T extends {
            id: unknown;
        }>(values: readonly T[], nextValue: T) => T[];
        excludeIds: <T extends {
            id: K;
        }, K>(values: readonly T[], excluded: ReadonlySet<K>) => T[];
    }>;
    data: Readonly<{
        DATA_TYPES: dataModule.DataTypeMap;
        normalizeDataType(descriptor: string | Function): string;
        analyzeArrayTypes(values: readonly unknown[]): {
            length: number;
            empty: boolean;
            homogeneous: boolean;
            primaryType: string | undefined;
            types: readonly string[];
            counts: Readonly<Record<string, number>>;
        };
        defaultValueForType(descriptor: string | Function, options?: dataModule.DefaultValueOptions): unknown;
        defaultValueFor(value: unknown, options?: dataModule.DefaultValueOptions): unknown;
        initializeLike(value: unknown, options?: dataModule.InitializeLikeOptions): unknown;
    }>;
    date: Readonly<{
        isValidDate(value: unknown): value is Date;
        toDate(value: Date | string | number | null | undefined): Date | null;
        daysInMonth(yearOrDate: number | Date, monthIndex?: number): number;
        startOfLocalDay(value: Date | string | number): Date;
        localDateKey(value: Date | string | number): string;
        differenceInLocalDays(later: Date | string | number, earlier: Date | string | number): number;
        isSameLocalDay(left: Date | string | number, right: Date | string | number): boolean;
        isToday(value: Date | string | number, now?: Date): boolean;
        toUnixSeconds(value: Date | string | number): number;
        fromUnixSeconds(seconds: number): Date;
        normalizeInstantRange(start: Date | string | number, end: Date | string | number): {
            start: Date;
            end: Date;
        };
        isWithinInstantRange(value: Date | string | number, start: Date | string | number, end: Date | string | number, { startInclusive, endInclusive }?: {
            startInclusive?: boolean;
            endInclusive?: boolean;
        }): boolean;
        clockTimeToMinutes(value: string): number | null;
        minutesToClockTime(minutes: number): string;
        clock12To24(value: string): string | null;
        clock24To12(value: string): string | null;
        formatDate(value: Date | string | number, locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions): string;
        formatDateTime(value: Date | string | number, locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions): string;
        formatDuration(minutes: number, options?: {
            rounding?: "round" | "floor" | "ceil" | "trunc";
        }): string;
        formatRelativeTime(value: Date | string | number, locales?: Intl.LocalesArgument, options?: Intl.RelativeTimeFormatOptions & {
            base?: Date | string | number;
        }): string;
    }>;
    http: Readonly<{
        HttpError: typeof httpModule.HttpError;
        request<T>(input: string | URL, options?: RequestInit & {
            responseType?: "auto" | "json" | "text" | "blob" | "arrayBuffer" | "response";
            timeoutMs?: number;
            maxResponseBytes?: number;
            includeErrorBody?: boolean;
            sensitiveHeaderNames?: readonly string[];
            fetchFn?: typeof fetch;
        }): Promise<T>;
        redactHeaders(headers: HeadersInit, additionalSensitiveNames?: readonly string[]): Record<string, string>;
        parseRetryAfter(value: string | null | undefined, options?: {
            now?: number;
            maximumDelaySeconds?: number;
            maximumHeaderLength?: number;
            allowFractionalSeconds?: boolean;
        }): number | undefined;
        parseContentDispositionFilename(value: string | null | undefined, options?: {
            fallback?: string;
            maximumHeaderLength?: number;
            maximumLength?: number;
        }): string | undefined;
    }>;
    hash: Readonly<{
        sha256Hex(value: hashModule.HashInput, options?: hashModule.Sha256Options): Promise<string>;
        crc32(value: hashModule.HashInput, options?: {
            maximumBytes?: number;
        }): number;
        sha256Json(value: unknown, options?: hashModule.JsonHashOptions): Promise<string>;
        stableJsonId(prefix: string, value: unknown, options?: hashModule.JsonHashOptions & {
            hashLength?: number;
        }): Promise<string>;
    }>;
    geo: Readonly<{
        normalizeGeoPosition(value: unknown, options?: geoModule.GeoPositionOptions): [number, number] | [number, number, number];
        isGeoPosition(value: unknown, options?: geoModule.GeoPositionOptions): boolean;
        geoPositionToObject(value: unknown, options?: geoModule.GeoPositionOptions & {
            objectKeys?: "canonical" | "short";
        }): {
            longitude: number;
            latitude: number;
            altitude?: number;
        } | {
            lng: number;
            lat: number;
            alt?: number;
        };
        haversineDistance(left: unknown, right: unknown, options?: geoModule.GeoDistanceOptions): number;
        isWithinGeoDistance(left: unknown, right: unknown, maximumDistance: number, options?: geoModule.GeoDistanceOptions): boolean;
        hasPositionWithinDistance(target: unknown, positions: readonly unknown[], maximumDistance: number, options?: geoModule.GeoSearchOptions): boolean;
        filterPositionsWithinDistance(target: unknown, positions: readonly unknown[], maximumDistance: number, options?: geoModule.GeoSearchOptions): unknown[];
        createGeoJsonFeature(geometryType: "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon", coordinates: unknown, options?: geoModule.GeoJsonFeatureOptions): {
            type: "Feature";
            geometry: {
                type: string;
                coordinates: unknown;
            };
            properties: Record<PropertyKey, unknown> | null;
            id?: string | number;
        };
        createGeoJsonFeatureCollection(features: readonly unknown[], options?: geoModule.GeoJsonCollectionOptions): {
            type: "FeatureCollection";
            features: ReturnType<typeof geoModule.createGeoJsonFeature>[];
        };
    }>;
    input: Readonly<{
        INPUT_TYPES: inputModule.InputTypeMap;
        CONTROL_TYPES: inputModule.ControlTypeMap;
        inputTypeForType(descriptor: string | Function, options?: inputModule.InputTypeOptions): inputModule.InputType | string | undefined;
        inputTypeForValue(value: unknown, options?: inputModule.InputTypeOptions): inputModule.InputType | string | undefined;
        controlTypeForType(descriptor: string | Function, options?: inputModule.InputTypeOptions): inputModule.ControlType;
        controlTypeForValue(value: unknown, options?: inputModule.InputTypeOptions): inputModule.ControlType;
        fieldDescriptorFor(name: string, value: unknown, options?: inputModule.InputFieldOptions): Readonly<{
            name: string;
            label: string;
            path: readonly (string | number)[];
            dataType: string;
            inputType: inputModule.InputType | string | undefined;
            controlType: ReturnType<typeof inputModule.controlTypeForValue>;
            defaultValue: unknown;
            arrayAnalysis: ReturnType<typeof dataModule.analyzeArrayTypes> | undefined;
        }>;
        fieldsFromData(value: Record<PropertyKey, unknown> | readonly unknown[], options?: inputModule.FieldsFromDataOptions): readonly ReturnType<typeof inputModule.fieldDescriptorFor>[];
        createInputValueParser(descriptor: string | Function, options?: inputModule.InputValueParserOptions): (value: unknown) => unknown;
        parseInputValue(value: unknown, descriptor: string | Function, options?: inputModule.InputValueParserOptions): unknown;
    }>;
    function: Readonly<{
        once<This, Args extends unknown[], Result>(callback: (this: This, ...args: Args) => Result, options?: functionModule.OnceOptions): (this: This, ...args: Args) => Result;
        memoize<This, Args extends unknown[], Result, Key>(callback: (this: This, ...args: Args) => Result, toKey: (this: This, ...args: Args) => Key, options?: functionModule.MemoizeOptions): ((this: This, ...args: Args) => Result) & functionModule.MemoizedControls<Key>;
        debounce<This, Args extends unknown[], Result>(callback: (this: This, ...args: Args) => Result, wait: number, options?: functionModule.DebounceOptions): ((this: This, ...args: Args) => Promise<Awaited<Result>>) & functionModule.ScheduledControls<Result>;
        throttle<This, Args extends unknown[], Result>(callback: (this: This, ...args: Args) => Result, wait: number, options?: functionModule.ThrottleOptions): ((this: This, ...args: Args) => Promise<Awaited<Result>>) & functionModule.ScheduledControls<Result>;
    }>;
    number: Readonly<{
        clamp(value: number, minimum: number, maximum: number): number;
        wrap(value: number, minimum: number, maximum: number): number;
        roundTo(value: number, digits?: number): number;
        sum(...values: number[]): number;
        subtract(first: number, ...rest: number[]): number;
        distance(left: number, right: number): number;
        distance2d(left: readonly [number, number], right: readonly [number, number]): number;
        fibonacci(index: number): number;
        toBinary(value: number): string;
        formatBytes(bytes: number, options?: {
            system?: "decimal" | "binary";
            maximumFractionDigits?: number;
        }): string;
        summarizeNumbers(values: readonly number[]): {
            count: number;
            minimum: number | null;
            maximum: number | null;
            median: number | null;
            p75: number | null;
            p95: number | null;
            mean: number | null;
            standardDeviation: number | null;
        };
    }>;
    object: Readonly<{
        isPlainObject(value: unknown): value is Record<PropertyKey, unknown>;
        parsePath(path: string | readonly (string | number)[]): (string | number)[];
        getAtPath<T>(value: unknown, path: string | readonly (string | number)[], fallback?: T): unknown | T;
        hasAtPath(value: unknown, path: string | readonly (string | number)[]): boolean;
        parseJsonPointer(pointer: string): string[];
        getAtJsonPointer<T>(value: unknown, pointer: string, fallback?: T): unknown | T;
        hasAtJsonPointer(value: unknown, pointer: string): boolean;
        setAtPath<T>(value: T, path: string | readonly (string | number)[], nextValue: unknown): T;
        traverseObject(value: Record<PropertyKey, unknown> | unknown[], options?: objectModule.ObjectTraversalOptions): objectModule.ObjectTraversalEntry[];
        findDeep(value: Record<PropertyKey, unknown> | unknown[], predicate: (entry: objectModule.ObjectTraversalEntry) => boolean, options?: objectModule.ObjectTraversalOptions): objectModule.ObjectTraversalEntry | undefined;
        findAllDeep(value: Record<PropertyKey, unknown> | unknown[], predicate: (entry: objectModule.ObjectTraversalEntry) => boolean, options?: objectModule.ObjectTraversalOptions & {
            maxMatches?: number;
        }): objectModule.ObjectTraversalEntry[];
        hasDeep(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: objectModule.DeepSearchOptions): boolean;
        findDeepMatch(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: objectModule.DeepSearchOptions): objectModule.ObjectTraversalEntry | undefined;
        findDeepValue(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: objectModule.DeepSearchOptions): unknown;
        findDeepParent(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: objectModule.DeepSearchOptions): objectModule.ObjectTraversalEntry["parent"];
        findAllDeepMatches(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: objectModule.DeepMatchCollectionOptions): objectModule.ObjectTraversalEntry[];
        findAllDeepValues(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: objectModule.DeepMatchCollectionOptions): unknown[];
        findAllDeepParents(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: objectModule.DeepMatchCollectionOptions): objectModule.ObjectTraversalEntry["parent"][];
        deepQuery(value: Record<PropertyKey, unknown> | unknown[], options?: objectModule.ObjectTraversalOptions): Readonly<objectModule.DeepQueryView>;
        pick<T extends object>(value: T, keys: readonly (keyof T)[]): Partial<T>;
        omit<T extends object>(value: T, keys: readonly (keyof T)[]): Partial<T>;
        deepClone<T>(value: T, options?: StructuredSerializeOptions): T;
        cloneJson<T>(value: T, options?: objectModule.JsonCloneOptions): T;
        deepMerge<T extends Record<PropertyKey, unknown>, U extends Record<PropertyKey, unknown>>(base: T, override: U): T & U;
        pickAllowed(value: unknown, allowedKeys: readonly string[], { rejectUnknown }?: {
            rejectUnknown?: boolean;
        }): Record<string, unknown>;
    }>;
    random: Readonly<{
        randomFloat(minimum?: number, maximum?: number, random?: () => number): number;
        randomInt(minimum: number, maximum: number, options?: {
            inclusiveMaximum?: boolean;
            random?: () => number;
        }): number;
        randomBoolean(random?: () => number): boolean;
        randomString(length: number, characters?: string, random?: () => number): string;
        secureRandomUuid(): string;
        secureRandomString(length: number, alphabet?: string): string;
        randomDate(start: Date | string | number, end?: Date | string | number, random?: () => number): Date;
    }>;
    sort: Readonly<{
        sortBy<T, K>(values: readonly T[], toKey?: (value: T, index: number) => K, options?: {
            direction?: sortModule.SortDirection;
            nulls?: sortModule.NullPlacement;
            compare?: (left: K, right: K) => number;
        }): T[];
        sortByMany<T>(values: readonly T[], criteria: ReadonlyArray<{
            toKey: (value: T, index: number) => unknown;
            direction?: sortModule.SortDirection;
            nulls?: sortModule.NullPlacement;
            compare?: (left: any, right: any) => number;
        }>): T[];
        createCollatorComparator(locales?: Intl.LocalesArgument, options?: Intl.CollatorOptions): (left: unknown, right: unknown) => number;
        compareValues(left: unknown, right: unknown): number;
        compareNumericOrder(left: Record<string, unknown>, right: Record<string, unknown>, keys?: readonly string[]): number;
        sortByNumericOrder<T extends Record<string, unknown>>(values: readonly T[], keys?: readonly string[]): T[];
    }>;
    string: Readonly<{
        capitalize(value: string, locales?: string | string[]): string;
        kebabCase(value: string): string;
        camelCase(value: string): string;
        pascalCase(value: string): string;
        sentenceCase(value: string): string;
        includesText(value: string, search: string, { caseSensitive, locales }?: {
            caseSensitive?: boolean;
            locales?: string | string[];
        }): boolean;
        replaceMany(value: string, replacements: ReadonlyMap<string, string> | Record<string, string>): string;
        replaceRegex(value: string, pattern: RegExp, replacement: string | ((substring: string, ...args: any[]) => string)): string;
        longestStringLength(value: unknown): number;
        utf8ByteLength(value: string): number;
        countWords(value: string): number;
        splitTextByLimits(value: string, options?: {
            maximumBytes?: number | null;
            maximumWords?: number | null;
            maximumCost?: number | null;
            measureCost?: (value: string) => number;
            maximumInputLength?: number;
            maximumChunks?: number;
        }): string[];
        safeFilename(value: string, { fallback, maximumLength }?: {
            fallback?: string;
            maximumLength?: number;
        }): string;
        slugify(value: string, { fallback, maximumLength }?: {
            fallback?: string;
            maximumLength?: number;
        }): string;
        escapeHtml(value: unknown): string;
        prettyJson(value: unknown, space?: number | string): string;
        stableJson(value: unknown, options?: {
            maximumDepth?: number;
            maximumNodes?: number;
            maximumLength?: number;
        }): string;
    }>;
    validation: Readonly<{
        isDefined<T>(value: T | null | undefined): value is T;
        isArray(value: unknown): value is unknown[];
        isString(value: unknown): value is string;
        isNumber(value: unknown): value is number;
        isBoolean(value: unknown): value is boolean;
        isNonArrayObject(value: unknown): value is object;
        isBlank(value: unknown): boolean;
        defaultIfBlank<T, U>(value: T, fallback: U): T | U;
        isEmpty(value: unknown): boolean;
        isFiniteNumber(value: unknown): value is number;
        isFiniteNonInteger(value: unknown): value is number;
        isSafeInteger(value: unknown): value is number;
        isMap(value: unknown): value is Map<unknown, unknown>;
        isSet(value: unknown): value is Set<unknown>;
        isTypedArray(value: unknown): value is Exclude<ArrayBufferView, DataView>;
        isPlainObjectArray(value: unknown): value is Record<PropertyKey, unknown>[];
        isBlob(value: unknown): value is Blob;
        isFile(value: unknown): value is File;
        typeOf(value: unknown): string;
        isJson(value: unknown): value is string;
        isEmail(value: unknown): value is string;
        normalizeNanpPhone(value: unknown): string | null;
        formatNanpPhone(value: unknown): string | null;
        normalizePortableRelativePath(value: string, options?: validationModule.PortableRelativePathOptions): string;
        normalizePortableRelativePaths(values: readonly string[], options?: validationModule.PortableRelativePathOptions & {
            maximumPaths?: number;
            caseSensitive?: boolean;
        }): ReadonlyArray<string>;
        validateJsonContract(value: unknown, schema: validationModule.JsonContract): string[];
        assertJsonContract<T>(value: T, schema: validationModule.JsonContract): T;
    }>;
}>;
