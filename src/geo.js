import { cloneJson, isPlainObject } from "./object.js";

/**
 * @typedef {object} GeoPositionOptions
 * @property {"longitude-latitude" | "latitude-longitude"} [arrayOrder="longitude-latitude"] Meaning assigned to the first two array coordinates.
 */

/**
 * @typedef {GeoPositionOptions & {
 *   unit?: "meters" | "kilometers" | "miles" | "nautical-miles",
 *   earthRadiusMeters?: number
 * }} GeoDistanceOptions
 */

/**
 * @typedef {GeoDistanceOptions & {
 *   maximumPositions?: number
 * }} GeoSearchOptions
 */

/**
 * @typedef {GeoPositionOptions & {
 *   properties?: Record<PropertyKey, unknown> | null,
 *   id?: string | number,
 *   maximumPositions?: number,
 *   maximumPropertyBytes?: number
 * }} GeoJsonFeatureOptions
 */

/**
 * @typedef {GeoPositionOptions & {
 *   maximumFeatures?: number,
 *   maximumPositions?: number,
 *   maximumPropertyBytes?: number
 * }} GeoJsonCollectionOptions
 */

const defaultEarthRadiusMeters = 6_371_008.8;
const distanceUnitMeters = Object.freeze({
  meters: 1,
  kilometers: 1_000,
  miles: 1_609.344,
  "nautical-miles": 1_852,
});
const geometryTypes = new Set(["Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon"]);
const longitudeKeys = ["longitude", "lng", "lon"];
const latitudeKeys = ["latitude", "lat"];
const altitudeKeys = ["altitude", "alt"];

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
export function normalizeGeoPosition(value, options = {}) {
  const normalizedOptions = normalizePositionOptions(options);
  return normalizePosition(value, normalizedOptions.arrayOrder);
}

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
export function isGeoPosition(value, options = {}) {
  const normalizedOptions = normalizePositionOptions(options);
  try {
    normalizePosition(value, normalizedOptions.arrayOrder);
    return true;
  } catch (error) {
    if (error instanceof TypeError || error instanceof RangeError) return false;
    throw error;
  }
}

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
export function geoPositionToObject(value, options = {}) {
  const normalizedOptions = normalizePositionOptions(options);
  if (options.objectKeys !== undefined && options.objectKeys !== "canonical" && options.objectKeys !== "short") {
    throw new TypeError('objectKeys must be "canonical" or "short".');
  }
  const [longitude, latitude, altitude] = normalizePosition(value, normalizedOptions.arrayOrder);
  if (options.objectKeys === "short") {
    return altitude === undefined
      ? { lng: longitude, lat: latitude }
      : { lng: longitude, lat: latitude, alt: altitude };
  }
  return altitude === undefined ? { longitude, latitude } : { longitude, latitude, altitude };
}

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
export function haversineDistance(left, right, options = {}) {
  const normalizedOptions = normalizeDistanceOptions(options);
  const leftPosition = normalizePosition(left, normalizedOptions.arrayOrder);
  const rightPosition = normalizePosition(right, normalizedOptions.arrayOrder);
  return distanceBetweenPositions(leftPosition, rightPosition, normalizedOptions);
}

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
export function isWithinGeoDistance(left, right, maximumDistance, options = {}) {
  assertMaximumDistance(maximumDistance);
  return haversineDistance(left, right, options) <= maximumDistance;
}

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
export function hasPositionWithinDistance(target, positions, maximumDistance, options = {}) {
  const search = prepareGeoSearch(target, positions, maximumDistance, options);
  for (const candidate of positions) {
    const position = normalizePosition(candidate, search.arrayOrder);
    if (distanceBetweenPositions(search.target, position, search) <= maximumDistance) return true;
  }
  return false;
}

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
export function filterPositionsWithinDistance(target, positions, maximumDistance, options = {}) {
  const search = prepareGeoSearch(target, positions, maximumDistance, options);
  return positions.filter((candidate) => {
    const position = normalizePosition(candidate, search.arrayOrder);
    return distanceBetweenPositions(search.target, position, search) <= maximumDistance;
  });
}

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
export function createGeoJsonFeature(geometryType, coordinates, options = {}) {
  const normalizedOptions = normalizeFeatureOptions(options);
  const context = { count: 0, maximumPositions: normalizedOptions.maximumPositions };
  const normalizedCoordinates = normalizeGeometryCoordinates(
    geometryType,
    coordinates,
    normalizedOptions.arrayOrder,
    context,
  );
  const properties = cloneGeoJsonProperties(options.properties, normalizedOptions.maximumPropertyBytes);
  /** @type {{type: "Feature", geometry: {type: string, coordinates: unknown}, properties: Record<PropertyKey, unknown> | null, id?: string | number}} */
  const feature = { type: "Feature", geometry: { type: geometryType, coordinates: normalizedCoordinates }, properties };
  if (options.id !== undefined) {
    assertGeoJsonId(options.id);
    feature.id = options.id;
  }
  return feature;
}

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
export function createGeoJsonFeatureCollection(features, options = {}) {
  if (!Array.isArray(features)) throw new TypeError("features must be an array.");
  const normalizedOptions = normalizeCollectionOptions(options);
  assertDenseDataArray(features, "features");
  if (features.length > normalizedOptions.maximumFeatures) {
    throw new RangeError("createGeoJsonFeatureCollection exceeded maximumFeatures.");
  }

  let remainingPositions = normalizedOptions.maximumPositions;
  const copiedFeatures = features.map((value) => {
    if (!isPlainObject(value)) throw new TypeError("Each collection item must be a plain GeoJSON Feature.");
    const type = ownDataValue(value, "type", "Feature");
    if (type !== "Feature") throw new TypeError('Each collection item must have type "Feature".');
    const geometry = ownDataValue(value, "geometry", "Feature");
    if (!isPlainObject(geometry)) throw new TypeError("Feature geometry must be a plain object.");
    const geometryType = ownDataValue(geometry, "type", "geometry");
    const coordinates = ownDataValue(geometry, "coordinates", "geometry");
    if (typeof geometryType !== "string" || !geometryTypes.has(geometryType)) {
      throw new TypeError("Feature geometry type is unsupported.");
    }
    const properties = ownDataValue(value, "properties", "Feature");
    const id = optionalOwnDataValue(value, "id", "Feature");
    const copied = createGeoJsonFeature(
      /** @type {"Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon"} */ (
        geometryType
      ),
      coordinates,
      {
        arrayOrder: normalizedOptions.arrayOrder,
        properties: /** @type {Record<PropertyKey, unknown> | null} */ (properties),
        maximumPositions: remainingPositions,
        maximumPropertyBytes: normalizedOptions.maximumPropertyBytes,
        ...(id.found ? { id: /** @type {string | number} */ (id.value) } : {}),
      },
    );
    const used = countGeometryPositions(copied.geometry.type, copied.geometry.coordinates);
    remainingPositions -= used;
    return copied;
  });
  return { type: "FeatureCollection", features: copiedFeatures };
}

