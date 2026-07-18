import assert from "node:assert/strict";
import test from "node:test";

import {
  createGeoJsonFeature,
  createGeoJsonFeatureCollection,
  filterPositionsWithinDistance,
  geoPositionToObject,
  hasPositionWithinDistance,
  haversineDistance,
  isGeoPosition,
  isWithinGeoDistance,
  normalizeGeoPosition,
} from "../src/geo.js";

test("normalizeGeoPosition uses canonical GeoJSON order and explicit legacy order", () => {
  assert.deepEqual(normalizeGeoPosition({ lat: 40.7, lng: -74 }), [-74, 40.7]);
  assert.deepEqual(normalizeGeoPosition({ latitude: 40.7, longitude: -74, altitude: 12 }), [-74, 40.7, 12]);
  assert.deepEqual(normalizeGeoPosition([40.7, -74], { arrayOrder: "latitude-longitude" }), [-74, 40.7]);
  assert.deepEqual(geoPositionToObject([-74, 40.7]), { longitude: -74, latitude: 40.7 });
  assert.deepEqual(geoPositionToObject([-74, 40.7, 12], { objectKeys: "short" }), { lng: -74, lat: 40.7, alt: 12 });
});

test("position validation rejects ambiguous, active, sparse, and out-of-range data", () => {
  assert.equal(isGeoPosition([180, -90]), true);
  assert.equal(isGeoPosition([181, 0]), false);
  assert.equal(isGeoPosition([0, 91]), false);
  assert.equal(isGeoPosition([0, "1"]), false);
  assert.equal(isGeoPosition([0, , 1]), false);
  assert.equal(isGeoPosition({ longitude: 1, lng: 2, latitude: 0 }), false);
  assert.equal(
    isGeoPosition({
      get longitude() {
        throw new Error("must not run");
      },
      latitude: 0,
    }),
    false,
  );
  assert.throws(() => normalizeGeoPosition([0, 91]), /latitude/);
  assert.throws(() => isGeoPosition([0, 0], { arrayOrder: "guess" }), /arrayOrder/);
});

test("haversineDistance is unit-aware and nearby helpers honor their threshold", () => {
  const kilometers = haversineDistance([0, 0], [0, 1], { unit: "kilometers" });
  assert.ok(Math.abs(kilometers - 111.195) < 0.01);
  assert.ok(Math.abs(haversineDistance([0, 0], [0, 1], { unit: "miles" }) - 69.093) < 0.01);
  assert.equal(haversineDistance([0, 0, 100], [0, 0, 2_000]), 0);
  assert.equal(isWithinGeoDistance([0, 0], [0, 0.001], 112), true);
  assert.equal(isWithinGeoDistance([0, 0], [0, 0.001], 111), false);

  const candidates = [[20, 20], { lon: 0, lat: 0.001 }, [0, 0.01]];
  assert.equal(hasPositionWithinDistance([0, 0], candidates, 112), true);
  assert.deepEqual(filterPositionsWithinDistance([0, 0], candidates, 112), [candidates[1]]);
  assert.throws(() => hasPositionWithinDistance([0, 0], candidates, 112, { maximumPositions: 2 }), /maximumPositions/);
  assert.throws(() => isWithinGeoDistance([0, 0], [0, 0], -1), /maximumDistance/);
});

test("GeoJSON feature creation normalizes every supported coordinate nesting", () => {
  assert.deepEqual(createGeoJsonFeature("Point", { lat: 40.7, lng: -74 }, { properties: { name: "NYC" }, id: 1 }), {
    type: "Feature",
    geometry: { type: "Point", coordinates: [-74, 40.7] },
    properties: { name: "NYC" },
    id: 1,
  });
  assert.deepEqual(
    createGeoJsonFeature("LineString", [
      [0, 0],
      [1, 1],
    ]).geometry.coordinates,
    [
      [0, 0],
      [1, 1],
    ],
  );
  assert.deepEqual(createGeoJsonFeature("MultiPoint", [{ lng: 0, lat: 0 }]).geometry.coordinates, [[0, 0]]);
  assert.deepEqual(
    createGeoJsonFeature("MultiLineString", [
      [
        [0, 0],
        [1, 1],
      ],
    ]).geometry.coordinates,
    [
      [
        [0, 0],
        [1, 1],
      ],
    ],
  );
  const polygon = [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
    ],
  ];
  assert.deepEqual(createGeoJsonFeature("Polygon", polygon).geometry.coordinates, polygon);
  assert.deepEqual(createGeoJsonFeature("MultiPolygon", [polygon]).geometry.coordinates, [polygon]);
});

test("GeoJSON helpers reject malformed geometry and bound work", () => {
  assert.throws(() => createGeoJsonFeature("point", [0, 0]), /unsupported/);
  assert.throws(() => createGeoJsonFeature("LineString", [[0, 0]]), /at least 2/);
  assert.throws(
    () =>
      createGeoJsonFeature("Polygon", [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ],
      ]),
    /closed/,
  );
  assert.throws(
    () =>
      createGeoJsonFeature(
        "MultiPoint",
        [
          [0, 0],
          [1, 1],
        ],
        { maximumPositions: 1 },
      ),
    /maximumPositions/,
  );
  assert.throws(() => createGeoJsonFeature("Point", [0, 0], { properties: new Date() }), /properties/);
  assert.throws(() => createGeoJsonFeature("Point", [0, 0], { id: Number.NaN }), /id/);
});

test("feature collections validate and rebuild feature data", () => {
  const source = createGeoJsonFeature("Point", [40.7, -74], {
    arrayOrder: "latitude-longitude",
    properties: { nested: { active: true } },
  });
  const collection = createGeoJsonFeatureCollection([source]);
  assert.deepEqual(collection, { type: "FeatureCollection", features: [source] });
  assert.notEqual(collection.features[0], source);
  assert.notEqual(collection.features[0].properties, source.properties);
  assert.throws(() => createGeoJsonFeatureCollection([source], { maximumFeatures: 0 }), /maximumFeatures/);
  assert.throws(
    () => createGeoJsonFeatureCollection([{ type: "Feature", geometry: null, properties: null }]),
    /geometry/,
  );
});
