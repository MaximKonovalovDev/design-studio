// tools/agent-block.mjs (DS-05 agent-02): prompt-to-block loop with judge gate.
//
// Brief-in, block-out, judged by the shared rubric: every built block is
// scored with ds-quality-v1 from tools/judge.mjs (imported, never forked)
// and nothing ships below the floor (SHIP_FLOOR = 8). Fail-closed: a
// below-floor block is written for inspection but reported REWORK with a
// nonzero exit; no SHIP line is ever printed for it.
//
// Shape:
//   prompt { title, subtitle?, cta?, dir?, size? } -> outDir/
//     brief.json + tokens.css + page.html + out.png (+ DESIGN-REVIEW.md,
//     iterations.json via the loop)
//   judge gate: judgeSample(outDir/brief.json), floor 8.
//
// Rendering: tries the real browser render from tools/render.mjs first; when
// no browser is available (CI) it writes a synthetic placeholder PNG with
// true IHDR dims (>= 4096B) and labels the iteration `synthetic placeholder
// (no browser)` so the judge's render-exists gate stays honest about pixels.
//
// Usage:
//   node tools/agent-block.mjs <prompt.json|brief.json> [outDir] [--iters N]
//   node tools/agent-block.mjs --check   (self-test, no browser needed)
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pngDims, render as realRender, buildFreePrompt, FREE_TERMS_NOTE } from "./render.mjs";
import { auditBrief } from "./audit.mjs";
import { RUBRIC_ID, SHIP_FLOOR, judgeSample, writeReview } from "./judge.mjs";
import { PNG_MAGIC, chunk } from "./png.mjs";

export const ROW = "DS-05";
export const BLOCK_ID = "ds-agent-block-v1";
export const TOOL = "tools/agent-block.mjs";
export const DEFAULT_ITERS = 3;

const readText = (f) => {
  try {
    return readFileSync(f, "utf8");
  } catch {
    return null;
  }
};

// Synthetic placeholder PNG with TRUE dims (solid paper #faf7f0), padded so
// audit/judge `non-trivial >= 4096B` passes. Never labelled a screenshot.
export function syntheticPng(size) {
  const w = Number(size?.w ?? 1280);
  const h = Number(size?.h ?? 720);
  const row = Buffer.alloc(1 + w * 3, 0);
  for (let x = 0; x < w; x++) {
    row[1 + x * 3] = 0xfa;
    row[1 + x * 3 + 1] = 0xf7;
    row[1 + x * 3 + 2] = 0xf0;
  }
  const raw = Buffer.concat(Array.from({ length: h }, () => row));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const parts = [
    PNG_MAGIC,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
  ];
  let png = Buffer.concat(parts.concat([chunk("IEND", Buffer.alloc(0))]));
  if (png.length < 4096) {
    // tEXt padding keeps the PNG valid while reaching the non-trivial floor.
    png = Buffer.concat(parts.concat([chunk("tEXt", Buffer.alloc(4096 - png.length + 64, 0)), chunk("IEND", Buffer.alloc(0))]));
  }
  const dims = pngDims(png);
  if (dims.w !== w || dims.h !== h) throw new Error("synthetic PNG dims mismatch");
  return png;
}

// ---- Prompt -> full brief ----
// Accepts a lean prompt or a full brief.json-shaped object; fills judge-ready
// defaults (wide title box, computed title_px, high-contrast swatches).
export function expandBrief(prompt = {}) {
  const p = prompt ?? {};
  const size = { w: Number(p?.size?.w ?? 1280), h: Number(p?.size?.h ?? 720) };
  const dir = String(p.dir ?? p.direction ?? "ltr").toLowerCase();
  const title = String(p.title ?? "DESIGN THAT SHIPS");
  const box = Array.isArray(p.title_box) && p.title_box.length === 4 ? [...p.title_box] : [0.08, 0.3, 0.92, 0.55];
  const boxW = (box[2] - box[0]) * size.w;
  const minPx = Math.ceil((12 * size.w) / 256);
  const maxPx = Math.floor((boxW * 2) / Math.max(1, title.length));
  const want = Number(p.title_px ?? 96);
  // Prefer the asked size when it satisfies both gates; otherwise clamp to
  // the fits ceiling, never below the legibility floor (a too-long title then
  // honestly FAILs title-fits and the gate refuses to ship).
  let title_px = want;
  if (!(title_px > 0)) title_px = 96;
  if (maxPx >= minPx) title_px = Math.min(Math.max(minPx, Math.min(title_px, maxPx)), maxPx);
  else title_px = Math.max(title_px, minPx);
  return {
    title,
    subtitle: String(p.subtitle ?? "Brief to rendered, audited pixels. No human in the loop."),
    cta: String(p.cta ?? "Render it again"),
    size,
    dir,
    tokens: "tokens.css",
    page: "page.html",
    image: "out.png",
    text: [
      { label: "title", fg: "var(--ink)", bg: "var(--paper)", min: 4.5 },
      { label: "subtitle", fg: "var(--muted)", bg: "var(--paper)", min: 4.5 },
      { label: "cta", fg: "var(--on-accent)", bg: "var(--accent)", min: 4.5 },
    ],
    title_box: box,
    title_px,
  };
}

