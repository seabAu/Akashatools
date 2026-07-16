import { countWords, splitTextByLimits, utf8ByteLength } from "akashatools/string";

/**
 * Provider-neutral SPLICR planning fixture. Blank-input policy remains in this
 * adapter; the generic splitter itself preserves all source whitespace.
 */
export function planSplicrText(
  text,
  {
    maximumBytes = 3_800,
    maximumWords = 350,
    maximumCost = null,
    measureCost,
    maximumInputLength = 1_000_000,
    maximumChunks = 10_000,
  } = {},
) {
  if (typeof text !== "string") throw new TypeError("text must be a string.");
  if (!/\S/u.test(text)) throw new RangeError("text must contain at least one non-whitespace character.");

  const pieces = splitTextByLimits(text, {
    maximumBytes,
    maximumWords,
    maximumCost,
    measureCost,
    maximumInputLength,
    maximumChunks,
  });
  let cursor = 0;
  const chunks = pieces.map((piece, index) => {
    const startChar = cursor;
    cursor += piece.length;
    return {
      index,
      text: piece,
      startChar,
      endChar: cursor,
      byteCount: utf8ByteLength(piece),
      wordCount: countWords(piece),
    };
  });

  return {
    text,
    chunks,
    totalBytes: utf8ByteLength(text),
    totalWords: countWords(text),
  };
}
