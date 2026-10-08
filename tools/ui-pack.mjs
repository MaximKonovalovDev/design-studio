// tools/ui-pack.mjs: builds the engine-loadable pixel UI pack of order O-023 (game-ui lane).
//   node tools/ui-pack.mjs            writes designs/O-023/: ui-atlas.png + .json, font-5x7.png + .json, tokens.json,
//                                     layout.json, preview-hud.png, preview-menu.png, preview-atlas.png
//   node tools/ui-pack.mjs --check    builds in memory and checks every piece fits, every layout id resolves, PNGs decode
// Pure node (zlib only): no browser, no Python, no download. Every pixel is authored here (CC0): the 9-slice atlas,
// the 5x7 bitmap font and the icons. The previews are composed from the atlas, the font and layout.json, so the
// files an engine loads are the files the previews prove.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { encodePng as encodeRgbaPng } from "./png.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "designs", "O-023");

// ---------- raster ----------
export class Img {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Uint8Array(w * h * 4); }
  set(x, y, c) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; const i = (y * this.w + x) * 4; this.d[i] = c[0]; this.d[i + 1] = c[1]; this.d[i + 2] = c[2]; this.d[i + 3] = c[3] ?? 255; }
  get(x, y) { const i = (y * this.w + x) * 4; return [this.d[i], this.d[i + 1], this.d[i + 2], this.d[i + 3]]; }
  over(x, y, c) { // source-over
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || !c[3]) return;
    const i = (y * this.w + x) * 4; const a = c[3] / 255; const b = this.d[i + 3] / 255; const o = a + b * (1 - a);
    for (let k = 0; k < 3; k++) this.d[i + k] = Math.round((c[k] * a + this.d[i + k] * b * (1 - a)) / (o || 1));
    this.d[i + 3] = Math.round(o * 255);
  }
  rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); }
  clear(x, y) { this.set(x, y, [0, 0, 0, 0]); }
}

// The Img wrapper over the shared codec in tools/png.mjs (kept so tests/ui-pack.test.mjs keeps its call).
export function encodePng(img) {
  return encodeRgbaPng(img.w, img.h, img.d);
}

// ---------- palette (same values as kits/game-ui/tokens.css, plus derived light and dark edges) ----------
const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16), 255];
export const COLORS = {
  bg: "#14161f", panel: "#1f2333", panelHi: "#2b3149", panelLo: "#171a27", ink: "#f4f1e8", muted: "#a8aec2",
  accent: "#ffb325", accentHi: "#ffd27a", accentLo: "#b97a0b", onAccent: "#1a1206",
  hp: "#e5484d", hpHi: "#ff8a8e", hpLo: "#9c2a30", mana: "#3e8ef7", manaHi: "#8dbaff", manaLo: "#285aa5",
  stamina: "#4cc38a", staminaHi: "#8fe3b9", staminaLo: "#2c7e57", line: "#333a52", lineHi: "#4b5478", white: "#ffffff",
};
const C = Object.fromEntries(Object.entries(COLORS).map(([k, v]) => [k, hex(v)]));