/** @param {GeoPositionOptions} options */
function normalizePositionOptions(options) {
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  const arrayOrder = options.arrayOrder ?? "longitude-latitude";
  if (arrayOrder !== "longitude-latitude" && arrayOrder !== "latitude-longitude") {
    throw new TypeError('arrayOrder must be "longitude-latitude" or "latitude-longitude".');
  }
  return { arrayOrder };
}

/** @param {GeoDistanceOptions} options */
function normalizeDistanceOptions(options) {
  const { arrayOrder } = normalizePositionOptions(options);
  const unit = options.unit ?? "meters";
  if (!Object.hasOwn(distanceUnitMeters, unit)) {
    throw new TypeError('unit must be "meters", "kilometers", "miles", or "nautical-miles".');
  }
  const earthRadiusMeters = options.earthRadiusMeters ?? defaultEarthRadiusMeters;
  if (!Number.isFinite(earthRadiusMeters) || earthRadiusMeters <= 0) {
    throw new RangeError("earthRadiusMeters must be a positive finite number.");
  }
  return { arrayOrder, unit, earthRadiusMeters };
}

/** @param {GeoSearchOptions} options */
function normalizeSearchOptions(options) {
  const distanceOptions = normalizeDistanceOptions(options);
  const maximumPositions = options.maximumPositions ?? 100_000;
  assertNonNegativeSafeInteger(maximumPositions, "maximumPositions");
  return { ...distanceOptions, maximumPositions };
}