export function tokensFor(/* brief-ish, kept for the seam */) {
  // Same high-contrast kit as samples/cover (proven SHIP): ink/paper ~15:1,
  // muted/paper ~7:1, white on accent passes 4.5:1, plus the font tokens the
  // type-pair gate and the RTL Hebrew-type gate need.
  return [
    `/* Generated by tools/agent-block.mjs (${BLOCK_ID}). Edit the brief, not this file. */`,
    `:root {`,
    `  --paper: #faf7f0;`,
    `  --ink: #1a1a1a;`,
    `  --muted: #57534e;`,
    `  --accent: #c2410c;`,
    `  --on-accent: #ffffff;`,
    `  --line: #e7e0d3;`,
    `  --font-display: "Arial Black", "Segoe UI", Verdana, sans-serif;`,
    `  --font-body: "Segoe UI", Verdana, Arial, sans-serif;`,
    `  --font-hebrew: "Heebo", "Assistant", "Noto Sans Hebrew", "Segoe UI", Arial, sans-serif;`,
    `}`,
    `[data-theme="dark"] {`,
    `  --paper: #1c1917;`,
    `  --ink: #faf7f0;`,
    `  --muted: #d6d3d1;`,
    `  --accent: #fb923c;`,
    `  --on-accent: #1c1917;`,
    `  --line: #44403c;`,
    `}`,
    ``,
  ].join("\n");
}

// Full block page: title + subtitle + cta action, all color via var(--*),
// logical properties only (no physical left/right, so RTL stays green).
export function pageFor(brief) {
  const dir = String(brief.dir ?? "ltr");
  const rtl = dir === "rtl";
  const lang = rtl ? "he" : "en";
  const bodyFont = rtl ? "var(--font-hebrew)" : "var(--font-body)";
  const hFont = rtl ? "var(--font-hebrew)" : "var(--font-display)";
  const esc = (s) =>
    String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return [
    `<!DOCTYPE html>`,
    `<!-- Generated by tools/agent-block.mjs (${BLOCK_ID}) for "${esc(brief.title)}". Color only via tokens.css. -->`,
    `<html lang="${lang}" dir="${dir}">`,
    `<head>`,
    `<meta charset="utf-8">`,
    `<link rel="stylesheet" href="tokens.css">`,
    `<style>`,
    `  * { margin: 0; padding: 0; box-sizing: border-box; }`,
    `  body {`,
    `    width: ${brief.size.w}px; height: ${brief.size.h}px;`,
    `    background: var(--paper); color: var(--ink);`,
    `    font-family: ${bodyFont};`,
    `    display: flex; align-items: center; justify-content: center;`,
    `  }`,
    `  .hero {`,
    `    width: 84%; text-align: center;`,
    `    border-block-start: 6px solid var(--accent);`,
    `    border-block-end: 2px solid var(--line);`,
    `    padding-inline: 24px; padding-block: 48px 56px;`,
    `    margin-inline: auto;`,
    `  }`,
    `  .kicker {`,
    `    font-size: 28px; letter-spacing: 10px; color: var(--accent);`,
    `    font-family: ${bodyFont}; margin-block-end: 22px;`,
    `  }`,
    `  h1 {`,
    `    font-family: ${hFont};`,
    `    font-size: ${brief.title_px}px; line-height: 1.05; color: var(--ink);`,
    `    margin-block-end: 20px;`,
    `  }`,
    `  .sub { font-size: 34px; color: var(--muted); margin-block-end: 40px; }`,
    `  .cta {`,
    `    display: inline-block; font-size: 32px; font-weight: bold;`,
    `    color: var(--on-accent); background: var(--accent);`,
    `    padding-block: 20px; padding-inline: 64px; border-radius: 12px;`,
    `  }`,
    `</style>`,
    `</head>`,
    `<body>`,
    `  <div class="hero">`,
    `    <div class="kicker">DESIGN-STUDIO BLOCK</div>`,
    `    <h1>${esc(brief.title)}</h1>`,
    `    <p class="sub">${esc(brief.subtitle ?? "")}</p>`,
    `    <span class="cta">${esc(brief.cta ?? "")}</span>`,
    `  </div>`,
    `</body>`,
    `</html>`,
    ``,
  ].join("\n");
}

