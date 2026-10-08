// tools/compose.mjs: standalone image-composition commands for the store lane (NEED-08, order O-026).
//
// The store maker hand-rolled system picks and side-by-side PNGs through
// `tools/cover.mjs compare`; the review chain (`sprint/queue/chain/review.md`)
// and the store/social/game seats call this tool instead:
//
//   node tools/compose.mjs compare <ours.png> <theirs.png> --widths 256,315 --out <compare.png>
//     side-by-side rows at each listing width (default 256,315); prints COMPARE <out>.
//   node tools/compose.mjs svg2png <a.svg> --out <b.png> [--width 1280] [--height 720]
//     rasterize one of our own SVG shapes through the local browser (game lane); prints SVG2PNG <out>.
//   node tools/compose.mjs --check   (COMPOSE PASS: pure gates + one TEMP-dir end-to-end compare)
//
// Own code, no donor: the compare layout is adapted from `tools/cover.mjs`
// compare() (this repo, read 2026-10-04) and renders through `tools/render.mjs`
// (local Edge/Chrome headless, no network). Center arsenal `--list` on
// 2026-10-04 shows no compose/donor/mockup/compare tool in any repo, and the
// factory `preview/make_cover_*.py` scripts draw covers, they never compose a
// side-by-side: nothing to steal, so this file is the first implementation.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { render, pngDims } from "./render.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_WIDTHS = [256, 315];

export function parseWidths(raw) {
  const src = raw ?? DEFAULT_WIDTHS.join(",");
  const list = String(src)
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n >= 16 && n <= 1280);
  if (list.length === 0) throw new Error(`bad --widths ${JSON.stringify(raw)} (want ints 16..1280, e.g. 256,315)`);
  return [...new Set(list)].sort((a, b) => a - b);
}

export function parseArgs(args) {
  let widths = null;
  let out = null;
  let width = 1280;
  let height = null;
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--widths" && args[i + 1] != null) widths = parseWidths(args[++i]);
    else if (a.startsWith("--widths=")) widths = parseWidths(a.slice("--widths=".length));
    else if (a === "--out" && args[i + 1] != null) out = args[++i];
    else if (a.startsWith("--out=")) out = a.slice("--out=".length);
    else if (a === "--width" && args[i + 1] != null) width = Number(args[++i]);
    else if (a.startsWith("--width=")) width = Number(a.slice("--width=".length));
    else if (a === "--height" && args[i + 1] != null) height = Number(args[++i]);
    else if (a.startsWith("--height=")) height = Number(a.slice("--height=".length));
    else if (!a.startsWith("-")) rest.push(a);
  }
  return { rest, widths: widths ?? [...DEFAULT_WIDTHS], out, width, height };
}

function mustPng(path, role) {
  if (!path || !/\.png$/i.test(path)) throw new Error(`${role} must be a .png path (got ${JSON.stringify(path)})`);
  if (!existsSync(path)) throw new Error(`${role} missing: ${path}`);
  return path;
}

function rowHtml(label, srcUrl, w, h) {
  return `<div><p>${label} ${w}px</p><img src="${srcUrl}" style="width:${w}px;height:${h}px"></div>`;
}

export function buildCompareHtml(ours, theirs, widths) {
  const od = pngDims(readFileSync(ours));
  const td = pngDims(readFileSync(theirs));
  const rows = widths
    .map((w) => {
      const ho = Math.max(1, Math.round((w * od.h) / od.w));
      const ht = Math.max(1, Math.round((w * td.h) / td.w));
      const ou = pathToFileURL(resolve(ours)).href;
      const tu = pathToFileURL(resolve(theirs)).href;
      return { w, ho, ht, html: `<div class="r">${rowHtml("ours", ou, w, ho)}${rowHtml("theirs", tu, w, ht)}</div>` };
    });
  const height = Math.min(1600, 20 + rows.reduce((n, r) => n + r.ho + r.ht + 22, 0));
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}body{background:#888;font:12px Arial;color:#fff;padding:10px;width:760px}.r{display:flex;gap:16px;margin-bottom:14px;align-items:flex-start}p{margin:0 0 3px}</style></head><body>${rows.map((r) => r.html).join("")}</body></html>`;
  return { html, height };
}

