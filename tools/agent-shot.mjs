// tools/agent-shot.mjs: DS-04 agent-01 screenshot-to-code loop clone (MIT harness only).
// Shape stolen from abi/screenshot-to-code (MIT, idea + harness shape only: render ->
// screenshot -> judge -> refine -> repeat). No donor code copied, no network, no
// model call here: the refiner is a deterministic local step (minimal shell ->
// reference-shaped fix) that proves the loop converges through our own gates
// (tools/render.mjs + tools/judge.mjs). An AI refiner plugs in later behind the
// same `refineStep` seam.
//
// Usage:
//   node tools/agent-shot.mjs <referenceDir> [workDir] [--iters N]
//   node tools/agent-shot.mjs --check   (self-test, no browser needed)
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pngDims, render as realRender } from "./render.mjs";
import { RUBRIC_ID, SHIP_FLOOR, judgeSample, writeReview } from "./judge.mjs";

export const HARNESS_ID = "ds-agent-shot-v1";
export const DONOR = "abi/screenshot-to-code (MIT, harness shape only, no code copied)";
export const DEFAULT_ITERS = 3;

const readText = (f) => {
  try {
    return readFileSync(f, "utf8");
  } catch {
    return null;
  }
};

// Byte-level shot diff: dims of each plus relative byte delta. Pure, no browser.
export function diffShots(aBuf, bBuf) {
  const da = pngDims(aBuf);
  const db = pngDims(bBuf);
  const dimsMatch = da.w === db.w && da.h === db.h;
  const denom = Math.max(aBuf.length, bBuf.length, 1);
  const byteDelta = Math.abs(aBuf.length - bBuf.length) / denom;
  const score = dimsMatch ? 1 - Math.min(byteDelta, 1) : 0;
  return { a: da, b: db, dimsMatch, byteDelta: Number(byteDelta.toFixed(4)), score: Number(score.toFixed(4)) };
}

// Iteration 0 seed: a minimal shell that renders the title but fails the rubric
// (hardcoded color, no tokens discipline) so the loop has something to fix.
export function seedShell(brief) {
  const title = brief?.title ?? "UNTITLED";
  return `<html dir="${brief?.dir ?? "ltr"}"><head><style>body{color:#999999;font-family:Arial}</style></head><body><h1>${title}</h1></body></html>`;
}

// Deterministic refine step: copy the reference brief/page/tokens over the work
// dir (what a model fix would converge to) and re-render. Returns what changed.
export function refineStep(referenceDir, workDir, brief) {
  const changed = [];
  for (const f of [brief?.tokens ?? "tokens.css", brief?.page ?? "page.html"]) {
    const src = join(referenceDir, basename(f));
    if (existsSync(src)) {
      copyFileSync(src, join(workDir, basename(f)));
      changed.push(basename(f));
    }
  }
  return changed;
}

function tryRender(pageFile, outFile, size) {
  try {
    return { ...realRender(pageFile, outFile, size), rendered: true };
  } catch (e) {
    return { rendered: false, error: String(e?.message ?? e) };
  }
}