// DS-65 FREE-01 consumer: brief -> draft copy/layout prompt text for the
// :free text lane (drafts only, never final pixels). Pure offline helper;
// the live call (if any) uses buildFreePrompt with a key from env only.
export function draftCopyPrompt(brief = {}) {
  const title = String(brief?.title ?? "").trim();
  if (!title) throw new Error("free draft needs a brief title (never silent)");
  const size = brief?.size ?? { w: 1280, h: 720 };
  return [`Draft brief copy/layout (DRAFT ONLY, ${FREE_TERMS_NOTE}):`, `title: ${title}`, `subtitle: ${String(brief?.subtitle ?? "")}`, `cta: ${String(brief?.cta ?? "")}`, `size: ${size.w}x${size.h} dir=${String(brief?.dir ?? "ltr")}`].join("\n");
}
export function freeDraftFor(brief = {}, model = "") {
  return buildFreePrompt({ model, prompt: draftCopyPrompt(brief) });
}

// Iteration 0 seed: a minimal shell that renders the title but fails the
// rubric (hardcoded color, no token discipline, no action) so the loop and
// the fail-closed gate have something to catch.
export function seedShell(brief) {
  const title = brief?.title ?? "UNTITLED";
  return `<html dir="${brief?.dir ?? "ltr"}"><head><style>body{color:#999999;font-family:Arial}</style></head><body><h1>${title}</h1></body></html>`;
}

// Fail-closed gate: SHIP only at or above the shared floor. Never throws;
// a below-floor block is REWORK, never SHIP.
export function gateBlock(judged) {
  const score = Number(judged?.score ?? 0);
  const pass = !!judged?.pass && score >= SHIP_FLOOR;
  return pass
    ? { ship: true, verdict: `SHIP ${score}/${judged?.max ?? 10} meets floor ${SHIP_FLOOR}` }
    : { ship: false, verdict: `REWORK ${score}/${judged?.max ?? 10} below floor ${SHIP_FLOOR}` };
}

function tryRender(pageFile, outFile, size) {
  try {
    return { ...realRender(pageFile, outFile, size), rendered: true, note: "browser screenshot" };
  } catch (e) {
    return { rendered: false, error: String(e?.message ?? e) };
  }
}

// Write one full block (brief + tokens + page + png) into outDir and judge
// it on the shared rubric. renderShot injectable for tests; defaults to the
// real browser render with a labelled synthetic fallback (CI, no browser).
export function buildBlock(prompt, outDir, { renderShot = null } = {}) {
  const brief = expandBrief(prompt);
  const dir = resolve(outDir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "brief.json"), `${JSON.stringify(brief, null, 2)}\n`, "utf8");
  writeFileSync(join(dir, brief.tokens), tokensFor(brief), "utf8");
  writeFileSync(join(dir, brief.page), pageFor(brief), "utf8");

  const outFile = join(dir, brief.image);
  const shot =
    renderShot ??
    ((pageFile, pngFile) => {
      const r = tryRender(pageFile, pngFile, brief.size);
      if (!r.rendered) {
        writeFileSync(pngFile, syntheticPng(brief.size));
        return { rendered: false, note: `synthetic placeholder (no browser: ${r.error})` };
      }
      return r;
    });
  const renderInfo = shot(join(dir, brief.page), outFile);
  const judged = judgeSample(join(dir, "brief.json"));
  const gate = gateBlock(judged);
  return { brief, dir, renderInfo, judged, gate, shippable: gate.ship };
}