/** @param {GeoJsonFeatureOptions} options */
function normalizeFeatureOptions(options) {
  const { arrayOrder } = normalizePositionOptions(options);
  const maximumPositions = options.maximumPositions ?? 100_000;
  const maximumPropertyBytes = options.maximumPropertyBytes ?? 1_000_000;
  assertNonNegativeSafeInteger(maximumPositions, "maximumPositions");
  assertNonNegativeSafeInteger(maximumPropertyBytes, "maximumPropertyBytes");
  return { arrayOrder, maximumPositions, maximumPropertyBytes };
}

/** @param {GeoJsonCollectionOptions} options */
function normalizeCollectionOptions(options) {
  const { arrayOrder } = normalizePositionOptions(options);
  const maximumFeatures = options.maximumFeatures ?? 10_000;
  const maximumPositions = options.maximumPositions ?? 100_000;
  const maximumPropertyBytes = options.maximumPropertyBytes ?? 1_000_000;
  assertNonNegativeSafeInteger(maximumFeatures, "maximumFeatures");
  assertNonNegativeSafeInteger(maximumPositions, "maximumPositions");
  assertNonNegativeSafeInteger(maximumPropertyBytes, "maximumPropertyBytes");
  return { arrayOrder, maximumFeatures, maximumPositions, maximumPropertyBytes };
}

/**
 * @param {unknown} value
 * @param {"longitude-latitude" | "latitude-longitude"} arrayOrder
 * @returns {[number, number] | [number, number, number]}
 */
function normalizePosition(value, arrayOrder) {
  let longitude;
  let latitude;
  let altitude;

  if (Array.isArray(value)) {
    if (value.length !== 2 && value.length !== 3)
      throw new TypeError("A coordinate array must contain two or three items.");
    assertDenseDataArray(value, "coordinate array");
    const first = value[0];
    const second = value[1];
    longitude = arrayOrder === "longitude-latitude" ? first : second;
    latitude = arrayOrder === "longitude-latitude" ? second : first;
    altitude = value.length === 3 ? value[2] : undefined;
  } else if (isPlainObject(value)) {
    longitude = readCoordinateAlias(value, longitudeKeys, "longitude");
    latitude = readCoordinateAlias(value, latitudeKeys, "latitude");
    altitude = readOptionalCoordinateAlias(value, altitudeKeys, "altitude");
  } else {
    throw new TypeError("A coordinate position must be an array or plain object.");
  }

  assertCoordinateNumber(longitude, "longitude");
  assertCoordinateNumber(latitude, "latitude");
  if (longitude < -180 || longitude > 180) throw new RangeError("longitude must be between -180 and 180.");
  if (latitude < -90 || latitude > 90) throw new RangeError("latitude must be between -90 and 90.");
  if (altitude !== undefined) assertCoordinateNumber(altitude, "altitude");
  return altitude === undefined ? [longitude, latitude] : [longitude, latitude, altitude];
}

/** @param {Record<PropertyKey, unknown>} value @param {readonly string[]} keys @param {string} label */
function readCoordinateAlias(value, keys, label) {
  const result = readAliases(value, keys, label);
  if (!result.found) throw new TypeError(`Coordinate object must contain ${label}.`);
  return result.value;
}

/** @param {Record<PropertyKey, unknown>} value @param {readonly string[]} keys @param {string} label */
function readOptionalCoordinateAlias(value, keys, label) {
  return readAliases(value, keys, label).value;
}

/** @param {Record<PropertyKey, unknown>} value @param {readonly string[]} keys @param {string} label */
function readAliases(value, keys, label) {
  let found = false;
  let coordinate;
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined) continue;
    if (!Object.hasOwn(descriptor, "value"))
      throw new TypeError(`Coordinate ${label} aliases must be data properties.`);
    if (found && descriptor.value !== coordinate) throw new TypeError(`Coordinate ${label} aliases must agree.`);
    found = true;
    coordinate = descriptor.value;
  }
  return { found, value: coordinate };
}

/** @param {unknown} value @param {string} label */
function assertCoordinateNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError(`${label} must be a finite number.`);
}

