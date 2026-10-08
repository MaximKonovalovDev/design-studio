// tools/atlas.mjs: PNG texture-atlas packer for the game-ui lane (NEED-04, order O-011).
//
// Packs a set of PNG files (one per sprite) into a single atlas PNG plus an
// engine-loadable JSON index [{ id, x, y, w, h }]. Replaces the game maker's
// by-hand Pillow packing step: the forge HUD slice and the engine2040 menu
// skin load one PNG + one JSON instead of loose files.
//
// Packing core (best-short-side-fit node choice, guillotine split of every
// intersected free rect, containment prune of the free list) adapted from
// soimy/maxrects-packer v2.7.3, file src/maxrects-bin.ts, pinned commit
// 848b260b05b2c51cf53c6814b2d996d1c5043ebe, MIT licence (licence spdx MIT in
// the repo record; credit stays in this header; the simplification to a
// fixed growing bin with no rotation is ours). PNG codec: tools/png.mjs (one
// shared copy): pure node, no
// npm package, no network, works on the screenshots tools/render.mjs writes.
//
//   node tools/atlas.mjs <a.png> [b.png ...] --out atlas.png [--json atlas.json] [--pad 1] [--max 2048] [--pot]
//   node tools/atlas.mjs --src <dir> --out atlas.png [--json atlas.json] [...same flags]
//   node tools/atlas.mjs --check   (pure-function gates + a TEMP-dir end-to-end pack; writes nothing to the repo)
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodePng, encodePng } from "./png.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CREDIT = "soimy/maxrects-packer v2.7.3 (848b260, src/maxrects-bin.ts), MIT";

// ---------- MaxRects bin (adapted, see header credit) ----------
function contains(a, b) {
  return b.x >= a.x && b.y >= a.y && b.x + b.w <= a.x + a.w && b.y + b.h <= a.y + a.h;
}

function collide(a, b) {
  return b.x < a.x + a.w && b.x + b.w > a.x && b.y < a.y + a.h && b.y + b.h > a.y;
}

class Bin {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.free = [{ x: 0, y: 0, w, h }];
    this.placed = [];
  }
  // Best short side fit: the free rect leaving the smallest leftover side wins.
  findNode(rw, rh) {
    let best = null;
    let score = Infinity;
    for (const r of this.free) {
      if (r.w >= rw && r.h >= rh) {
        const fit = Math.min(r.w - rw, r.h - rh);
        if (fit < score) {
          score = fit;
          best = { x: r.x, y: r.y, w: rw, h: rh };
        }
      }
    }
    return best;
  }
  split(node) {
    const n = this.free.length;
    let i = 0;
    let count = n;
    while (i < count) {
      const f = this.free[i];
      if (collide(f, node)) {
        if (node.x < f.x + f.w && node.x + node.w > f.x) {
          if (node.y > f.y && node.y < f.y + f.h) {
            this.free.push({ x: f.x, y: f.y, w: f.w, h: node.y - f.y });
          }
          if (node.y + node.h < f.y + f.h) {
            this.free.push({ x: f.x, y: node.y + node.h, w: f.w, h: f.y + f.h - (node.y + node.h) });
          }
        }
        if (node.y < f.y + f.h && node.y + node.h > f.y) {
          if (node.x > f.x && node.x < f.x + f.w) {
            this.free.push({ x: f.x, y: f.y, w: node.x - f.x, h: f.h });
          }
          if (node.x + node.w < f.x + f.w) {
            this.free.push({ x: node.x + node.w, y: f.y, w: f.x + f.w - (node.x + node.w), h: f.h });
          }
        }
        this.free.splice(i, 1);
        count--;
        i--;
      }
      i++;
    }
    // Prune: drop any free rect contained in another.
    for (let a = 0; a < this.free.length; a++) {
      for (let c = a + 1; c < this.free.length; c++) {
        if (contains(this.free[c], this.free[a])) {
          this.free.splice(a, 1);
          a--;
          break;
        }
        if (contains(this.free[a], this.free[c])) {
          this.free.splice(c, 1);
          c--;
        }
      }
    }
  }
  add(rect) {
    const node = this.findNode(rect.w, rect.h);
    if (!node) return null;
    this.split(node);
    const placed = { ...rect, x: node.x, y: node.y };
    this.placed.push(placed);
    return placed;
  }
}

