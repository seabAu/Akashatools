// Simulates an `akashatools/chunk` export pointing at the current array module.
import { chunk } from "../../src/array.js";

export const run = (values) => chunk(values, 20);
