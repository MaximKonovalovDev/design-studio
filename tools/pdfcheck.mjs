// tools/pdfcheck.mjs: PDF text-layer gate for CV PDFs (NEED-03, order O-007).
//
// Reads a PDF's real text layer with pdfjs-dist 6.4.299 (Apache-2.0, Mozilla;
// installed inside this repo via `npm i pdfjs-dist@6.4.299`, legacy Node
// build, no worker, no network, no native deps) and checks page count, real
// text (chars, Hebrew vs Latin letters), raster images (ATS-safe means text
// must be real, not pixels) and optional ordered words (Hebrew section order).
// Replaces the career maker's by-hand PyMuPDF read (designs/O-007/pdf-check.txt).
//
//   node tools/pdfcheck.mjs <pdf...> [--expect-pages N] [--expect w1,w2] [--json out.json]
//   node tools/pdfcheck.mjs --check   (unit gates + live read of the O-007 PDFs)
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// pdfjs-dist legacy build: the Node-safe entry (the non-legacy build prints
// "Please use the `legacy` build in Node.js environments"). Pinned 6.4.299,
// Apache-2.0. Loaded lazily so `--help`-style paths never pay the import.
let _pdfjs = null;
async function pdfjs() {
  if (!_pdfjs) _pdfjs = await import("../node_modules/pdfjs-dist/legacy/build/pdf.mjs");
  return _pdfjs;
}
export function pdfjsVersion() {
  try {
    return require("../node_modules/pdfjs-dist/package.json").version;
  } catch {
    return "unknown";
  }
}

const HEBREW_RE = /[\u0590-\u05FF]/g;
const LATIN_RE = /[A-Za-z]/g;

// Count Hebrew vs Latin letters in a string (placeholders like [..] excluded
// on purpose: they are Latin brackets but not real copy; the gate counts
// letters only, so brackets never inflate either side).
export function countScripts(text) {
  const s = String(text ?? "");
  return {
    chars: s.length,
    hebrew: (s.match(HEBREW_RE) ?? []).length,
    latin: (s.match(LATIN_RE) ?? []).length,
  };
}

// Ordered-words gate: every word must occur in the full text, in order.
// Returns { pass, missing } where missing names the first word out of order.
export function checkOrder(fullText, words) {
  const list = (Array.isArray(words) ? words : String(words ?? "").split(","))
    .map((w) => String(w ?? "").trim())
    .filter(Boolean);
  if (list.length === 0) return { pass: true, missing: null, words: [] };
  let from = 0;
  for (const w of list) {
    const at = String(fullText).indexOf(w, from);
    if (at < 0) return { pass: false, missing: w, words: list };
    from = at + w.length;
  }
  return { pass: true, missing: null, words: list };
}

