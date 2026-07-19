import akasha, {
  array,
  chunk,
  data,
  date,
  function as functionUtils,
  hash,
  http,
  input,
  isEmail,
  once,
  request,
  toEpochMilliseconds,
  validation,
} from "akashatools";
import { chunk as categoryChunk } from "akashatools/array";
import granularChunk from "akashatools/array/chunk";
import { analyzeArrayTypes, DATA_TYPES, initializeLike } from "akashatools/data";
import type { DataType } from "akashatools/data";
import { toDate, toEpochMilliseconds as categoryToEpochMilliseconds } from "akashatools/date";
import type { TimestampInput } from "akashatools/date";
import granularToEpochMilliseconds from "akashatools/date/toEpochMilliseconds";
import { HttpError, request as categoryRequest } from "akashatools/http";
import { crc32, sha256Hex, stableJsonId } from "akashatools/hash";
import granularOnce from "akashatools/function/once";
import { CONTROL_TYPES, fieldsFromData, inputTypeForValue, INPUT_TYPES } from "akashatools/input";
import type { ControlType, InputType } from "akashatools/input";
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
const dataType: DataType = DATA_TYPES.BOOLEAN;
const inputType: InputType = INPUT_TYPES.CHECKBOX;
const controlType: ControlType = CONTROL_TYPES.INPUT;
const rootDataType: "boolean" = akasha.DATA_TYPES.BOOLEAN;
const structuredTimestamp: TimestampInput = { seconds: 1, nanoseconds: 500_000_000 };
const protobufTimestamp: TimestampInput = { seconds: 1, nanos: 250_000_000 };
// @ts-expect-error Firestore and Protobuf fractional field spellings are mutually exclusive.
const invalidStructuredTimestamp: TimestampInput = { seconds: 1, nanoseconds: 1, nanos: 1 };
const timestampMilliseconds: number | null = toEpochMilliseconds(structuredTimestamp);
const categoryTimestampMilliseconds: number | null = categoryToEpochMilliseconds(structuredTimestamp);
const granularTimestampMilliseconds: number | null = granularToEpochMilliseconds(structuredTimestamp);
const namespacedTimestampMilliseconds: number | null = date.toEpochMilliseconds(structuredTimestamp);
const timestampDate: Date | null = toDate(structuredTimestamp);
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
const initializedOnce: () => { ready: boolean } = once(() => ({ ready: true }));
const granularInitialized: () => string = granularOnce(() => "ready");
const memoizedLength = functionUtils.memoize((value: string) => value.length, (value: string) => value);
const cachedLength: number = memoizedLength("Akasha");
const debouncedLength = functionUtils.debounce((value: string) => value.length, 25);
const pendingLength: Promise<number> = debouncedLength("Akasha");
const throttledLength = functionUtils.throttle((value: string) => value.length, 25, { trailing: false });
const throttledPending: Promise<number> = throttledLength("Akasha");

// @ts-expect-error Node-only helpers are intentionally absent from the root.
akasha.resolveContainedPath;
// @ts-expect-error Array input is required.
chunk("not an array", 2);
// @ts-expect-error The contract supports only declared JSON types.
const invalidContract: JsonContract = { type: "date" };
// @ts-expect-error DataType accepts only the canonical vocabulary.
const invalidDataType: DataType = "not-a-data-type";

void [
  values, categoryValues, granularValues, nestedValues, flatValues, namedNamespaceValues,
  initialized, primaryType, defaultString,
  textInput, fieldName, nestedInput, dataType, inputType, controlType, rootDataType,
  structuredTimestamp, protobufTimestamp, invalidStructuredTimestamp, timestampMilliseconds, categoryTimestampMilliseconds,
  granularTimestampMilliseconds, namespacedTimestampMilliseconds, timestampDate,
  hasId, ids, granularHasId,
  validEmail, rootPredicate, path, archivePath, archivePaths, contract, response, categoryResponse,
  namespacedResponse, errorCode, invalidContract, invalidDataType,
  checksum, digest, deterministicId, namespacedDigest,
  initializedOnce, granularInitialized, memoizedLength, cachedLength,
  debouncedLength, pendingLength, throttledLength, throttledPending,
];
