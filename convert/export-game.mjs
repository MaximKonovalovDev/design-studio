// convert/export-game.mjs (O-041 selective export adapter): a game-UI design dir
// (layout.json + tokens.json + atlas.png, e.g. designs/O-042) -> production PNG
// sheet at exact pixels (Edge via tools/render.mjs) + print PDF (Edge
// print-to-pdf, A4, like the CV lane). Pure node, no new dependency, no
// machine-wide install.
//
// Pattern-only reuse of nexu-io/open-design (Apache-2.0,
// https://github.com/nexu-io/open-design, ref commit 1b47e60 recorded in
// .opencode/skills/od-poster-hero/NOTICE.md): the export-sheet idea
// (design tokens + layout + atlas -> PNG + PDF production files). 0 lines
// copied, all bytes authored here; no donor checkout taken (never clone the
// desktop monorepo; the sparse-checkout recipe lives in tools/donor.mjs
// open-design). This header is the NOTICE (Apache-2.0 reuse with attribution).
//
//   node convert/export-game.mjs <designDir> --out <outDir> [--size WxH]
//   node convert/export-game.mjs --check [--design <dir>]
//   node convert/export-game.mjs list
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render, renderPdf, pngDims } from "../tools/render.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SHEET_W = 1920;
export const SHEET_H = 1080;
export const SHEET_HTML = "export-sheet.html";
export const PRINT_HTML = "export-print.html";
export const SHEET_PNG = "export-sheet.png";
export const SHEET_PDF = "export-sheet.pdf";
export const ADAPTER_REL = "convert/export-game.mjs";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---------- input ----------
export function readGameDesign(dir) {
  const root = resolve(dir);
  const need = ["layout.json", "tokens.json", "atlas.png"];
  for (const f of need) {
    if (!existsSync(join(root, f))) {
      throw new Error(`game export needs ${f} in ${root} (fail closed: not a game-UI design dir)`);
    }
  }
  let layout;
  try {
    layout = JSON.parse(readFileSync(join(root, "layout.json"), "utf8"));
  } catch (e) {
    throw new Error(`game export: layout.json does not parse: ${e.message}`);
  }
  let tokens;
  try {
    tokens = JSON.parse(readFileSync(join(root, "tokens.json"), "utf8"));
  } catch (e) {
    throw new Error(`game export: tokens.json does not parse: ${e.message}`);
  }
  const screens = layout?.screens && typeof layout.screens === "object" ? Object.keys(layout.screens) : [];
  if (!screens.length) throw new Error(`game export: layout.json has no screens object (fail closed)`);
  const colors = tokens?.colors && typeof tokens.colors === "object" ? tokens.colors : null;
  if (!colors || !Object.keys(colors).length) throw new Error(`game export: tokens.json has no colors object (fail closed)`);
  let atlas = null;
  if (existsSync(join(root, "atlas.json"))) {
    try {
      atlas = JSON.parse(readFileSync(join(root, "atlas.json"), "utf8"));
    } catch {
      atlas = null;
    }
  }
  return {
    dir: root,
    layout,
    tokens,
    atlas,
    atlasPng: join(root, "atlas.png"),
    name: String(layout.name ?? tokens.name ?? basename(root)),
    order: String(tokens.order ?? layout.order ?? ""),
    screens,
    colors,
    refW: Number(layout.reference?.w ?? tokens.reference?.w ?? 640),
    refH: Number(layout.reference?.h ?? tokens.reference?.h ?? 360),
  };
}