// One logical line per painted row: group text items by rounded y, sort each
// row by x (ltr) — pdfjs items already arrive in paint order with logical
// (not visual) Hebrew, so joining with spaces keeps RTL words readable.
export function linesFromItems(items) {
  const rows = new Map();
  for (const it of items ?? []) {
    const tx = it?.transform ?? [0, 0, 0, 0, 0, 0];
    const key = `${Math.round(tx[5] / 2) * 2}`;
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push({ x: tx[4], str: String(it?.str ?? "") });
  }
  return [...rows.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([, cells]) => cells.sort((a, b) => a.x - b.x).map((c) => c.str).join(" ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export async function pdfInfo(pdfPath) {
  const lib = await pdfjs();
  const raw = readFileSync(pdfPath);
  const doc = await lib.getDocument({ data: new Uint8Array(raw) }).promise;
  const pages = doc.numPages;
  const sizes = [];
  let items = [];
  let images = 0;
  const fonts = new Set();
  for (let n = 1; n <= pages; n++) {
    const page = await doc.getPage(n);
    const vp = page.getViewport({ scale: 1 });
    sizes.push({ w: Math.round(vp.width * 100) / 100, h: Math.round(vp.height * 100) / 100 });
    const tc = await page.getTextContent();
    for (const it of tc.items ?? []) {
      items.push(it);
      if (it?.fontName) fonts.add(String(it.fontName));
    }
    const ops = await page.getOperatorList();
    for (const fn of ops.fnArray ?? []) {
      if (fn === lib.OPS.paintImageXObject || fn === lib.OPS.paintInlineImageXObject || fn === lib.OPS.paintImageMaskXObject) images++;
    }
  }
  const lines = linesFromItems(items);
  const fullText = lines.join("\n");
  const counts = countScripts(fullText);
  return {
    file: basename(String(pdfPath)),
    pages,
    sizes,
    items: items.length,
    chars: counts.chars,
    hebrew: counts.hebrew,
    latin: counts.latin,
    images,
    fonts: [...fonts].sort(),
    lines: lines.length,
    sample: lines.find((l) => l.trim().length > 8) ?? lines[0] ?? "",
    fullText,
  };
}

// Gates for one PDF: page count, real text layer, optional word order.
// images > 0 is a WARN (a logo is fine) — the FAIL is an empty text layer.
export function gateInfo(info, { expectPages = null, expectWords = [] } = {}) {
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });
  if (expectPages == null) {
    ok("has pages", info.pages >= 1, `${info.pages} page(s)`);
  } else {
    ok(`page count = ${expectPages}`, info.pages === expectPages, `${info.pages} page(s)`);
  }
  const size = info.sizes[0];
  if (size) {
    const a4 = Math.abs(size.w - 595.28) < 2 && Math.abs(size.h - 841.89) < 2;
    ok("A4 page size", a4, `${size.w}x${size.h}pt`);
  }
  ok("real text layer (chars >= 50)", info.chars >= 50, `${info.chars} chars, ${info.items} items, ${info.fonts.length} font(s)`);
  ok("no raster images (ATS-safe)", info.images === 0, info.images === 0 ? "0 image ops" : `${info.images} image op(s) — WARN only`);
  const order = checkOrder(info.fullText, expectWords);
  ok(
    "words in order",
    order.pass,
    order.words.length === 0 ? "no --expect given" : order.pass ? order.words.join(" < ") : `missing/out of order: ${order.missing}`,
  );
  // An image-heavy PDF still passes when the text layer is real; a scanned
  // PDF (no text) fails on the text gate above, never silently.
  const fail = results.filter((r) => !r.pass && r.name !== "no raster images (ATS-safe)");
  return { pass: fail.length === 0, results, info, warnImages: info.images > 0 };
}

export function parseArgs(args) {
  const files = [];
  let expectPages = null;
  let expectWords = [];
  let jsonOut = null;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--expect-pages" && args[i + 1] != null) {
      expectPages = Number(args[++i]);
    } else if (a.startsWith("--expect-pages=")) {
      expectPages = Number(a.slice("--expect-pages=".length));
    } else if (a === "--expect" && args[i + 1] != null) {
      expectWords = String(args[++i]).split(",").map((w) => w.trim()).filter(Boolean);
    } else if (a.startsWith("--expect=")) {
      expectWords = a.slice("--expect=".length).split(",").map((w) => w.trim()).filter(Boolean);
    } else if (a === "--json" && args[i + 1] != null) {
      jsonOut = args[++i];
    } else if (a.startsWith("--json=")) {
      jsonOut = a.slice("--json=".length);
    } else if (!a.startsWith("-")) {
      files.push(a);
    }
  }
  return { files, expectPages, expectWords, jsonOut };
}

