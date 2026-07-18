/**
 * Shared immutable identifiers for public data, native-input, and renderer
 * control contracts. Public category modules expose these same object
 * identities; this internal home prevents data/validation/input import cycles.
 */
export declare const dataTypes: Readonly<{
    ANY: "any";
    ARRAY: "array";
    ARRAY_BUFFER: "arraybuffer";
    BIGINT: "bigint";
    BIGINT64_ARRAY: "bigint64array";
    BIGUINT64_ARRAY: "biguint64array";
    BLOB: "blob";
    BOOLEAN: "boolean";
    DATA: "data";
    DATA_VIEW: "dataview";
    DATE: "date";
    ERROR: "error";
    FILE: "file";
    FLOAT32_ARRAY: "float32array";
    FLOAT64_ARRAY: "float64array";
    FORM_DATA: "formdata";
    FUNCTION: "function";
    INT8_ARRAY: "int8array";
    INT16_ARRAY: "int16array";
    INT32_ARRAY: "int32array";
    INTEGER: "integer";
    MAP: "map";
    NAN: "nan";
    NULL: "null";
    NUMBER: "number";
    OBJECT: "object";
    PROMISE: "promise";
    REGEXP: "regexp";
    SET: "set";
    SHARED_ARRAY_BUFFER: "sharedarraybuffer";
    STRING: "string";
    SYMBOL: "symbol";
    UINT8_ARRAY: "uint8array";
    UINT8_CLAMPED_ARRAY: "uint8clampedarray";
    UINT16_ARRAY: "uint16array";
    UINT32_ARRAY: "uint32array";
    UNDEFINED: "undefined";
    URL: "url";
    URL_SEARCH_PARAMS: "urlsearchparams";
    WEAK_MAP: "weakmap";
    WEAK_SET: "weakset";
}>;
export declare const inputTypes: Readonly<{
    BUTTON: "button";
    CHECKBOX: "checkbox";
    COLOR: "color";
    DATE: "date";
    DATETIME_LOCAL: "datetime-local";
    EMAIL: "email";
    FILE: "file";
    HIDDEN: "hidden";
    IMAGE: "image";
    MONTH: "month";
    NUMBER: "number";
    PASSWORD: "password";
    RADIO: "radio";
    RANGE: "range";
    RESET: "reset";
    SEARCH: "search";
    SUBMIT: "submit";
    TEL: "tel";
    TEXT: "text";
    TIME: "time";
    URL: "url";
    WEEK: "week";
}>;
export declare const controlTypes: Readonly<{
    ARRAY: "array";
    INPUT: "input";
    MAP: "map";
    MIXED_ARRAY: "mixed-array";
    NESTED_ARRAY: "nested-array";
    OBJECT: "object";
    OBJECT_ARRAY: "object-array";
    SCALAR_ARRAY: "scalar-array";
    SET: "set";
    UNSUPPORTED: "unsupported";
}>;