// ---------- 5x7 bitmap font (CC0, authored here): 95 printable ASCII glyphs, 5 columns x 7 rows ----------
const G = {
  " ": "...../...../...../...../...../...../.....", "!": "..#../..#../..#../..#../..#../...../..#..", "\"": ".#.#./.#.#./.#.#./...../...../...../.....",
  "#": ".#.#./.#.#./#####/.#.#./#####/.#.#./.#.#.", "$": "..#../.####/#.#../.###./..#.#/####./..#..", "%": "##..#/##..#/...#./..#../.#.../#..##/#..##",
  "&": ".##../#..#./#.#../.#.../#.#.#/#..#./.##.#", "'": "..#../..#../.#.../...../...../...../.....", "(": "...#./..#../.#.../.#.../.#.../..#../...#.",
  ")": ".#.../..#../...#./...#./...#./..#../.#...", "*": "...../..#../#.#.#/.###./#.#.#/..#../.....", "+": "...../..#../..#../#####/..#../..#../.....",
  ",": "...../...../...../...../.##../..#../.#...", "-": "...../...../...../#####/...../...../.....", ".": "...../...../...../...../...../.##../.##..",
  "/": "...../....#/...#./..#../.#.../#..../.....", "0": ".###./#...#/#..##/#.#.#/##..#/#...#/.###.", "1": "..#../.##../..#../..#../..#../..#../.###.",
  "2": ".###./#...#/....#/...#./..#../.#.../#####", "3": "#####/...#./..#../...#./....#/#...#/.###.", "4": "...#./..##./.#.#./#..#./#####/...#./...#.",
  "5": "#####/#..../####./....#/....#/#...#/.###.", "6": "..##./.#.../#..../####./#...#/#...#/.###.", "7": "#####/....#/...#./..#../.#.../.#.../.#...",
  "8": ".###./#...#/#...#/.###./#...#/#...#/.###.", "9": ".###./#...#/#...#/.####/....#/...#./.##..", ":": "...../.##../.##../...../.##../.##../.....",
  ";": "...../.##../.##../...../.##../..#../.#...", "<": "...#./..#../.#.../#..../.#.../..#../...#.", "=": "...../...../#####/...../#####/...../.....",
  ">": ".#.../..#../...#./....#/...#./..#../.#...", "?": ".###./#...#/....#/...#./..#../...../..#..", "@": ".###./#...#/#.###/#.#.#/#.###/#..../.###.",
  A: ".###./#...#/#...#/#####/#...#/#...#/#...#", B: "####./#...#/#...#/####./#...#/#...#/####.", C: ".###./#...#/#..../#..../#..../#...#/.###.",
  D: "###../#..#./#...#/#...#/#...#/#..#./###..", E: "#####/#..../#..../####./#..../#..../#####", F: "#####/#..../#..../####./#..../#..../#....",
  G: ".###./#...#/#..../#.###/#...#/#...#/.####", H: "#...#/#...#/#...#/#####/#...#/#...#/#...#", I: ".###./..#../..#../..#../..#../..#../.###.",
  J: "..###/...#./...#./...#./...#./#..#./.##..", K: "#...#/#..#./#.#../##.../#.#../#..#./#...#", L: "#..../#..../#..../#..../#..../#..../#####",
  M: "#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#", N: "#...#/#...#/##..#/#.#.#/#..##/#...#/#...#", O: ".###./#...#/#...#/#...#/#...#/#...#/.###.",
  P: "####./#...#/#...#/####./#..../#..../#....", Q: ".###./#...#/#...#/#...#/#.#.#/#..#./.##.#", R: "####./#...#/#...#/####./#.#../#..#./#...#",
  S: ".####/#..../#..../.###./....#/....#/####.", T: "#####/..#../..#../..#../..#../..#../..#..", U: "#...#/#...#/#...#/#...#/#...#/#...#/.###.",
  V: "#...#/#...#/#...#/#...#/#...#/.#.#./..#..", W: "#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#", X: "#...#/#...#/.#.#./..#../.#.#./#...#/#...#",
  Y: "#...#/#...#/.#.#./..#../..#../..#../..#..", Z: "#####/....#/...#./..#../.#.../#..../#####", "[": ".###./.#.../.#.../.#.../.#.../.#.../.###.",
  "\\": "...../#..../.#.../..#../...#./....#/.....", "]": ".###./...#./...#./...#./...#./...#./.###.", "^": "..#../.#.#./#...#/...../...../...../.....",
  _: "...../...../...../...../...../...../#####", "`": ".#.../..#../...#./...../...../...../.....",
  a: "...../...../.###./....#/.####/#...#/.####", b: "#..../#..../#.##./##..#/#...#/#...#/####.", c: "...../...../.###./#..../#..../#...#/.###.",
  d: "....#/....#/.##.#/#..##/#...#/#...#/.####", e: "...../...../.###./#...#/#####/#..../.###.", f: "..##./.#..#/.#.../###../.#.../.#.../.#...",
  g: "...../.####/#...#/#...#/.####/....#/.###.", h: "#..../#..../#.##./##..#/#...#/#...#/#...#", i: "..#../...../.##../..#../..#../..#../.###.",
  j: "...#./...../..##./...#./...#./#..#./.##..", k: "#..../#..../#..#./#.#../##.../#.#../#..#.", l: ".##../..#../..#../..#../..#../..#../.###.",
  m: "...../...../##.#./#.#.#/#.#.#/#...#/#...#", n: "...../...../#.##./##..#/#...#/#...#/#...#", o: "...../...../.###./#...#/#...#/#...#/.###.",
  p: "...../####./#...#/#...#/####./#..../#....", q: "...../.####/#...#/#...#/.####/....#/....#", r: "...../...../#.##./##..#/#..../#..../#....",
  s: "...../...../.####/#..../.###./....#/####.", t: ".#.../.#.../###../.#.../.#.../.#..#/..##.", u: "...../...../#...#/#...#/#...#/#..##/.##.#",
  v: "...../...../#...#/#...#/#...#/.#.#./..#..", w: "...../...../#...#/#...#/#.#.#/#.#.#/.#.#.", x: "...../...../#...#/.#.#./..#../.#.#./#...#",
  y: "...../#...#/#...#/#...#/.####/....#/.###.", z: "...../...../#####/...#./..#../.#.../#####", "{": "...##/..#../..#../.#.../..#../..#../...##",
  "|": "..#../..#../..#../..#../..#../..#../..#..", "}": "##.../..#../..#../...#./..#../..#../##...", "~": "...../...../.#.../#.#.#/...#./...../.....",
};
export const GLYPH_ROWS = Object.fromEntries(Object.entries(G).map(([k, v]) => [k, v.split("/")]));
const FONT = { cellW: 6, cellH: 8, cols: 16, rows: 6, first: 32, last: 126 };

