// tools/render.mjs: brief HTML -> PNG via the Edge/Chromium every Windows PC has.
// Port of factory engine/render_html.py to node (no Python needed here):
// find msedge.exe (or Chrome/Chromium), --headless --screenshot, fail closed
// when no browser is found, the render fails, or the image is suspicious.
//
// Launch note (verified 2026-10-02 on this PC): a browser spawned directly
// from node exits 0 and writes nothing while a browser instance is already
// running (Start-Process from a shell renders fine in the same minute). So
// this module launches Edge through a temp .ps1 (Start-Process -Wait) run by
// powershell.exe, which node can spawn. No Python, no new dependency.
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, resolve, sep } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const FIXED_BROWSERS = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];
const PATH_NAMES = ["msedge.exe", "chrome.exe", "chromium.exe"];

const POWERSHELL = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";

export function findBrowser() {
  const env = process.env.BROWSER_BIN;
  if (env && existsSync(env)) return env;
  for (const p of FIXED_BROWSERS) if (existsSync(p)) return p;
  const dirs = String(process.env.PATH ?? "").split(";");
  for (const d of dirs) {
    for (const n of PATH_NAMES) {
      const hit = d ? `${d.replace(/[\\/]+$/, "")}${sep}${n}` : null;
      if (hit && existsSync(hit)) return hit;
    }
  }
  return null;
}

export function parseSize(text) {
  const m = String(text ?? "").toLowerCase().match(/^(\d+)x(\d+)$/);
  if (!m) throw new Error("size must be WIDTHxHEIGHT, e.g. 1280x720");
  const w = Number(m[1]);
  const h = Number(m[2]);
  if (!(w >= 16 && w <= 8192 && h >= 16 && h <= 8192)) {
    throw new Error("size must be WIDTHxHEIGHT between 16 and 8192");
  }
  return { w, h };
}

// PNG: 8-byte magic, then IHDR with width/height as big-endian uint32 at 16/20.
export function pngDims(buf) {
  const magic = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!Buffer.isBuffer(buf) || buf.length < 24 || !buf.subarray(0, 8).equals(magic)) {
    throw new Error("not a PNG file");
  }
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

// DS-23 S01 one-to-many size matrix from a single brief (idea-only, no deps).
// Consumer slots measured here: 1280x720 cover, 1080x1080 square, 1200x628
// social. tools/audit.mjs re-passes title legibility + fits per size.
export const SIZE_MATRIX = [
  { w: 1280, h: 720, name: "landscape" },
  { w: 1080, h: 1080, name: "square" },
  { w: 1200, h: 628, name: "social" },
];

// out.png + {w,h} -> out-1280x720.png (keeps ext, same folder).
export function outForSize(outPath, size) {
  const i = String(outPath).lastIndexOf(".");
  const stem = i >= 0 ? String(outPath).slice(0, i) : String(outPath);
  const ext = i >= 0 ? String(outPath).slice(i) : ".png";
  return `${stem}-${size.w}x${size.h}${ext}`;
}

const psq = (s) => `'${String(s).replace(/'/g, "''")}'`;

export function render(htmlPath, outPath, size = { w: 1280, h: 720 }, { minBytes = 4096 } = {}) {
  const browser = findBrowser();
  if (!browser) {
    throw new Error("no Edge, Chrome or Chromium found: set BROWSER_BIN (never fake the output)");
  }
  if (!existsSync(POWERSHELL)) {
    throw new Error("powershell.exe missing: cannot launch the browser on this PC");
  }
  const html = resolve(htmlPath);
  if (!existsSync(html)) throw new Error(`page missing: ${htmlPath}`);
  const out = resolve(outPath);
  mkdirSync(dirname(out), { recursive: true });
  const profile = mkdtempSync(`${tmpdir()}${sep}ds-render-`);
  const url = pathToFileURL(html).href;
  const args = [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    `--user-data-dir=${profile}`,
    `--window-size=${size.w},${size.h}`,
    "--force-device-scale-factor=1",
    "--virtual-time-budget=5000",
    `--screenshot=${out}`,
    url,
  ];
  const script =
    `$exe = ${psq(browser)}\n` +
    `$args = @(${args.map(psq).join(", ")})\n` +
    `$proc = Start-Process -FilePath $exe -ArgumentList $args -NoNewWindow -Wait -PassThru\n` +
    `exit $proc.ExitCode\n`;
  const ps1 = `${profile}${sep}launch.ps1`;
  writeFileSync(ps1, script, "utf8");
  let status = null;
  try {
    const done = spawnSync(POWERSHELL, ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps1], {
      timeout: 120000,
      encoding: "utf8",
    });
    if (done.error) throw new Error(`browser launch failed: ${done.error.message}`);
    status = done.status;
  } finally {
    try {
      rmSync(ps1);
    } catch {
      /* best effort */
    }
  }
  if (!existsSync(out)) {
    throw new Error(`the browser wrote no image (exit ${status}): ${browser} ${url}`);
  }
  const buf = readFileSync(out);
  const dims = pngDims(buf);
  if (dims.w !== size.w || dims.h !== size.h) {
    throw new Error(`render size ${dims.w}x${dims.h} != requested ${size.w}x${size.h}`);
  }
  if (buf.length < minBytes) {
    throw new Error(`render suspiciously small (${buf.length}B): the page likely did not render`);
  }
  return { out, w: dims.w, h: dims.h, bytes: buf.length };
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
  if (args.length < 2 || args.includes("-h") || args.includes("--help")) {
    console.log("usage: node tools/render.mjs <page.html> <out.png> [--size 1280x720] [--sizes]");
    process.exit(args.length < 2 ? 2 : 0);
  }
  // S01 per-size reflow: --sizes renders the full SIZE_MATRIX beside out.png.
  if (args.includes("--sizes")) {
    let fails = 0;
    for (const size of SIZE_MATRIX) {
      try {
        const r = render(args[0], outForSize(args[1], size), size);
        console.log(`RENDER OK ${r.out} ${r.w}x${r.h} ${r.bytes}B (${size.name})`);
      } catch (e) {
        console.log(`RENDER FAIL ${args[0]} ${size.w}x${size.h}: ${e.message}`);
        fails += 1;
      }
    }
    if (fails) process.exit(1);
    process.exit(0);
  }
  let size = { w: 1280, h: 720 };
  const si = args.indexOf("--size");
  if (si >= 0) {
    try {
      size = parseSize(args[si + 1]);
    } catch (e) {
      console.log(`RENDER FAIL: ${e.message}`);
      process.exit(1);
    }
  }
  try {
    const r = render(args[0], args[1], size);
    console.log(`RENDER OK ${r.out} ${r.w}x${r.h} ${r.bytes}B`);
  } catch (e) {
    console.log(`RENDER FAIL ${args[0]}: ${e.message}`);
    process.exit(1);
  }
}