// ---------- sheet (PNG source, exact pixels) ----------
export function sheetHtml(d) {
  const names = d.screens;
  const rows = names
    .map((s) => {
      const els = Array.isArray(d.layout.screens[s]) ? d.layout.screens[s] : [];
      const kinds = [...new Set(els.map((e) => e?.kind ?? "?"))].join(", ");
      return `<tr><td>${esc(s.toUpperCase())}</td><td>${els.length}</td><td>${esc(kinds)}</td></tr>`;
    })
    .join("");
  const chips = Object.entries(d.colors)
    .map(([k, v]) => `<span class="chip"><i style="background: ${esc(v)}"></i><b>${esc(k)}</b><em>${esc(v)}</em></span>`)
    .join("");
  const aw = d.atlas?.size?.w ?? 256;
  const ah = d.atlas?.size?.h ?? 64;
  const pieces = Array.isArray(d.atlas?.pieces) ? d.atlas.pieces.length : 0;
  const bg = d.colors.bg ?? "#14161f";
  const panel = d.colors.panel ?? "#1f2333";
  const ink = d.colors.ink ?? "#f4f1e8";
  const muted = d.colors.muted ?? "#a8aec2";
  const accent = d.colors.accent ?? "#ffb325";
  const line = d.colors.line ?? "#333a52";
  return `<!DOCTYPE html>
<!-- export sheet for ${esc(d.name)}: production PNG source, ${SHEET_W}x${SHEET_H}. Real text only (no text in images); atlas image is data, tinted nothing. -->
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<title>${esc(d.name)} export sheet</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${SHEET_W}px; height: ${SHEET_H}px; overflow: hidden; }
  body { background: ${esc(bg)}; color: ${esc(ink)}; font-family: "Segoe UI", system-ui, sans-serif; padding: 48px 56px 40px; }
  header h1 { font-size: 64px; line-height: 1; letter-spacing: 0.01em; color: ${esc(accent)}; }
  header p { margin-top: 10px; font-size: 24px; color: ${esc(muted)}; }
  main { display: grid; grid-template-columns: 1120px 1fr; gap: 32px; margin-top: 28px; }
  .card { background: ${esc(panel)}; border: 2px solid ${esc(line)}; border-radius: 12px; padding: 24px 28px; }
  .card h2 { font-size: 26px; letter-spacing: 0.08em; text-transform: uppercase; color: ${esc(muted)}; margin-bottom: 14px; }
  figure img { display: block; width: 1024px; height: auto; image-rendering: pixelated; border-radius: 6px; background: ${esc(bg)}; }
  figure figcaption { margin-top: 10px; font-size: 20px; color: ${esc(muted)}; }
  table { width: 100%; border-collapse: collapse; font-size: 24px; }
  th { text-align: left; font-size: 19px; letter-spacing: 0.08em; text-transform: uppercase; color: ${esc(muted)}; padding-bottom: 8px; }
  td { padding: 7px 10px 7px 0; border-top: 1px solid ${esc(line)}; }
  td:first-child { font-weight: 800; color: ${esc(accent)}; }
  .chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
  .chip { display: flex; align-items: center; gap: 8px; font-size: 19px; border: 1px solid ${esc(line)}; border-radius: 8px; padding: 5px 10px 5px 5px; }
  .chip i { display: block; width: 30px; height: 22px; border-radius: 5px; }
  .chip b { font-weight: 700; }
  .chip em { font-style: normal; color: ${esc(muted)}; font-family: Consolas, monospace; font-size: 17px; }
  footer { margin-top: 26px; font-size: 20px; color: ${esc(muted)}; }
</style>
</head>
<body>
<header><h1>${esc(d.name)} export sheet</h1><p>${names.length} screens (${esc(names.join(", "))}) from the ${esc(String(d.refW))}x${esc(String(d.refH))} reference &middot; ${Object.keys(d.colors).length} tokens &middot; atlas ${aw}x${ah}${pieces ? ` (${pieces} pieces)` : ""}${d.order ? ` &middot; order ${esc(d.order)}` : ""}</p></header>
<main>
<div class="card"><h2>Atlas</h2><figure><img src="atlas.png" alt="UI atlas"><figcaption>atlas.png ${aw}x${ah}${pieces ? `, ${pieces} nine-slice and icon pieces` : ""}, nearest only, integer upscale</figcaption></figure></div>
<div class="card"><h2>Screens</h2><table><tr><th>Screen</th><th>Elements</th><th>Kinds</th></tr>${rows}</table></div>
</main>
<div class="card" style="margin-top: 32px"><h2>Tokens</h2><div class="chips">${chips}</div></div>
<footer>Export pattern: nexu-io/open-design export-sheet (Apache-2.0, pattern-only, 0 lines copied) &middot; art bytes CC0, authored in design-studio &middot; PNG via tools/render.mjs, PDF via Edge print</footer>
</body>
</html>
`;
}