export function buildFont() {
  const img = new Img(FONT.cols * FONT.cellW, FONT.rows * FONT.cellH);
  for (let cp = FONT.first; cp <= FONT.last; cp++) {
    const rows = GLYPH_ROWS[String.fromCharCode(cp)];
    if (!rows || rows.length !== 7 || rows.some((r) => r.length !== 5)) throw new Error(`glyph ${String.fromCharCode(cp)} is not 5x7`);
    const idx = cp - FONT.first; const ox = (idx % FONT.cols) * FONT.cellW; const oy = Math.floor(idx / FONT.cols) * FONT.cellH;
    rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === "#") img.set(ox + x, oy + y, C.white); }));
  }
  const json = { name: "ds-pixel-5x7", license: "CC0 1.0 (authored for design-studio, no third-party font data)", image: "font-5x7.png", size: { w: img.w, h: img.h }, cell: { w: FONT.cellW, h: FONT.cellH }, glyph: { w: 5, h: 7 }, columns: FONT.cols, rows: FONT.rows, firstCodepoint: FONT.first, lastCodepoint: FONT.last, advance: FONT.cellW, lineHeight: FONT.cellH + 1, uv: "cell index = codepoint - 32; x = (index % 16) * 6; y = floor(index / 16) * 8; u = x / 96; v = y / 48; tint: glyph pixels are white, multiply by the text color", ttf: "ds-pixel-5x7.ttf (same glyphs as outlines, 125 units per pixel, 1000 per em)" };
  return { img, json };
}

// ---------- pieces ----------
const lineTo = (img, x0, y0, x1, y1, t, c) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) { const x = Math.round(x0 + ((x1 - x0) * i) / (n || 1)); const y = Math.round(y0 + ((y1 - y0) * i) / (n || 1)); img.rect(x, y, t, t, c); } };
const disc = (img, cx, cy, r, c) => { for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r) img.set(x, y, c); };
const notch = (img) => { for (const [x, y] of [[0, 0], [1, 0], [0, 1], [img.w - 1, 0], [img.w - 2, 0], [img.w - 1, 1], [0, img.h - 1], [1, img.h - 1], [0, img.h - 2], [img.w - 1, img.h - 1], [img.w - 2, img.h - 1], [img.w - 1, img.h - 2]]) img.clear(x, y); };

function frame(w, h, { fill, border, hi, lo, bw = 2 }) {
  const img = new Img(w, h); img.rect(0, 0, w, h, fill);
  for (let k = 0; k < bw; k++) { img.rect(k, k, w - 2 * k, 1, border); img.rect(k, h - 1 - k, w - 2 * k, 1, border); img.rect(k, k, 1, h - 2 * k, border); img.rect(w - 1 - k, k, 1, h - 2 * k, border); }
  if (hi) { img.rect(bw, bw, w - 2 * bw, 1, hi); img.rect(bw, bw, 1, h - 2 * bw, hi); }
  if (lo) { img.rect(bw, h - 1 - bw, w - 2 * bw, 1, lo); img.rect(w - 1 - bw, bw, 1, h - 2 * bw, lo); }
  notch(img); return img;
}

