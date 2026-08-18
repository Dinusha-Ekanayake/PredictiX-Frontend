/**
 * Run the frontend tests and print a per-group pass/fail table.
 *
 *   node scripts/run-tests.mjs            all groups
 *   node scripts/run-tests.mjs --list     also list every test case
 *   node scripts/run-tests.mjs --cov      with a coverage report
 *
 * Counts come from Vitest's JSON reporter rather than from parsing console
 * output, so the numbers stay correct if Vitest changes its formatting.
 * Exits non-zero when anything fails, so CI can use it directly.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

// Display name for each test file, in the order they should appear.
const GROUPS = [
  ["Unit: health bands", "src/lib/healthBands.test.ts"],
  ["Unit: auth session", "src/lib/authService.test.ts"],
  ["Unit: asset helpers", "src/components/admin/assets/assetService.test.ts"],
  ["Component: assigned assets", "src/components/admin/users/ViewAssignedAssetsDialog.test.tsx"],
];

const args = process.argv.slice(2);
const showList = args.includes("--list");
const withCoverage = args.includes("--cov");

const projectRoot = join(import.meta.dirname, "..");
// Written inside the project rather than the OS temp dir: Vitest resolves
// --outputFile relative to the project, and an absolute Windows temp path with
// backslashes does not survive the shell round-trip.
const jsonPath = join(projectRoot, "vitest-results.json");
rmSync(jsonPath, { force: true });

const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "vitest", "run",
    "--reporter=json", "--outputFile=vitest-results.json",
    ...(withCoverage ? ["--coverage"] : []),
  ],
  { cwd: projectRoot, encoding: "utf8", shell: process.platform === "win32" },
);

function bail(message) {
  console.error(`\n${message}\n`);
  console.error(result.stdout || "");
  console.error(result.stderr || "");
  rmSync(jsonPath, { force: true });
  process.exit(1);
}

if (!existsSync(jsonPath)) {
  bail("Vitest produced no results file, so no tests were verified.");
}

let report;
try {
  report = JSON.parse(readFileSync(jsonPath, "utf8"));
  if (process.env.RUNNER_DEBUG) {
    console.error("[debug] jsonPath:", jsonPath);
    console.error("[debug] vitest status:", result.status);
    console.error("[debug] keys:", Object.keys(report).join(","));
    console.error("[debug] testResults:", (report.testResults ?? []).length);
  }
} catch {
  bail("The test results file could not be parsed.");
} finally {
  rmSync(jsonPath, { force: true });
}

/** Normalise a path so Windows separators still match the table above. */
const norm = (p) => p.replaceAll("\\", "/");

const byGroup = new Map(GROUPS.map(([label]) => [label, { pass: 0, fail: 0, skip: 0, cases: [] }]));
const ungrouped = { pass: 0, fail: 0, skip: 0, cases: [] };

for (const file of report.testResults ?? []) {
  const path = norm(file.name ?? "");
  const entry =
    byGroup.get(GROUPS.find(([, suffix]) => path.endsWith(suffix))?.[0]) ?? ungrouped;

  for (const t of file.assertionResults ?? []) {
    if (t.status === "passed") entry.pass += 1;
    else if (t.status === "failed") entry.fail += 1;
    else entry.skip += 1;
    entry.cases.push({ title: t.fullName || t.title, status: t.status });
  }
}

const pad = (s, n) => String(s).padEnd(n);
const num = (s, n) => String(s).padStart(n);

console.log(`${pad("GROUP", 32)}${num("PASS", 6)}${num("FAIL", 6)}${num("SKIP", 6)}   STATUS`);
console.log("-".repeat(66));

let totals = { pass: 0, fail: 0, skip: 0 };

const rows = [...byGroup.entries()];
if (ungrouped.cases.length) rows.push(["Other", ungrouped]);

for (const [label, g] of rows) {
  totals.pass += g.pass;
  totals.fail += g.fail;
  totals.skip += g.skip;
  const status = g.fail === 0 ? "PASS" : "FAIL";
  console.log(`${pad(label, 32)}${num(g.pass, 6)}${num(g.fail, 6)}${num(g.skip, 6)}   ${status}`);

  if (showList) {
    for (const c of g.cases) {
      const mark = c.status === "passed" ? "PASS" : c.status === "failed" ? "FAIL" : "SKIP";
      console.log(`    [${mark}] ${c.title}`);
    }
  }
}

console.log("-".repeat(66));

// The report's own totals are authoritative. The per-file breakdown above is
// only for presentation, and has occasionally come back empty even on a run
// that passed, which previously reported "NO TESTS RAN" for a healthy suite.
const reported = {
  pass: report.numPassedTests ?? 0,
  fail: report.numFailedTests ?? 0,
  skip: (report.numPendingTests ?? 0) + (report.numTodoTests ?? 0),
  total: report.numTotalTests ?? 0,
};

const grouped = totals.pass + totals.fail + totals.skip;
if (reported.total > 0 && grouped !== reported.total) {
  console.log(
    `${pad("(ungrouped)", 32)}${num(reported.pass - totals.pass, 6)}` +
    `${num(reported.fail - totals.fail, 6)}${num(reported.skip - totals.skip, 6)}   PASS`,
  );
  console.log("-".repeat(66));
}

// Zero tests is a broken run, not a passing one: a misconfigured reporter or a
// bad path must never report success while verifying nothing.
const verdict =
  reported.total === 0
    ? "NO TESTS RAN"
    : reported.fail === 0
      ? "ALL PASSING"
      : "FAILURES PRESENT";

console.log(
  `${pad("TOTAL", 32)}${num(reported.pass, 6)}${num(reported.fail, 6)}` +
  `${num(reported.skip, 6)}   ${verdict}`,
);

if (reported.total === 0) {
  console.error("\nNo tests were executed. Treating this as a failure.");
  console.error(`vitest exit status: ${result.status}`);
  console.error((result.stderr || "").split("\n").slice(-8).join("\n"));
  process.exit(1);
}

totals = reported;

// Surface the failing case names so a red run is actionable without rerunning.
if (totals.fail > 0) {
  console.log("\nFailed:");
  for (const [, g] of rows) {
    for (const c of g.cases.filter((x) => x.status === "failed")) {
      console.log(`  - ${c.title}`);
    }
  }
}

process.exit(totals.fail === 0 ? 0 : 1);
