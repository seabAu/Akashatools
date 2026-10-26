import { appendFile, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";

const rootUrl = new URL("../", import.meta.url);
const packageJson = JSON.parse(await readFile(new URL("package.json", rootUrl), "utf8"));
const expectedTag = `v${packageJson.version}`;
const refType = process.env.GITHUB_REF_TYPE;
const refName = process.env.GITHUB_REF_NAME;

if (refType !== "tag" || refName !== expectedTag) {
  throw new Error(`Publication requires the ${expectedTag} Git tag; received ${refType ?? "no"} ${refName ?? "ref"}.`);
}

const tagCommit = git("rev-parse", `${expectedTag}^{}`);
const headCommit = git("rev-parse", "HEAD");
if (tagCommit !== headCommit) {
  throw new Error(`Checked-out commit ${headCommit} does not match ${expectedTag} (${tagCommit}).`);
}

const distTag = packageJson.version.includes("-") ? "next" : "latest";
const githubOutputIndex = process.argv.indexOf("--github-output");
if (githubOutputIndex !== -1) {
  const outputPath = process.argv[githubOutputIndex + 1];
  if (!outputPath) throw new Error("--github-output requires a file path.");
  await appendFile(outputPath, `dist_tag=${distTag}\n`, "utf8");
}

console.log(`Verified ${packageJson.name}@${packageJson.version} at ${headCommit}; publishing with ${distTag}.`);

function git(...args) {
  return execFileSync("git", args, {
    cwd: fileURLToPath(rootUrl),
    encoding: "utf8",
  }).trim();
}