function icon(name) {
  const img = new Img(16, 16); const w = C.white;
  const art = (rows) => rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === "#") img.set(x, y, w); }));
  if (name === "heart") art(["................", "..####....####..", ".######..######.", "################", "################", "################", "################", ".##############.", "..############..", "...##########...", "....########....", ".....######.....", "......####......", ".......##......."]);
  else if (name === "star") art([".......##.......", ".......##.......", "......####......", "......####......", ".##############.", "..############..", "...##########...", "....########....", "....########....", "...####..####...", "..####....####..", "..###......###..", ".##..........##."]);
  else if (name === "shield") art(["..############..", ".##############.", ".##############.", ".##############.", ".##############.", ".##############.", ".##############.", "..############..", "..############..", "...##########...", "....########....", ".....######.....", "......####......", ".......##......."]);
  else if (name === "sword") { lineTo(img, 5, 10, 13, 2, 2, w); lineTo(img, 3, 8, 8, 13, 2, w); lineTo(img, 4, 11, 2, 13, 2, w); img.rect(1, 14, 2, 2, w); img.rect(12, 1, 3, 3, w); }
  else if (name === "coin") { disc(img, 8, 8, 7, w); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x + 0.5 - 8, y + 0.5 - 8); if (d > 4.3 && d < 5.4) img.clear(x, y); } img.rect(7, 5, 2, 6, w); }
  else if (name === "timer") { disc(img, 8, 9, 6.5, w); disc(img, 8, 9, 4.5, [0, 0, 0, 0]); img.rect(6, 1, 4, 2, w); img.rect(7, 3, 2, 2, w); lineTo(img, 8, 9, 8, 5, 1, w); img.rect(8, 9, 3, 1, w); img.rect(7, 8, 2, 2, w); }
  else if (name === "pause") { img.rect(4, 3, 3, 10, w); img.rect(9, 3, 3, 10, w); }
  else if (name === "play") { for (let y = 2; y < 14; y++) { const half = y < 8 ? y - 1 : 14 - y; img.rect(5, y, Math.max(1, Math.round(half * 1.4)), 1, w); } }
  else if (name === "gear") { disc(img, 8, 8, 5.2, w); for (let a = 0; a < 8; a++) { const x = Math.round(8 + 6.4 * Math.cos((a * Math.PI) / 4)); const y = Math.round(8 + 6.4 * Math.sin((a * Math.PI) / 4)); img.rect(x - 1, y - 1, 3, 3, w); } disc(img, 8, 8, 2.2, [0, 0, 0, 0]); }
  else if (name === "close") { lineTo(img, 3, 3, 12, 12, 2, w); lineTo(img, 12, 3, 3, 12, 2, w); }
  else if (name === "arrow") { img.rect(2, 7, 8, 2, w); for (let x = 9; x < 14; x++) { const half = 14 - x; img.rect(x, 8 - half, 1, half * 2, w); } }
  else throw new Error(`unknown icon ${name}`);
  return img;
}

export const ICONS = ["heart", "shield", "sword", "star", "coin", "timer", "pause", "play", "gear", "close", "arrow"];

export function buildPieces() {
  const P = []; const add = (id, img, extra = {}) => P.push({ id, img, ...extra });
  add("panel", frame(24, 24, { fill: C.panel, border: C.line, hi: C.panelHi, lo: C.panelLo }), { slice: [6, 6, 6, 6], group: "panel" });
  add("panel-raised", frame(24, 24, { fill: C.panelHi, border: C.lineHi, hi: C.lineHi, lo: C.panel }), { slice: [6, 6, 6, 6], group: "panel" });
  const btn = (fill, border, hi, lo) => frame(48, 20, { fill, border, hi, lo });
  add("button-normal", btn(C.panelHi, C.line, C.lineHi, C.panel), { slice: [6, 6, 6, 6], group: "button", state: "normal" });
  add("button-hover", btn(C.lineHi, C.accent, C.muted, C.panelHi), { slice: [6, 6, 6, 6], group: "button", state: "hover" });
  add("button-pressed", btn(C.panelLo, C.accent, C.bg, C.panel), { slice: [6, 6, 6, 6], group: "button", state: "pressed" });
  add("button-disabled", btn(C.panel, C.line, C.panel, C.panelLo), { slice: [6, 6, 6, 6], group: "button", state: "disabled" });
  add("button-primary-normal", btn(C.accent, C.accentLo, C.accentHi, C.accentLo), { slice: [6, 6, 6, 6], group: "button-primary", state: "normal" });
  add("button-primary-hover", btn(C.accentHi, C.accent, C.white, C.accent), { slice: [6, 6, 6, 6], group: "button-primary", state: "hover" });
  add("button-primary-pressed", btn(C.accentLo, C.accentLo, C.accentLo, C.accent), { slice: [6, 6, 6, 6], group: "button-primary", state: "pressed" });
  const bar = frame(40, 8, { fill: C.bg, border: C.line, bw: 1 }); notch(bar);
  add("bar-frame", bar, { slice: [3, 3, 3, 3], group: "bar", inset: 2 });
  const fill = (c, hi, lo) => { const i = new Img(8, 4); i.rect(0, 0, 8, 4, c); i.rect(0, 0, 8, 1, hi); i.rect(0, 3, 8, 1, lo); return i; };
  add("bar-fill-hp", fill(C.hp, C.hpHi, C.hpLo), { group: "bar-fill", token: "hp" });
  add("bar-fill-mana", fill(C.mana, C.manaHi, C.manaLo), { group: "bar-fill", token: "mana" });
  add("bar-fill-stamina", fill(C.stamina, C.staminaHi, C.staminaLo), { group: "bar-fill", token: "stamina" });
  add("bar-fill-gold", fill(C.accent, C.accentHi, C.accentLo), { group: "bar-fill", token: "accent" });
  add("slot", frame(22, 22, { fill: C.panelLo, border: C.line, hi: C.bg, lo: C.panelHi, bw: 2 }), { slice: [5, 5, 5, 5], group: "slot" });
  add("slot-selected", frame(22, 22, { fill: C.panelLo, border: C.accent, hi: C.bg, lo: C.accentLo, bw: 2 }), { slice: [5, 5, 5, 5], group: "slot" });
  for (const n of ICONS) add(`icon-${n}`, icon(n), { group: "icon" });
  return P;
}