export function runCompare({ ours, theirs, widths = [...DEFAULT_WIDTHS], out }) {
  mustPng(ours, "ours");
  mustPng(theirs, "theirs");
  const ws = widths.length ? widths : [...DEFAULT_WIDTHS];
  if (!out) throw new Error("no --out compare.png given");
  const { html, height } = buildCompareHtml(ours, theirs, ws);
  const f = join(tmpdir(), `ds-compose-${process.pid}.html`);
  writeFileSync(f, html, "utf8");
  mkdirSync(dirname(resolve(out)), { recursive: true });
  const r = render(f, out, { w: 780, h: height }, { minBytes: 1024 });
  const got = pngDims(readFileSync(resolve(out)));
  return { out, bytes: r.bytes, w: got.w, h: got.h, widths: ws };
}

// Intrinsic SVG size: width/height attrs win, else viewBox, else 1:1 at --width.
export function svgSize(svgText, fallbackW) {
  const num = (re) => {
    const m = String(svgText).match(re);
    return m ? Number(m[1]) : null;
  };
  let w = num(/<svg[^>]*\bwidth="([\d.]+)(?:px)?"/i);
  let h = num(/<svg[^>]*\bheight="([\d.]+)(?:px)?"/i);
  if (w && h) return { w, h };
  const vb = String(svgText).match(/viewBox="([\d.\-\s]+)"/i);
  if (vb) {
    const p = vb[1].trim().split(/\s+/).map(Number);
    if (p.length === 4 && p[2] > 0 && p[3] > 0) {
      if (w && !h) return { w, h: Math.max(1, Math.round((w * p[3]) / p[2])) };
      return { w: p[2], h: p[3] };
    }
  }
  if (w && !h) return { w, h: w };
  return { w: fallbackW, h: fallbackW };
}

export function runSvg2png({ svg, out, width = 1280, height = null }) {
  if (!svg || !/\.svg$/i.test(svg)) throw new Error(`svg must be a .svg path (got ${JSON.stringify(svg)})`);
  if (!existsSync(svg)) throw new Error(`svg missing: ${svg}`);
  if (!out) throw new Error("no --out png given");
  if (!Number.isInteger(width) || width < 16 || width > 4096) throw new Error(`bad --width ${width} (want 16..4096)`);
  const text = readFileSync(svg, "utf8");
  if (!/<svg[\s>]/i.test(text)) throw new Error(`not an SVG: ${svg}`);
  const nat = svgSize(text, width);
  const w = width;
  const h = height ?? Math.max(1, Math.round((w * nat.h) / nat.w));
  if (!Number.isInteger(h) || h < 1 || h > 4096) throw new Error(`bad --height ${h} (want 1..4096)`);
  const url = pathToFileURL(resolve(svg)).href;
  const f = join(tmpdir(), `ds-svg2png-${process.pid}.html`);
  writeFileSync(
    f,
    `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}html,body{width:${w}px;height:${h}px;overflow:hidden;background:#fff}img{display:block;width:${w}px;height:${h}px}</style></head><body><img src="${url}"></body></html>`,
    "utf8",
  );
  mkdirSync(dirname(resolve(out)), { recursive: true });
  const r = render(f, out, { w, h }, { minBytes: 512 });
  const got = pngDims(readFileSync(resolve(out)));
  return { out, bytes: r.bytes, w: got.w, h: got.h };
}

