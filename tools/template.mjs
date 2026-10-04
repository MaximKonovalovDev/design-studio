// tools/template.mjs: the template system (design-studio templates v1). One contract, see templates/README.md.
//   node tools/template.mjs list [--json]                      every template and every palette
//   node tools/template.mjs new <order> --template <family>/<id> [--palette <id>] [SLOT=value ...] [--asset name=path ...]
//                                                              stamps designs/<order>/ (never overwrites a folder)
//   node tools/template.mjs build <order>                      page orders: every size, PDFs, thumb, audit, judge (cover orders: same as cover.mjs all)
//   node tools/template.mjs preview <family>/<id> [--palette <id>] [--out file.png] | preview --all
//                                                              templates/<family>/<id>/preview.png; --all also writes templates/palettes.png
//   node tools/template.mjs palettes [<family>/<id>] [--out file.png]   one template in all palettes on one sheet
//   node tools/template.mjs --check                            fail closed: template.json, files, slot defaults, hard colours, palette contrast, clean stamp
// kind "cover": writes cover.json (starter + palette tokens and fonts + slots + pictures), art.html, art.css; then `node tools/cover.mjs all <order>`.
// kind "page":  writes the template's files with slots filled, tokens.css from the palette and brief.json; then `node tools/template.mjs build <order>`.
// No new dependency: Edge headless through tools/render.mjs.
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { render, renderPdf, pngDims } from "./render.mjs";
import { auditBrief, contrastRatio } from "./audit.mjs";
import { judgeSample, writeReview } from "./judge.mjs";
import { thumbBrief } from "./thumb.mjs";
import { gen as coverGen, build as coverBuild } from "./cover.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TPL = join(ROOT, "templates");
const read = (p) => readFileSync(p, "utf8").replace(/^﻿/, "");
const posix = (p) => String(p).replace(/\\/g, "/");

export const TOKENS = ["bg", "bg-2", "ink", "muted", "accent", "accent-ink", "on-accent", "chip-bg", "chip-ink", "chip-line"];
export const FONTS = ["display", "body", "mono"];
export const CONTRAST_PAIRS = [["ink", "bg"], ["ink", "bg-2"], ["muted", "bg"], ["muted", "bg-2"], ["accent-ink", "bg"], ["on-accent", "accent"], ["chip-ink", "chip-bg"]];
export const CONTRAST_MIN = 4.5;
// The audit's rtl gate wants --font-hebrew in tokens.css; a palette may name its own (fonts.hebrew).
const HEBREW = "'Heebo', 'Assistant', 'Noto Sans Hebrew', 'Segoe UI', Arial, sans-serif";
const LEGACY = new Set(["pages", "blocks"]); // the old starters (templates/registry.json): not v1 templates, never touched here
const TEXT_EXT = new Set([".html", ".htm", ".css", ".svg", ".json", ".md", ".txt", ".xml", ".csv"]);
const isText = (f) => TEXT_EXT.has(extname(f).toLowerCase());
const SLOT_RE = /\{\{([A-Z][A-Z0-9_]*)\}\}/g;
const BUILTIN = ["ORDER", "TEMPLATE_DIR", "PRODUCT", "FROM_REPO"]; // ORDER and TEMPLATE_DIR are set by the tool, never by the maker
const escHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const escJson = (s) => JSON.stringify(String(s)).slice(1, -1);

// ---------- palettes ----------
export function loadPalettes(tplRoot = TPL) {
  const f = join(tplRoot, "palettes.json");
  if (!existsSync(f)) throw new Error(`${f} missing`);
  return JSON.parse(read(f)).palettes ?? {};
}