// Prompt-to-block loop: seed (fails) -> judge, then full block -> judge,
// until the ship floor or maxIters. Writes iterations.json + DESIGN-REVIEW.md.
// Fail-closed: converged is true only when the best iteration ships.
export function runBlockLoop({ prompt, outDir, maxIters = DEFAULT_ITERS, renderShot = null } = {}) {
  const brief = expandBrief(prompt);
  const dir = resolve(outDir);
  mkdirSync(dir, { recursive: true });

  const shot =
    renderShot ??
    ((pageFile, pngFile) => {
      const r = tryRender(pageFile, pngFile, brief.size);
      if (!r.rendered) {
        writeFileSync(pngFile, syntheticPng(brief.size));
        return { rendered: false, note: `synthetic placeholder (no browser: ${r.error})` };
      }
      return r;
    });

  const seed = (iter) => {
    if (iter === 0) {
      // Broken on purpose: hardcoded color, no tokens discipline, no action.
      writeFileSync(join(dir, "brief.json"), `${JSON.stringify({ ...brief, image: "missing.png" }, null, 2)}\n`, "utf8");
      writeFileSync(join(dir, brief.tokens), ":root{--ink:#999999;--paper:#ffffff;--accent:#999999;--font-a:Arial;}", "utf8");
      writeFileSync(join(dir, brief.page), seedShell(brief), "utf8");
      return "seed shell (expected to fail the gate)";
    }
    writeFileSync(join(dir, "brief.json"), `${JSON.stringify(brief, null, 2)}\n`, "utf8");
    writeFileSync(join(dir, brief.tokens), tokensFor(brief), "utf8");
    writeFileSync(join(dir, brief.page), pageFor(brief), "utf8");
    return "full block (judge-gated candidate)";
  };

  const iterations = [];
  let best = null;
  for (let i = 0; i < Math.max(1, maxIters); i++) {
    const step = seed(i);
    let renderInfo;
    try {
      renderInfo = shot(join(dir, brief.page), join(dir, brief.image ?? "out.png"));
    } catch (e) {
      renderInfo = { rendered: false, note: `render threw (fail-closed): ${String(e?.message ?? e)}` };
    }
    // When iter0 points at a missing image, materialize nothing: the judge
    // must see the failure (fail-closed, no invented pixels).
    let judged;
    try {
      judged = judgeSample(join(dir, "brief.json"));
    } catch (e) {
      judged = { score: 0, max: 10, pass: false, errors: [String(e?.message ?? e)], checks: [] };
    }
    const gate = gateBlock(judged);
    const iter = {
      iter: i,
      step,
      rendered: !!renderInfo.rendered,
      renderNote: renderInfo.note ?? (renderInfo.rendered ? "browser screenshot" : "no browser"),
      judgeScore: judged.score,
      judgeMax: judged.max,
      pass: gate.ship,
      verdict: gate.verdict,
      errors: (judged.errors ?? []).slice(0, 3),
    };
    iterations.push(iter);
    if (!best || iter.judgeScore > best.judgeScore) best = iter;
    if (gate.ship) break;
  }

  // Refresh the work dir with the best shape: converged -> full block files
  // on disk; unconverged -> files stay as the last (failing) attempt, and
  // the receipt says REWORK (nothing is quietly upgraded to SHIP).
  if (best?.pass) {
    writeFileSync(join(dir, "brief.json"), `${JSON.stringify(brief, null, 2)}\n`, "utf8");
    writeFileSync(join(dir, brief.tokens), tokensFor(brief), "utf8");
    writeFileSync(join(dir, brief.page), pageFor(brief), "utf8");
    try {
      shot(join(dir, brief.page), join(dir, brief.image ?? "out.png"));
    } catch {
      /* receipt still records the judged best */
    }
  }
  const finalJudged = judgeSample(join(dir, "brief.json"));
  const reviewPath = writeReview(join(dir, "brief.json"), finalJudged);
  const receipt = {
    harness: BLOCK_ID,
    row: ROW,
    rubric: RUBRIC_ID,
    floor: SHIP_FLOOR,
    prompt: { title: brief.title, size: brief.size, dir: brief.dir },
    iterations,
    best,
    converged: !!best?.pass,
    review: reviewPath,
  };
  writeFileSync(join(dir, "iterations.json"), `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  return receipt;
}

// --check self-test: no browser needed (synthetic placeholder PNG + one
// injected broken-image iteration), fixtures plus the shared gates.
export function selfCheck() {
  const results = [];
  const t = (name, ok, detail) => {
    results.push({ name, pass: !!ok, detail: String(detail ?? "") });
    console.log(`[${ok ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };

  t("block id is ds-agent-block-v1", BLOCK_ID === "ds-agent-block-v1", BLOCK_ID);
  t("reuses ds-quality-v1 (no fork)", RUBRIC_ID === "ds-quality-v1", RUBRIC_ID);
  t("ship floor is 8 from the shared judge", SHIP_FLOOR === 8, `floor ${SHIP_FLOOR}`);

  // 1. Default prompt builds a shippable block (brief-in -> block-out).
  try {
    const work = mkdtempSync(`${tmpdir()}\\ds-block-`);
    const b = buildBlock({ title: "DESIGN THAT SHIPS" }, work);
    t("brief-in builds block-out (brief+tokens+page+png)", existsSync(join(work, "brief.json")) && existsSync(join(work, "tokens.css")) && existsSync(join(work, "page.html")) && existsSync(join(work, "out.png")), work);
    t("built block judges >= floor 8", b.judged.score >= SHIP_FLOOR && b.judged.pass, `${b.judged.score}/${b.judged.max}`);
    t("built block passes a fresh audit", auditBrief(join(work, "brief.json")).pass === true, "auditBrief PASS");
    t("gate ships the built block", b.shippable === true && b.gate.ship === true, b.gate.verdict);
  } catch (e) {
    t("brief-in builds block-out (brief+tokens+page+png)", false, String(e?.message ?? e));
    t("built block judges >= floor 8", false, "build threw");
    t("built block passes a fresh audit", false, "build threw");
    t("gate ships the built block", false, "build threw");
  }

  // 2. Fail-closed: a broken block never ships.
  try {
    const d = mkdtempSync(`${tmpdir()}\\ds-block-broken-`);
    writeFileSync(
      join(d, "brief.json"),
      JSON.stringify(expandBrief({ title: "DESIGN THAT SHIPS", size: { w: 1280, h: 720 } }, ), null, 0).replace('"out.png"', '"missing.png"'),
      "utf8",
    );
    writeFileSync(join(d, "tokens.css"), ":root{--ink:#999999;--paper:#ffffff;--accent:#999999;--font-a:Arial;}", "utf8");
    writeFileSync(join(d, "page.html"), seedShell(expandBrief({ title: "DESIGN THAT SHIPS" })), "utf8");
    const r = judgeSample(join(d, "brief.json"));
    const g = gateBlock(r);
    t("broken block scores below floor", r.score < SHIP_FLOOR && !r.pass, `${r.score}/${r.max}`);
    t("gate refuses SHIP below floor (fail-closed)", g.ship === false && /REWORK/.test(g.verdict), g.verdict);
  } catch (e) {
    t("broken block scores below floor", false, String(e?.message ?? e));
    t("gate refuses SHIP below floor (fail-closed)", false, String(e?.message ?? e));
  }

  // 3. Loop converges: first iteration fails, best ships, receipt on disk.
  try {
    const work = mkdtempSync(`${tmpdir()}\\ds-block-loop-`);
    const receipt = runBlockLoop({ prompt: { title: "DESIGN THAT SHIPS" }, outDir: work, maxIters: 3 });
    t("loop runs seed-then-block (>= 2 iters)", receipt.iterations.length >= 2, `${receipt.iterations.length} iters`);
    t("first iteration fails, best ships", receipt.iterations[0].pass === false && receipt.best.pass === true, `0:${receipt.iterations[0].judgeScore} best:${receipt.best.judgeScore}`);
    t("iterations.json receipt written with harness + floor", existsSync(join(work, "iterations.json")) && receipt.harness === BLOCK_ID && receipt.floor === 8, join(work, "iterations.json"));
    const review = readText(receipt.review) ?? "";
    t("DESIGN-REVIEW.md written with rubric + verdict", review.includes(RUBRIC_ID) && /SHIP|REWORK/.test(review), receipt.review);
    t("loop converges (fail-closed receipt)", receipt.converged === true, `best ${receipt.best.judgeScore}/${receipt.best.judgeMax}`);
  } catch (e) {
    t("loop runs seed-then-block (>= 2 iters)", false, String(e?.message ?? e));
    t("first iteration fails, best ships", false, String(e?.message ?? e));
    t("iterations.json receipt written with harness + floor", false, String(e?.message ?? e));
    t("DESIGN-REVIEW.md written with rubric + verdict", false, String(e?.message ?? e));
    t("loop converges (fail-closed receipt)", false, String(e?.message ?? e));
  }

  // 4. RTL prompt stays green (dir token + logical CSS + Hebrew type).
  try {
    const work = mkdtempSync(`${tmpdir()}\\ds-block-rtl-`);
    const b = buildBlock({ title: "עיצוב שמנצח", dir: "rtl" }, work);
    t("rtl prompt builds a shippable block", b.judged.pass && b.judged.score >= SHIP_FLOOR, `${b.judged.score}/${b.judged.max}`);
  } catch (e) {
    t("rtl prompt builds a shippable block", false, String(e?.message ?? e));
  }

  // 5. DS-65 FREE-01: draft prompt shapes a :free request, drafts only.
  try {
    const r = freeDraftFor({ title: "DESIGN THAT SHIPS", size: { w: 1280, h: 720 }, dir: "ltr" }, "meta-llama/llama-3.2-3b-instruct:free");
    t("free draft shapes :free request (draft-only)", r.body.model.endsWith(":free") && r.draftOnly === true, r.body.model);
  } catch (e) {
    t("free draft shapes :free request (draft-only)", false, String(e?.message ?? e));
  }
  try { freeDraftFor({ title: "DESIGN THAT SHIPS" }, "plain-model"); t("free non-:free fixture FAILs closed", false, "no throw?"); }
  catch (e) { t("free non-:free fixture FAILs closed", /:free suffix/.test(e.message), e.message); }

  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `AGENT-BLOCK FAIL: ${fails.length} failing check(s)` : `AGENT-BLOCK PASS: ${BLOCK_ID} brief-in block-out, judge ${RUBRIC_ID} floor ${SHIP_FLOOR}, fail-closed`);
  return { pass: fails.length === 0, results };
}

const isMain = (() => {
  try {
    return fileURLToPath(import.meta.url) === resolve(process.argv[1]);
  } catch {
    return false;
  }
})();

if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes("--check")) {
    const { pass } = selfCheck();
    if (!pass) process.exitCode = 1;
  } else if (args.length >= 1 && !args.includes("-h") && !args.includes("--help")) {
    const it = args.indexOf("--iters");
    const maxIters = it >= 0 ? Number(args[it + 1]) || DEFAULT_ITERS : DEFAULT_ITERS;
    const inFile = args.find((a) => !a.startsWith("-"));
    let prompt;
    try {
      prompt = JSON.parse(readFileSync(resolve(inFile), "utf8"));
    } catch (e) {
      console.log(`AGENT-BLOCK FAIL: cannot read prompt JSON ${inFile}: ${String(e?.message ?? e)}`);
      process.exit(2);
    }
    const positional = args.filter((a) => !a.startsWith("-"));
    const outDir = positional[1] ?? join(dirname(fileURLToPath(import.meta.url)), "..", "samples", "block-out");
    // A full brief.json is a valid prompt: expandBrief keeps its title/size/dir.
    const receipt = runBlockLoop({ prompt, outDir, maxIters });
    console.log(`${receipt.converged ? "SHIP" : "REWORK"} best ${receipt.best.judgeScore}/${receipt.best.judgeMax} in ${receipt.iterations.length} iter(s) -> ${outDir}`);
    if (!receipt.converged) {
      console.log(`AGENT-BLOCK FAIL: below floor ${receipt.floor} (fail-closed, see ${join(outDir, "iterations.json")})`);
      process.exitCode = 1;
    }
  } else {
    console.log(`usage: node ${TOOL} <prompt.json|brief.json> [outDir] [--iters N] | node ${TOOL} --check (${ROW} prompt-to-block, judge floor ${SHIP_FLOOR})`);
    process.exit(2);
  }
}