export function selfCheck() {
  const results = [];
  const ok = (name, pass, detail) => {
    results.push({ name, pass: !!pass, detail });
    console.log(`[${pass ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };
  try {
    ok("widths default 256,315", JSON.stringify(parseWidths(null)) === "[256,315]", parseWidths(null).join(","));
  } catch (e) {
    ok("widths default 256,315", false, String(e.message));
  }
  try {
    ok("widths sort + dedupe", JSON.stringify(parseWidths("315,256,256")) === "[256,315]", "315,256,256 -> 256,315");
  } catch (e) {
    ok("widths sort + dedupe", false, String(e.message));
  }
  let threw = false;
  try {
    parseWidths("huge,0,-3");
  } catch {
    threw = true;
  }
  ok("widths FAIL closed on garbage", threw, "throws, never guesses");
  threw = false;
  try {
    mustPng("designs/O-026/nope.png", "ours");
  } catch {
    threw = true;
  }
  ok("compare FAILs closed on missing PNG", threw, "throws, never renders");
  const s1 = svgSize('<svg width="64" height="32" xmlns="http://www.w3.org/2000/svg"></svg>', 1280);
  ok("svg size reads width/height attrs", s1.w === 64 && s1.h === 32, `${s1.w}x${s1.h}`);
  const s2 = svgSize('<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"></svg>', 200);
  ok("svg size falls back to viewBox", s2.w === 100 && s2.h === 50, `${s2.w}x${s2.h}`);
  try {
    const ours = join(ROOT, "designs", "O-026", "out.png");
    const theirs = "C:/empire/autonomous-factory/products/skill-pack/fleet-pack/preview/cover-1280x720.png";
    if (!existsSync(ours) || !existsSync(theirs)) throw new Error("O-026 fixtures missing");
    const { html } = buildCompareHtml(ours, theirs, [256, 315]);
    ok(
      "compare html carries both files at both widths",
      html.includes(pathToFileURL(resolve(ours)).href) && html.includes("256px") && html.includes("315px"),
      "ours+theirs urls, 2 rows",
    );
    const out = join(tmpdir(), `ds-compose-check-${process.pid}.png`);
    const r = runCompare({ ours, theirs, widths: [256, 315], out });
    const good = existsSync(out) && r.bytes > 1024 && r.w === 780;
    ok("end-to-end compare renders to TEMP", good, `${r.w}x${r.h} ${r.bytes}B`);
  } catch (e) {
    ok("end-to-end compare renders to TEMP", false, String(e.message ?? e));
  }
  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `COMPOSE FAIL: ${fails.length} failing check(s)` : "COMPOSE PASS: compare + svg2png green");
  return fails.length === 0;
}

const isMain = (() => {
  try {
    return fileURLToPath(import.meta.url) === resolve(process.argv[1]);
  } catch {
    return false;
  }
})();
if (isMain) {
  const [cmd, ...rest] = process.argv.slice(2);
  try {
    if (cmd === "--check") {
      process.exit(selfCheck() ? 0 : 1);
    }
    if (cmd === "compare") {
      const { rest: files, widths, out } = parseArgs(rest);
      if (files.length < 2) throw new Error("usage: node tools/compose.mjs compare <ours.png> <theirs.png> --widths 256,315 --out <compare.png>");
      const r = runCompare({ ours: files[0], theirs: files[1], widths, out });
      console.log(`COMPARE ${r.out}: ours vs ${files[1]} at ${r.widths.join(",")}px (${r.w}x${r.h}, ${r.bytes}B)`);
      process.exit(0);
    }
    if (cmd === "svg2png") {
      const { rest: files, out, width, height } = parseArgs(rest);
      if (files.length < 1) throw new Error("usage: node tools/compose.mjs svg2png <a.svg> --out <b.png> [--width 1280] [--height 720]");
      const r = runSvg2png({ svg: files[0], out, width, height });
      console.log(`SVG2PNG ${r.out}: ${r.w}x${r.h}, ${r.bytes}B`);
      process.exit(0);
    }
    console.log("usage: node tools/compose.mjs compare <ours.png> <theirs.png> --widths 256,315 --out <compare.png> | node tools/compose.mjs svg2png <a.svg> --out <b.png> [--width N] | node tools/compose.mjs --check");
    process.exit(2);
  } catch (e) {
    console.log(`COMPOSE FAIL: ${e.message}`);
    process.exit(1);
  }
}