export function nextPow2(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

// Packs rects [{ id, w, h }] (pad added around each) into a growing bin.
// Returns { w, h, placed: [{ id, x, y, w, h }] } with tight w/h, or pot when asked.
export function packRects(rects, { pad = 1, max = 2048, pot = false } = {}) {
  const items = [...rects]
    .map((r) => ({ id: r.id, w: r.w + pad * 2, h: r.h + pad * 2 }))
    .sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h) || (a.id < b.id ? -1 : 1));
  for (const it of items) {
    if (it.w > max || it.h > max) throw new Error(`sprite ${it.id} ${it.w - pad * 2}x${it.h - pad * 2} exceeds --max ${max}`);
  }
  let size = 64;
  const need = Math.max(...items.map((r) => Math.max(r.w, r.h)), 1);
  while (size < need) size *= 2;
  for (;;) {
    const bin = new Bin(size, size);
    let ok = true;
    const placed = [];
    for (const it of items) {
      const node = bin.add(it);
      if (!node) {
        ok = false;
        break;
      }
      placed.push(node);
    }
    if (ok) {
      let w = 0;
      let h = 0;
      for (const p of placed) {
        w = Math.max(w, p.x + p.w);
        h = Math.max(h, p.y + p.h);
      }
      if (pot) {
        w = nextPow2(w);
        h = nextPow2(h);
      }
      return {
        w,
        h,
        placed: placed.map((p) => ({ id: p.id, x: p.x + pad, y: p.y + pad, w: p.w - pad * 2, h: p.h - pad * 2 })),
      };
    }
    size *= 2;
    if (size > max) throw new Error(`sprites do not fit in --max ${max} (grew past it)`);
  }
}

// True when every placed rect is inside w/h and no two overlap.
export function verifyLayout(placed, w, h) {
  for (const p of placed) {
    if (p.x < 0 || p.y < 0 || p.x + p.w > w || p.y + p.h > h) return false;
  }
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      if (collide(placed[i], placed[j])) return false;
    }
  }
  return true;
}

export function parseArgs(args) {
  const files = [];
  let src = null;
  let out = null;
  let jsonOut = null;
  let pad = 1;
  let max = 2048;
  let pot = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--src" && args[i + 1] != null) src = args[++i];
    else if (a.startsWith("--src=")) src = a.slice("--src=".length);
    else if (a === "--out" && args[i + 1] != null) out = args[++i];
    else if (a.startsWith("--out=")) out = a.slice("--out=".length);
    else if (a === "--json" && args[i + 1] != null) jsonOut = args[++i];
    else if (a.startsWith("--json=")) jsonOut = a.slice("--json=".length);
    else if (a === "--pad" && args[i + 1] != null) pad = Number(args[++i]);
    else if (a.startsWith("--pad=")) pad = Number(a.slice("--pad=".length));
    else if (a === "--max" && args[i + 1] != null) max = Number(args[++i]);
    else if (a.startsWith("--max=")) max = Number(a.slice("--max=".length));
    else if (a === "--pot") pot = true;
    else if (!a.startsWith("-")) files.push(a);
  }
  return { files, src, out, jsonOut, pad, max, pot };
}

export function collectInputs({ files, src }) {
  let list = [...files];
  if (src) {
    if (!existsSync(src)) throw new Error(`--src missing: ${src}`);
    for (const f of readdirSync(src).sort()) {
      if (extname(f).toLowerCase() === ".png") list.push(join(src, f));
    }
  }
  return [...new Set(list)].sort();
}

export function runAtlas({ files, src, out, jsonOut, pad = 1, max = 2048, pot = false }) {
  const inputs = collectInputs({ files, src });
  if (inputs.length === 0) throw new Error("no PNG inputs (pass files or --src <dir>)");
  if (!out) throw new Error("no --out atlas.png given");
  const sprites = inputs.map((f) => {
    if (!existsSync(f)) throw new Error(`input missing: ${f}`);
    const { w, h, data } = decodePng(readFileSync(f));
    return { id: basename(f, extname(f)), file: f, w, h, data };
  });
  const { w, h, placed } = packRects(sprites, { pad, max, pot });
  if (!verifyLayout(placed, w, h)) throw new Error("internal: packed layout failed verification");
  const atlas = new Uint8Array(w * h * 4);
  const byId = new Map(sprites.map((s) => [s.id, s]));
  for (const p of placed) {
    const s = byId.get(p.id);
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.w; x++) {
        const si = (y * s.w + x) * 4;
        const di = ((p.y + y) * w + (p.x + x)) * 4;
        atlas[di] = s.data[si];
        atlas[di + 1] = s.data[si + 1];
        atlas[di + 2] = s.data[si + 2];
        atlas[di + 3] = s.data[si + 3];
      }
    }
  }
  const bytes = encodePng(w, h, atlas);
  mkdirSync(dirname(resolve(out)), { recursive: true });
  writeFileSync(resolve(out), bytes);
  const index = {
    tool: "atlas",
    packer: CREDIT,
    date: new Date().toISOString().slice(0, 10),
    size: { w, h },
    pad,
    pot,
    sprites: placed.map((p) => ({ id: p.id, x: p.x, y: p.y, w: p.w, h: p.h })),
  };
  const jsonPath = jsonOut ?? out.replace(/\.png$/i, ".json");
  writeFileSync(resolve(jsonPath), `${JSON.stringify(index, null, 2)}\n`, "utf8");
  return { out, jsonPath, w, h, bytes: bytes.length, sprites: index.sprites };
}