// shelf pack, 1px gutter, width 256
export function packAtlas(pieces, W = 256) {
  const order = [...pieces].sort((a, b) => b.img.h - a.img.h || a.id.localeCompare(b.id));
  let x = 1; let y = 1; let rowH = 0; const at = new Map();
  for (const p of order) { if (x + p.img.w + 1 > W) { x = 1; y += rowH + 1; rowH = 0; } at.set(p.id, { x, y }); x += p.img.w + 1; rowH = Math.max(rowH, p.img.h); }
  const H = y + rowH + 1; const atlas = new Img(W, H);
  for (const p of pieces) { const { x: px, y: py } = at.get(p.id); for (let j = 0; j < p.img.h; j++) for (let i = 0; i < p.img.w; i++) atlas.set(px + i, py + j, p.img.get(i, j)); }
  const json = { name: "ds-pixel-ui-v1", license: "CC0 1.0 (authored for design-studio)", image: "ui-atlas.png", size: { w: W, h: H }, filter: "nearest (point), no mipmaps, no premultiply", scale: "integer only: x2 for 1280x720, x3 for 1920x1080, x4 for 2560x1440 from the 640x360 reference", slice: "slice = [left, top, right, bottom] in atlas pixels; corners keep their size times scale, edges and center stretch", pieces: pieces.map((p) => { const a = at.get(p.id); const o = { id: p.id, x: a.x, y: a.y, w: p.img.w, h: p.img.h }; if (p.slice) o.slice = p.slice; if (p.group) o.group = p.group; if (p.state) o.state = p.state; if (p.inset != null) o.fillInset = p.inset; if (p.token) o.colorToken = p.token; return o; }) };
  return { img: atlas, json };
}

