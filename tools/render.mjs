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

// DS-21 r2 screenshot-refine + measured preview (pattern-only, no vendor copy):
// openui Apache-2.0 Prompt.tsx streamResponse create-vs-refine idea +
// llamacoder MIT code-runner-react.tsx bundle()/PREVIEW_WATCHDOG_MS idea +
// screenshot-to-code MIT App.tsx doCreate/doUpdate generationType idea.
// Wrapper <=120 lines; preview logs bundleMs for the judge gate.
export const PREVIEW_WATCHDOG_MS = 60000;
export const FIX_RE = /<!--FIX\s*\(\d+\)\s*:\s*(.+?)-->/;
export function parsePreviewMarkdown(md) {
  const m = String(md ?? "").match(/```html\s*([\s\S]*?)(?:```|$)/i);
  return (m ? m[1] : String(md ?? "")).trim();
}
// DS-30 S08 chunk-to-preview: append + throttled parse, pop-last-line guard
// so half-written tags never flash (openui throttledMD pattern; FIX_RE +
// parse + streamPreview + buildRefinePrompt <=45 lines).
export function streamPreview(chunks) {
  let live = "";
  const states = [];
  for (const part of chunks ?? []) {
    live += String(part ?? "");
    const lines = live.split("\n");
    const head = lines.length > 1 ? lines.slice(0, -1).join("\n") : live;
    states.push({ pureHTML: parsePreviewMarkdown(head), rendering: true });
  }
  if (states.length) states[states.length - 1].rendering = false;
  return states;
}
// DS-30 S08 annotate-refine: FIX-comment -> refine prompt (openai.ts
// createOrRefine pattern: FIX wins, else query, else fail-closed).
export function buildRefinePrompt(html, query) {
  const fix = String(html ?? "").match(FIX_RE);
  if (fix) return `Address the FIX comments: ${fix[1].trim()}\n${String(html)}`;
  const q = String(query ?? "").trim();
  if (q) return `${q}\n${String(html ?? "")}`;
  throw new Error("refine needs a FIX comment or query (never silent)");
}
// DS-21 measured preview: pure bundle timing + data-preview-* badge
// (llamacoder bundleMs pattern, no esbuild here).
export function measurePreview(html) {
  const t0 = Date.now();
  const body = String(html ?? "");
  const bytes = Buffer.byteLength(body, "utf8");
  if (!body.trim()) throw new Error("preview needs HTML (never silent)");
  const pure = parsePreviewMarkdown(body) || body;
  const badge = ` data-preview-bytes="${bytes}" data-preview-bundle-ms="__MS__"`;
  const srcdoc = pure.includes("<body")
    ? pure.replace(/<body([^>]*)>/i, `<body$1${badge}>`)
    : `<div${badge}>${pure}</div>`;
  const bundleMs = Math.max(0, Date.now() - t0);
  const out = srcdoc.replace("__MS__", String(bundleMs));
  console.log(`PREVIEW bundleMs=${bundleMs} bytes=${bytes}`);
  return { srcdoc: out, bundleMs, bytes, watchdogMs: PREVIEW_WATCHDOG_MS };
}
// DS-21 screenshot-refine wrapper: create vs update split, reuses render()
// downstream (screenshot-to-code generationType pattern).
export function refineHtml(html, instruction, { generationType } = {}) {
  const hasHtml = String(html ?? "").trim().length > 0;
  const type = generationType ?? (hasHtml ? "update" : "create");
  if (type !== "create" && type !== "update") throw new Error(`generationType must be create|update, got ${JSON.stringify(generationType)}`);
  if (type === "create") {
    if (!String(instruction ?? "").trim()) throw new Error("create needs an instruction (never silent)");
    return { generationType: "create", prompt: `${String(instruction).trim()}\n${String(html ?? "")}`, html: String(html ?? "") };
  }
  return { generationType: "update", prompt: buildRefinePrompt(html, instruction), html: String(html ?? "") };
}
// DS-65 FREE-01 :free text lane for brief/copy/layout drafts (idea-only from
// openrouter :free docs, 0 lines copied: proprietary docs). Text-only: model
// slug must end in :free, key from OPENROUTER_API_KEY env only (never in repo,
// never printed), drafts only never final pixels. No image bytes here.
export const FREE_TERMS_NOTE = "per-model Terms: free-lane output is a draft only, never final pixels; check the serving model Terms before ship";
export function freeKey() {
  const k = String(process.env.OPENROUTER_API_KEY ?? "").trim();
  if (!k) throw new Error("OPENROUTER_API_KEY missing from env (free lane stays off, never commit a key)");
  return k;
}
export function buildFreePrompt({ model, prompt } = {}) {
  const m = String(model ?? "").trim();
  if (!/:free$/.test(m)) throw new Error("free prompt needs a model slug with :free suffix (only listed models support it)");
  const p = String(prompt ?? "").trim();
  if (!p) throw new Error("free prompt needs prompt text (never silent)");
  return { url: "https://openrouter.ai/api/v1/chat/completions", headers: { Authorization: "Bearer <env>", "Content-Type": "application/json" }, body: { model: m, messages: [{ role: "user", content: p }] }, terms: FREE_TERMS_NOTE, draftOnly: true };
}
export function freeDraftReceipt(base, { model } = {}) {
  const m = String(model ?? "").trim();
  if (!/:free$/.test(m)) throw new Error("free receipt needs the serving :free model (pin what served, never silent)");
  return { ...base, model: m, draftOnly: true, terms: FREE_TERMS_NOTE };
}
// DS-21+DS-30 self-check: good preview/stream/refine PASS, bad fixtures FAIL
// as expected (F2P proven inside a green suite, like audit --sizes/--rtl).
export function renderSelfCheck() {
  const results = [];
  const t = (name, ok, detail) => {
    results.push({ name, pass: !!ok, detail: String(detail ?? "") });
    console.log(`[${ok ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };
  try {
    const m = measurePreview("<html><body><h1>Hi</h1></body></html>");
    t("preview measures bundleMs + badge", Number.isFinite(m.bundleMs) && m.srcdoc.includes("data-preview-bundle-ms="), `bundleMs=${m.bundleMs} bytes=${m.bytes}`);
  } catch (e) { t("preview measures bundleMs + badge", false, String(e.message || e)); }
  try { measurePreview("   "); t("preview empty fixture FAILs closed", false, "no throw?"); }
  catch (e) { t("preview empty fixture FAILs closed", /needs HTML/.test(e.message), e.message); }
  try {
    const r = refineHtml("<!--FIX (1): darker title--><h1>Hi</h1>", "");
    t("refine FIX-comment fires update prompt", r.generationType === "update" && r.prompt.includes("Address the FIX comments"), r.prompt.split("\n")[0]);
  } catch (e) { t("refine FIX-comment fires update prompt", false, String(e.message || e)); }
  try { refineHtml("<h1>Hi</h1>", "   "); t("refine query-less fixture FAILs closed", false, "no throw?"); }
  catch (e) { t("refine query-less fixture FAILs closed", /FIX comment or query/.test(e.message), e.message); }
  {
    const chunks = ["```html\n<h1>Hi", "\n<p>Sub</p>", "\n</h1>\n```"];
    const states = streamPreview(chunks);
    const prog = states.length === 3 && states[2].pureHTML.includes("<p>Sub</p>") && states[2].rendering === false;
    t("stream 3-chunk progressive preview", prog, states.map((s) => s.pureHTML.length).join(">"));
    const short = streamPreview(["```html\n<h1>Hi\n```"]);
    t("stream 1-chunk fixture FAILs 3-progress gate", short.length !== 3, `${short.length} state(s), want 3`);
  }
  {
    const c = refineHtml("", "make it bolder");
    t("create path seeds from instruction", c.generationType === "create", c.prompt.split("\n")[0].slice(0, 40));
  }
  // DS-65 FREE-01 gates: :free-suffix shape + env-only key + draft receipt.
  try {
    const r = buildFreePrompt({ model: "meta-llama/llama-3.2-3b-instruct:free", prompt: "draft hero copy" });
    t("free prompt builds :free shape (draft-only)", r.body.model.endsWith(":free") && r.draftOnly === true && /per-model Terms/.test(r.terms), r.body.model);
  } catch (e) { t("free prompt builds :free shape (draft-only)", false, String(e.message || e)); }
  try { buildFreePrompt({ model: "plain-model", prompt: "x" }); t("free non-:free fixture FAILs closed", false, "no throw?"); }
  catch (e) { t("free non-:free fixture FAILs closed", /:free suffix/.test(e.message), e.message); }
  try { buildFreePrompt({ model: "m:free", prompt: "   " }); t("free empty-prompt fixture FAILs closed", false, "no throw?"); }
  catch (e) { t("free empty-prompt fixture FAILs closed", /needs prompt text/.test(e.message), e.message); }
  {
    const saved = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    try { freeKey(); t("free missing-key fixture FAILs closed", false, "no throw?"); }
    catch (e) { t("free missing-key fixture FAILs closed", /missing from env/.test(e.message), "env-only, never committed"); }
    if (saved != null) process.env.OPENROUTER_API_KEY = saved;
  }
  try {
    const rc = freeDraftReceipt({ url: "https://x.local/h", date: "2026-10-03", rev: "abc1234" }, { model: "meta-llama/llama-3.2-3b-instruct:free" });
    t("free receipt pins serving :free model (draft-only)", rc.model.endsWith(":free") && rc.draftOnly === true, `${rc.model} draftOnly`);
  } catch (e) { t("free receipt pins serving :free model (draft-only)", false, String(e.message || e)); }
  const pass = results.every((r) => r.pass);
  console.log(pass ? "RENDER PASS: refine + measured preview + 3-chunk stream green" : `RENDER FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
  return { pass, results };
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

// PDF through the same Edge launch: real text layer (Edge prints text as text), page size and margins from the page's own @page.
export function renderPdf(htmlPath, outPath) {
  const browser = findBrowser();
  if (!browser) throw new Error("no Edge, Chrome or Chromium found: set BROWSER_BIN (never fake the output)");
  if (!existsSync(POWERSHELL)) throw new Error("powershell.exe missing: cannot launch the browser on this PC");
  const html = resolve(htmlPath);
  if (!existsSync(html)) throw new Error(`page missing: ${htmlPath}`);
  const out = resolve(outPath);
  mkdirSync(dirname(out), { recursive: true });
  try { rmSync(out); } catch { /* no old file */ }
  const profile = mkdtempSync(`${tmpdir()}${sep}ds-pdf-`);
  const args = ["--headless", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-extensions", `--user-data-dir=${profile}`, "--no-pdf-header-footer", "--virtual-time-budget=5000", `--print-to-pdf=${out}`, pathToFileURL(html).href];
  const script = `$exe = ${psq(browser)}
$args = @(${args.map(psq).join(", ")})
$proc = Start-Process -FilePath $exe -ArgumentList $args -NoNewWindow -Wait -PassThru
exit $proc.ExitCode
`;
  const ps1 = `${profile}${sep}launch.ps1`;
  writeFileSync(ps1, script, "utf8");
  try {
    const done = spawnSync(POWERSHELL, ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps1], { timeout: 120000, encoding: "utf8" });
    if (done.error) throw new Error(`browser launch failed: ${done.error.message}`);
  } finally {
    try { rmSync(ps1); } catch { /* best effort */ }
  }
  if (!existsSync(out)) throw new Error(`the browser wrote no PDF: ${browser} ${html}`);
  const buf = readFileSync(out);
  if (buf.length < 1500 || buf.subarray(0, 5).toString("latin1") !== "%PDF-") throw new Error(`not a PDF or suspiciously small (${buf.length}B)`);
  return { out, bytes: buf.length };
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
    const { pass } = renderSelfCheck();
    if (!pass) process.exitCode = 1;
    process.exit(process.exitCode ?? 0);
  }
  if (args.includes("--pdf") && args.length >= 3) {
    const [src, dst] = args.filter((x) => x !== "--pdf");
    try { const r = renderPdf(src, dst); console.log(`PDF OK ${r.out} ${r.bytes}B`); } catch (e) { console.log(`PDF FAIL ${src}: ${e.message}`); process.exit(1); }
    process.exit(0);
  }
  if (args.length < 2 || args.includes("-h") || args.includes("--help")) {
    console.log("usage: node tools/render.mjs <page.html> <out.png> [--size 1280x720] [--sizes] | node tools/render.mjs --pdf <page.html> <out.pdf> | node tools/render.mjs --check");
    process.exit(args.length < 2 ? 2 : 0);
  }
  // DS-65 FREE-01 helper: offline draft-shape print (no network, no key read,
  // drafts only never final pixels). Usage: --free-prompt <model:free> <text>.
  if (args.includes("--free-prompt")) {
    const i = args.indexOf("--free-prompt");
    try {
      const r = buildFreePrompt({ model: args[i + 1], prompt: args.slice(i + 2).join(" ") });
      console.log(`FREE-PROMPT DRAFT model=${r.body.model} ${r.terms}`);
      console.log(r.body.messages[0].content.slice(0, 160));
    } catch (e) {
      console.log(`FREE-PROMPT FAIL: ${e.message}`);
      process.exit(1);
    }
    process.exit(0);
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
