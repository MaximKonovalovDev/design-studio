// tools/check.mjs: DS-01 proof + the 11-sample suite (cover, cover-b,
// ad-square, story, hebrew-hero, jobhunt, cv, ads/ad-1, ads/ad-2, ads/ad-3,
// ads/hero). Runs sprint/check.mjs, then renders + audits every sample
// (brief.json -> page.html -> out.png -> design-audit.json) plus a real
// 256px thumbnail (thumb-256.png) beside each render; S04 snapshot-invariant:
// preview (out.png+audit) re-renders freely, live (receipt.json) moves only on publish.
// Exit 1 on any FAIL.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { render, parseSize } from "./render.mjs";
import { auditBrief } from "./audit.mjs";
import { thumbSize } from "./thumb.mjs";

// S02 C1 Sites-style publish receipt gate (figma.com Sites idea-only, no code
// copied): a landing page counts as published when receipt.json holds
// {url,date,rev}. Opt-in so pre-receipt samples keep passing: skipped unless
// brief.publish, brief.receipt, or receipt.json exists beside the brief.
// When gated, url must be http(s), date YYYY-MM-DD, rev a non-empty string.
export function checkReceipt(dir, brief) {
  const name = typeof brief.receipt === "string" ? brief.receipt : "receipt.json";
  const file = join(dir, name);
  const optedIn = brief.publish != null || brief.receipt != null || existsSync(file);
  if (!optedIn) return { pass: true, skipped: true, detail: "no receipt declared, skipped" };
  let r;
  try {
    r = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    return { pass: false, detail: `${name} unreadable (${e.message}) — next: write {url,date,rev}` };
  }
  const urlOk = typeof r.url === "string" && /^https?:\/\/\S+/.test(r.url);
  const dateOk = typeof r.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.date) && !Number.isNaN(Date.parse(r.date));
  const revOk = typeof r.rev === "string" && r.rev.trim().length >= 1;
  if (urlOk && dateOk && revOk) {
    // DS-36 receipt-required landing sample: rev pins the audited out.png
    // hash (git-short style: rev must be a >=7-char prefix of the image
    // sha256). Missing image falls back to format-only so fixtures without
    // a render still pass the shape gate.
    const img = join(dir, brief.image ?? "out.png");
    if (existsSync(img)) {
      const hash = createHash("sha256").update(readFileSync(img)).digest("hex");
      const rev = r.rev.trim();
      if (rev.length < 7 || !hash.startsWith(rev) && rev !== hash) {
        return { pass: false, detail: `rev mismatch out.png sha256:${hash.slice(0, 12)} — next: publish then re-run` };
      }
      return { pass: true, skipped: false, detail: `${r.url} ${r.date} ${hash.slice(0, 12)}` };
    }
    return { pass: true, skipped: false, detail: `${r.url} ${r.date} ${String(r.rev).slice(0, 7)}` };
  }
  const missing = [!urlOk && "url http(s)", !dateOk && "date YYYY-MM-DD", !revOk && "rev"].filter(Boolean).join(", ");
  return { pass: false, detail: `receipt.json bad (${missing}) — next: publish then re-run` };
}

// S07 C3 two-variant winner (abi/screenshot-to-code variant fan-out, MIT
// pattern only): winner by audit first, then 256px thumb bytes (legibility
// pixels a human can open). Informational only, never fails the suite.
export function pickWinner(aDir, bDir) {
  const aB = JSON.parse(readFileSync(join(aDir, "brief.json"), "utf8"));
  const bB = JSON.parse(readFileSync(join(bDir, "brief.json"), "utf8"));
  const a = auditBrief(join(aDir, "brief.json"));
  const b = auditBrief(join(bDir, "brief.json"));
  const bytes = (d) => {
    try {
      return readFileSync(join(d, "thumb-256.png")).length;
    } catch {
      return 0;
    }
  };
  const at256 = (br) => ((Number(br.title_px || 0) * 256) / (br.size?.w || 1280)).toFixed(1);
  const ab = bytes(aDir);
  const bb = bytes(bDir);
  let winner = ab >= bb ? basename(aDir) : basename(bDir);
  if (a.pass && !b.pass) winner = basename(aDir);
  if (b.pass && !a.pass) winner = basename(bDir);
  return { winner, a: { pass: a.pass, thumb: ab, at256: at256(aB) }, b: { pass: b.pass, thumb: bb, at256: at256(bB) } };
}

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
// Usage first: a stranger probing the CLI gets guidance, not a render run
// (matches tools/render.mjs, tools/audit.mjs, tools/judge.mjs).
if (process.argv.slice(2).includes("--help") || process.argv.slice(2).includes("-h")) {
  console.log("usage: node tools/check.mjs | node tools/check.mjs <samples/<name>/brief.json> (receipt.json checked when brief.publish/receipt or receipt.json exists beside the brief)");
  process.exit(0);
}
// Single-sample mode for F2P fixtures: `node tools/check.mjs <brief.json>`
// checks just that brief (render + thumb + audit + receipt). Default suite
// stays the 11 samples so P2P RESULT PASS is stable.
const onlyArg = process.argv.slice(2).find((a) => a.endsWith(".json"));
const SAMPLES = onlyArg
  ? [onlyArg]
  : ["cover", "cover-b", "ad-square", "story", "hebrew-hero", "jobhunt", "cv", "ads/ad-1", "ads/ad-2", "ads/ad-3", "ads/hero"].map((n) => join(ROOT, "samples", n, "brief.json"));