// ---------- layout: the HUD and the menu, in the 640x360 reference ----------
export const LAYOUT = {
  name: "ds-pixel-ui-layout-v1",
  reference: { w: 640, h: 360 },
  note: "x and y are offsets from the anchor edge, in reference pixels. kind nine = 9-slice piece stretched to w x h; bar = frame piece + fill piece inside the frame inset, value 0..1, from start or end; icon = piece at native size; text = font-5x7 at an integer scale, colored by a token.",
  screens: {
    hud: [
      { id: "p1-name", kind: "text", anchor: "top-left", x: 16, y: 8, text: "PLAYER 1", scale: 1, color: "ink" },
      { id: "p1-hp", kind: "bar", anchor: "top-left", x: 16, y: 18, w: 240, h: 12, frame: "bar-frame", fill: "bar-fill-hp", value: 0.72, from: "start" },
      { id: "p1-stamina", kind: "bar", anchor: "top-left", x: 16, y: 32, w: 160, h: 8, frame: "bar-frame", fill: "bar-fill-stamina", value: 0.48, from: "start" },
      { id: "p1-round-1", kind: "icon", anchor: "top-left", x: 16, y: 44, piece: "icon-star", tint: "accent" },
      { id: "p1-round-2", kind: "icon", anchor: "top-left", x: 34, y: 44, piece: "icon-star", tint: "line" },
      { id: "p2-name", kind: "text", anchor: "top-right", x: 16, y: 8, text: "PLAYER 2", scale: 1, color: "ink", align: "end" },
      { id: "p2-hp", kind: "bar", anchor: "top-right", x: 16, y: 18, w: 240, h: 12, frame: "bar-frame", fill: "bar-fill-hp", value: 0.55, from: "end" },
      { id: "p2-stamina", kind: "bar", anchor: "top-right", x: 16, y: 32, w: 160, h: 8, frame: "bar-frame", fill: "bar-fill-stamina", value: 0.8, from: "end" },
      { id: "p2-round-1", kind: "icon", anchor: "top-right", x: 16, y: 44, piece: "icon-star", tint: "accent" },
      { id: "p2-round-2", kind: "icon", anchor: "top-right", x: 34, y: 44, piece: "icon-star", tint: "accent" },
      { id: "timer-panel", kind: "nine", anchor: "top-center", x: 0, y: 6, w: 64, h: 40, piece: "panel" },
      { id: "timer-label", kind: "text", anchor: "top-center", x: 0, y: 13, text: "TIME", scale: 1, color: "muted", align: "center" },
      { id: "timer-value", kind: "text", anchor: "top-center", x: 0, y: 24, text: "58", scale: 2, color: "accent", align: "center" },
      { id: "slot-1", kind: "nine", anchor: "bottom-center", x: -39, y: 12, w: 22, h: 22, piece: "slot-selected" },
      { id: "slot-2", kind: "nine", anchor: "bottom-center", x: -13, y: 12, w: 22, h: 22, piece: "slot" },
      { id: "slot-3", kind: "nine", anchor: "bottom-center", x: 13, y: 12, w: 22, h: 22, piece: "slot" },
      { id: "slot-4", kind: "nine", anchor: "bottom-center", x: 39, y: 12, w: 22, h: 22, piece: "slot" },
      { id: "slot-1-icon", kind: "icon", anchor: "bottom-center", x: -39, y: 15, piece: "icon-sword", tint: "ink" },
      { id: "slot-2-icon", kind: "icon", anchor: "bottom-center", x: -13, y: 15, piece: "icon-shield", tint: "ink" },
      { id: "slot-3-icon", kind: "icon", anchor: "bottom-center", x: 13, y: 15, piece: "icon-heart", tint: "hp" },
      { id: "slot-4-icon", kind: "icon", anchor: "bottom-center", x: 39, y: 15, piece: "icon-coin", tint: "accent" },
      { id: "key-1", kind: "text", anchor: "bottom-center", x: -39, y: 2, text: "1", scale: 1, color: "muted", align: "center" },
      { id: "key-2", kind: "text", anchor: "bottom-center", x: -13, y: 2, text: "2", scale: 1, color: "muted", align: "center" },
      { id: "key-3", kind: "text", anchor: "bottom-center", x: 13, y: 2, text: "3", scale: 1, color: "muted", align: "center" },
      { id: "key-4", kind: "text", anchor: "bottom-center", x: 39, y: 2, text: "4", scale: 1, color: "muted", align: "center" },
    ],
    menu: [
      { id: "menu-panel", kind: "nine", anchor: "center", x: 0, y: 0, w: 210, h: 226, piece: "panel" },
      { id: "title", kind: "text", anchor: "center", x: 0, y: -80, text: "ARENA", scale: 4, color: "accent", align: "center" },
      { id: "subtitle", kind: "text", anchor: "center", x: 0, y: -50, text: "MAIN MENU", scale: 1, color: "muted", align: "center" },
      { id: "btn-continue", kind: "button", anchor: "center", x: 0, y: -22, w: 160, h: 24, group: "button", state: "disabled", text: "CONTINUE", scale: 1, color: "muted" },
      { id: "btn-start", kind: "button", anchor: "center", x: 0, y: 10, w: 160, h: 24, group: "button-primary", state: "hover", text: "START", scale: 2, color: "onAccent" },
      { id: "btn-options", kind: "button", anchor: "center", x: 0, y: 42, w: 160, h: 24, group: "button", state: "normal", text: "OPTIONS", scale: 1, color: "ink" },
      { id: "btn-quit", kind: "button", anchor: "center", x: 0, y: 74, w: 160, h: 24, group: "button", state: "normal", text: "QUIT", scale: 1, color: "ink" },
      { id: "close", kind: "icon", anchor: "top-right", x: 10, y: 10, piece: "icon-close", tint: "muted" },
    ],
  },
};

