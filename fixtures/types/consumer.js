import akasha, { chunk, validation } from "akashatools";
import { initializeLike } from "akashatools/data";
import { getAtPath } from "akashatools/object";
import { secureRandomUuid } from "akashatools/random";

/** @type {number[][]} */
const chunks = chunk([1, 2, 3], 2);
/** @type {boolean} */
const valid = akasha.validation.isEmail("person@example.com");
/** @type {unknown} */
const nested = getAtPath({ person: { name: "Akasha" } }, "person.name");
/** @type {string} */
const identifier = secureRandomUuid();
/** @type {unknown} */
const initialized = initializeLike({ title: "Draft" });

// @ts-expect-error Unknown categories must not appear on the default namespace.
akasha.schema;
// @ts-expect-error Email validation requires exactly one argument.
validation.isEmail("a@example.com", "extra");

void [chunks, valid, nested, identifier, initialized];
