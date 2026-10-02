// tools/check.mjs: DS-01 proof + the 4-sample suite (cover, ad-square, story,
// hebrew-hero). Runs sprint/check.mjs, then renders + audits every sample
// (brief.json -> page.html -> out.png -> design-audit.json) plus a real
// 256px thumbnail (thumb-256.png) beside each render, so the audit's
// "title legible at 256px" gate is backed by pixels a human can open.
// Exit 1 on any FAIL.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { render, parseSize } from "./render.mjs";
import { auditBrief } from "./audit.mjs";
import { thumbSize } from "./thumb.mjs";

// Full-page scaled into a 256px-wide PNG: the sample page keeps its brief
// pixel layout (often fixed-width), so a 256px viewport would crop it.
// An iframe at full brief size with CSS scale-down screenshots the whole
// hero the way a store listing shows it. No new dependency.
function renderThumb(dir, brief) {
  const size = parseSize(`${brief.size.w}x${brief.size.h}`);
  const t = thumbSize(size.w, size.h);
  const scale = t.w / size.w;
  const pageUrl = pathToFileURL(join(dir, brief.page ?? "page.html")).href;
  const wrap =
    `<!DOCTYPE html><html><head><meta charset="utf-8"><style>` +
    `*{margin:0;padding:0}html,body{width:${t.w}px;height:${t.h}px;overflow:hidden;background:#fff}` +
    `iframe{border:0;width:${size.w}px;height:${size.h}px;transform:scale(${scale});transform-origin:top left;}` +
    `</style></head><body><iframe src="${pageUrl}"></iframe></body></html>`;
  const wrapFile = join(tmpdir(), `ds-thumb-${basename(dir)}.html`);
  writeFileSync(wrapFile, wrap, "utf8");
  // Scaled heroes carry text edges (cover measures 5567B); a blank crop is
  // ~495B, so a 1024B floor rejects blanks without punishing simple designs.
  return render(wrapFile, join(dir, "thumb-256.png"), t, { minBytes: 1024 });
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SAMPLES = ["cover", "ad-square", "story", "hebrew-hero"].map((n) => join(ROOT, "samples", n, "brief.json"));

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

// 2. Render + audit every sample brief.
for (const SAMPLE of SAMPLES) {
  const name = SAMPLE.split("samples")[1] ?? SAMPLE;
  console.log(`--- samples${name.replace(/\\/g, "/").replace("/brief.json", "")} ---`);
  if (!existsSync(SAMPLE)) {
    console.log(`[FAIL] sample: ${SAMPLE} missing`);
    fails += 1;
    continue;
  }
  try {
    const brief = JSON.parse(readFileSync(SAMPLE, "utf8"));
    const dir = dirname(SAMPLE);
    const r = render(join(dir, brief.page ?? "page.html"), join(dir, brief.image ?? "out.png"), parseSize(`${brief.size.w}x${brief.size.h}`));
    console.log(`[PASS] render: ${r.w}x${r.h} ${r.bytes}B`);
  } catch (e) {
    console.log(`[FAIL] render: ${e.message}`);
    fails += 1;
  }
  try {
    const brief = JSON.parse(readFileSync(SAMPLE, "utf8"));
    const t = renderThumb(dirname(SAMPLE), brief);
    console.log(`[PASS] thumb: thumb-256.png ${t.w}x${t.h} ${t.bytes}B`);
  } catch (e) {
    console.log(`[FAIL] thumb: ${e.message}`);
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

console.log(fails ? `RESULT FAIL: ${fails} failing check(s)` : "RESULT PASS: loop check plus 4 sample renders plus thumbs plus audits");
if (fails) process.exitCode = 1;