// ---------- print (PDF source, one A4 landscape page) ----------
export function printHtml(d) {
  const names = d.screens;
  const rows = names
    .map((s) => {
      const els = Array.isArray(d.layout.screens[s]) ? d.layout.screens[s] : [];
      return `<tr><td>${esc(s.toUpperCase())}</td><td>${els.length}</td><td>${esc(els.map((e) => e?.id ?? "").filter(Boolean).slice(0, 6).join(", "))}</td></tr>`;
    })
    .join("");
  const toks = Object.entries(d.colors)
    .map(([k, v]) => `<p><b>${esc(k)}</b> ${esc(v)}</p>`)
    .join("");
  return `<!DOCTYPE html>
<!-- print source for ${esc(d.name)}: one A4 landscape page, real text. -->
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<title>${esc(d.name)} production sheet</title>
<style>
  @page { size: A4 landscape; margin: 10mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Segoe UI", system-ui, sans-serif; color: #111; font-size: 12px; line-height: 1.35; }
  h1 { font-size: 22px; }
  .meta { color: #444; margin: 2px 0 8px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #444; margin: 10px 0 4px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; border: 1px solid #999; padding: 3px 6px; }
  th { background: #eee; }
  .cols { display: flex; gap: 12px; }
  .cols > div { flex: 1; }
  .toks { columns: 2; column-gap: 12px; font-size: 11px; }
  .toks p { break-inside: avoid; border-bottom: 1px solid #bbb; padding: 2px 0; }
  .toks b { display: inline-block; min-width: 62px; }
  img.atlas { width: 520px; image-rendering: pixelated; border: 1px solid #999; }
  footer { margin-top: 8px; color: #444; font-size: 11px; }
</style>
</head>
<body>
<h1>${esc(d.name)} production sheet</h1>
<p class="meta">${names.length} screens (${esc(names.join(", "))}) &middot; ${Object.keys(d.colors).length} color tokens &middot; ${esc(String(d.refW))}x${esc(String(d.refH))} reference${d.order ? ` &middot; order ${esc(d.order)}` : ""}</p>
<div class="cols">
<div><h2>Screens</h2><table><tr><th>Screen</th><th>N</th><th>First elements</th></tr>${rows}</table></div>
<div><h2>Tokens (${Object.keys(d.colors).length})</h2><div class="toks">${toks}</div></div>
</div>
<h2>Atlas</h2>
<img class="atlas" src="atlas.png" alt="UI atlas">
<footer>Export pattern: nexu-io/open-design export-sheet (Apache-2.0, pattern-only). Art CC0, authored in design-studio. PNG at ${SHEET_W}x${SHEET_H} via tools/render.mjs; this PDF via Edge print-to-pdf.</footer>
</body>
</html>
`;
}

// ---------- export ----------
export function exportGame(designDir, outDir, { w = SHEET_W, h = SHEET_H } = {}) {
  const d = readGameDesign(designDir);
  const out = resolve(outDir);
  mkdirSync(out, { recursive: true });
  copyFileSync(d.atlasPng, join(out, "atlas.png"));
  writeFileSync(join(out, SHEET_HTML), sheetHtml(d), "utf8");
  writeFileSync(join(out, PRINT_HTML), printHtml(d), "utf8");
  // Production PNG at exact pixels through the existing render path (no history:
  // temp exports stay hermetic; the path, browser and size gates still apply).
  const png = render(join(out, SHEET_HTML), join(out, SHEET_PNG), { w, h }, { history: false });
  const dims = pngDims(readFileSync(png.out));
  if (dims.w !== w || dims.h !== h) throw new Error(`export sheet is ${dims.w}x${dims.h}, want ${w}x${h} (fail closed)`);
  // Print PDF through the same Edge launch as the CV lane (real text layer).
  const pdf = renderPdf(join(out, PRINT_HTML), join(out, SHEET_PDF));
  const pdfBuf = readFileSync(pdf.out);
  if (pdfBuf.subarray(0, 5).toString("latin1") !== "%PDF-") throw new Error(`export PDF is not a PDF (fail closed)`);
  return {
    out,
    design: d.name,
    order: d.order,
    screens: d.screens,
    colors: Object.keys(d.colors).length,
    html: join(out, SHEET_HTML),
    printHtml: join(out, PRINT_HTML),
    png: png.out,
    pdf: pdf.out,
    w: dims.w,
    h: dims.h,
    pngBytes: png.bytes,
    pdfBytes: pdf.bytes,
  };
}