// --check self-test: pure-function gates (always) + one end-to-end pack of
// generated sprites in the OS temp dir (writes nothing to the repo).
export function selfCheck() {
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });
  ok("credit pins MIT packer", CREDIT.includes("MIT"), CREDIT.slice(0, 40));
  const a = packRects(
    [
      { id: "a", w: 16, h: 16 },
      { id: "b", w: 16, h: 16 },
      { id: "c", w: 32, h: 16 },
    ],
    { pad: 0 },
  );
  ok("fixture packs inside its bin", verifyLayout(a.placed, a.w, a.h), `${a.w}x${a.h}, ${a.placed.length} sprites`);
  ok("fixture bin is tight 64x16", a.w === 64 && a.h === 16, `${a.w}x${a.h}`);
  const b1 = packRects(
    [
      { id: "hud", w: 640, h: 360 },
      { id: "menu", w: 640, h: 360 },
      { id: "avatar", w: 640, h: 360 },
    ],
    { pad: 1 },
  );
  ok("O-011 screens fit 2048", verifyLayout(b1.placed, b1.w, b1.h) && b1.w <= 2048 && b1.h <= 2048, `${b1.w}x${b1.h}`);
  const b2 = packRects(
    [
      { id: "avatar", w: 640, h: 360 },
      { id: "menu", w: 640, h: 360 },
      { id: "hud", w: 640, h: 360 },
    ],
    { pad: 1 },
  );
  ok(
    "pack is order-independent",
    JSON.stringify(b1.sprites ?? b1.placed) === JSON.stringify(b2.sprites ?? b2.placed),
    "same layout whatever the input order",
  );
  const pot = packRects([{ id: "a", w: 100, h: 50 }], { pad: 0, pot: true });
  ok("--pot rounds to powers of two", pot.w === 128 && pot.h === 64, `${pot.w}x${pot.h}`);
  const grad = new Uint8Array(24 * 12 * 4);
  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 24; x++) {
      const i = (y * 24 + x) * 4;
      grad[i] = (x * 10) & 255;
      grad[i + 1] = (y * 20) & 255;
      grad[i + 2] = 128;
      grad[i + 3] = x % 2 ? 255 : 128;
    }
  }
  const rt = decodePng(encodePng(24, 12, grad));
  ok("PNG round-trip is byte-identical", rt.w === 24 && rt.h === 12 && Buffer.from(rt.data).equals(Buffer.from(grad)), "24x12 RGBA gradient");
  let threw = false;
  try {
    decodePng(Buffer.from("definitely not a png"));
  } catch {
    threw = true;
  }
  ok("decode FAILs closed on non-PNG", threw, "throws, never guesses");
  let noInput = false;
  try {
    runAtlas({ files: [], src: null, out: join(tmpdir(), "atlas-nope.png") });
  } catch {
    noInput = true;
  }
  ok("empty input FAILs closed", noInput, "throws, never writes");
  try {
    const dir = join(tmpdir(), `atlas-check-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const red = new Uint8Array(32 * 16 * 4).fill(0);
    for (let i = 0; i < 32 * 16; i++) {
      red[i * 4] = 255;
      red[i * 4 + 3] = 255;
    }
    const blue = new Uint8Array(16 * 32 * 4).fill(0);
    for (let i = 0; i < 16 * 32; i++) {
      blue[i * 4 + 2] = 255;
      blue[i * 4 + 3] = 255;
    }
    writeFileSync(join(dir, "red.png"), encodePng(32, 16, red));
    writeFileSync(join(dir, "blue.png"), encodePng(16, 32, blue));
    const r = runAtlas({ files: [], src: dir, out: join(dir, "atlas.png"), pad: 1 });
    const back = decodePng(readFileSync(r.out));
    const idx = JSON.parse(readFileSync(r.jsonPath, "utf8"));
    const px = (x, y) => [...back.data.subarray((y * back.w + x) * 4, (y * back.w + x) * 4 + 4)];
    const rs = idx.sprites.find((s) => s.id === "red");
    const bs = idx.sprites.find((s) => s.id === "blue");
    const redOk = rs && px(rs.x + 2, rs.y + 2).join(",") === "255,0,0,255";
    const blueOk = bs && px(bs.x + 2, bs.y + 2).join(",") === "0,0,255,255";
    ok("end-to-end pack keeps pixels", redOk && blueOk && idx.sprites.length === 2, `${r.w}x${r.h}, red+blue land intact`);
  } catch (e) {
    ok("end-to-end pack keeps pixels", false, String(e?.message ?? e));
  }
  return { pass: results.every((r) => r.pass), results };
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
    const { pass, results } = selfCheck();
    for (const r of results) console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}: ${r.detail}`);
    console.log(pass ? "ATLAS PASS: maxrects packer + PNG codec green" : `ATLAS FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
    if (!pass) process.exitCode = 1;
  } else {
    try {
      const r = runAtlas(parseArgs(args));
      for (const s of r.sprites) console.log(`[PASS] ${s.id}: ${s.w}x${s.h} at ${s.x},${s.y}`);
      console.log(`wrote ${r.out} (${r.w}x${r.h}, ${r.bytes} bytes) + ${r.jsonPath}`);
      console.log(`ATLAS PASS: ${r.sprites.length} sprites in ${r.w}x${r.h}, layout verified no-overlap`);
    } catch (e) {
      console.log(`ATLAS FAIL: ${String(e?.message ?? e)}`);
      process.exitCode = 1;
    }
  }
}