// --check self-test: pure-function gates (always) + live read of the O-007
// CV PDFs (committed fixtures: he = 1 A4 page, Hebrew, no images; en = 1 A4
// page, Latin, no Hebrew). Thresholds sit far below the real counts
// (he ~875 Hebrew letters, en ~941 Latin) so the check is stable, not tight.
export async function selfCheck() {
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });
  ok("pdfjs-dist pinned 6.x Apache-2.0", /^6\./.test(pdfjsVersion()), `pdfjs-dist ${pdfjsVersion()}`);
  const c = countScripts("שלום Hello 123");
  ok("countScripts splits Hebrew/Latin", c.hebrew === 4 && c.latin === 5, `hebrew=${c.hebrew} latin=${c.latin}`);
  ok("checkOrder accepts in-order words", checkOrder("א ב ג ד", ["א", "ג"]).pass, "א < ג");
  ok("checkOrder rejects out-of-order words", !checkOrder("א ב ג ד", ["ג", "א"]).pass, "ג then א fails");
  const he = join(ROOT, "designs", "O-007", "cv-he.pdf");
  const en = join(ROOT, "designs", "O-007", "cv-en.pdf");
  ok("O-007 fixtures on disk", existsSync(he) && existsSync(en), "cv-he.pdf + cv-en.pdf");
  if (existsSync(he) && existsSync(en)) {
    const heInfo = await pdfInfo(he);
    ok("cv-he.pdf: 1 page", heInfo.pages === 1, `${heInfo.pages} page(s)`);
    ok("cv-he.pdf: Hebrew text layer", heInfo.hebrew >= 500 && heInfo.chars >= 500, `hebrew=${heInfo.hebrew} chars=${heInfo.chars}`);
    ok("cv-he.pdf: no raster images", heInfo.images === 0, `${heInfo.images} image op(s)`);
    const enInfo = await pdfInfo(en);
    ok("cv-en.pdf: 1 page", enInfo.pages === 1, `${enInfo.pages} page(s)`);
    ok("cv-en.pdf: Latin text, no Hebrew", enInfo.latin >= 500 && enInfo.hebrew === 0, `latin=${enInfo.latin} hebrew=${enInfo.hebrew}`);
    ok("cv-en.pdf: no raster images", enInfo.images === 0, `${enInfo.images} image op(s)`);
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
    selfCheck().then(({ pass, results }) => {
      for (const r of results) console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}: ${r.detail}`);
      console.log(pass ? `PDFCHECK PASS: pdfjs-dist ${pdfjsVersion()}, O-007 PDFs read with real text` : `PDFCHECK FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
      if (!pass) process.exitCode = 1;
    }).catch((e) => {
      console.log(`PDFCHECK FAIL: ${String(e?.message ?? e)}`);
      process.exitCode = 1;
    });
  } else {
    const { files, expectPages, expectWords, jsonOut } = parseArgs(args);
    if (files.length === 0) {
      console.log("usage: node tools/pdfcheck.mjs <pdf...> [--expect-pages N] [--expect w1,w2] [--json out.json]");
      process.exitCode = 2;
    } else {
      (async () => {
        let allPass = true;
        const infos = [];
        for (const f of files) {
          if (!existsSync(f)) {
            console.log(`[FAIL] ${f}: file missing`);
            allPass = false;
            continue;
          }
          const info = await pdfInfo(f);
          infos.push(info);
          const { pass, results, warnImages } = gateInfo(info, { expectPages, expectWords });
          if (!pass) allPass = false;
          for (const r of results) {
            const tag = r.pass ? "PASS" : (r.name.startsWith("no raster") ? "WARN" : "FAIL");
            if (tag === "FAIL") allPass = false;
            console.log(`[${tag}] ${info.file} — ${r.name}: ${r.detail}`);
          }
          console.log(`--- ${info.file}: pages=${info.pages} chars=${info.chars} hebrew=${info.hebrew} latin=${info.latin} images=${info.images} sample=${JSON.stringify(info.sample.slice(0, 60))}`);
          if (warnImages) console.log(`[WARN] ${info.file}: raster image(s) present alongside real text`);
        }
        if (jsonOut) {
          mkdirSync(dirname(resolve(jsonOut)), { recursive: true });
          writeFileSync(resolve(jsonOut), `${JSON.stringify({ tool: "pdfcheck", pdfjs: pdfjsVersion(), date: new Date().toISOString().slice(0, 10), expectPages, expectWords, files: infos.map(({ fullText, ...rest }) => rest) }, null, 2)}\n`, "utf8");
          console.log(`wrote ${jsonOut}`);
        }
        console.log(allPass ? "PDFCHECK PASS: every PDF carries a real text layer" : "PDFCHECK FAIL: see FAIL lines above");
        if (!allPass) process.exitCode = 1;
      })().catch((e) => {
        console.log(`PDFCHECK FAIL: ${String(e?.message ?? e)}`);
        process.exitCode = 1;
      });
    }
  }
}