// Problems with one palette ([] = good): 10 tokens as #rrggbb, 3 font stacks, the 7 contrast pairs.
export function paletteProblems(p) {
  const bad = [];
  if (!p || typeof p !== "object") return ["not an object"];
  for (const k of ["name", "mood"]) if (typeof p[k] !== "string" || !p[k].trim()) bad.push(`${k} missing`);
  for (const k of TOKENS) if (!/^#[0-9a-fA-F]{6}$/.test(String(p.tokens?.[k] ?? ""))) bad.push(`token ${k} must be #rrggbb`);
  for (const k of FONTS) {
    const v = p.fonts?.[k];
    if (typeof v !== "string" || !v.trim()) bad.push(`font ${k} missing`);
    else if (v.includes('"')) bad.push(`font ${k} uses double quotes (single quotes only: stacks go into style attributes)`);
  }
  if (bad.length) return bad;
  for (const [fg, bg] of CONTRAST_PAIRS) {
    const r = contrastRatio(p.tokens[fg], p.tokens[bg]);
    if (r < CONTRAST_MIN) bad.push(`${fg} on ${bg} is ${r.toFixed(2)}:1, want ${CONTRAST_MIN}:1`);
  }
  return bad;
}

const tokenValues = (p) => ({
  ...Object.fromEntries(TOKENS.map((k) => [k, p.tokens[k]])),
  "font-display": p.fonts.display, "font-body": p.fonts.body, "font-mono": p.fonts.mono, "font-hebrew": p.fonts.hebrew ?? HEBREW,
});

export function tokensCss(p, paletteId, what) {
  const rows = Object.entries(tokenValues(p)).map(([k, v]) => `  --${k}: ${v};`);
  return `/* tokens.css: ${what}, palette ${paletteId} (${p.name}). Written by tools/template.mjs from templates/palettes.json. All page colour comes from these vars. */\n:root {\n${rows.join("\n")}\n}\n`;
}

// email: every var(--token) becomes the palette's literal value; the dead tokens.css link goes.
export function inlineTokens(text, p) {
  const v = tokenValues(p);
  return String(text)
    .replace(/var\(\s*--([\w-]+)\s*(?:,[^()]*)?\)/g, (m, k) => (v[k] !== undefined ? v[k] : m))
    .replace(/[ \t]*<link[^>]*href=["']tokens\.css["'][^>]*>\r?\n?/gi, "");
}

// ---------- templates ----------
export function templateDirs(tplRoot = TPL) {
  const out = [];
  for (const fam of readdirSync(tplRoot, { withFileTypes: true })) {
    if (!fam.isDirectory() || LEGACY.has(fam.name)) continue;
    for (const t of readdirSync(join(tplRoot, fam.name), { withFileTypes: true })) if (t.isDirectory()) out.push({ ref: `${fam.name}/${t.name}`, family: fam.name, id: t.name, dir: join(tplRoot, fam.name, t.name) });
  }
  return out.sort((a, b) => a.ref.localeCompare(b.ref));
}

export function loadTemplate(ref, tplRoot = TPL) {
  const m = String(ref ?? "").match(/^([a-z0-9][a-z0-9-]*)\/([a-z0-9][a-z0-9-]*)$/);
  if (!m || LEGACY.has(m[1])) throw new Error(`template must be <family>/<id>, got ${JSON.stringify(ref)} (node tools/template.mjs list)`);
  const dir = join(tplRoot, m[1], m[2]);
  const f = join(dir, "template.json");
  if (!existsSync(f)) throw new Error(`no template ${ref} (${posix(f)} missing; node tools/template.mjs list)`);
  return { ref, family: m[1], id: m[2], dir, meta: JSON.parse(read(f)) };
}

// Every text file in a template folder (sources and template.json; pictures and preview.png are skipped).
function textFilesOf(dir, rel = "") {
  const out = [];
  for (const e of readdirSync(join(dir, rel), { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...textFilesOf(dir, r));
    else if (isText(e.name)) out.push(r);
  }
  return out;
}

const NAMED = new Set("aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen".split(" "));
const BLACK_SHADOW = /^rgba?\(\s*0\s*[,\s]\s*0\s*[,\s]\s*0\s*(?:[,/]\s*[\d.]+%?\s*)?\)$/i;

// Colours written by hand in one template file. Allowed: var(--token), color-mix() of tokens, transparent, currentColor,
// and rgba(0,0,0,a) shadows. Returns the offending snippets.
export function hardColours(text, file = "x.html") {
  const ext = extname(file).toLowerCase();
  const src = String(text).replace(/<!--[\s\S]*?-->/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");
  const found = [];
  const clean = src.replace(/(?:xlink:href|href|for|id|aria-[a-z]+)\s*=\s*(["'])#[^"']*\1/gi, " ").replace(/url\(\s*["']?#[^)]*\)/gi, " ");
  for (const m of clean.matchAll(/(?<![&\w])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6})\b/g)) found.push(m[0]);
  if (ext === ".json") return [...new Set(found)];
  // the places CSS lives: a .css file, <style> blocks, style="" attributes, SVG paint attributes
  const css = [];
  if (ext === ".css") css.push(clean);
  for (const m of clean.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) css.push(m[1]);
  for (const m of clean.matchAll(/\sstyle\s*=\s*"([^"]*)"/gi)) css.push(m[1]);
  for (const m of clean.matchAll(/\s(?:fill|stroke|stop-color|flood-color|lighting-color|color|bgcolor)\s*=\s*"([^"]*)"/gi)) css.push(m[1]);
  for (const block of css) {
    const b = block.replace(/(["'])(?:\\.|(?!\1).)*\1/g, " ").replace(/url\([^)]*\)/gi, " ").replace(/--[\w-]+/g, " ");
    for (const m of b.matchAll(/(?<![&\w])#(?:[0-9a-fA-F]{3,4})\b/g)) found.push(m[0]);
    for (const m of b.matchAll(/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)/gi)) if (!BLACK_SHADOW.test(m[0])) found.push(m[0]);
    for (const m of b.matchAll(/(?<![\w.#-])([a-z]+)(?![\w-]|\s*\()/gi)) if (NAMED.has(m[1].toLowerCase())) found.push(m[1]);
  }
  return [...new Set(found)];
}

// Problems with one template folder ([] = good), and notes (contract hints that do not fail the check).
export function templateProblems(t, palettes) {
  const bad = [];
  const notes = [];
  const { meta, dir } = t;
  if (meta.id !== t.id) bad.push(`id ${JSON.stringify(meta.id)} is not the folder name ${t.id}`);
  if (meta.family !== t.family) bad.push(`family ${JSON.stringify(meta.family)} is not the folder name ${t.family}`);
  if (!["page", "cover"].includes(meta.kind)) bad.push(`kind must be "page" or "cover"`);
  for (const k of ["title", "what", "donor"]) if (typeof meta[k] !== "string" || !meta[k].trim()) bad.push(`${k} missing`);
  if (!Array.isArray(meta.for) || !meta.for.length || !meta.for.every((x) => typeof x === "string")) bad.push("for must list repo names");
  if (!palettes[meta.palette]) bad.push(`palette ${JSON.stringify(meta.palette)} is not in palettes.json`);
  const sizesOk = Array.isArray(meta.sizes) && meta.sizes.length && meta.sizes.every((z) => Number.isInteger(z?.w) && Number.isInteger(z?.h) && z.w >= 16 && z.h >= 16 && typeof z.name === "string" && z.name);
  if (!sizesOk) bad.push("sizes must be [{w, h, name}] with whole numbers of 16 or more");
  const files = Array.isArray(meta.files) ? meta.files : [];
  if (!files.length) bad.push("files is empty");
  for (const f of files) {
    if (typeof f !== "string" || isAbsolute(f) || f.split(/[\\/]/).includes("..")) bad.push(`file path must be relative, no ..: ${f}`);
    else if (!existsSync(join(dir, f))) bad.push(`file missing: ${f}`);
    else if (["tokens.css", "brief.json"].includes(f)) bad.push(`${f} is written by the tool, take it out of files`);
  }
  const slots = meta.slots && typeof meta.slots === "object" && !Array.isArray(meta.slots) ? meta.slots : null;
  if (!slots) bad.push("slots must be an object {NAME: default}");
  for (const [k, v] of Object.entries(slots ?? {})) {
    if (!/^[A-Z][A-Z0-9_]*$/.test(k)) bad.push(`slot name ${k} is not UPPER_SNAKE`);
    if (typeof v !== "string") bad.push(`slot ${k}: the default must be a string`);
    if (["ORDER", "TEMPLATE_DIR"].includes(k)) bad.push(`slot ${k} is set by the tool`);
  }
  for (const x of meta.pdf ?? []) if (!x || !files.includes(x.page) || typeof x.out !== "string" || !/\.pdf$/i.test(x.out)) bad.push(`pdf entry must be {page: one of files, out: "name.pdf"}`);
  if (bad.length) return { bad, notes };

  const known = new Set([...Object.keys(slots), ...BUILTIN]);
  const used = new Set();
  for (const f of textFilesOf(dir)) {
    const text = read(join(dir, f));
    const hard = hardColours(text, f);
    if (hard.length) bad.push(`${f}: colour written by hand (${hard.slice(0, 4).join(", ")}), use var(--token)`);
    if (f === "template.json") continue;
    for (const m of text.matchAll(SLOT_RE)) { used.add(m[1]); if (!known.has(m[1])) bad.push(`${f}: slot {{${m[1]}}} has no default in template.json`); }
    if (/\{\{(?![A-Z][A-Z0-9_]*\}\})/.test(text)) bad.push(`${f}: a {{ that is not a {{UPPER_SNAKE}} slot`);
  }
  for (const m of JSON.stringify(meta.brief ?? {}).matchAll(SLOT_RE)) { used.add(m[1]); if (!known.has(m[1])) bad.push(`brief: slot {{${m[1]}}} has no default`); }
  for (const v of Object.values(slots)) for (const m of v.matchAll(SLOT_RE)) if (m[1] !== "ORDER") bad.push(`a slot default may only use {{ORDER}}, found {{${m[1]}}}`);
  const idle = Object.keys(slots).filter((k) => !used.has(k) && !BUILTIN.includes(k) && !(meta.kind === "page" && k === "TITLE"));
  if (idle.length) notes.push(`slots no file uses: ${idle.join(" ")}`);

  if (meta.kind === "cover") {
    for (const f of ["cover.json", "art.html", "art.css"]) if (!files.includes(f)) bad.push(`a cover template needs ${f} in files`);
    if (files.includes("cover.json")) {
      try {
        const spec = JSON.parse(read(join(dir, "cover.json")).replace(SLOT_RE, "x"));
        for (const k of ["tokens", "fonts"]) if (spec[k]) bad.push(`cover.json carries a ${k} block: that comes from the palette`);
        for (const a of spec.assets ?? []) if (!a.src || (String(a.src).startsWith("x/") && !existsSync(join(dir, String(a.src).slice(2))))) bad.push(`cover.json picture missing in the template folder: ${a.src}`);
      } catch (e) { bad.push(`cover.json does not parse: ${e.message}`); }
    }
  } else {
    const main = files[0];
    const b = meta.brief;
    if (!b || typeof b !== "object") bad.push("a page template needs brief (the brief.json body)");
    else {
      if (!Array.isArray(b.text) || !b.text.length) bad.push("brief.text (contrast swatches) missing");
      if (!Array.isArray(b.title_box) || b.title_box.length !== 4) bad.push("brief.title_box missing");
      if (!(Number(b.title_px) > 0)) bad.push("brief.title_px missing");
    }
    if (!/\.html?$/i.test(main ?? "")) bad.push("files[0] must be the main .html page");
    else {
      const html = read(join(dir, main));
      if (!/<html[^>]*\blang="\{\{LANG\}\}"/.test(html) || !/<html[^>]*\bdir="\{\{DIR\}\}"/.test(html)) notes.push(`${main}: <html lang="{{LANG}}" dir="{{DIR}}"> not found`);
      if (!/<link[^>]*href="tokens\.css"/.test(html)) notes.push(`${main}: no <link rel="stylesheet" href="tokens.css">`);
      if (!/var\(\s*--[\w-]+\s*\)/.test(html)) notes.push(`${main}: no var(--token) in the main page (the audit wants one)`);
      if (!/var\(\s*--font-hebrew\s*\)/.test(html)) notes.push(`${main}: never uses var(--font-hebrew), so DIR=rtl fails the audit's Hebrew type gate`);
    }
    for (const k of ["LANG", "DIR", "TITLE"]) if (slots[k] === undefined) notes.push(`standard slot ${k} has no default`);
  }
  for (const f of textFilesOf(dir).filter((x) => /\.(html?|css|svg)$/i.test(x))) {
    const text = read(join(dir, f)).replace(/<!--[\s\S]*?-->/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");
    const phys = text.match(/\b(margin-left|margin-right|padding-left|padding-right|left\s*:|right\s*:|float\s*:)/i);
    if (phys) notes.push(`${f}: physical CSS ${phys[1].trim()} (logical properties keep rtl working)`);
    const ext = text.match(/(?:src|href)\s*=\s*["']\s*(?:https?:)?\/\/|url\(\s*["']?\s*(?:https?:)?\/\/|@import/i);
    if (ext) notes.push(`${f}: external URL (${ext[0].trim().slice(0, 30)})`);
  }
  if (!existsSync(join(dir, "preview.png"))) notes.push(`no preview.png yet (node tools/template.mjs preview ${t.ref})`);
  return { bad, notes };
}

// ---------- title fit (covers) ----------
// The fewest lines the title needs at maxChars per line, then the split whose longest line is shortest.
export function wrapTitle(title, maxChars) {
  const words = String(title).trim().split(/\s+/).filter(Boolean);
  if (!words.length || words.some((w) => w.length > maxChars)) return null;
  let n = 1;
  let len = 0;
  for (const w of words) { const add = len ? len + 1 + w.length : w.length; if (add > maxChars) { n += 1; len = w.length; } else len = add; }
  let best = null;
  // a tie goes to the split that fills the earlier lines (the way a browser breaks a line)
  const fuller = (a, b) => { for (let k = 0; k < a.length; k++) if (a[k].length !== b[k].length) return a[k].length > b[k].length; return false; };
  const walk = (i, left, lines) => {
    if (left === 1) {
      const all = [...lines, words.slice(i).join(" ")];
      const mx = Math.max(...all.map((l) => l.length));
      if (mx <= maxChars && (!best || mx < best.mx || (mx === best.mx && fuller(all, best.lines)))) best = { mx, lines: all };
      return;
    }
    for (let j = i + 1; j <= words.length - (left - 1); j++) walk(j, left - 1, [...lines, words.slice(i, j).join(" ")]);
  };
  walk(0, n, []);
  return best ? best.lines : null;
}

// The largest title size (maxPx down to minPx) at which the title wraps onto maxLines(px) lines or fewer.
// advance = the display font's average glyph width in em (palettes.json cover.advance).
export function fitTitle(title, { width, maxPx, minPx, advance, maxLines }) {
  for (let px = maxPx; px >= minPx; px -= 2) {
    const lines = wrapTitle(title, Math.floor(width / (px * advance)));
    if (lines && lines.length <= maxLines(px)) return { px, lines, fits: true };
  }
  return { px: minPx, lines: wrapTitle(title, Math.max(1, Math.floor(width / (minPx * advance)))) ?? [String(title)], fits: false };
}

// ---------- stamping ----------
function orderRow(order, csvFile = join(ROOT, "orders.csv")) {
  if (!existsSync(csvFile)) return null;
  const line = read(csvFile).split(/\r?\n/).find((l) => l.startsWith(`${order},`));
  if (!line) return null;
  const [, from_repo, product] = line.split(",");
  return { from_repo, product };
}

// Fills one template in memory. Returns { files: Map(rel -> string | Buffer), sample: [slots left at their default], pictures: [placeholder
// pictures left], notes: [] }. Throws on an unknown slot, an unknown picture or a leftover {{.
export function stamp({ template, palette, order = "PREVIEW", slots = {}, assets = {}, tplRoot = TPL, ordersCsv } = {}) {
  const t = typeof template === "string" ? loadTemplate(template, tplRoot) : template;
  const { meta, dir } = t;
  const palettes = loadPalettes(tplRoot);
  const paletteId = palette ?? meta.palette;
  const p = palettes[paletteId];
  if (!p) throw new Error(`unknown palette ${JSON.stringify(paletteId)} (have: ${Object.keys(palettes).join(", ")})`);
  const pp = paletteProblems(p);
  if (pp.length) throw new Error(`palette ${paletteId}: ${pp[0]}`);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(order)) throw new Error(`order id ${JSON.stringify(order)} must be letters, digits, dot, dash or underscore`);

  const defaults = { ...(meta.slots ?? {}) };
  for (const k of Object.keys(slots)) {
    if (["ORDER", "TEMPLATE_DIR"].includes(k)) throw new Error(`slot ${k} is set by the tool`);
    if (defaults[k] === undefined && !BUILTIN.includes(k)) throw new Error(`unknown slot ${k} for ${t.ref} (slots: ${Object.keys(defaults).join(" ") || "none"})`);
    if (String(slots[k]).includes("{{")) throw new Error(`slot ${k}: the value holds a {{`);
  }
  const row = orderRow(order, ordersCsv);
  const auto = {};
  if (row) {
    auto.PRODUCT = row.product;
    auto.FROM_REPO = row.from_repo;
    if (defaults.STORE !== undefined) auto.STORE = /^cover:itch\//.test(row.product) ? "itch.io" : "Gumroad";
  }
  const values = { PRODUCT: t.ref, FROM_REPO: "", ...defaults, ...auto, ...Object.fromEntries(Object.entries(slots).map(([k, v]) => [k, String(v)])) };
  for (const k of Object.keys(values)) values[k] = values[k].replace(/\{\{ORDER\}\}/g, order);
  values.ORDER = order;
  values.TEMPLATE_DIR = posix(dir);
  const sample = Object.keys(defaults).filter((k) => slots[k] === undefined && auto[k] === undefined && defaults[k] !== "" && !["LANG", "DIR"].includes(k));
  const fill = (text, mode) => String(text).replace(SLOT_RE, (m, k) => (values[k] === undefined ? m : mode === "json" ? escJson(values[k]) : escHtml(values[k])));

  const files = new Map();
  const notes = [];
  for (const f of meta.files) files.set(f, isText(f) ? fill(read(join(dir, f)), extname(f).toLowerCase() === ".json" ? "json" : "html") : readFileSync(join(dir, f)));

  const pictures = [];
  const assetNames = new Set(Object.keys(assets));
  const rename = (from, to) => { if (from !== to) for (const [f, c] of files) if (typeof c === "string") files.set(f, c.split(from).join(to)); };
  const stem = (f) => basename(f, extname(f));

  if (meta.kind === "cover") {
    let spec;
    try { spec = JSON.parse(files.get("cover.json")); } catch (e) { throw new Error(`${t.ref}/cover.json does not parse after the slots are filled: ${e.message}`); }
    spec.chips = (spec.chips ?? []).filter((c) => (typeof c === "string" ? c : c?.t));
    for (const k of ["fine", "listing", "beatNote"]) if (spec[k] === "") delete spec[k];
    if (spec.toBeat === "") spec.toBeat = null;
    for (const a of spec.assets ?? []) {
      const key = stem(a.name);
      if (assets[key] === undefined) { pictures.push(a.name); continue; }
      const src = resolve(assets[key]);
      if (!existsSync(src) || !statSync(src).isFile()) throw new Error(`picture ${key}: no file ${assets[key]}`);
      const name = `${key}${extname(src).toLowerCase() || extname(a.name)}`;
      rename(`assets/${a.name}`, `assets/${name}`);
      a.name = name;
      a.src = posix(src);
      a.what = `the customer's own picture ${basename(src)}`;
      assetNames.delete(key);
    }
    if (assetNames.size) throw new Error(`unknown picture ${[...assetNames].join(", ")} for ${t.ref} (pictures: ${(spec.assets ?? []).map((a) => stem(a.name)).join(" ") || "none"})`);
    const style = p.cover ?? {};
    // never under 0.5 em: that is the width the audit's own "title fits its box" estimate uses
    const advance = Math.max(0.5, Number(style.advance) || 0.58);
    // the title column: the copy column inside its padding, and never wider than claimW (art.css: h1 { max-width: var(--claim-w) })
    const copyW = Math.min((Number.parseFloat(spec.copyW ?? "52") / 100) * 1280 - Number.parseFloat(spec.vars?.pad ?? "72") - 8, Number.parseFloat(spec.claimW ?? "560"));
    const wide = fitTitle(spec.title, { width: copyW, maxPx: spec.titlePx ?? 104, minPx: 64, advance, maxLines: (px) => (px > 88 ? 2 : 3) });
    const card = fitTitle(spec.title, { width: 630 - 2 * Number.parseFloat(spec.vars?.["pad-card"] ?? "26"), maxPx: spec.titlePxCard ?? 58, minPx: 32, advance, maxLines: (px) => (px > 50 ? 1 : 2) });
    if (!wide.fits || !card.fits) notes.push(`TITLE is too long for the automatic fit: set titlePx, titlePxCard and the titleWrap lines in cover.json by hand`);
    const head = { product: spec.product, from_repo: spec.from_repo, storeName: spec.storeName, title: spec.title, pick: paletteId, template: t.ref, kicker: spec.kicker, claim: spec.claim, chips: spec.chips, badge: spec.badge, ...(spec.fine ? { fine: spec.fine } : {}) };
    const look = {
      tokens: Object.fromEntries(TOKENS.map((k) => [k, p.tokens[k]])),
      fonts: { display: p.fonts.display, body: p.fonts.body, mono: p.fonts.mono },
      titlePx: wide.px, titlePxCard: card.px,
      titleWeight: spec.titleWeight ?? style.titleWeight ?? 800, titleTrack: spec.titleTrack ?? style.titleTrack ?? "-0.01em",
      titleWrapWide: wide.lines, titleWrapCard: card.lines,
      chipR: spec.chipR ?? style.chipR ?? "8px",
    };
    const rest = Object.fromEntries(Object.entries(spec).filter(([k]) => !(k in head) && !(k in look)));
    files.set("cover.json", `${JSON.stringify({ ...head, ...look, ...rest }, null, 2)}\n`);
    notes.push(`title fit: ${wide.px}px wide ${JSON.stringify(wide.lines)}, ${card.px}px card ${JSON.stringify(card.lines)}`);
  } else {
    for (const key of [...assetNames]) {
      const hit = meta.files.find((f) => !isText(f) && (f === key || basename(f) === key || stem(f) === key));
      if (!hit) throw new Error(`unknown picture ${key} for ${t.ref} (pictures: ${meta.files.filter((f) => !isText(f)).map(stem).join(" ") || "none"})`);
      const src = resolve(assets[key]);
      if (!existsSync(src) || !statSync(src).isFile()) throw new Error(`picture ${key}: no file ${assets[key]}`);
      const ext = extname(src).toLowerCase() || extname(hit);
      const to = `${hit.slice(0, hit.length - extname(hit).length)}${ext}`;
      files.delete(hit);
      files.set(to, readFileSync(src));
      rename(basename(hit), basename(to));
    }
    for (const f of meta.files) if (!isText(f) && files.has(f) && /\.(png|jpe?g|webp|gif|avif)$/i.test(f)) pictures.push(f);
    const main = meta.files[0];
    let page = main;
    if (meta.inlineTokens) {
      // the sendable files carry literal values; the var() twin of the main page stays for render, audit and judge
      page = main.replace(/(\.[^.]+)$/, ".tokens$1");
      const twin = files.get(main);
      for (const [f, c] of files) if (typeof c === "string" && extname(f).toLowerCase() !== ".json") files.set(f, inlineTokens(c, p));
      files.set(page, twin);
      notes.push(`inlineTokens: ${main} carries literal colours (send that one); ${page} is its var() twin for audit and judge`);
    }
    files.set("tokens.css", tokensCss(p, paletteId, `${order} ${t.ref}`));
    const first = meta.sizes[0];
    const body = JSON.parse(fill(JSON.stringify(meta.brief ?? {}), "json"));
    const brief = {
      size: { w: first.w, h: first.h },
      sizes: meta.sizes.map((z) => ({ w: z.w, h: z.h, name: z.name })),
      tokens: "tokens.css", image: "out.png",
      ...body,
      title: defaults.TITLE !== undefined ? escHtml(values.TITLE) : body.title ?? meta.title,
      dir: defaults.DIR !== undefined ? values.DIR : body.dir ?? "ltr",
      page,
      order, product: values.PRODUCT, template: t.ref, palette: paletteId,
      ...(meta.pdf ? { pdf: meta.pdf } : {}),
    };
    files.set("brief.json", `${JSON.stringify(brief, null, 2)}\n`);
  }
  for (const [f, c] of files) if (typeof c === "string" && c.includes("{{")) throw new Error(`${f}: a {{ is left after stamping (${c.slice(c.indexOf("{{"), c.indexOf("{{") + 30).split("\n")[0]})`);
  return { ref: t.ref, kind: meta.kind, palette: paletteId, order, files, sample, pictures, notes, meta };
}

export function writeStamp(st, dest) {
  mkdirSync(dest, { recursive: true });
  for (const [f, c] of st.files) {
    mkdirSync(dirname(join(dest, f)), { recursive: true });
    writeFileSync(join(dest, f), c);
  }
  return dest;
}

// node tools/template.mjs new: stamp into designs/<order>/, never over an existing folder.
export function newOrder(order, opts, { designsDir = join(ROOT, "designs") } = {}) {
  const dest = join(designsDir, order);
  if (existsSync(dest)) throw new Error(`designs/${order} exists already: a template never overwrites an order folder`);
  const st = stamp({ ...opts, order });
  writeStamp(st, dest);
  return { ...st, dest };
}

const quiet = (fn) => { const log = console.log; console.log = () => {}; try { return fn(); } finally { console.log = log; } };
const outName = (z, i, image = "out.png") => (i === 0 ? image : `out-${z.w}x${z.h}.png`);

// Page orders: every size, the PDFs, the 256px thumbnail, audit and judge (the same steps cover.mjs build runs for covers).
export function buildOrder(dirOrId, { designsDir = join(ROOT, "designs") } = {}) {
  const dir = isAbsolute(dirOrId) ? dirOrId : join(designsDir, dirOrId);
  const id = basename(dir);
  if (existsSync(join(dir, "cover.json"))) { coverGen(dir); return coverBuild(dir); }
  const brief = JSON.parse(read(join(dir, "brief.json")));
  const page = join(dir, brief.page ?? "page.html");
  const sizes = Array.isArray(brief.sizes) && brief.sizes.length ? brief.sizes : [brief.size];
  const made = sizes.map((z, i) => render(page, join(dir, outName(z, i, brief.image)), { w: z.w, h: z.h }));
  for (const x of brief.pdf ?? []) { const r = renderPdf(join(dir, x.page), join(dir, x.out)); console.log(`PDF ${id}: ${x.out} ${r.bytes}B`); }
  const th = thumbBrief(join(dir, "brief.json"));
  const a = auditBrief(join(dir, "brief.json"));
  const j = judgeSample(join(dir, "brief.json"));
  writeReview(join(dir, "brief.json"), j);
  console.log(`BUILD ${id}: ${sizes.map((z, i) => `${outName(z, i, brief.image)} ${made[i].bytes}B`).join(", ")}, thumb ${th.w}x${th.h}, audit ${a.pass ? "PASS" : `FAIL ${a.errors.slice(0, 3).join("; ")}`}, judge ${j.score}/${j.max} ${j.pass ? "SHIP" : "REWORK"}`);
  return { pass: a.pass && j.pass };
}

// Renders one template with its default slots at its first size; nothing is left in designs/.
export function preview(ref, { palette, out, tplRoot = TPL } = {}) {
  const t = loadTemplate(ref, tplRoot);
  const tmp = mkdtempSync(join(tmpdir(), "ds-tpl-"));
  const dir = join(tmp, "PREVIEW");
  try {
    const st = stamp({ template: t, palette, tplRoot });
    writeStamp(st, dir);
    let page;
    if (st.kind === "cover") { quiet(() => coverGen(dir)); page = join(dir, "page.html"); }
    else page = join(dir, JSON.parse(read(join(dir, "brief.json"))).page);
    const z = t.meta.sizes[0];
    const dst = out ? resolve(out) : join(t.dir, "preview.png");
    const r = render(page, dst, { w: z.w, h: z.h });
    return { ...r, ref, palette: st.palette };
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}

// One template in every palette on one sheet (the palette picker's picture).
export function paletteSheet({ ref = "covers/app-window", out = join(TPL, "palettes.png"), tplRoot = TPL } = {}) {
  const palettes = loadPalettes(tplRoot);
  const t = loadTemplate(ref, tplRoot);
  const z = t.meta.sizes[0];
  const tw = 640;
  const th = Math.round((tw * z.h) / z.w);
  const tmp = mkdtempSync(join(tmpdir(), "ds-pal-"));
  try {
    const tiles = Object.entries(palettes).map(([id, p]) => {
      const shot = join(tmp, `${id}.png`);
      preview(ref, { palette: id, out: shot, tplRoot });
      const sw = TOKENS.map((k) => `<i title="${k}" style="background:${p.tokens[k]}"></i>`).join("");
      return `<div class="t"><img src="${pathToFileURL(shot).href}"><h2>${escHtml(p.name)} <code>${id}</code> <em>${p.dark ? "dark" : "light"}</em></h2><p>${escHtml(p.mood)}</p><div class="sw">${sw}</div><p class="f">${escHtml(p.fonts.display.split(",")[0].replace(/'/g, ""))} / ${escHtml(p.fonts.body.split(",")[0].replace(/'/g, ""))}</p></div>`;
    });
    const cols = 4;
    const rows = Math.ceil(tiles.length / cols);
    const W = 48 * 2 + cols * tw + (cols - 1) * 32;
    const H = 48 * 2 + 64 + rows * (th + 150) + (rows - 1) * 28;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:${W}px;height:${H}px;overflow:hidden;background:#f1f2f4;color:#14151a;font-family:'Segoe UI',Arial,sans-serif}body{padding:48px}h1{font-size:30px;height:64px}h1 span{font-weight:400;color:#5b6070}.g{display:grid;grid-template-columns:repeat(${cols},${tw}px);gap:28px 32px}.t{height:${th + 150}px}.t img{display:block;width:${tw}px;height:${th}px;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,.18)}h2{font-size:22px;margin-top:14px}code{font:400 16px Consolas,monospace;color:#5b6070;margin-inline-start:6px}em{font:400 14px 'Segoe UI';color:#5b6070;border:1px solid #c3c6cf;border-radius:10px;padding:1px 8px;margin-inline-start:6px}p{font-size:16px;color:#3d414d;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sw{display:flex;gap:5px;margin-top:10px}.sw i{display:block;width:34px;height:22px;border-radius:5px;border:1px solid rgba(0,0,0,.25)}.f{font-size:14px;color:#5b6070;margin-top:8px}</style></head><body><h1>design-studio palettes <span>${Object.keys(palettes).length} brands, one template (${ref}); swatches: ${TOKENS.join(" ")}</span></h1><div class="g">${tiles.join("")}</div></body></html>`;
    const f = join(tmp, "sheet.html");
    writeFileSync(f, html, "utf8");
    return render(f, resolve(out), { w: W, h: H });
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}

// ---------- --check ----------
export function check({ tplRoot = TPL, log = console.log } = {}) {
  const results = [];
  const t = (name, ok, detail) => { results.push({ name, pass: !!ok, detail: String(detail ?? "") }); log(`[${ok ? "PASS" : "FAIL"}] ${name}: ${detail}`); };
  let palettes = {};
  try { palettes = loadPalettes(tplRoot); } catch (e) { t("palettes.json reads", false, e.message); }
  const ids = Object.keys(palettes);
  const dark = ids.filter((id) => palettes[id].dark === true);
  t("palettes.json holds 8 palettes, 2 or more dark", ids.length === 8 && dark.length >= 2, `${ids.length} palettes, ${dark.length} dark`);
  for (const id of ids) {
    const bad = paletteProblems(palettes[id]);
    const min = bad.length ? null : CONTRAST_PAIRS.map(([a, b]) => [contrastRatio(palettes[id].tokens[a], palettes[id].tokens[b]), `${a}/${b}`]).sort((x, y) => x[0] - y[0])[0];
    t(`palette ${id}`, !bad.length, bad.length ? bad.join("; ") : `${TOKENS.length} tokens, ${FONTS.length} fonts, ${CONTRAST_PAIRS.length} pairs at ${CONTRAST_MIN}:1 or more (lowest ${min[0].toFixed(2)} ${min[1]})`);
  }
  const dirs = templateDirs(tplRoot);
  t("templates found", dirs.length > 0, `${dirs.length} template folders`);
  const notes = [];
  for (const d of dirs) {
    let tpl;
    try { tpl = loadTemplate(d.ref, tplRoot); } catch (e) { t(`${d.ref} template.json`, false, e.message.includes("missing") ? "template.json missing" : `template.json does not parse: ${e.message}`); continue; }
    const { bad, notes: n } = templateProblems(tpl, palettes);
    for (const x of n) notes.push(`${d.ref}: ${x}`);
    if (bad.length) { t(`${d.ref}`, false, bad.join("; ")); continue; }
    const tmp = mkdtempSync(join(tmpdir(), "ds-tplcheck-"));
    try {
      const st = stamp({ template: tpl, tplRoot });
      const dir = writeStamp(st, join(tmp, "CHECK"));
      const more = [];
      if (st.kind === "cover") {
        quiet(() => coverGen(dir));
        const page = read(join(dir, "page.html"));
        if (page.includes("{{")) more.push("page.html keeps a {{");
        if (/#[0-9a-fA-F]{6}\b/.test(page)) more.push("page.html holds a hex colour");
        const brief = JSON.parse(read(join(dir, "brief.json")));
        const need = (b, w) => (Number(b.title_longest) || String(brief.title).length) * Number(b.title_px) * 0.5 <= (b.title_box[2] - b.title_box[0]) * w;
        if (!need(brief, brief.size.w) || !need({ title_box: brief.title_box, title_px: brief.title_px, ...brief.sizes[1] }, brief.sizes[1].w)) more.push("the default title does not fit its box");
      } else {
        const brief = JSON.parse(read(join(dir, "brief.json")));
        const page = read(join(dir, brief.page));
        if (!page.includes(brief.title)) more.push(`${brief.page} does not carry the title text`);
      }
      t(`${d.ref}`, !more.length, more.length ? more.join("; ") : `${tpl.meta.kind}, ${tpl.meta.files.length} files, ${Object.keys(tpl.meta.slots).length} slots with defaults, 0 colours by hand, stamps clean (${st.files.size} files, no {{ left)`);
    } catch (e) { t(`${d.ref}`, false, `stamp failed: ${e.message}`); } finally { rmSync(tmp, { recursive: true, force: true }); }
  }
  for (const n of notes) log(`[NOTE] ${n}`);
  const fails = results.filter((r) => !r.pass);
  const fams = [...new Set(dirs.map((d) => d.family))].map((f) => `${f} ${dirs.filter((d) => d.family === f).length}`).join(", ");
  log(fails.length ? `TEMPLATE FAIL: ${fails.length} failing check(s)` : `TEMPLATE PASS: ${ids.length} palettes (${dark.length} dark) at ${CONTRAST_MIN}:1, ${dirs.length} templates (${fams}), every slot has a default, 0 colours by hand, every stamp clean; ${notes.length} note(s)`);
  return { pass: fails.length === 0, results, notes };
}

// ---------- CLI ----------
export function parseArgs(argv) {
  const o = { _: [], slots: {}, assets: {}, flags: new Set() };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const kv = a.match(/^([A-Z][A-Z0-9_]*)=([\s\S]*)$/);
    if (a === "--template" || a === "--palette" || a === "--out") o[a.slice(2)] = argv[++i];
    else if (a === "--asset") { const m = String(argv[++i] ?? "").match(/^([^=]+)=([\s\S]+)$/); if (!m) throw new Error("--asset wants name=path"); o.assets[m[1]] = m[2]; }
    else if (a.startsWith("--")) o.flags.add(a);
    else if (kv) o.slots[kv[1]] = kv[2];
    else o._.push(a);
  }
  return o;
}

const USAGE = "usage: node tools/template.mjs list | new <order> --template <family>/<id> [--palette <id>] [SLOT=value ...] [--asset name=path ...] | build <order> | preview <family>/<id> [--palette <id>] | preview --all | palettes [<family>/<id>] | --check";

const isMain = (() => { try { return fileURLToPath(import.meta.url) === resolve(process.argv[1]); } catch { return false; } })();
if (isMain) {
  let code = 0;
  try {
    const o = parseArgs(process.argv.slice(2));
    const [cmd, arg] = o._;
    if (o.flags.has("--check")) code = check().pass ? 0 : 1;
    else if (cmd === "list") {
      const palettes = loadPalettes();
      const tpls = templateDirs().map((d) => { try { return loadTemplate(d.ref); } catch { return null; } }).filter(Boolean);
      if (o.flags.has("--json")) console.log(JSON.stringify({ templates: tpls.map((t) => ({ ref: t.ref, kind: t.meta.kind, sizes: t.meta.sizes, what: t.meta.what, for: t.meta.for, palette: t.meta.palette, slots: Object.keys(t.meta.slots ?? {}) })), palettes: Object.fromEntries(Object.entries(palettes).map(([id, p]) => [id, { name: p.name, mood: p.mood, dark: !!p.dark }])) }, null, 2));
      else {
        console.log(`TEMPLATES (${tpls.length}): node tools/template.mjs new <order> --template <family>/<id> [--palette <id>] [SLOT=value ...]`);
        for (const t of tpls) console.log(`  ${t.ref.padEnd(26)} ${String(t.meta.kind).padEnd(5)} ${(t.meta.sizes ?? []).map((z) => `${z.w}x${z.h}`).join(" ").padEnd(20)} ${t.meta.what} | for ${(t.meta.for ?? []).join(", ")} | palette ${t.meta.palette}`);
        console.log(`PALETTES (${Object.keys(palettes).length}): picture templates/palettes.png`);
        for (const [id, p] of Object.entries(palettes)) console.log(`  ${id.padEnd(26)} ${(p.dark ? "dark" : "light").padEnd(5)} ${p.name}: ${p.mood}`);
      }
    } else if (cmd === "new") {
      if (!arg || !o.template) throw new Error(USAGE);
      const st = newOrder(arg, { template: o.template, palette: o.palette, slots: o.slots, assets: o.assets });
      console.log(`NEW ${arg}: ${st.ref} + ${st.palette} -> designs/${arg} (${[...st.files.keys()].join(" ")})`);
      for (const n of st.notes) console.log(`  ${n}`);
      if (st.sample.length) console.log(`  SAMPLE TEXT still in ${st.sample.length} slots: ${st.sample.join(" ")} (pass SLOT=value, or edit the files)`);
      if (st.pictures.length) console.log(`  PLACEHOLDER pictures: ${st.pictures.join(" ")} (pass --asset <name>=<path> with the customer's own picture)`);
      console.log(`  next: node tools/${st.kind === "cover" ? "cover.mjs all" : "template.mjs build"} ${arg}`);
    } else if (cmd === "build") {
      if (!arg) throw new Error(USAGE);
      code = buildOrder(arg).pass ? 0 : 1;
    } else if (cmd === "preview") {
      const refs = o.flags.has("--all") ? templateDirs().map((d) => d.ref) : [arg];
      if (!refs[0]) throw new Error(USAGE);
      for (const ref of refs) { const r = preview(ref, { palette: o.palette, out: o.flags.has("--all") ? undefined : o.out }); console.log(`PREVIEW ${ref}: ${posix(r.out).replace(`${posix(ROOT)}/`, "")} ${r.w}x${r.h} ${r.bytes}B (${r.palette})`); }
      if (o.flags.has("--all")) { const r = paletteSheet(); console.log(`PALETTES: templates/palettes.png ${r.w}x${r.h} ${r.bytes}B`); }
    } else if (cmd === "palettes") {
      const r = paletteSheet({ ref: arg ?? "covers/app-window", ...(o.out ? { out: o.out } : {}) });
      console.log(`PALETTES: ${posix(r.out).replace(`${posix(ROOT)}/`, "")} ${r.w}x${r.h} ${r.bytes}B (${arg ?? "covers/app-window"})`);
    } else { console.log(USAGE); code = 2; }
  } catch (e) {
    console.log(`TEMPLATE FAIL: ${e.message}`);
    code = 1;
  }
  process.exit(code);
}