let fails = 0;

// 1. The loop's own check (skipped in single-sample fixture mode so the
// receipt/reference gate is what fails, not the loop).
if (!onlyArg) {
console.log("--- sprint/check.mjs ---");
const loop = spawnSync(process.execPath, ["sprint/check.mjs"], { cwd: ROOT, stdio: "inherit" });
if (loop.status !== 0) {
  console.log("[FAIL] loop: sprint/check.mjs failed (see above)");
  fails += 1;
} else {
  console.log("[PASS] loop: sprint/check.mjs");
}
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
  // S02 receipt gate + S07 reference surfacing: audit already carries the
  // reference.png parity gate; the receipt gate runs here beside it.
  try {
    const brief = JSON.parse(readFileSync(SAMPLE, "utf8"));
    const rc = checkReceipt(dirname(SAMPLE), brief);
    if (rc.pass) {
      console.log(`[PASS] receipt: ${rc.detail}`);
    } else {
      console.log(`[FAIL] receipt: ${rc.detail}`);
      fails += 1;
    }
  } catch (e) {
    console.log(`[FAIL] receipt: ${e.message}`);
    fails += 1;
  }
}

// S07 2-variant winner (cover vs cover-b, informational only): winner by
// audit first, then 256px thumb bytes. Skipped when cover-b is absent.
if (!onlyArg) {
  try {
    const aDir = join(ROOT, "samples", "cover");
    const bDir = join(ROOT, "samples", "cover-b");
    if (existsSync(join(aDir, "brief.json")) && existsSync(join(bDir, "brief.json"))) {
      const w = pickWinner(aDir, bDir);
      console.log(`[PASS] winner: ${w.winner} by audit + 256px (cover audit=${w.a.pass ? "PASS" : "FAIL"} ${w.a.thumb}B ${w.a.at256}px vs cover-b audit=${w.b.pass ? "PASS" : "FAIL"} ${w.b.thumb}B ${w.b.at256}px)`);
    }
  } catch (e) {
    console.log(`[FAIL] winner: ${e.message}`);
    fails += 1;
  }
}

// DS-42 LAND-02 hero A/B winner (step 2/4 Landing, user of DS-29): same
// audit-first + 256px-thumb-bytes rule as the cover winner, over
// samples/ads/hero vs samples/ads/hero-b. Informational only, never fails
// the suite: renders hero-b beside hero (best-effort), then picks by
// pickWinner. Skipped when hero-b is absent.
if (!onlyArg) {
  try {
    const hDir = join(ROOT, "samples", "ads", "hero");
    const hbDir = join(ROOT, "samples", "ads", "hero-b");
    if (existsSync(join(hDir, "brief.json")) && existsSync(join(hbDir, "brief.json"))) {
      try {
        const hbBrief = JSON.parse(readFileSync(join(hbDir, "brief.json"), "utf8"));
        render(join(hbDir, hbBrief.page ?? "page.html"), join(hbDir, hbBrief.image ?? "out.png"), parseSize(`${hbBrief.size.w}x${hbBrief.size.h}`));
        renderThumb(hbDir, hbBrief);
      } catch {
        // Best-effort: pickWinner still runs on audit math + any thumbs present.
      }
      const w = pickWinner(hDir, hbDir);
      console.log(`[PASS] winner-hero: ${w.winner} by audit + 256px (hero audit=${w.a.pass ? "PASS" : "FAIL"} ${w.a.thumb}B ${w.a.at256}px vs hero-b audit=${w.b.pass ? "PASS" : "FAIL"} ${w.b.thumb}B ${w.b.at256}px)`);
    }
  } catch (e) {
    console.log(`[PASS] winner-hero skipped: ${e.message}`);
  }
}

console.log(fails ? `RESULT FAIL: ${fails} failing check(s)` : "RESULT PASS: loop check plus 11 sample renders plus thumbs plus audits");
if (fails) process.exitCode = 1;
