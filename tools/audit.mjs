// tools/audit.mjs: S03 structured-brief prompt-shape — brief.json IS the prompt
// (node port of the factory engine/design_audit.py contract, no Python needed here).
// Reads samples/<name>/brief.json + tokens.css + page.html + out.png and writes
// design-audit.json beside the image: contrast (WCAG from resolved tokens),
// PNG size match, title box valid, 256px title legibility, overflow heuristic,
// RTL gate. Every FAIL carries a next: hint for the aimed re-prompt. Taste stays in review.
import { existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pngDims, decodePngPixels } from "./png.mjs";
import { SIZE_MATRIX } from "./render.mjs";
// Self-checks live in ./audit-checks.mjs (split, same behavior); re-exported
// here so `import ... from "./audit.mjs"` callers keep working.
import {
  rtlSelfCheck,
  sizeMatrixSelfCheck,
  adSquareReflowSelfCheck,
  listingWidthSelfCheck,
} from "./audit-checks.mjs";
export { rtlSelfCheck, sizeMatrixSelfCheck, adSquareReflowSelfCheck, listingWidthSelfCheck };

// Characters the fit estimate counts: the title length, or (when the page wraps
// the title onto several lines) the declared title_longest = chars on the longest
// line, so a two-line "BookForge" / "Pro" title is measured by "BookForge". A size
// entry may carry its own title_longest; a missing one falls back to the brief's.
export function titleChars(entry, brief) {
  const n = Number(entry?.title_longest) > 0 ? Number(entry.title_longest) : Number(brief?.title_longest) > 0 ? Number(brief.title_longest) : String(brief?.title ?? "").length;
  return n;
}