// ---------- compose (reference pixels), then upscale ----------
function blit(dst, src, sx, sy, sw, sh, dx, dy, dw, dh, slice, tint) {
  const pick = (u, v) => { // u,v in dst pixel offsets, reference pixels
    let x; let y;
    if (!slice) { x = Math.floor((u * sw) / dw); y = Math.floor((v * sh) / dh); }
    else {
      const [l, t, r, b] = slice;
      x = u < l ? u : u >= dw - r ? sw - (dw - u) : l + Math.floor(((u - l) * (sw - l - r)) / (dw - l - r));
      y = v < t ? v : v >= dh - b ? sh - (dh - v) : t + Math.floor(((v - t) * (sh - t - b)) / (dh - t - b));
    }
    return src.get(sx + x, sy + y);
  };
  for (let v = 0; v < dh; v++) for (let u = 0; u < dw; u++) { const c = pick(u, v); if (!c[3]) continue; dst.over(dx + u, dy + v, tint ? [Math.round((c[0] * tint[0]) / 255), Math.round((c[1] * tint[1]) / 255), Math.round((c[2] * tint[2]) / 255), c[3]] : c); }
}

export function composeScreen(layout, name, atlas, atlasJson, font) {
  const R = layout.reference; const dst = new Img(R.w, R.h); dst.rect(0, 0, R.w, R.h, name === "menu" ? [10, 11, 17, 255] : [26, 29, 41, 255]);
  const piece = (id) => { const p = atlasJson.pieces.find((q) => q.id === id); if (!p) throw new Error(`layout piece ${id} is not in the atlas`); return p; };
  const group = (g, state) => { const p = atlasJson.pieces.find((q) => q.group === g && q.state === state); if (!p) throw new Error(`layout group ${g}/${state} is not in the atlas`); return p; };
  const col = (t) => { if (!C[t]) throw new Error(`layout color ${t} unknown`); return C[t]; };
  const place = (e, w, h) => { const ax = e.anchor; let x; let y;
    if (ax.endsWith("left")) x = e.x; else if (ax.endsWith("right")) x = R.w - e.x - w; else x = Math.round(R.w / 2 - w / 2 + e.x);
    if (ax.startsWith("top")) y = e.y; else if (ax.startsWith("bottom")) y = R.h - e.y - h; else y = Math.round(R.h / 2 - h / 2 + e.y);
    return [x, y]; };
  const text = (str, x, y, scale, color) => { for (let i = 0; i < str.length; i++) { const idx = str.charCodeAt(i) - FONT.first; if (idx < 0 || idx > FONT.last - FONT.first) throw new Error(`glyph ${str[i]} outside ASCII`); const sx = (idx % FONT.cols) * FONT.cellW; const sy = Math.floor(idx / FONT.cols) * FONT.cellH; blit(dst, font, sx, sy, 5, 7, x + i * FONT.cellW * scale, y, 5 * scale, 7 * scale, null, color); } };
  const tw = (str, scale) => str.length * FONT.cellW * scale - scale;
  for (const e of layout.screens[name]) {
    if (e.kind === "nine") { const p = piece(e.piece); const [x, y] = place(e, e.w, e.h); blit(dst, atlas, p.x, p.y, p.w, p.h, x, y, e.w, e.h, p.slice, null); }
    else if (e.kind === "icon") { const p = piece(e.piece); const [x, y] = place(e, p.w, p.h); blit(dst, atlas, p.x, p.y, p.w, p.h, x, y, p.w, p.h, null, col(e.tint)); }
    else if (e.kind === "bar") { const f = piece(e.frame); const fl = piece(e.fill); const [x, y] = place(e, e.w, e.h); blit(dst, atlas, f.x, f.y, f.w, f.h, x, y, e.w, e.h, f.slice, null); const ins = f.fillInset ?? 2; const iw = Math.round((e.w - ins * 2) * e.value); const ix = e.from === "end" ? x + e.w - ins - iw : x + ins; blit(dst, atlas, fl.x, fl.y, fl.w, fl.h, ix, y + ins, iw, e.h - ins * 2, null, null); }
    else if (e.kind === "button") { const p = group(e.group, e.state); const [x, y] = place(e, e.w, e.h); blit(dst, atlas, p.x, p.y, p.w, p.h, x, y, e.w, e.h, p.slice, null); const w = tw(e.text, e.scale); text(e.text, x + Math.round((e.w - w) / 2), y + Math.round((e.h - 7 * e.scale) / 2), e.scale, col(e.color)); }
    else if (e.kind === "text") { const w = tw(e.text, e.scale); const [x0, y] = place(e, w, 7 * e.scale); const x = e.align === "center" ? Math.round(R.w / 2 - w / 2 + (e.anchor.endsWith("center") ? e.x : 0)) : e.align === "end" ? R.w - e.x - w : x0; text(e.text, x, y, e.scale, col(e.color)); }
    else throw new Error(`layout kind ${e.kind}`);
  }
  return dst;
}