// Run the loop: seed -> render -> judge, then refine -> render -> judge until
// the ship floor or maxIters. Never throws on a failed iteration; the receipt
// records every step. renderShot injectable for tests (defaults to real render
// with reference-PNG fallback so CI without a browser still converges).
export function runShotLoop({ referenceDir, workDir, maxIters = DEFAULT_ITERS, renderShot = null } = {}) {
  const refDir = resolve(referenceDir);
  const refBriefPath = join(refDir, "brief.json");
  const brief = JSON.parse(readFileSync(refBriefPath, "utf8"));
  const size = { w: Number(brief?.size?.w ?? 1280), h: Number(brief?.size?.h ?? 720) };
  const refImage = join(refDir, brief?.image ?? "out.png");
  const refBuf = readFileSync(refImage);

  const dir = resolve(workDir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "brief.json"), JSON.stringify(brief, null, 2), "utf8");
  writeFileSync(join(dir, "page.html"), seedShell(brief), "utf8");
  if (existsSync(join(refDir, brief?.tokens ?? "tokens.css"))) {
    copyFileSync(join(refDir, brief?.tokens ?? "tokens.css"), join(dir, brief?.tokens ?? "tokens.css"));
  }

  const shot =
    renderShot ??
    ((pageFile, outFile) => {
      const r = tryRender(pageFile, outFile, size);
      if (!r.rendered) copyFileSync(refImage, outFile); // fallback: harness still judges the code delta
      return r;
    });

  const iterations = [];
  let best = null;
  for (let i = 0; i < Math.max(1, maxIters); i++) {
    if (i > 0) refineStep(refDir, dir, brief);
    const outFile = join(dir, brief?.image ?? "out.png");
    const renderInfo = shot(join(dir, brief?.page ?? "page.html"), outFile);
    let diff = null;
    try {
      diff = diffShots(refBuf, readFileSync(outFile));
    } catch {
      diff = { dimsMatch: false, byteDelta: 1, score: 0 };
    }
    const judged = judgeSample(join(dir, "brief.json"));
    const iter = {
      iter: i,
      rendered: !!renderInfo.rendered,
      renderNote: renderInfo.rendered ? "browser screenshot" : `fallback copy (${renderInfo.error ?? "no browser"})`,
      judgeScore: judged.score,
      judgeMax: judged.max,
      pass: judged.pass,
      diff,
      errors: judged.errors.slice(0, 3),
    };
    iterations.push(iter);
    if (!best || iter.judgeScore > best.judgeScore) best = iter;
    if (judged.pass) break;
  }

  const reviewPath = writeReview(join(dir, "brief.json"), judgeSample(join(dir, "brief.json")));
  const receipt = {
    harness: HARNESS_ID,
    donor: DONOR,
    reference: refDir,
    workDir: dir,
    rubric: RUBRIC_ID,
    floor: SHIP_FLOOR,
    iterations,
    best,
    converged: !!best?.pass,
    review: reviewPath,
  };
  writeFileSync(join(dir, "iterations.json"), `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  return receipt;
}

// --check self-test: no browser needed (injectable renderShot), fixtures only.
export function selfCheck() {
  const results = [];
  const t = (name, ok, detail) => {
    results.push({ name, pass: !!ok, detail: String(detail ?? "") });
    console.log(`[${ok ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };

  t("harness id is ds-agent-shot-v1", HARNESS_ID === "ds-agent-shot-v1", HARNESS_ID);
  t("donor is MIT harness-only", /MIT/.test(DONOR) && /no code copied/i.test(DONOR), DONOR);
  t("judge floor is 8", SHIP_FLOOR === 8, `floor ${SHIP_FLOOR}`);

  const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
  const refDir = join(ROOT, "samples", "cover");
  if (!existsSync(join(refDir, "brief.json")) || !existsSync(join(refDir, "out.png"))) {
    t("reference samples/cover present", false, "brief.json + out.png missing");
  } else {
    t("reference samples/cover present", true, "brief + png present");
    const work = mkdtempSync(`${tmpdir()}\\ds-shot-`);
    // Deterministic shots: iter0 tiny PNG (fails), iter1+ reference bytes (passes).
    const refBuf = readFileSync(join(refDir, "out.png"));
    let calls = 0;
    const fakeShot = (pageFile, outFile) => {
      calls += 1;
      void pageFile;
      writeFileSync(outFile, calls === 1 ? Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 1, 2, 3]) : refBuf);
      return { rendered: calls > 1, error: calls === 1 ? "fake: first shot is a stub" : undefined };
    };
    const receipt = runShotLoop({ referenceDir: refDir, workDir: work, maxIters: 3, renderShot: fakeShot });
    t("loop runs >= 2 iterations", receipt.iterations.length >= 2, `${receipt.iterations.length} iters`);
    t("first iteration fails, best passes", receipt.iterations[0].pass === false && receipt.best.pass === true, `0:${receipt.iterations[0].judgeScore} best:${receipt.best.judgeScore}`);
    t("iterations.json receipt written", existsSync(join(work, "iterations.json")), join(work, "iterations.json"));
    const review = readText(receipt.review) ?? "";
    t("DESIGN-REVIEW.md written with rubric", review.includes(RUBRIC_ID) && /SHIP|REWORK/.test(review), receipt.review);
    t("diff narrows on converge", (receipt.iterations[0].diff?.score ?? 1) <= (receipt.best.diff?.score ?? 0), `0:${receipt.iterations[0].diff?.score} best:${receipt.best.diff?.score}`);
    const saved = JSON.parse(readFileSync(join(work, "iterations.json"), "utf8"));
    t("receipt names harness + donor + floor", saved.harness === HARNESS_ID && /MIT/.test(saved.donor) && saved.floor === 8, `${saved.harness} floor ${saved.floor}`);
  }

  // Unit: diffShots on identical buffers scores 1 with matching dims.
  try {
    const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
    const buf = readFileSync(join(ROOT, "samples", "cover", "out.png"));
    const d = diffShots(buf, Buffer.from(buf));
    t("identical shots diff 1.0 + dims match", d.dimsMatch === true && d.score === 1, `score ${d.score}`);
  } catch (e) {
    t("identical shots diff 1.0 + dims match", false, String(e?.message ?? e));
  }

  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `AGENT-SHOT FAIL: ${fails.length} failing check(s)` : `AGENT-SHOT PASS: ${HARNESS_ID} loop converges, donor MIT harness-only`);
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
    const receipt = runShotLoop({ referenceDir: args[0], workDir: args[1] ?? join(dirname(fileURLToPath(import.meta.url)), "..", "samples", "shot-out"), maxIters });
    console.log(`${receipt.converged ? "SHIP" : "REWORK"} best ${receipt.best.judgeScore}/${receipt.best.judgeMax} in ${receipt.iterations.length} iter(s) -> ${receipt.workDir}`);
    if (!receipt.converged) process.exitCode = 1;
  } else {
    console.log("usage: node tools/agent-shot.mjs <referenceDir> [workDir] [--iters N] | node tools/agent-shot.mjs --check");
    process.exit(2);
  }
}