export function luminance(hex) {
  const m = String(hex ?? "").match(/^#([0-9a-fA-F]{6})$/);
  if (!m) throw new Error(`expected #rrggbb, got ${JSON.stringify(hex)}`);
  const rgb = [0, 2, 4].map((i) => Number.parseInt(m[1].slice(i, i + 2), 16) / 255);
  const lin = rgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function contrastRatio(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// :root { --name: #rrggbb; ... } -> Map name -> #rrggbb (lowercased).
// Only the :root (light theme) block: [data-theme="dark"] overrides must not
// shadow the rendered default (pages render light unless they opt into dark).
export function parseTokens(css) {
  const root = String(css ?? "").match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? String(css ?? "");
  const vars = new Map();
  const re = /--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g;
  let m;
  while ((m = re.exec(root)) !== null) vars.set(m[1], m[2].toLowerCase());
  return vars;
}

// The dark overrides in [data-theme="dark"] { ... }, if present.
export function parseTokensDark(css) {
  const dark = String(css ?? "").match(/\[data-theme\s*=\s*"dark"\]\s*\{([\s\S]*?)\}/)?.[1] ?? "";
  const vars = new Map();
  const re = /--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g;
  let m;
  while ((m = re.exec(dark)) !== null) vars.set(m[1], m[2].toLowerCase());
  return vars;
}

export function resolveColor(ref, vars) {
  const v = String(ref ?? "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  const m = v.match(/^var\(\s*--([\w-]+)\s*\)$/);
  if (m && vars.has(m[1])) return vars.get(m[1]);
  throw new Error(`unresolvable color ${JSON.stringify(ref)} (tokens hold: ${[...vars.keys()].join(", ") || "none"})`);
}

function fail(errors, what) {
  errors.push(what);
  return false;
}

// Full audit of one brief folder. Returns { pass, checks, errors, report }.
export function auditBrief(briefPath) {
  const briefFile = resolve(briefPath);
  const dir = dirname(briefFile);
  const checks = [];
  const errors = [];
  const check = (name, ok, detail, opts) => {
    const entry = { name, pass: ok, detail };
    if (opts?.skipped) entry.skipped = true;
    checks.push(entry);
    if (!ok) errors.push(`${name}: ${detail}`);
  };

  let brief;
  try {
    brief = JSON.parse(readFileSync(briefFile, "utf8"));
  } catch (e) {
    check("brief.json parses", false, `${String(e.message || e)} — next: fix JSON syntax in brief.json`);
    return finish(false, checks, errors, dir);
  }
  check("brief.json parses", true, brief.title ?? "untitled");

  const size = brief.size ?? {};
  const sizeOk = Number.isInteger(size.w) && Number.isInteger(size.h) && size.w >= 16 && size.h >= 16;
  check("brief size sane", sizeOk, sizeOk ? `${size.w}x${size.h}` : 'size must be {w,h} ints >= 16 — next: set size to e.g. {"w":1280,"h":720}');
  if (!sizeOk) return finish(false, checks, errors, dir);

  // Tokens.
  const tokensFile = join(dir, brief.tokens ?? "tokens.css");
  let vars = new Map();
  let tokensRaw = "";
  if (!existsSync(tokensFile)) {
    check("tokens.css exists", false, `${brief.tokens ?? "tokens.css"} missing — next: add tokens.css beside brief.json`);
  } else {
    tokensRaw = readFileSync(tokensFile, "utf8");
    vars = parseTokens(tokensRaw);
    check("tokens.css parses with 2+ colors", vars.size >= 2, vars.size >= 2 ? `${vars.size} vars` : `${vars.size} vars — next: declare 2+ --name: #rrggbb in :root`);
  }

  // Page.
  const pageFile = join(dir, brief.page ?? "page.html");
  let html = null;
  if (!existsSync(pageFile)) {
    check("page.html exists", false, `${brief.page ?? "page.html"} missing — next: add page.html beside brief.json`);
  } else {
    html = readFileSync(pageFile, "utf8");
    check("page.html carries the title", html.includes(brief.title ?? "\0") && (brief.title ?? "") !== "", html.includes(brief.title ?? "\0") && (brief.title ?? "") !== "" ? "title text present" : "title missing from page.html \u2014 next: carry brief.title verbatim in page.html");
    const hard = html.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
    check("no hardcoded colors in page.html", hard.length === 0, hard.length ? `hardcoded ${hard.slice(0, 3).join(", ")} — next: replace hex with var(--*) from tokens.css` : "all color via var(--*)");
    const usesVars = /var\(\s*--[\w-]+\s*\)/.test(html);
    check("page.html uses tokens", usesVars, usesVars ? "var(--*) found" : "no var(--*) reference — next: color via var(--*) from tokens.css");
  }

  // RTL gate.
  // DS-31 S09 direction-as-data token: brief.dir (alias brief.direction) is the
  // single wantDir token; every alignment question goes through it, never by
  // hunting physical left/right (already banned below).
  const wantDir = String(brief.dir ?? brief.direction ?? "ltr").toLowerCase();
  if (html != null) {
    const m = html.match(/<html[^>]*\bdir\s*=\s*"(ltr|rtl)"/i);
    if (wantDir === "rtl") {
      check("rtl: html dir=rtl", !!m && m[1].toLowerCase() === "rtl", m ? `dir=${m[1]}` : 'no dir on <html> — next: add dir="rtl" to <html>');
      const physical = html.match(/\b(margin-left|margin-right|padding-left|padding-right|left\s*:|right\s*:|float\s*:)/i);
      check("rtl: logical properties only", !physical, physical ? `physical CSS ${physical[1]} — next: use logical margin-inline/padding-inline` : "no physical left/right");
      // Hebrew type pair: tokens declare --font-hebrew (a non-color token, so
      // scan the raw CSS, not the hex-only vars map) and the page uses it.
      const declaresHebrew = /--font-hebrew\s*:/.test(tokensRaw);
      const usesHebrew = /var\(\s*--font-hebrew\s*\)/.test(html);
      check(
        "rtl: Hebrew type pair",
        declaresHebrew && usesHebrew,
        declaresHebrew ? (usesHebrew ? "page uses var(--font-hebrew)" : "page never uses var(--font-hebrew) \u2014 next: set font-family: var(--font-hebrew)") : "tokens.css lacks --font-hebrew \u2014 next: declare --font-hebrew in :root",
      );
      // S09 direction-token gate: wantDir=rtl must match <html dir>, and a
      // flex row-reverse/column-reverse without declared intent fails first
      // (warn-first: FAIL with the fix hint, never silent).
      check("direction token matches html dir", !!m && m[1].toLowerCase() === wantDir, m ? (m[1].toLowerCase() === wantDir ? `wantDir=${wantDir} dir=${m[1]}` : `wantDir=${wantDir} dir=${m[1]} \u2014 next: set <html dir to brief dir`) : `wantDir=${wantDir} no dir \u2014 next: add dir to <html> per brief dir`);
      const rev = html.match(/flex-direction\s*:\s*(row-reverse|column-reverse)/i);
      const intent = /data-dir-intent\s*=\s*["']?reverse/i.test(html) || brief.allowReverse === true;
      check("no row-reverse without intent", !rev || intent, rev ? (intent ? "reverse intent declared" : `${rev[1]} without intent \u2014 next: add data-dir-intent="reverse" or keep logical order`) : "no reverse flex");
      // RTL-02 mixed-dir mirror check: a page mixing rtl flow with latin/ltr
      // segments must not leave unmirrored physical remnants the logical
      // gate cannot see (background-position left/right, clear left/right,
      // translateX shifts). Warn-first FAIL with the mirror fix, never silent.
      const bodyText = html
        .replace(/<!--[\s\S]*?-->/g, " ")
        .replace(/<style>[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ");
      const mixedDir = /[A-Za-z]{3,}/.test(bodyText) || /<[^>]*\bdir\s*=\s*"ltr"/i.test(html);
      const remnant = html.match(/background-position\s*:[^;]*\b(left|right)\b|clear\s*:\s*(left|right)\b|translateX\s*\(/i);
      check(
        "rtl: mixed-dir mirror",
        !mixedDir || !remnant,
        mixedDir ? (remnant ? `unmirrored ${remnant[0].trim().slice(0, 44)} — next: mirror it (position right, clear inline-end, drop translateX)` : "mixed-dir content mirrored") : "single-dir page, mirror skipped",
      );
    } else if (wantDir === "ltr") {
      check("ltr: html dir matches brief", !m || m[1].toLowerCase() === "ltr", !m ? "no dir, ltr default" : (m[1].toLowerCase() === "ltr" ? `dir=${m[1]}` : `dir=${m[1]} \u2014 next: set <html dir="ltr" or brief dir="rtl"`));
    } else {
      check("direction token valid", false, `wantDir=${JSON.stringify(brief.dir)} must be "ltr" or "rtl" \u2014 next: set brief dir to "ltr" or "rtl"`);
    }
  }

  // Image.
  const imageFile = join(dir, brief.image ?? "out.png");
  if (!existsSync(imageFile)) {
    check("out.png exists", false, `${brief.image ?? "out.png"} missing \u2014 next: render page.html to out.png at brief size`);
  } else {
    try {
      const buf = readFileSync(imageFile);
      const dims = pngDims(buf);
      check("out.png size matches brief", dims.w === size.w && dims.h === size.h, dims.w === size.w && dims.h === size.h ? `${dims.w}x${dims.h}` : `${dims.w}x${dims.h} vs ${size.w}x${size.h} \u2014 next: re-render at brief size`);
      check("out.png non-trivial", buf.length >= 4096, buf.length >= 4096 ? `${buf.length}B` : `${buf.length}B \u2014 next: re-render, image looks blank`);
    } catch (e) {
      check("out.png is a PNG", false, `${String(e.message || e)} \u2014 next: replace with a real PNG render`);
    }
  }

  // Contrast swatches.
  const swatches = brief.text ?? [];
  if (!Array.isArray(swatches) || swatches.length === 0) {
    check("brief declares text swatches", false, "text must be a nonempty array \u2014 next: add {label,fg,bg,min} to brief.text");
  } else {
    swatches.forEach((s, i) => {
      const label = s.label ?? `swatch ${i + 1}`;
      try {
        const fg = resolveColor(s.fg, vars);
        const bg = resolveColor(s.bg, vars);
        const min = Number(s.min ?? 4.5);
        if (!(min >= 1 && min <= 21)) throw new Error(`minimum ${s.min} outside 1..21`);
        const ratio = contrastRatio(fg, bg);
        const ok = ratio >= min;
        check(`contrast ${label}`, ok, `${ratio.toFixed(2)}:1 vs ${min}:1 (${fg} on ${bg})${ok ? "" : ` — next: edit ${label} fg/bg toward 7:1`}`);
      } catch (e) {
        check(`contrast ${label}`, false, `${String(e.message || e)} \u2014 next: point fg/bg at tokens.css vars or #rrggbb`);
      }
    });
  }

  // Title box + 256px legibility + overflow heuristic.
  const box = brief.title_box;
  const boxOk = Array.isArray(box) && box.length === 4 && box.every((v) => typeof v === "number");
  const inRange = boxOk && box[0] >= 0 && box[0] < box[2] && box[2] <= 1 && box[1] >= 0 && box[1] < box[3] && box[3] <= 1;
  check("title_box valid fractions", !!inRange, inRange ? box.join(",") : "need [x0,y0,x1,y1] in 0..1 \u2014 next: set title_box e.g. [0.08,0.3,0.92,0.55]");
  const titlePx = Number(brief.title_px ?? 0);
  if (!(titlePx > 0)) {
    check("title_px declared", false, "brief needs title_px (title font size in px) \u2014 next: set title_px e.g. 96");
  } else if (inRange) {
    const at256 = (titlePx * 256) / size.w;
    const legOk = at256 >= 12;
    check("title legible at 256px", legOk, `${at256.toFixed(1)}px at 256px wide (floor 12px)${legOk ? "" : " — next: raise title_px or widen title_box"}`);
    const boxW = (box[2] - box[0]) * size.w;
    const need = titleChars(brief, brief) * titlePx * 0.5;
    const fitOk = need <= boxW;
    check("title fits its box", fitOk, `need ~${Math.round(need)}px, box ${Math.round(boxW)}px${fitOk ? "" : " — next: shorten title or widen title_box"}`);
  }

  // DS-39 THUMB-02 315px listing gate (step 2/3 Thumbnail): the store/
  // listing slot renders the brief at 315px wide, so the title must stay
  // legible there too — same 12px floor and matrix math as the 256px gate
  // (card research/cards/2026-10-02-s13.md: title_px*315/stage.w >= 12),
  // pinned as its own check so a future shrink that still clears 256px
  // cannot slip past the listing slot. 0 gate weakens.
  if (inRange && titlePx > 0) {
    const at315 = (titlePx * 315) / size.w;
    const listOk = at315 >= 12;
    check("title legible at 315px listing", listOk, `${at315.toFixed(1)}px at 315px listing (floor 12px)${listOk ? "" : " — next: raise title_px for the 315px listing slot"}`);
  }

  // DS-23 S01 one-to-many size matrix + per-size reflow: every matrix size
  // re-passes 256px legibility + title-fits-box (never ships scaled-blind).
  // Uses brief.sizes when declared, else the shared SIZE_MATRIX from render.
  if (inRange && titlePx > 0) {
    const matrix = Array.isArray(brief.sizes) && brief.sizes.length ? brief.sizes : SIZE_MATRIX;
    for (const s of matrix) {
      const sw = Number(s?.w);
      if (!(sw >= 16)) continue;
      // Per-size reflow (optional): a size entry may carry its own title_px and
      // title_box when the page re-lays itself out for that size (a 630x500
      // store card sets its title smaller than the 1280x720 hero). Without
      // them the brief-level title_px and title_box apply, as before.
      const sPx = Number(s?.title_px) > 0 ? Number(s.title_px) : titlePx;
      const sBox = Array.isArray(s?.title_box) && s.title_box.length === 4 && s.title_box.every((v) => typeof v === "number") ? s.title_box : box;
      const at = (sPx * 256) / sw;
      const okL = at >= 12;
      check(`size ${sw}x${Number(s?.h)}: title legible at 256px`, okL, `${at.toFixed(1)}px at 256px (floor 12px)${okL ? "" : " — next: raise title_px for this width"}`);
      const bW = (sBox[2] - sBox[0]) * sw;
      const needPx = titleChars(s, brief) * sPx * 0.5;
      const okF = needPx <= bW;
      check(`size ${sw}x${Number(s?.h)}: title fits its box`, okF, `need ~${Math.round(needPx)}px, box ${Math.round(bW)}px${okF ? "" : " — next: reflow title_px/box for this size"}`);
    }
  }

  // S07 C1 reference-in parity (donor abi/screenshot-to-code create-from-
  // reference, MIT pattern only): only gates when the brief opts in via
  // brief.reference or a reference.png beside the brief; skipped otherwise
  // so pre-reference samples keep passing. When gated the reference must be
  // a PNG with the same dims as out.png (parity of intent vs pixels).
  checkReferenceParity(dir, brief, join(dir, brief.image ?? "out.png"), check);

  return finish(errors.length === 0, checks, errors, dir, { brief: briefFile, image: imageFile });
}

// DS-74 S68 honest audit: true pixel compare for reference parity (no new
// dependency, pure node:zlib inflate + PNG unfilter). Returns
// { equal, diffBytes, totalBytes, pct, shaA, shaB } or { equal, fallback:true }
// when either PNG uses an encoding this decoder does not cover (interlaced,
// bit depth != 8, unknown color type) — callers then fall back to hash compare.
export function pngPixelDiff(aBuf, bBuf) {
  const shaA = createHash("sha256").update(aBuf).digest("hex");
  const shaB = createHash("sha256").update(bBuf).digest("hex");
  if (shaA === shaB) {
    return { equal: true, diffBytes: 0, totalBytes: aBuf.length, pct: 0, shaA, shaB };
  }
  let rawA = null;
  let rawB = null;
  try {
    rawA = decodePngPixels(aBuf);
    rawB = decodePngPixels(bBuf);
  } catch {
    return { equal: false, diffBytes: -1, totalBytes: -1, pct: -1, shaA, shaB, fallback: true };
  }
  if (!rawA || !rawB) return { equal: false, diffBytes: -1, totalBytes: -1, pct: -1, shaA, shaB, fallback: true };
  if (rawA.w !== rawB.w || rawA.h !== rawB.h || rawA.data.length !== rawB.data.length) {
    return { equal: false, diffBytes: -1, totalBytes: Math.max(rawA.data.length, rawB.data.length), pct: 100, shaA, shaB };
  }
  let diff = 0;
  for (let i = 0; i < rawA.data.length; i++) if (rawA.data[i] !== rawB.data[i]) diff++;
  const pct = rawA.data.length ? (diff / rawA.data.length) * 100 : 100;
  return { equal: diff === 0, diffBytes: diff, totalBytes: rawA.data.length, pct, shaA, shaB };
}

// Exported for tools/check.mjs winner line plus unit tests. Takes the same
// check() collector auditBrief uses so the gate lands in design-audit.json.
// DS-74 honest gate: no reference -> SKIP entry (pass:true + skipped:true so
// old audits stay green, but the CLI prints [SKIP] and PASS-line counters
// must exclude skipped:true); gated -> dims first, then true pixel bytes.
export function checkReferenceParity(dir, brief, imageFile, check) {
  const declared = typeof brief.reference === "string" ? brief.reference : null;
  const autoFile = join(dir, "reference.png");
  const refFile = declared ? join(dir, declared) : autoFile;
  const optedIn = declared != null || existsSync(autoFile);
  if (!optedIn) {
    // Honest SKIP: counted as green for pass/fail, never as a PASS. The
    // collector records skipped:true; printers show [SKIP] and PASS totals
    // exclude skipped entries (see CLI loop below).
    check("reference.png parity", true, "no reference declared, SKIP — add reference.png to gate pixels", { skipped: true });
    return { pass: true, skipped: true };
  }
  if (!existsSync(refFile)) {
    check("reference.png parity", false, `${declared ?? "reference.png"} missing — next: add reference.png beside brief.json`);
    return { pass: false };
  }
  try {
    const refBuf = readFileSync(refFile);
    const outBuf = readFileSync(imageFile);
    const refDims = pngDims(refBuf);
    const outDims = pngDims(outBuf);
    if (refDims.w !== outDims.w || refDims.h !== outDims.h) {
      check("reference.png parity", false, `reference ${refDims.w}x${refDims.h} != out ${outDims.w}x${outDims.h} — next: re-export reference at brief size`);
      return { pass: false };
    }
    const diff = pngPixelDiff(refBuf, outBuf);
    if (diff.equal) {
      check("reference.png parity", true, `${refDims.w}x${refDims.h} pixels identical (sha ${diff.shaA.slice(0, 12)})`);
      return { pass: true };
    }
    const detail = diff.fallback
      ? `pixels differ (sha ${diff.shaA.slice(0, 12)} vs ${diff.shaB.slice(0, 12)}, encoder-fallback hash compare) — next: re-export reference from out.png`
      : `pixels differ ${diff.diffBytes}/${diff.totalBytes} bytes (${diff.pct.toFixed(2)}%) sha ${diff.shaA.slice(0, 12)} vs ${diff.shaB.slice(0, 12)} — next: re-export reference from out.png`;
    check("reference.png parity", false, detail);
    return { pass: false, diff };
  } catch (e) {
    check("reference.png parity", false, `${String(e.message || e)} — next: replace reference.png with a real PNG`);
    return { pass: false };
  }
}

function finish(pass, checks, errors, dir, extra = {}) {
  const report = { pass, checks, errors, ...extra, at: new Date().toISOString().slice(0, 10) };
  try {
    writeFileSync(join(dir, "design-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  } catch {
    // Report write is best-effort; pass/fail still stands.
  }
  return { pass, checks, errors, report };
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
  if (args.includes("--sizes") && args.includes("--check")) {
    const a = sizeMatrixSelfCheck();
    const b = adSquareReflowSelfCheck();
    if (!a.pass || !b.pass) process.exitCode = 1;
  } else if (args.includes("--listing") && args.includes("--check")) {
    const { pass } = listingWidthSelfCheck();
    if (!pass) process.exitCode = 1;
  } else if (args.includes("--rtl") && args.includes("--check")) {
    const { pass } = rtlSelfCheck();
    if (!pass) process.exitCode = 1;
  } else if (args.includes("--check")) {
    const { pass } = rtlSelfCheck();
    if (!pass) process.exitCode = 1;
  } else {
    const brief = args.find((a) => !a.startsWith("-"));
    if (brief == null || args.includes("-h") || args.includes("--help")) {
      console.log("usage: node tools/audit.mjs <samples/<name>/brief.json> | node tools/audit.mjs --rtl --check | node tools/audit.mjs --sizes --check | node tools/audit.mjs --listing --check");
      process.exit(args.length < 1 ? 2 : 0);
    } else {
      const { pass, checks, errors } = auditBrief(brief);
      const tag = (c) => (c.skipped ? "SKIP" : c.pass ? "PASS" : "FAIL");
      for (const c of checks) console.log(`[${tag(c)}] ${c.name}: ${c.detail}`);
      const greens = checks.filter((c) => c.pass && !c.skipped).length;
      console.log(pass ? `AUDIT PASS: ${greens} green + ${checks.length - greens} SKIP, render, sizes, contrast, thumbnail, RTL gates` : `AUDIT FAIL: ${errors.length} failing check(s)`);
      if (!pass) process.exitCode = 1;
    }
  }
}
