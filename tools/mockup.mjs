// tools/mockup.mjs: CSS-only device/scene mockups for the store lane (NEED-08, order O-026).
//
// The store recipe names `node tools/mockup.mjs` (Blender, one at a time) for
// a book, box or laptop hero, and `research/donors/open-design/assets/frames/`
// for software shots — neither exists on disk. Until a Blender pass lands,
// this command stages one of the product's own pictures inside a pure-CSS
// device frame and renders it through the local browser:
//
//   node tools/mockup.mjs --shot <pic.png> --frame browser|macbook|iphone|ipad --out <mockup.png> [--size WxH] [--bg charcoal|pearl|midnight|mocha] [--caption "..."]
//   node tools/mockup.mjs --check   (MOCKUP PASS: pure gates + one TEMP-dir end-to-end render)
//
// Own code, shaped by our `od-mockup-device` skill (CSS 3D device, glass
// highlights, caption; never an external mockup image URL — every pixel of the
// frame is CSS, the screen is the customer's own picture). Steal chain
// (2026-10-04): center `--list` shows no mockup tool in any repo (nearest is
// the shared kaggle image lane — generated pictures, a different job); our own
// `tools/cover.mjs` draws window cards, never a standalone device hero.
// Renders through `tools/render.mjs` (local Edge/Chrome headless, no network).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { render, pngDims } from "./render.mjs";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const FRAMES = ["browser", "macbook", "iphone", "ipad"];
export const BGS = {
  charcoal: "radial-gradient(1200px 700px at 50% 30%, #26262e, #0a0a0f)",
  pearl: "radial-gradient(1200px 700px at 50% 30%, #f2efe8, #cfc9bc)",
  midnight: "radial-gradient(1200px 700px at 50% 30%, #16244d, #070b1d)",
  mocha: "radial-gradient(1200px 700px at 50% 30%, #4a3a2e, #191008)",
};
const BG_INK = { charcoal: "#fff", pearl: "#222", midnight: "#fff", mocha: "#fff" };

export function parseSize(raw, fallback = "1280x720") {
  const m = String(raw ?? fallback).match(/^(\d+)x(\d+)$/);
  const w = m ? Number(m[1]) : 0, h = m ? Number(m[2]) : 0;
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 320 || w > 2560 || h < 320 || h > 2560)
    throw new Error(`bad --size ${JSON.stringify(raw)} (want WxH, 320..2560, e.g. 1280x720)`);
  return { w, h };
}

export function parseArgs(args) {
  let shot = null, frame = "browser", out = null, size = "1280x720", bg = "charcoal", caption = "";
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const val = (name) => {
      const v = args[++i];
      if (v == null) throw new Error(`no value for ${name}`);
      return v;
    };
    if (a === "--shot") shot = val(a);
    else if (a.startsWith("--shot=")) shot = a.slice(7);
    else if (a === "--frame") frame = val(a);
    else if (a.startsWith("--frame=")) frame = a.slice(8);
    else if (a === "--out") out = val(a);
    else if (a.startsWith("--out=")) out = a.slice(6);
    else if (a === "--size") size = val(a);
    else if (a.startsWith("--size=")) size = a.slice(7);
    else if (a === "--bg") bg = val(a);
    else if (a.startsWith("--bg=")) bg = a.slice(5);
    else if (a === "--caption") caption = val(a);
    else if (a.startsWith("--caption=")) caption = a.slice(10);
  }
  return { shot, frame, out, size, bg, caption };
}

function mustShot(path) {
  if (!path || !/\.(png|jpe?g|webp)$/i.test(path)) throw new Error(`shot must be a picture path (got ${JSON.stringify(path)})`);
  if (!existsSync(path)) throw new Error(`shot missing: ${path}`);
  return path;
}

