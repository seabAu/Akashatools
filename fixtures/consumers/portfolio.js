import { createKeyedSingleFlight, createSingleFlight } from "akashatools/async";
import { parseContentDispositionFilename } from "akashatools/http";
import { formatBytes } from "akashatools/number";

/** Adapts the portfolio's positional expiring-single-flight contract. */
export function createPortfolioSingleFlight(loader, ttl, now = Date.now, shouldCache = () => true) {
  return createSingleFlight(loader, { ttl, now, shouldCache });
}

/** Adapts the portfolio's keyed loader while adding a retained-key bound. */
export function createPortfolioKeyedSingleFlight(
  loader,
  ttl,
  now = Date.now,
  shouldCache = () => true,
  maximumSize = 100,
) {
  return createKeyedSingleFlight(loader, { ttl, now, shouldCache, maximumSize });
}

/** Representative portfolio response-download presentation primitives. */
export function describePortfolioDownload(contentDisposition, fallback, bytes) {
  return {
    filename: parseContentDispositionFilename(contentDisposition, { fallback }),
    size: formatBytes(bytes),
  };
}
