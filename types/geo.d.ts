export type GeoPositionOptions = {
    /**
     * Meaning assigned to the first two array coordinates.
     */
    arrayOrder?: "longitude-latitude" | "latitude-longitude";
};
export type GeoDistanceOptions = GeoPositionOptions & {
    unit?: "meters" | "kilometers" | "miles" | "nautical-miles";
    earthRadiusMeters?: number;
};
export type GeoSearchOptions = GeoDistanceOptions & {
    maximumPositions?: number;
};
export type GeoJsonFeatureOptions = GeoPositionOptions & {
    properties?: Record<PropertyKey, unknown> | null;
    id?: string | number;
    maximumPositions?: number;
    maximumPropertyBytes?: number;
};
export type GeoJsonCollectionOptions = GeoPositionOptions & {
    maximumFeatures?: number;
    maximumPositions?: number;
    maximumPropertyBytes?: number;
};
/**
 * Converts an array or plain coordinate object to a fresh GeoJSON-order
 * position. Arrays are `[longitude, latitude]` unless the legacy order is
 * explicitly requested. Objects accept `longitude`/`lng`/`lon`,
 * `latitude`/`lat`, and optional `altitude`/`alt` aliases. Duplicate aliases
 * must agree. Longitude and latitude ranges are validated.
 *
 * @param {unknown} value Coordinate array or plain coordinate object.
 * @param {GeoPositionOptions} [options] Explicit array coordinate order.
 * @returns {[number, number] | [number, number, number]} Fresh `[longitude, latitude, altitude?]` position.
 * @throws {TypeError} If the value or options do not match the coordinate contract.
 * @throws {RangeError} If longitude or latitude is outside its legal range.
 * @example
 * normalizeGeoPosition({ lat: 40.7, lng: -74 }); // [-74, 40.7]
 * @since 2.0.0
 */
export declare function normalizeGeoPosition(value: unknown, options?: GeoPositionOptions): [number, number] | [number, number, number];
/**
 * Checks whether a value is a valid coordinate position without accepting
 * truthy strings, sparse arrays, accessors, or out-of-range coordinates.
 * Invalid options still throw so configuration errors are not disguised as
 * invalid data.
 *
 * @param {unknown} value Candidate coordinate value.
 * @param {GeoPositionOptions} [options] Explicit array coordinate order.
 * @returns {boolean} Whether the value can be normalized safely.
 * @throws {TypeError} If options are invalid.
 * @example
 * isGeoPosition([12.5, 48.1]); // true
 * @since 2.0.0
 */
export declare function isGeoPosition(value: unknown, options?: GeoPositionOptions): boolean;
/**
 * Converts any accepted position to a fresh coordinate object. Canonical long
 * property names are the default; short Mapbox-style aliases require an
 * explicit output option.
 *
 * @param {unknown} value Coordinate array or object.
 * @param {GeoPositionOptions & {objectKeys?: "canonical" | "short"}} [options] Input order and output-key policy.
 * @returns {{longitude: number, latitude: number, altitude?: number} | {lng: number, lat: number, alt?: number}} Fresh coordinate object.
 * @throws {TypeError | RangeError} If the value or options violate the coordinate contract.
 * @example
 * geoPositionToObject([-74, 40.7]); // { longitude: -74, latitude: 40.7 }
 * @since 2.0.0
 */
