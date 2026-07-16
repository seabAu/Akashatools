import os from "node:os";

/** Prints the runtime context that materially affects timing results. */
export function printEnvironment(title) {
  const cpu = os.cpus()[0]?.model ?? "unknown CPU";
  console.log(`# ${title}`);
  console.log();
  console.log(`Node ${process.versions.node}; ${os.type()} ${os.release()}; ${process.arch}; ${cpu}`);
  console.log("Warmups: 3 per strategy. Times use process.hrtime.bigint().");
  console.log();
}

/** Measures one synchronous operation after fixed warmup rounds. */
export function measure(samples, operation, warmups = 3) {
  for (let index = 0; index < warmups; index += 1) operation();
  const durations = Array.from({ length: samples }, () => {
    const start = process.hrtime.bigint();
    operation();
    return Number(process.hrtime.bigint() - start) / 1_000_000;
  });
  return summarize(durations);
}

/** Prints a stable Markdown result table. */
export function printTable(rows) {
  console.log("| Strategy | Scale | Items | Samples | Median ms | Min-max ms | Std dev ms | Relative |");
  console.log("| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of rows) {
    console.log(
      `| ${row.strategy} | ${row.scale} | ${row.items.toLocaleString("en-US")} | ${row.samples} | ${row.median.toFixed(3)} | ${row.minimum.toFixed(3)}-${row.maximum.toFixed(3)} | ${row.standardDeviation.toFixed(3)} | ${(row.baseline / row.median).toFixed(1)}x |`,
    );
  }
}

/** @param {number[]} values */
function summarize(values) {
  const ordered = values.toSorted((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  const median = ordered.length % 2 === 0 ? (ordered[middle - 1] + ordered[middle]) / 2 : ordered[middle];
  const mean = ordered.reduce((total, value) => total + value, 0) / ordered.length;
  const variance = ordered.reduce((total, value) => total + (value - mean) ** 2, 0) / ordered.length;
  return {
    samples: ordered.length,
    median,
    minimum: ordered[0],
    maximum: ordered.at(-1),
    standardDeviation: Math.sqrt(variance),
  };
}
