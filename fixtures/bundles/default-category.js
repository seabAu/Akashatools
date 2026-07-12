import akasha from "akashatools";

export const run = (values) => akasha.array.chunk(values, 20);
