import akasha, {
  array,
  chunk,
  http,
  isEmail,
  request,
  validation,
} from "akashatools";
import { chunk as categoryChunk } from "akashatools/array";
import { HttpError, request as categoryRequest } from "akashatools/http";
import { resolveContainedPath } from "akashatools/node";
import type { JsonContract } from "akashatools/validation";

const values: number[][] = chunk([1, 2, 3], 2);
const categoryValues: number[][] = categoryChunk([1, 2, 3], 2);
const nestedValues: number[][] = akasha.array.chunk([1, 2, 3], 2);
const flatValues: number[][] = akasha.chunk([1, 2, 3], 2);
const namedNamespaceValues: number[][] = array.chunk([1, 2, 3], 2);
const validEmail: boolean = validation.isEmail("person@example.com");
const rootPredicate: boolean = isEmail("person@example.com");
const path: string = resolveContainedPath("/srv/data", "report.json");
const contract: JsonContract = {
  type: "object",
  required: ["ok"],
  properties: { ok: { type: "boolean" } },
};
const response: Promise<{ ok: boolean }> = request<{ ok: boolean }>("https://example.com/data");
const categoryResponse: Promise<string> = categoryRequest<string>("https://example.com/text", { responseType: "text" });
const namespacedResponse: Promise<string> = http.request<string>("https://example.com/text");
const errorCode: HttpError["code"] = "TIMEOUT";

// @ts-expect-error Node-only helpers are intentionally absent from the root.
akasha.resolveContainedPath;
// @ts-expect-error Array input is required.
chunk("not an array", 2);
// @ts-expect-error The contract supports only declared JSON types.
const invalidContract: JsonContract = { type: "date" };

void [
  values, categoryValues, nestedValues, flatValues, namedNamespaceValues,
  validEmail, rootPredicate, path, contract, response, categoryResponse,
  namespacedResponse, errorCode, invalidContract,
];