export declare function geoPositionToObject(value: unknown, options?: GeoPositionOptions & {
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
/**
 * Calculates great-circle surface distance with the Haversine formula.
 * Altitude, when present, is intentionally ignored. The default IUGG mean Earth
 * radius is explicit and may be overridden in meters for another spherical
 * body or domain model.
 *
 * @param {unknown} left First coordinate position.
 * @param {unknown} right Second coordinate position.
 * @param {GeoDistanceOptions} [options] Array order, output unit, and spherical radius.
 * @returns {number} Finite surface distance in the selected unit.
 * @throws {TypeError | RangeError} If positions or options violate the contract.
 * @example
 * haversineDistance([0, 0], [0, 1], { unit: "kilometers" }); // approximately 111.2
 * @since 2.0.0
 */
export declare function haversineDistance(left: unknown, right: unknown, options?: GeoDistanceOptions): number;
/**
 * Checks whether two positions are within an inclusive great-circle distance.
 * Maximum distance uses the same selected unit as the returned value from
 * `haversineDistance`.
 *
 * @param {unknown} left First coordinate position.
 * @param {unknown} right Second coordinate position.
 * @param {number} maximumDistance Non-negative inclusive distance in the selected unit.
 * @param {GeoDistanceOptions} [options] Array order, unit, and spherical radius.
 * @returns {boolean} Whether the positions are within maximumDistance.
 * @throws {TypeError | RangeError} If distance, positions, or options violate the contract.
 * @example
 * isWithinGeoDistance([0, 0], [0, 0.001], 200); // true
 * @since 2.0.0
 */
export declare function isWithinGeoDistance(left: unknown, right: unknown, maximumDistance: number, options?: GeoDistanceOptions): boolean;
/**
 * Stops at the first position within an inclusive great-circle distance. The
 * list and every candidate are validated, and work is capped before iteration.
 *
 * @param {unknown} target Position to compare against.
 * @param {readonly unknown[]} positions Candidate positions.
 * @param {number} maximumDistance Non-negative inclusive distance in the selected unit.
 * @param {GeoSearchOptions} [options] Distance policy and maximum candidate count.
 * @returns {boolean} Whether any candidate is within maximumDistance.
 * @throws {TypeError | RangeError} If input or options violate the contract.
 * @example
 * hasPositionWithinDistance([0, 0], [[20, 20], [0, 0.001]], 200); // true
 * @since 2.0.0
 */
export declare function hasPositionWithinDistance(target: unknown, positions: readonly unknown[], maximumDistance: number, options?: GeoSearchOptions): boolean;
/**
 * Returns the original candidate values whose great-circle distance from a
 * target is within an inclusive threshold. Candidate order and references are
 * preserved; the input array is never mutated.
 *
 * @param {unknown} target Position to compare against.
 * @param {readonly unknown[]} positions Candidate positions.
 * @param {number} maximumDistance Non-negative inclusive distance in the selected unit.
 * @param {GeoSearchOptions} [options] Distance policy and maximum candidate count.
 * @returns {unknown[]} Original candidate values that fall within the distance.
 * @throws {TypeError | RangeError} If input or options violate the contract.
 * @example
 * filterPositionsWithinDistance([0, 0], [[0, 0.001], [20, 20]], 200); // [[0, 0.001]]
 * @since 2.0.0
 */
export declare function filterPositionsWithinDistance(target: unknown, positions: readonly unknown[], maximumDistance: number, options?: GeoSearchOptions): unknown[];
/**
 * Creates a deterministic GeoJSON Feature for Point, MultiPoint, LineString,
 * MultiLineString, Polygon, or MultiPolygon geometry. Coordinate objects and an
 * explicit legacy array order are accepted as input, but output coordinates
 * always use GeoJSON `[longitude, latitude]` order. Polygon rings must already
 * be closed so the helper never silently changes geometry.
 *
 * @param {"Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon"} geometryType Standard GeoJSON geometry type.
 * @param {unknown} coordinates Coordinates with nesting appropriate to geometryType.
 * @param {GeoJsonFeatureOptions} [options] Properties, identifier, coordinate order, and work bounds.
 * @returns {{type: "Feature", geometry: {type: string, coordinates: unknown}, properties: Record<PropertyKey, unknown> | null, id?: string | number}} Fresh strict core GeoJSON Feature.
 * @throws {TypeError | RangeError} If geometry, properties, identifier, or bounds violate the contract.
 * @example
 * createGeoJsonFeature("Point", { lng: -74, lat: 40.7 }, { properties: { name: "New York" } });
 * @since 2.0.0
 */
export declare function createGeoJsonFeature(geometryType: "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon", coordinates: unknown, options?: GeoJsonFeatureOptions): {
    type: "Feature";
    geometry: {
        type: string;
        coordinates: unknown;
    };
    properties: Record<PropertyKey, unknown> | null;
    id?: string | number;
};
/**
 * Creates a bounded deterministic GeoJSON FeatureCollection. Each input feature
 * is rebuilt through `createGeoJsonFeature`, so coordinate order, geometry
 * nesting, properties, identifiers, and accessors receive the same validation.
 * Foreign GeoJSON members are intentionally omitted from the canonical output.
 *
 * @param {readonly unknown[]} features GeoJSON Feature-like values to validate and copy.
 * @param {GeoJsonCollectionOptions} [options] Array order and total work bounds.
 * @returns {{type: "FeatureCollection", features: ReturnType<typeof createGeoJsonFeature>[]}} Fresh GeoJSON FeatureCollection.
 * @throws {TypeError | RangeError} If features or options violate the contract.
 * @example
 * createGeoJsonFeatureCollection([createGeoJsonFeature("Point", [0, 0])]);
 * @since 2.0.0
 */
export declare function createGeoJsonFeatureCollection(features: readonly unknown[], options?: GeoJsonCollectionOptions): {
    type: "FeatureCollection";
    features: ReturnType<typeof createGeoJsonFeature>[];
};
