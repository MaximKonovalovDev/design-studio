// spikes/sprite-mask.mjs: mask-based procedural sprite generator (spike).
// Idea-only port of Chris95Hua/spriten (MIT) + sahwar/sprite-gen: symmetric
// random bitmask + palette + 8-direction (D4) variants. Reimplemented from
// scratch — no code copied. License-clean: only node builtins (zlib).
// Credit: spriten by Chris95Hua (MIT), sprite-gen idea by sahwar.
// Usage: node spikes/sprite-mask.mjs --seed 7 --out out.png [--size 8] [--palette gameboy] [--variant 0-7] [--scale 16]
import { writeFileSync } from "node:fs";
import { encodePng } from "../tools/png.mjs";

export const PALETTES = {
  gameboy: ["#00000000", "#0f380f", "#306230", "#8bac0f", "#9bbc0f"],
  ember: ["#00000000", "#1a1c2c", "#b13e53", "#ef7d57", "#ffcd75"],
  sea: ["#00000000", "#0b2545", "#13315c", "#134074", "#8da9c4"],
};

// mulberry32: tiny seeded PRNG (public-domain pattern, written fresh here).
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// genMask: 2-bit symmetric mask (mirror left half). 0 = transparent,
// 1..3 = palette entries. Returns { w, h, cells } row-major.
export function genMask(seed, w = 8, h = 8) {
  const rand = rng(seed);
  const cells = new Array(w * h).fill(0);
  const half = Math.ceil(w / 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < half; x++) {
      const v = rand() < 0.45 ? 0 : 1 + Math.floor(rand() * 3);
      cells[y * w + x] = v;
      cells[y * w + (w - 1 - x)] = v;
    }
  }
  return { w, h, cells };
}

// variants8: the 8 dihedral (D4) transforms = 8 top-down directions.
// Square grids only. Index 0 is the identity (original).
export function variants8(grid) {
  const { w, h, cells } = grid;
  if (w !== h) throw new Error("variants8 needs a square grid");
  const n = w;
  const at = (g, x, y) => g[y * n + x];
  const maps = [
    (x, y) => [x, y], (x, y) => [n - 1 - y, x],
    (x, y) => [n - 1 - x, n - 1 - y], (x, y) => [y, n - 1 - x],
    (x, y) => [n - 1 - x, y], (x, y) => [x, n - 1 - y],
    (x, y) => [y, x], (x, y) => [n - 1 - y, n - 1 - x],
  ];
  return maps.map((m) => {
    const out = new Array(n * n);
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const [sx, sy] = m(x, y);
        out[y * n + x] = at(cells, sx, sy);
      }
    return { w: n, h: n, cells: out };
  });
}

const hex = (s) => [
  parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16),
  parseInt(s.slice(5, 7), 16), s.length > 7 ? parseInt(s.slice(7, 9), 16) : 255,
];

// PNG bytes come from the one shared codec, tools/png.mjs (truecolor+alpha).
export function toPNG(grid, paletteName = "gameboy", scale = 16) {
  const pal = (PALETTES[paletteName] ?? PALETTES.gameboy).map(hex);
  const W = grid.w * scale, H = grid.h * scale;
  const rgba = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const v = grid.cells[Math.floor(y / scale) * grid.w + Math.floor(x / scale)];
      const px = pal[v] ?? pal[0];
      if (px) rgba.set(px, (y * W + x) * 4);
    }
  }
  return encodePng(W, H, rgba);
}

if (process.argv[1]?.endsWith("sprite-mask.mjs")) {
  const arg = (k, d) => {
    const i = process.argv.indexOf(`--${k}`);
    return i === -1 ? d : process.argv[i + 1];
  };
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log("usage: node spikes/sprite-mask.mjs --seed N --out sprite.png [--size 8] [--palette gameboy|ember|sea] [--variant 0-7] [--scale 16]");
    process.exit(0);
  }
  const seed = Number(arg("seed", "7"));
  const size = Number(arg("size", "8"));
  const variant = Number(arg("variant", "0"));
  const out = arg("out", null);
  if (!out || Number.isNaN(seed)) { console.error("need --seed N --out file.png"); process.exit(1); }
  const grid = variants8(genMask(seed, size, size))[variant] ?? (() => { throw new Error("variant 0-7"); })();
  writeFileSync(out, toPNG(grid, arg("palette", "gameboy"), Number(arg("scale", "16"))));
  console.log(`sprite seed=${seed} variant=${variant} -> ${out}`);
}
