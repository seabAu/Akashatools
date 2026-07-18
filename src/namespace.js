import * as arrayModule from "./array/index.js";
import * as asyncModule from "./async/index.js";
import * as browserModule from "./browser/index.js";
import * as collectionModule from "./collection/index.js";
import * as dataModule from "./data/index.js";
import * as dateModule from "./date/index.js";
import * as httpModule from "./http/index.js";
import * as hashModule from "./hash/index.js";
import * as inputModule from "./input/index.js";
import * as functionModule from "./function/index.js";
import * as numberModule from "./number/index.js";
import * as objectModule from "./object/index.js";
import * as randomModule from "./random/index.js";
import * as sortModule from "./sort/index.js";
import * as stringModule from "./string/index.js";
import * as validationModule from "./validation/index.js";

/** Frozen array utilities for namespace-style discovery. */
export const array = /* @__PURE__ */ Object.freeze({ ...arrayModule });
/** Frozen asynchronous utilities for namespace-style discovery. */
export const asyncUtils = /* @__PURE__ */ Object.freeze({ ...asyncModule });
/** Frozen browser utilities for namespace-style discovery. */
export const browser = /* @__PURE__ */ Object.freeze({ ...browserModule });
/** Frozen collection utilities for namespace-style discovery. */
export const collection = /* @__PURE__ */ Object.freeze({ ...collectionModule });
/** Frozen data introspection and initialization utilities. */
export const data = /* @__PURE__ */ Object.freeze({ ...dataModule });
/** Frozen date and time utilities for namespace-style discovery. */
export const date = /* @__PURE__ */ Object.freeze({ ...dateModule });
/** Frozen HTTP request and error utilities. */
export const http = /* @__PURE__ */ Object.freeze({ ...httpModule });
/** Frozen checksum and deterministic hashing utilities. */
export const hash = /* @__PURE__ */ Object.freeze({ ...hashModule });
/** Frozen form-input inference and descriptor utilities. */
export const input = /* @__PURE__ */ Object.freeze({ ...inputModule });
/** Frozen function-control utilities for namespace-style discovery. */
export const functionUtils = /* @__PURE__ */ Object.freeze({ ...functionModule });
/** Frozen numeric utilities for namespace-style discovery. */
export const number = /* @__PURE__ */ Object.freeze({ ...numberModule });
/** Frozen object utilities for namespace-style discovery. */
export const object = /* @__PURE__ */ Object.freeze({ ...objectModule });
/** Frozen pseudo-random utilities for namespace-style discovery. */
export const random = /* @__PURE__ */ Object.freeze({ ...randomModule });
/** Frozen sorting utilities for namespace-style discovery. */
export const sort = /* @__PURE__ */ Object.freeze({ ...sortModule });
/** Frozen string utilities for namespace-style discovery. */
export const string = /* @__PURE__ */ Object.freeze({ ...stringModule });
/** Frozen validation utilities for namespace-style discovery. */
export const validation = /* @__PURE__ */ Object.freeze({ ...validationModule });

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
export const akasha = /* @__PURE__ */ Object.freeze({
  ...array,
  ...asyncUtils,
  ...browser,
  ...collection,
  ...data,
  ...date,
  ...http,
  ...hash,
  ...input,
  ...functionUtils,
  ...number,
  ...object,
  ...random,
  ...sort,
  ...string,
  ...validation,
  array,
  async: asyncUtils,
  browser,
  collection,
  data,
  date,
  http,
  hash,
  input,
  function: functionUtils,
  number,
  object,
  random,
  sort,
  string,
  validation,
});

/**
 * Rejects ambiguous flat utility names and collisions with category names.
 * Exported only for package-internal contract tests; it is not a package entry.
 *
 * @param {readonly (readonly [string, Readonly<Record<string, unknown>>])[]} entries
 * @returns {void}
 * @throws {TypeError} If categories or flat utility names are ambiguous.
 * @internal
 */
export function assertNamespaceIsCollisionFree(entries) {
  const categoryNames = new Set();
  const utilityOwners = new Map();

  for (const [categoryName] of entries) {
    if (categoryNames.has(categoryName)) {
      throw new TypeError(`Duplicate Akashatools category: ${categoryName}`);
    }
    categoryNames.add(categoryName);
  }

  for (const [categoryName, category] of entries) {
    for (const [utilityName, utility] of Object.entries(category)) {
      if (categoryNames.has(utilityName)) {
        throw new TypeError(`Utility name collides with an Akashatools category: ${utilityName}`);
      }

      const previous = utilityOwners.get(utilityName);
      if (previous && previous.utility !== utility) {
        throw new TypeError(
          `Ambiguous Akashatools utility "${utilityName}" is exported by both "${previous.category}" and "${categoryName}".`,
        );
      }
      utilityOwners.set(utilityName, { category: categoryName, utility });
    }
  }
}
