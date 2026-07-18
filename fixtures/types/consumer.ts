import akasha, {
  array,
  chunk,
  data,
  hash,
  http,
  input,
  isEmail,
  request,
  validation,
} from "akashatools";
import { chunk as categoryChunk } from "akashatools/array";
import granularChunk from "akashatools/array/chunk";
import { analyzeArrayTypes, initializeLike } from "akashatools/data";
import { HttpError, request as categoryRequest } from "akashatools/http";
import { crc32, sha256Hex, stableJsonId } from "akashatools/hash";
import { fieldsFromData, inputTypeForValue } from "akashatools/input";
import { resolveContainedPath } from "akashatools/node";
import { deepQuery, findAllDeepValues } from "akashatools/object";
import granularHasDeep from "akashatools/object/hasDeep";
import {
  normalizePortableRelativePath,
  normalizePortableRelativePaths,
} from "akashatools/validation";
import type { JsonContract } from "akashatools/validation";

const values: number[][] = chunk([1, 2, 3], 2);
const categoryValues: number[][] = categoryChunk([1, 2, 3], 2);
const granularValues: number[][] = granularChunk([1, 2, 3], 2);
const nestedValues: number[][] = akasha.array.chunk([1, 2, 3], 2);
const flatValues: number[][] = akasha.chunk([1, 2, 3], 2);
const namedNamespaceValues: number[][] = array.chunk([1, 2, 3], 2);
const initialized: unknown = initializeLike({ name: "Ada" });
const primaryType: string | undefined = analyzeArrayTypes([1, 2]).primaryType;
const defaultString: unknown = data.defaultValueForType(String);
const textInput: string | undefined = inputTypeForValue("Ada");
const fieldName: string = fieldsFromData({ name: "Ada" })[0].name;
const nestedInput: string | undefined = input.inputTypeForType(Boolean);
const hasId: boolean = deepQuery({ user: { id: 1 } }).has("id", { by: "key" });
const ids: unknown[] = findAllDeepValues({ user: { id: 1 } }, "id", { by: "key" });
const granularHasId: boolean = granularHasDeep({ id: 1 }, "id", { by: "key" });
const validEmail: boolean = validation.isEmail("person@example.com");
const rootPredicate: boolean = isEmail("person@example.com");
const path: string = resolveContainedPath("/srv/data", "report.json");
const archivePath: string = normalizePortableRelativePath("reports/2026.json");
const archivePaths: ReadonlyArray<string> = normalizePortableRelativePaths(
  ["assets/", "assets/logo.svg"],
  { kind: "either" },
);
const contract: JsonContract = {
  type: "object",
  required: ["ok"],
  properties: { ok: { type: "boolean" } },
};
const response: Promise<{ ok: boolean }> = request<{ ok: boolean }>("https://example.com/data");
const categoryResponse: Promise<string> = categoryRequest<string>("https://example.com/text", { responseType: "text" });
const namespacedResponse: Promise<string> = http.request<string>("https://example.com/text");
const errorCode: HttpError["code"] = "TIMEOUT";
const checksum: number = crc32("content");
const digest: Promise<string> = sha256Hex("content");
const deterministicId: Promise<string> = stableJsonId("item", { id: 1 });
const namespacedDigest: Promise<string> = hash.sha256Json({ id: 1 });

// @ts-expect-error Node-only helpers are intentionally absent from the root.
akasha.resolveContainedPath;
// @ts-expect-error Array input is required.
chunk("not an array", 2);
// @ts-expect-error The contract supports only declared JSON types.
const invalidContract: JsonContract = { type: "date" };

void [
  values, categoryValues, granularValues, nestedValues, flatValues, namedNamespaceValues,
  initialized, primaryType, defaultString,
  textInput, fieldName, nestedInput,
  hasId, ids, granularHasId,
  validEmail, rootPredicate, path, archivePath, archivePaths, contract, response, categoryResponse,
  namespacedResponse, errorCode, invalidContract,
  checksum, digest, deterministicId, namespacedDigest,
];
