import { chunk } from "akashatools";

export const run = (values) => chunk(values, 20);