/** @param {number} maximumDistance */
function assertMaximumDistance(maximumDistance) {
  if (!Number.isFinite(maximumDistance) || maximumDistance < 0) {
    throw new RangeError("maximumDistance must be a non-negative finite number.");
  }
}

/**
 * @param {unknown} target
 * @param {readonly unknown[]} positions
 * @param {number} maximumDistance
 * @param {GeoSearchOptions} options
 */
function prepareGeoSearch(target, positions, maximumDistance, options) {
  assertMaximumDistance(maximumDistance);
  if (!Array.isArray(positions)) throw new TypeError("positions must be an array.");
  assertDenseDataArray(positions, "positions");
  const normalizedOptions = normalizeSearchOptions(options);
  if (positions.length > normalizedOptions.maximumPositions)
    throw new RangeError("Geo search exceeded maximumPositions.");
  return { ...normalizedOptions, target: normalizePosition(target, normalizedOptions.arrayOrder) };
}

/**
 * @param {[number, number] | [number, number, number]} left
 * @param {[number, number] | [number, number, number]} right
 * @param {{unit: keyof typeof distanceUnitMeters, earthRadiusMeters: number}} options
 */
function distanceBetweenPositions(left, right, options) {
  const toRadians = Math.PI / 180;
  const latitude1 = left[1] * toRadians;
  const latitude2 = right[1] * toRadians;
  const latitudeDelta = (right[1] - left[1]) * toRadians;
  const longitudeDelta = (right[0] - left[0]) * toRadians;
  const latitudeSin = Math.sin(latitudeDelta / 2);
  const longitudeSin = Math.sin(longitudeDelta / 2);
  const haversine = Math.min(
    1,
    latitudeSin * latitudeSin + Math.cos(latitude1) * Math.cos(latitude2) * longitudeSin * longitudeSin,
  );
  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return (centralAngle * options.earthRadiusMeters) / distanceUnitMeters[options.unit];
}

/**
 * @param {string} geometryType
 * @param {unknown} coordinates
 * @param {"longitude-latitude" | "latitude-longitude"} arrayOrder
 * @param {{count: number, maximumPositions: number}} context
 * @returns {unknown}
 */
function normalizeGeometryCoordinates(geometryType, coordinates, arrayOrder, context) {
  if (!geometryTypes.has(geometryType)) throw new TypeError("geometryType is unsupported.");
  if (geometryType === "Point") return normalizeCountedPosition(coordinates, arrayOrder, context);
  if (geometryType === "MultiPoint")
    return normalizePositionSequence(coordinates, arrayOrder, context, 1, "MultiPoint");
  if (geometryType === "LineString")
    return normalizePositionSequence(coordinates, arrayOrder, context, 2, "LineString");
  if (geometryType === "MultiLineString") {
    return mapNestedArrays(coordinates, "MultiLineString", 1, (line) =>
      normalizePositionSequence(line, arrayOrder, context, 2, "MultiLineString line"),
    );
  }
  if (geometryType === "Polygon") return normalizePolygon(coordinates, arrayOrder, context, "Polygon");
  return mapNestedArrays(coordinates, "MultiPolygon", 1, (polygon) =>
    normalizePolygon(polygon, arrayOrder, context, "MultiPolygon polygon"),
  );
}

/**
 * @param {unknown} coordinates
 * @param {"longitude-latitude" | "latitude-longitude"} arrayOrder
 * @param {{count: number, maximumPositions: number}} context
 * @param {number} minimum
 * @param {string} label
 */
function normalizePositionSequence(coordinates, arrayOrder, context, minimum, label) {
  return mapNestedArrays(coordinates, label, minimum, (position) =>
    normalizeCountedPosition(position, arrayOrder, context),
  );
}

/**
 * @param {unknown} coordinates
 * @param {"longitude-latitude" | "latitude-longitude"} arrayOrder
 * @param {{count: number, maximumPositions: number}} context
 * @param {string} label
 */
function normalizePolygon(coordinates, arrayOrder, context, label) {
  return mapNestedArrays(coordinates, label, 1, (ring) => {
    const positions = normalizePositionSequence(ring, arrayOrder, context, 4, `${label} ring`);
    const first = positions[0];
    const last = positions.at(-1);
    if (!samePosition(first, last)) throw new TypeError(`${label} rings must be closed.`);
    return positions;
  });
}

