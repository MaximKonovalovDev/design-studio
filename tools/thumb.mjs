// tools/thumb.mjs: 256px thumbnail renders (DS-07 workshop easy half).
// A thumbnail is a real render of the same page at 256px wide (aspect kept),
// so the audit's "title legible at 256px" gate is backed by pixels a human can
// open, not just math.
//
// DS-80 S60: Edge-free first. When the brief's own out.png already exists,
// the thumb is a sharp downscale of those same pixels (no browser needed:
// `thumb <brief.json>` prefers ./sharp.mjs and only falls back to the Edge
// iframe path when there is no out.png yet). Flags: --sharp forces the
// downscale (missing out.png = fail closed), --edge forces the browser path.
// Fail closed everywhere: missing out.png + no Edge = SKIP/error, never a
// blank PNG passed off as a thumb. No new dependency beyond the pinned
// in-repo sharp (Apache-2.0, see tools/sharp.mjs header).
//   node tools/thumb.mjs <samples/<name>/brief.json> [thumb.png] [--sharp|--edge]
//   node tools/thumb.mjs --check   (self-test: math + sharp, no browser)
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { render, parseSize } from "./render.mjs";

export const THUMB_W = 256;

// Height that keeps the brief aspect at 256px wide.
export function thumbSize(w, h) {
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 16 || h < 16) {
    throw new Error("brief size must be {w,h} ints >= 16");
  }
  return { w: THUMB_W, h: Math.max(16, Math.round((THUMB_W * h) / w)) };
}

// The brief's own render, when it exists: dir + (brief.image ?? "out.png").
// Null when nothing is on disk yet (the Edge fallback then builds it).
export function resolveSourcePng(briefPath, brief) {
  const dir = dirname(resolve(briefPath));
  const cand = join(dir, brief?.image ?? "out.png");
  return existsSync(cand) ? cand : null;
}

export function thumbEdge(briefPath, outPath = null) {
  const dir = dirname(resolve(briefPath));
  const brief = JSON.parse(readFileSync(resolve(briefPath), "utf8"));
  const size = parseSize(`${brief.size.w}x${brief.size.h}`);
  const t = thumbSize(size.w, size.h);
  const out = resolve(outPath ?? join(dir, "thumb-256.png"));
  // Fixed-width pages (e.g. body { width: 1280px }) crop to a sliver when
  // the viewport itself is 256px wide. Render the full brief page inside a
  // scaled iframe instead, so the 256px shot is a real miniature of the hero.
  const scale = t.w / size.w;
  const pageUrl = pathToFileURL(join(dir, brief.page ?? "page.html")).href;
  const wrap =
    `<!DOCTYPE html><html><head><meta charset="utf-8"><style>` +
    `*{margin:0;padding:0}html,body{width:${t.w}px;height:${t.h}px;overflow:hidden;background:#fff}` +
    `iframe{border:0;width:${size.w}px;height:${size.h}px;transform:scale(${scale});transform-origin:top left;}` +
    `</style></head><body><iframe src="${pageUrl}"></iframe></body></html>`;
  const wrapFile = join(tmpdir(), `ds-thumb-${basename(dir)}-${process.pid}.html`);
  writeFileSync(wrapFile, wrap, "utf8");
  // Scaled heroes carry text edges (cover measures ~5KB); a blank crop is
  // ~495B, so a 1024B floor rejects blanks without punishing simple designs.
  const r = render(wrapFile, out, t, { minBytes: 1024 });
  return { out, ...r, method: "edge" };
}

// DS-80 S60: sharp first, Edge as fallback. cover.mjs / template.mjs keep
// calling thumbBrief() synchronously (Edge path, untouched); the CLI and new
// consumers use thumbAuto(), which downscales out.png through sharp when it
// exists next to the brief (no browser) and only renders via Edge otherwise.
// --sharp forces the downscale (missing source = throw, never blank);
// --edge forces the browser even when a source exists.
export function thumbBrief(briefPath, outPath = null) {
  return thumbEdge(briefPath, outPath);
}

export async function thumbAuto(briefPath, outPath = null, { edge = false, sharp = false } = {}) {
  if (edge && sharp) throw new Error("thumb takes --sharp or --edge, never both");
  const dir = dirname(resolve(briefPath));
  const brief = JSON.parse(readFileSync(resolve(briefPath), "utf8"));
  const out = resolve(outPath ?? join(dir, "thumb-256.png"));
  const src = resolveSourcePng(briefPath, brief);
  if (sharp && !src) {
    throw new Error(`thumb --sharp needs ${join(dir, brief?.image ?? "out.png")} next to the brief (missing + no Edge fallback allowed = SKIP, never a blank PNG)`);
  }
  if (!edge && src) {
    const { sharpThumb } = await import("./sharp.mjs");
    return sharpThumb(src, out);
  }
  return thumbEdge(briefPath, outPath);
}

async function selfCheck() {
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
  // DS-80 S60 sharp checks (no browser): the pinned dep loads, a synthetic
  // PNG downscales to 256px wide, and a missing source fails closed.
  try {
    const { sharpAvailable, sharpThumb, SHARP_VERSION } = await import("./sharp.mjs");
    const ok = await sharpAvailable();
    t("sharp in-repo dep loads (Edge-free path armed)", ok, ok ? `sharp ${SHARP_VERSION} Apache-2.0` : "not installed: run npm install");
    if (ok) {
      const { mkdtempSync } = await import("node:fs");
      const { sep } = await import("node:path");
      const tiny = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
      );
      const d = mkdtempSync(`${tmpdir()}${sep}ds-thumb-check-`);
      writeFileSync(join(d, "src.png"), tiny);
      const r = await sharpThumb(join(d, "src.png"), join(d, "thumb-256.png"), { minBytes: 1 });
      t("sharp downscales 1x1 -> 256x256 (aspect kept, no browser)", r.w === 256 && r.h === 256 && r.method === "sharp", `${r.w}x${r.h} ${r.bytes}B`);
      let closed = false;
      try {
        await sharpThumb(join(d, "missing.png"), join(d, "nope.png"));
      } catch (e) {
        closed = /missing|SKIP|blank/i.test(e.message);
      }
      t("missing source fails closed (no blank thumb)", closed && !existsSync(join(d, "nope.png")), "throws, writes nothing");
    }
  } catch (e) {
    t("sharp self-check harness", false, String(e.message || e));
  }
  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `THUMB FAIL: ${fails.length} failing check(s)` : "THUMB PASS: 256px math + sharp downscale green (Edge fallback kept)");
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
    selfCheck().then(({ pass }) => {
      if (!pass) process.exitCode = 1;
    });
  } else if (args.length >= 1 && !args.includes("-h") && !args.includes("--help")) {
    (async () => {
      try {
        const positional = args.filter((a) => a !== "--sharp" && a !== "--edge");
        const r = await thumbAuto(positional[0], positional[1] ?? null, {
          sharp: args.includes("--sharp"),
          edge: args.includes("--edge"),
        });
        console.log(`THUMB OK ${r.out} ${r.w}x${r.h} ${r.bytes}B via ${r.method ?? "edge"}`);
      } catch (e) {
        console.log(`THUMB FAIL ${args[0]}: ${e.message}`);
        process.exitCode = 1;
      }
    })();
  } else {
    console.log("usage: node tools/thumb.mjs <samples/<name>/brief.json> [thumb.png] [--sharp|--edge] | node tools/thumb.mjs --check");
    console.log("default: sharp downscale of out.png next to the brief (no browser); --sharp forces it, --edge forces the Edge iframe render.");
    process.exit(2);
  }
}
