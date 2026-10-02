// tools/thumb.mjs: 256px thumbnail renders (DS-07 workshop easy half).
// A thumbnail is a real render of the same page at 256px wide (aspect kept),
// so the audit's "title legible at 256px" gate is backed by pixels a human can
// open, not just math. No new dependency: Edge headless via tools/render.mjs.
//   node tools/thumb.mjs <samples/<name>/brief.json> [thumb.png]
//   node tools/thumb.mjs --check   (self-test: math only, no browser)
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render, parseSize } from "./render.mjs";

export const THUMB_W = 256;

// Height that keeps the brief aspect at 256px wide.
export function thumbSize(w, h) {
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 16 || h < 16) {
    throw new Error("brief size must be {w,h} ints >= 16");
  }
  return { w: THUMB_W, h: Math.max(16, Math.round((THUMB_W * h) / w)) };
}

export function thumbBrief(briefPath, outPath = null) {
  const dir = dirname(resolve(briefPath));
  const brief = JSON.parse(readFileSync(resolve(briefPath), "utf8"));
  const size = parseSize(`${brief.size.w}x${brief.size.h}`);
  const t = thumbSize(size.w, size.h);
  const out = resolve(outPath ?? join(dir, "thumb-256.png"));
  // Thumbnails are legitimately tiny PNGs; keep a 200B floor against blanks.
  const r = render(join(dir, brief.page ?? "page.html"), out, t, { minBytes: 200 });
  return { out, ...r };
}

function selfCheck() {
  const results = [];
  const t = (name, cond, detail) => {
    results.push({ name, pass: !!cond });
    console.log(`[${cond ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };
  t("cover 1280x720 -> 256x144", JSON.stringify(thumbSize(1280, 720)) === JSON.stringify({ w: 256, h: 144 }), "144px tall");
  t("story 1080x1920 -> 256x455", JSON.stringify(thumbSize(1080, 1920)) === JSON.stringify({ w: 256, h: 455 }), "455px tall");
  t("square 1080x1080 -> 256x256", JSON.stringify(thumbSize(1080, 1080)) === JSON.stringify({ w: 256, h: 256 }), "256px square");
  t("capsule 616x353 -> 256x147", JSON.stringify(thumbSize(616, 353)) === JSON.stringify({ w: 256, h: 147 }), "147px tall");
  let threw = false;
  try {
    thumbSize(0, 0);
  } catch {
    threw = true;
  }
  t("rejects insane sizes", threw, "throws on 0x0");
  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `THUMB FAIL: ${fails.length} failing check(s)` : "THUMB PASS: 256px math on 4 sizes");
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
    if (!selfCheck().pass) process.exitCode = 1;
  } else if (args.length >= 1 && !args.includes("-h") && !args.includes("--help")) {
    try {
      const r = thumbBrief(args[0], args[1] ?? null);
      console.log(`THUMB OK ${r.out} ${r.w}x${r.h} ${r.bytes}B`);
    } catch (e) {
      console.log(`THUMB FAIL ${args[0]}: ${e.message}`);
      process.exitCode = 1;
    }
  } else {
    console.log("usage: node tools/thumb.mjs <samples/<name>/brief.json> [thumb.png] | node tools/thumb.mjs --check");
    process.exit(2);
  }
}
