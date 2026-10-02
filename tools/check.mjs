// tools/check.mjs: DS-01 proof. Runs sprint/check.mjs, then renders + audits
// the sample brief in samples/cover (brief.json -> page.html -> out.png ->
// design-audit.json). Exit 1 on any FAIL.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render, parseSize } from "./render.mjs";
import { auditBrief } from "./audit.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SAMPLE = join(ROOT, "samples", "cover", "brief.json");

let fails = 0;

// 1. The loop's own check.
console.log("--- sprint/check.mjs ---");
const loop = spawnSync(process.execPath, ["sprint/check.mjs"], { cwd: ROOT, stdio: "inherit" });
if (loop.status !== 0) {
  console.log("[FAIL] loop: sprint/check.mjs failed (see above)");
  fails += 1;
} else {
  console.log("[PASS] loop: sprint/check.mjs");
}

// 2. Render + audit the sample brief.
console.log("--- samples/cover ---");
if (!existsSync(SAMPLE)) {
  console.log(`[FAIL] sample: ${SAMPLE} missing`);
  fails += 1;
} else {
  try {
    const brief = JSON.parse((await import("node:fs")).readFileSync(SAMPLE, "utf8"));
    const dir = dirname(SAMPLE);
    const r = render(join(dir, brief.page ?? "page.html"), join(dir, brief.image ?? "out.png"), parseSize(`${brief.size.w}x${brief.size.h}`));
    console.log(`[PASS] render: ${r.w}x${r.h} ${r.bytes}B`);
  } catch (e) {
    console.log(`[FAIL] render: ${e.message}`);
    fails += 1;
  }
  const { pass, errors } = auditBrief(SAMPLE);
  if (pass) {
    console.log("[PASS] audit: design-audit.json written, all gates green");
  } else {
    for (const e of errors) console.log(`[FAIL] audit: ${e}`);
    fails += errors.length;
  }
}

console.log(fails ? `RESULT FAIL: ${fails} failing check(s)` : "RESULT PASS: loop check plus sample render plus audit");
if (fails) process.exitCode = 1;
