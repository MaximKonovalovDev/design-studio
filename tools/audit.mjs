// tools/audit.mjs: objective checks on one brief render (node port of the
// factory engine/design_audit.py contract, no Python needed here).
// Reads samples/<name>/brief.json + tokens.css + page.html + out.png and writes
// design-audit.json beside the image: contrast (WCAG from resolved tokens),
// PNG size match, title box valid, 256px title legibility, overflow heuristic,
// RTL gate. Prints FAIL lines, exit 1 on any failure. Taste stays in review.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pngDims } from "./render.mjs";

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
export function parseTokens(css) {
  const vars = new Map();
  const re = /--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g;
  let m;
  while ((m = re.exec(String(css ?? ""))) !== null) vars.set(m[1], m[2].toLowerCase());
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
  const check = (name, ok, detail) => {
    checks.push({ name, pass: ok, detail });
    if (!ok) errors.push(`${name}: ${detail}`);
  };

  let brief;
  try {
    brief = JSON.parse(readFileSync(briefFile, "utf8"));
  } catch (e) {
    check("brief.json parses", false, String(e.message || e));
    return finish(false, checks, errors, dir);
  }
  check("brief.json parses", true, brief.title ?? "untitled");

  const size = brief.size ?? {};
  const sizeOk = Number.isInteger(size.w) && Number.isInteger(size.h) && size.w >= 16 && size.h >= 16;
  check("brief size sane", sizeOk, sizeOk ? `${size.w}x${size.h}` : "size must be {w,h} ints >= 16");
  if (!sizeOk) return finish(false, checks, errors, dir);

  // Tokens.
  const tokensFile = join(dir, brief.tokens ?? "tokens.css");
  let vars = new Map();
  if (!existsSync(tokensFile)) {
    check("tokens.css exists", false, brief.tokens ?? "tokens.css");
  } else {
    vars = parseTokens(readFileSync(tokensFile, "utf8"));
    check("tokens.css parses with 2+ colors", vars.size >= 2, `${vars.size} vars`);
  }

  // Page.
  const pageFile = join(dir, brief.page ?? "page.html");
  let html = null;
  if (!existsSync(pageFile)) {
    check("page.html exists", false, brief.page ?? "page.html");
  } else {
    html = readFileSync(pageFile, "utf8");
    check("page.html carries the title", html.includes(brief.title ?? "\0") && (brief.title ?? "") !== "", "title text present");
    const hard = html.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
    check("no hardcoded colors in page.html", hard.length === 0, hard.length ? `hardcoded ${hard.slice(0, 3).join(", ")}` : "all color via var(--*)");
    const usesVars = /var\(\s*--[\w-]+\s*\)/.test(html);
    check("page.html uses tokens", usesVars, usesVars ? "var(--*) found" : "no var(--*) reference");
  }

  // RTL gate.
  const wantDir = brief.dir ?? "ltr";
  if (html != null) {
    const m = html.match(/<html[^>]*\bdir\s*=\s*"(ltr|rtl)"/i);
    if (wantDir === "rtl") {
      check("rtl: html dir=rtl", !!m && m[1].toLowerCase() === "rtl", m ? `dir=${m[1]}` : "no dir on <html>");
      const physical = html.match(/\b(margin-left|margin-right|padding-left|padding-right|left\s*:|right\s*:|float\s*:)/i);
      check("rtl: logical properties only", !physical, physical ? `physical CSS ${physical[1]}` : "no physical left/right");
    } else {
      check("ltr: html dir matches brief", !m || m[1].toLowerCase() === "ltr", m ? `dir=${m[1]}` : "no dir, ltr default");
    }
  }

  // Image.
  const imageFile = join(dir, brief.image ?? "out.png");
  if (!existsSync(imageFile)) {
    check("out.png exists", false, brief.image ?? "out.png");
  } else {
    try {
      const buf = readFileSync(imageFile);
      const dims = pngDims(buf);
      check("out.png size matches brief", dims.w === size.w && dims.h === size.h, `${dims.w}x${dims.h}`);
      check("out.png non-trivial", buf.length >= 4096, `${buf.length}B`);
    } catch (e) {
      check("out.png is a PNG", false, String(e.message || e));
    }
  }

  // Contrast swatches.
  const swatches = brief.text ?? [];
  if (!Array.isArray(swatches) || swatches.length === 0) {
    check("brief declares text swatches", false, "text must be a nonempty array");
  } else {
    swatches.forEach((s, i) => {
      const label = s.label ?? `swatch ${i + 1}`;
      try {
        const fg = resolveColor(s.fg, vars);
        const bg = resolveColor(s.bg, vars);
        const min = Number(s.min ?? 4.5);
        if (!(min >= 1 && min <= 21)) throw new Error(`minimum ${s.min} outside 1..21`);
        const ratio = contrastRatio(fg, bg);
        check(`contrast ${label}`, ratio >= min, `${ratio.toFixed(2)}:1 vs ${min}:1 (${fg} on ${bg})`);
      } catch (e) {
        check(`contrast ${label}`, false, String(e.message || e));
      }
    });
  }

  // Title box + 256px legibility + overflow heuristic.
  const box = brief.title_box;
  const boxOk = Array.isArray(box) && box.length === 4 && box.every((v) => typeof v === "number");
  const inRange = boxOk && box[0] >= 0 && box[0] < box[2] && box[2] <= 1 && box[1] >= 0 && box[1] < box[3] && box[3] <= 1;
  check("title_box valid fractions", !!inRange, inRange ? box.join(",") : "need [x0,y0,x1,y1] in 0..1");
  const titlePx = Number(brief.title_px ?? 0);
  if (!(titlePx > 0)) {
    check("title_px declared", false, "brief needs title_px (title font size in px)");
  } else if (inRange) {
    const at256 = (titlePx * 256) / size.w;
    check("title legible at 256px", at256 >= 12, `${at256.toFixed(1)}px at 256px wide (floor 12px)`);
    const boxW = (box[2] - box[0]) * size.w;
    const need = String(brief.title ?? "").length * titlePx * 0.5;
    check("title fits its box", need <= boxW, `need ~${Math.round(need)}px, box ${Math.round(boxW)}px`);
  }

  return finish(errors.length === 0, checks, errors, dir, { brief: briefFile, image: imageFile });
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
  if (args.length < 1 || args.includes("-h") || args.includes("--help")) {
    console.log("usage: node tools/audit.mjs <samples/<name>/brief.json>");
    process.exit(args.length < 1 ? 2 : 0);
  }
  const { pass, checks, errors } = auditBrief(args[0]);
  for (const c of checks) console.log(`[${c.pass ? "PASS" : "FAIL"}] ${c.name}: ${c.detail}`);
  console.log(pass ? "AUDIT PASS: render, sizes, contrast, thumbnail, RTL gates" : `AUDIT FAIL: ${errors.length} failing check(s)`);
  if (!pass) process.exitCode = 1;
}
