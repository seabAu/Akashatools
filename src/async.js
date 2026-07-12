/**
 * Maps values with a fixed concurrency ceiling. Results retain input order and
 * individual failures are represented like `Promise.allSettled`.
 *
 * @template T, R
 * @param {readonly T[]} values Values to map without mutating the input array.
 * @param {number} concurrency Maximum number of mapper calls active at once.
 * @param {(value: T, index: number) => R | PromiseLike<R>} mapper Mapper whose return or thrown reason becomes one settled result.
 * @returns {Promise<PromiseSettledResult<R>[]>} Settled results in input order.
 * @throws {TypeError} If values is not an array or mapper is not a function.
 * @throws {RangeError} If concurrency is not a positive safe integer.
 * @example
 * const results = await mapSettledWithConcurrency(urls, 4, fetch);
 * @since 2.0.0
 */
export async function mapSettledWithConcurrency(values, concurrency, mapper) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array.");
  if (!Number.isSafeInteger(concurrency) || concurrency < 1) {
    throw new RangeError("concurrency must be a positive safe integer.");
  }
  if (typeof mapper !== "function") throw new TypeError("mapper must be a function.");

  /** @type {PromiseSettledResult<R>[]} */
  const results = new Array(values.length);
  let cursor = 0;

  const worker = async () => {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = { status: "fulfilled", value: await mapper(values[index], index) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

/**
 * Extracts values from fulfilled settled results.
 *
 * @template T
 * @param {readonly PromiseSettledResult<T>[]} results Settled results to filter in their existing order.
 * @returns {T[]} Values from fulfilled entries only.
 * @throws {TypeError} If results is not an array.
 * @example
 * fulfilledValues(await Promise.allSettled([Promise.resolve(1), Promise.reject("no")])); // [1]
 * @since 2.0.0
 */
export function fulfilledValues(results) {
  if (!Array.isArray(results)) throw new TypeError("results must be an array.");
  return results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
}

/**
 * Waits for a duration and optionally supports cancellation.
 *
 * @param {number} milliseconds Finite duration from 0 through 2,147,483,647 milliseconds.
 * @param {{signal?: AbortSignal}} [options] Optional cancellation signal.
 * @returns {Promise<void>} Promise fulfilled after the duration or rejected on cancellation.
 * @throws {TypeError} If signal does not implement the AbortSignal contract.
 * @throws {RangeError} If milliseconds is outside the host timer range.
 * @example
 * await delay(250, { signal: controller.signal });
 * @since 2.0.0
 */
export function delay(milliseconds, { signal } = {}) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0 || milliseconds > 2_147_483_647) {
    throw new RangeError("milliseconds must be between 0 and 2147483647.");
  }
  if (signal !== undefined && (
    signal === null || typeof signal !== "object" ||
    typeof signal.aborted !== "boolean" ||
    typeof signal.addEventListener !== "function" ||
    typeof signal.removeEventListener !== "function"
  )) {
    throw new TypeError("signal must be an AbortSignal.");
  }
  if (signal?.aborted) return Promise.reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
  const abortSignal = signal;

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timeout);
      abortSignal?.removeEventListener("abort", onAbort);
      reject(abortSignal?.reason ?? new DOMException("Aborted", "AbortError"));
    };
    const timeout = setTimeout(() => {
      abortSignal?.removeEventListener("abort", onAbort);
      resolve();
    }, milliseconds);
    abortSignal?.addEventListener("abort", onAbort, { once: true });
  });
}