/**
 * @template T
 * @param {unknown} value
 * @param {string} label
 * @param {number} minimum
 * @param {(entry: unknown) => T} mapper
 * @returns {T[]}
 */
function mapNestedArrays(value, label, minimum, mapper) {
  if (!Array.isArray(value)) throw new TypeError(`${label} coordinates must be an array.`);
  assertDenseDataArray(value, `${label} coordinates`);
  if (value.length < minimum) throw new TypeError(`${label} coordinates must contain at least ${minimum} item(s).`);
  return value.map(mapper);
}

/**
 * @param {unknown} value
 * @param {"longitude-latitude" | "latitude-longitude"} arrayOrder
 * @param {{count: number, maximumPositions: number}} context
 */
function normalizeCountedPosition(value, arrayOrder, context) {
  context.count += 1;
  if (context.count > context.maximumPositions) throw new RangeError("GeoJSON geometry exceeded maximumPositions.");
  return normalizePosition(value, arrayOrder);
}

/** @param {unknown} left @param {unknown} right */
function samePosition(left, right) {
  return (
    Array.isArray(left) &&
    Array.isArray(right) &&
    left.length === right.length &&
    left.every((coordinate, index) => coordinate === right[index])
  );
}

/** @param {unknown} properties @param {number} maximumPropertyBytes */
function cloneGeoJsonProperties(properties, maximumPropertyBytes) {
  if (properties === undefined) return {};
  if (properties === null) return null;
  if (!isPlainObject(properties)) throw new TypeError("GeoJSON properties must be a plain object or null.");
  return cloneJson(properties, { maximumBytes: maximumPropertyBytes });
}

/** @param {unknown} id */
function assertGeoJsonId(id) {
  if (typeof id === "string") return;
  if (typeof id === "number" && Number.isFinite(id)) return;
  throw new TypeError("GeoJSON id must be a string or finite number.");
}

/** @param {Record<PropertyKey, unknown>} value @param {string} key @param {string} label */
function ownDataValue(value, key, label) {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (descriptor === undefined) throw new TypeError(`${label} must contain ${key}.`);
  if (!Object.hasOwn(descriptor, "value")) throw new TypeError(`${label}.${key} must be a data property.`);
  return descriptor.value;
}

/** @param {Record<PropertyKey, unknown>} value @param {string} key @param {string} label */
function optionalOwnDataValue(value, key, label) {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (descriptor === undefined) return { found: false, value: undefined };
  if (!Object.hasOwn(descriptor, "value")) throw new TypeError(`${label}.${key} must be a data property.`);
  return { found: true, value: descriptor.value };
}

/** @param {readonly unknown[]} value @param {string} label */
function assertDenseDataArray(value, label) {
  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = descriptors[index];
    if (descriptor === undefined) throw new TypeError(`${label} must not be sparse.`);
    if (!Object.hasOwn(descriptor, "value")) throw new TypeError(`${label} must not contain accessors.`);
  }
  for (const key of Reflect.ownKeys(value)) {
    if (key === "length" || (typeof key === "string" && /^(0|[1-9]\d*)$/.test(key) && Number(key) < value.length))
      continue;
    if (Object.getOwnPropertyDescriptor(value, key)?.enumerable) {
      throw new TypeError(`${label} must not contain custom enumerable properties.`);
    }
  }
}

/** @param {number} value @param {string} label */
function assertNonNegativeSafeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(`${label} must be a non-negative safe integer.`);
}

/** @param {string} geometryType @param {unknown} coordinates */
function countGeometryPositions(geometryType, coordinates) {
  if (geometryType === "Point") return 1;
  if (geometryType === "MultiPoint" || geometryType === "LineString")
    return /** @type {unknown[]} */ (coordinates).length;
  if (geometryType === "MultiLineString" || geometryType === "Polygon") {
    return /** @type {unknown[][]} */ (coordinates).reduce((total, values) => total + values.length, 0);
  }
  return /** @type {unknown[][][]} */ (coordinates).reduce(
    (total, polygon) => total + polygon.reduce((subtotal, ring) => subtotal + ring.length, 0),
    0,
  );
}