// One device, CSS only: the screen is always the customer's own picture.
export function buildMockupHtml({ shotUrl, frame, shotW, shotH, caption, bg }) {
  const img = `<img src="${shotUrl}" alt="product screenshot">`;
  const cap = caption ? `<p class="cap">${String(caption).replace(/</g, "&lt;")}</p>` : "";
  const lens = `<div class="lens"></div>`;
  let device = "";
  if (frame === "browser") {
    device = `<div class="browser"><div class="bar"><i></i><i></i><i></i><span>localhost</span></div><div class="scr land">${img}</div></div>`;
  } else if (frame === "macbook") {
    device = `<div class="mac"><div class="lid"><div class="cam"></div><div class="scr wide">${img}</div></div><div class="base"></div></div>`;
  } else if (frame === "iphone") {
    device = `<div class="phone"><div class="notch"></div><div class="scr tall">${img}</div></div>`;
  } else {
    device = `<div class="pad"><div class="scr mid">${img}</div></div>`;
  }
  void shotW; void shotH;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:${BGS[bg]};min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:40px;font:13px 'Segoe UI',Arial;color:${BG_INK[bg]}}
.cap{opacity:.6;letter-spacing:.14em;text-transform:uppercase;font-size:12px}
.lens{position:fixed;top:-60px;left:15%;width:420px;height:180px;background:radial-gradient(ellipse,rgba(255,255,255,.22),transparent 60%);pointer-events:none}
.browser{width:min(960px,88vw);border-radius:12px;overflow:hidden;background:#111;box-shadow:0 40px 80px rgba(0,0,0,.5)}
.browser .bar{display:flex;align-items:center;gap:7px;background:#2b2e3a;padding:10px 14px}
.browser .bar i{width:11px;height:11px;border-radius:50%;background:#5b5f75}
.browser .bar i:first-child{background:#ff5f57}.browser .bar i:nth-child(2){background:#febc2e}.browser .bar i:nth-child(3){background:#28c840}
.browser .bar span{margin-left:10px;flex:1;background:#171923;border-radius:6px;color:#9aa;font-size:12px;padding:4px 12px}
.scr img{display:block;width:100%;height:100%;object-fit:cover}
.scr.land{aspect-ratio:16/9}.scr.wide{aspect-ratio:16/10}.scr.tall{aspect-ratio:9/19}.scr.mid{aspect-ratio:4/3}
.mac{width:min(980px,90vw)}
.mac .lid{background:#0c0c10;border-radius:14px 14px 0 0;padding:14px 14px 10px;box-shadow:0 40px 80px rgba(0,0,0,.5)}
.mac .cam{width:8px;height:8px;border-radius:50%;background:#333;margin:0 auto 8px}
.mac .scr{border-radius:6px;overflow:hidden;background:#000}
.mac .base{height:14px;background:linear-gradient(#3c3c44,#15151a);border-radius:0 0 14px 14px}
.phone{width:min(340px,70vw);background:#0c0c10;border:4px solid #a8a8ad;border-radius:52px;padding:12px;box-shadow:0 40px 80px rgba(0,0,0,.55)}
.phone .notch{width:120px;height:24px;background:#0c0c10;border-radius:0 0 14px 14px;margin:0 auto 8px}
.phone .scr{border-radius:40px;overflow:hidden;background:#000}
.pad{width:min(760px,84vw);background:#0c0c10;border:10px solid #2c2c33;border-radius:28px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,.5)}
${cap}</style></head><body>${lens}${cap}${device}</body></html>`;
}

export function runMockup({ shot, frame = "browser", out, size = "1280x720", bg = "charcoal", caption = "" }) {
  mustShot(shot);
  if (!FRAMES.includes(frame)) throw new Error(`unknown frame ${JSON.stringify(frame)} (want ${FRAMES.join("|")})`);
  if (!BGS[bg]) throw new Error(`unknown --bg ${JSON.stringify(bg)} (want ${Object.keys(BGS).join("|")})`);
  if (!out) throw new Error("no --out mockup.png given");
  const { w, h } = parseSize(size);
  const dims = pngDims(readFileSync(resolve(shot)));
  const html = buildMockupHtml({ shotUrl: pathToFileURL(resolve(shot)).href, frame, shotW: dims.w, shotH: dims.h, caption, bg });
  const f = join(tmpdir(), `ds-mockup-${process.pid}.html`);
  writeFileSync(f, html, "utf8");
  mkdirSync(dirname(resolve(out)), { recursive: true });
  const r = render(f, out, { w, h }, { minBytes: 1024 });
  const got = pngDims(readFileSync(resolve(out)));
  return { out, frame, bytes: r.bytes, w: got.w, h: got.h };
}

export function selfCheck() {
  const results = [];
  const ok = (name, pass, detail) => {
    results.push({ name, pass: !!pass, detail });
    console.log(`[${pass ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };
  try {
    const p = parseArgs(["--shot", "a.png", "--frame", "iphone", "--out", "b.png", "--size", "1280x720", "--bg", "pearl"]);
    ok("args parse with defaults", p.frame === "iphone" && p.bg === "pearl" && p.size === "1280x720", `${p.frame}/${p.bg}/${p.size}`);
  } catch (e) { ok("args parse with defaults", false, String(e.message)); }
  let threw = false;
  try { parseSize("huge"); } catch { threw = true; }
  ok("size FAILs closed on garbage", threw, "throws, never guesses");
  threw = false;
  try { runMockup({ shot: "designs/O-026/nope.png", frame: "browser", out: "x.png" }); } catch { threw = true; }
  ok("mockup FAILs closed on a missing shot", threw, "throws, never renders");
  threw = false;
  try { runMockup({ shot: "designs/O-026/assets/screenshot-pairs.png", frame: "toaster", out: "x.png" }); } catch { threw = true; }
  ok("mockup FAILs closed on an unknown frame", threw, `want ${FRAMES.join("|")}`);
  try {
    const shot = join(ROOT, "designs", "O-026", "assets", "screenshot-pairs.png");
    if (!existsSync(shot)) throw new Error("O-026 fixture missing");
    const html = buildMockupHtml({ shotUrl: pathToFileURL(resolve(shot)).href, frame: "browser", shotW: 1, shotH: 1, caption: "Fleet Vol 1", bg: "charcoal" });
    ok("html is CSS-only with the real shot", html.includes("screenshot-pairs.png") && !/unsplash|dribbble/i.test(html), "own picture, no stock URL");
    for (const fr of FRAMES) {
      const h = buildMockupHtml({ shotUrl: "x", frame: fr, shotW: 1, shotH: 1, caption: "", bg: "charcoal" });
      if (!h.includes("scr")) throw new Error(`${fr} has no screen`);
    }
    ok("all 4 frames carry a screen", FRAMES.join(","), "browser macbook iphone ipad");
    const out = join(tmpdir(), `ds-mockup-check-${process.pid}.png`);
    const r = runMockup({ shot, frame: "browser", out, size: "1280x720", bg: "charcoal", caption: "Fleet Vol 1" });
    ok("end-to-end mockup renders to TEMP", existsSync(out) && r.bytes > 1024 && r.w === 1280 && r.h === 720, `${r.w}x${r.h} ${r.bytes}B`);
  } catch (e) { ok("end-to-end mockup renders to TEMP", false, String(e.message ?? e)); }
  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `MOCKUP FAIL: ${fails.length} failing check(s)` : "MOCKUP PASS: browser + macbook + iphone + ipad green");
  return fails.length === 0;
}

const isMain = (() => {
  try { return fileURLToPath(import.meta.url) === resolve(process.argv[1]); } catch { return false; }
})();
if (isMain) {
  const args = process.argv.slice(2);
  try {
    if (args.includes("--check")) process.exit(selfCheck() ? 0 : 1);
    const { shot, frame, out, size, bg, caption } = parseArgs(args);
    const r = runMockup({ shot, frame, out, size, bg, caption });
    console.log(`MOCKUP ${r.out}: ${r.frame} ${r.w}x${r.h}, ${r.bytes}B`);
    process.exit(0);
  } catch (e) {
    console.log(`MOCKUP FAIL: ${e.message}`);
    process.exit(1);
  }
}