export function upscale(src, s) { const o = new Img(src.w * s, src.h * s); for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) o.set(x, y, src.get(Math.floor(x / s), Math.floor(y / s))); return o; }

function checkerPreview(atlas, s = 4) { const o = new Img(atlas.w * s, atlas.h * s); const a = [38, 41, 56, 255]; const b = [30, 33, 46, 255]; for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) o.set(x, y, ((x >> 3) + (y >> 3)) & 1 ? a : b); for (let y = 0; y < atlas.h; y++) for (let x = 0; x < atlas.w; x++) { const c = atlas.get(x, y); if (!c[3]) continue; for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) o.over(x * s + i, y * s + j, c); } return o; }

export function tokensJson() {
  return { name: "ds-pixel-ui-tokens-v1", colors: COLORS, reference: LAYOUT.reference, scales: [2, 3, 4], font: { atlas: "font-5x7.json", ttf: "ds-pixel-5x7.ttf", sizes: { small: 1, body: 1, label: 1, title: 4, score: 2 } }, sizes: { touchMinReference: 22, barH: 12, buttonH: 24, buttonW: 160, slot: 22, icon: 16 }, source: "colors equal kits/game-ui/tokens.css (--gui-*); the edge shades (Hi, Lo) are derived and live only in the atlas" };
}

export function buildAll() {
  const { img: font, json: fontJson } = buildFont();
  const pieces = buildPieces(); const { img: atlas, json: atlasJson } = packAtlas(pieces);
  const hud = composeScreen(LAYOUT, "hud", atlas, atlasJson, font); const menu = composeScreen(LAYOUT, "menu", atlas, atlasJson, font);
  return { font, fontJson, atlas, atlasJson, previews: { hud: upscale(hud, 2), menu: upscale(menu, 2), atlas: checkerPreview(atlas, 4) } };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url).replace(/\\/g, "/").toLowerCase() === process.argv[1].replace(/\\/g, "/").toLowerCase();
if (isMain) {
  const r = buildAll();
  if (process.argv.includes("--check")) {
    const bytes = encodePng(r.atlas); const ok = bytes.subarray(1, 4).toString() === "PNG" && r.atlasJson.pieces.length >= 27 && r.fontJson.size.w === 96;
    console.log(`UIPACK ${ok ? "PASS" : "FAIL"}: ${r.atlasJson.pieces.length} atlas pieces in ${r.atlasJson.size.w}x${r.atlasJson.size.h}, 95 glyphs, hud and menu compose from layout.json`);
    process.exit(ok ? 0 : 1);
  }
  mkdirSync(OUT, { recursive: true });
  const w = (f, d) => writeFileSync(join(OUT, f), d);
  w("ui-atlas.png", encodePng(r.atlas)); w("ui-atlas.json", `${JSON.stringify(r.atlasJson, null, 2)}\n`);
  w("font-5x7.png", encodePng(r.font)); w("font-5x7.json", `${JSON.stringify(r.fontJson, null, 2)}\n`);
  w("tokens.json", `${JSON.stringify(tokensJson(), null, 2)}\n`); w("layout.json", `${JSON.stringify(LAYOUT, null, 2)}\n`);
  w("font-glyphs.json", `${JSON.stringify(GLYPH_ROWS, null, 1)}\n`);
  w("preview-hud.png", encodePng(r.previews.hud)); w("preview-menu.png", encodePng(r.previews.menu)); w("preview-atlas.png", encodePng(r.previews.atlas));
  console.log(`UIPACK wrote designs/O-023: ui-atlas.png ${r.atlas.w}x${r.atlas.h} (${r.atlasJson.pieces.length} pieces), font-5x7.png, tokens.json, layout.json, previews`);
}