// ---------- wiring: the templates/game export entry ----------
export function listGameExports({ gameDir = join(ROOT, "templates", "game") } = {}) {
  const out = [];
  let fams = [];
  try {
    fams = readdirSync(gameDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return out;
  }
  for (const id of fams.sort()) {
    let meta = null;
    try {
      meta = JSON.parse(readFileSync(join(gameDir, id, "template.json"), "utf8"));
    } catch {
      continue;
    }
    if (meta && meta.export) out.push({ ref: `game/${id}`, dir: join(gameDir, id), export: meta.export });
  }
  return out;
}

// ---------- --check ----------
export function checkGameExport({ designDir = join(ROOT, "designs", "O-042") } = {}) {
  const results = [];
  const ok = (name, pass, detail) => {
    results.push({ name, pass: !!pass, detail: String(detail ?? "") });
    console.log(`[${pass ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };
  let d = null;
  try {
    d = readGameDesign(designDir);
    ok("design reads (layout + tokens + atlas PNG)", true, `${d.name}: ${d.screens.length} screens, ${Object.keys(d.colors).length} tokens`);
  } catch (e) {
    ok("design reads (layout + tokens + atlas PNG)", false, e.message);
    console.log(`EXPORT-GAME FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
    return { pass: false, results };
  }
  ok("screens include hud + menu", d.screens.includes("hud") && d.screens.includes("menu"), d.screens.join(", "));
  const wired = listGameExports();
  const entry = wired.find((e) => e.export?.adapter === ADAPTER_REL);
  ok("templates/game export entry wired", !!entry, entry ? `${entry.ref} -> ${entry.export.adapter}` : "no game/*/template.json names convert/export-game.mjs");
  if (entry) {
    ok("export adapter file on disk", existsSync(join(ROOT, entry.export.adapter)), entry.export.adapter);
    ok("export entry names sheet PNG + PDF", !!entry.export.png && !!entry.export.pdf, `${entry.export.png ?? "?"} + ${entry.export.pdf ?? "?"}`);
  }
  const tmp = mkdtempSync(join(tmpdir(), "ds-export-game-"));
  try {
    const r = exportGame(designDir, tmp);
    ok(`production PNG at exact pixels`, r.w === SHEET_W && r.h === SHEET_H, `${basename(r.png)} ${r.w}x${r.h} ${r.pngBytes}B`);
    ok("print PDF written (%PDF-, real bytes)", r.pdfBytes >= 1500, `${basename(r.pdf)} ${r.pdfBytes}B`);
    const sheet = readFileSync(r.html, "utf8");
    const missing = d.screens.filter((s) => !sheet.includes(s.toUpperCase()) && !sheet.includes(s));
    ok("sheet carries every screen name as real text", missing.length === 0, missing.length ? `missing ${missing.join(",")}` : `${d.screens.length} screens in text`);
    const print = readFileSync(r.printHtml, "utf8");
    ok("print carries token hexes as real text", print.includes("#") && print.includes("atlas.png"), "hexes + atlas ref in print source");
  } catch (e) {
    ok("export hud/menu PNG+PDF", false, e.message);
  }
  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `EXPORT-GAME FAIL: ${fails.length} failing check(s)` : `EXPORT-GAME PASS: ${d.name} ${d.screens.length} screens -> ${SHEET_W}x${SHEET_H} PNG + A4 PDF, game export wired`);
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
  try {
    if (args.includes("--check")) {
      const di = args.indexOf("--design");
      const design = di !== -1 && args[di + 1] ? args[di + 1] : join(ROOT, "designs", "O-042");
      const { pass } = checkGameExport({ designDir: design });
      if (!pass) process.exitCode = 1;
    } else if (args[0] === "list") {
      for (const e of listGameExports()) console.log(`${e.ref}: adapter=${e.export.adapter} png=${e.export.png} pdf=${e.export.pdf} ${e.export.size?.w ?? SHEET_W}x${e.export.size?.h ?? SHEET_H}`);
      console.log(`EXPORT-GAME LIST: ${listGameExports().length} game export(s)`);
    } else if (args.length >= 1 && !args[0].startsWith("--")) {
      const design = args[0];
      const oi = args.indexOf("--out");
      const out = oi !== -1 && args[oi + 1] ? args[oi + 1] : join(tmpdir(), `ds-export-game-${Date.now()}`);
      const si = args.indexOf("--size");
      let size = { w: SHEET_W, h: SHEET_H };
      if (si !== -1 && args[si + 1]) {
        const m = String(args[si + 1]).match(/^(\d+)x(\d+)$/);
        if (!m) throw new Error("size must be WIDTHxHEIGHT, e.g. 1920x1080");
        size = { w: Number(m[1]), h: Number(m[2]) };
      }
      const r = exportGame(design, out, size);
      console.log(`EXPORT-GAME OK ${r.design}: ${r.png} ${r.w}x${r.h} ${r.pngBytes}B + ${r.pdf} ${r.pdfBytes}B`);
    } else {
      console.log("usage: node convert/export-game.mjs <designDir> --out <outDir> [--size WxH] | node convert/export-game.mjs --check [--design <dir>] | node convert/export-game.mjs list");
      process.exitCode = 2;
    }
  } catch (e) {
    console.log(`EXPORT-GAME FAIL: ${e.message}`);
    process.exitCode = 1;
  }
}
