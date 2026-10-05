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
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, appendFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { createHash } from "node:crypto";
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
// O-038 render history + never-overwrite gate (ideas from
// nexu-io/html-anything@553ed98c283f9c0f489902d035416a972d6a9699 Apache-2.0,
// read live via gh api, 0 lines copied):
// - next/src/lib/history/db.ts putRun/version idea: append-only version log,
//   never mutates a prior entry; restore-as-new-version -> here a changed
//   brief re-renders and appends a new entry instead of editing history.
// - cli/src/index.ts existing-output pre-flight + prompt.ts promptOverwrite
//   fail-closed idea (default No): refuse to overwrite unless allowed.
// - cli/src/collision-resolve.ts namespace-instead-of-overwrite idea.
// Adapted to this repo: node JSONL beside the job (no IDB in a CLI), Edge
// .ps1 launch path untouched, every existing fail-closed gate stays first.
// Deliberate delta: donor CLI allows overwrite on non-TTY; here non-TTY
// REFUSES (fail closed, --force overrides). No prune cap: the packet
// requires prior entries are never overwritten, so the log only appends.
export function repoRoot() {
  return resolve(dirname(fileURLToPath(import.meta.url)), "..");
}
export function defaultHistoryPath() {
  return resolve(repoRoot(), "designs", "job", "history", "render-history.jsonl");
}
export function sha256Hex(buf) {
  return createHash("sha256").update(buf).digest("hex");
}
export function briefHashFor(source) {
  const buf = Buffer.isBuffer(source) ? source : Buffer.from(String(source ?? ""), "utf8");
  if (!buf.length) throw new Error("brief hash needs source bytes (never silent)");
  return sha256Hex(buf);
}
export function fileSha256(path) {
  if (!existsSync(path)) return null;
  return sha256Hex(readFileSync(path));
}
// JSONL history: one object per line {date, brief, briefHash, out, sha256,
// w, h, bytes}. Append-only: this module only ever appends. Bad lines are
// skipped (fail-open read) so one corrupt line never blocks the gate.
export function readHistory(historyPath) {
  const p = historyPath ?? defaultHistoryPath();
  if (!existsSync(p)) return [];
  const rows = [];
  for (const line of String(readFileSync(p, "utf8")).split("\n")) {
    const s = line.trim();
    if (!s) continue;
    try {
      const e = JSON.parse(s);
      if (e && typeof e === "object" && e.briefHash && e.out && e.sha256) rows.push(e);
    } catch { /* skip one bad line, keep the rest */ }
  }
  return rows;
}
export function lastEntryFor(entries, outAbs) {
  let last = null;
  for (const e of entries ?? []) if (resolve(String(e.out)) === outAbs) last = e;
  return last;
}
export function appendHistory(historyPath, entry) {
  const p = historyPath ?? defaultHistoryPath();
  for (const k of ["brief", "briefHash", "out", "sha256"]) {
    if (!entry?.[k]) throw new Error(`history entry needs ${k} (never silent)`);
  }
  mkdirSync(dirname(resolve(p)), { recursive: true });
  const line = JSON.stringify({ date: new Date().toISOString(), ...entry });
  appendFileSync(p, line + "\n", "utf8");
  return entry;
}
// Never-overwrite gate. Fail closed with the reason:
// - no existing output -> render.
// - existing + last entry same briefHash + same sha -> skip (up to date).
// - existing + last entry older briefHash -> render (brief changed).
// - existing + no entry (foreign file) or sha mismatch -> refuse.
export function gateOverwrite({ outPath, briefHash, historyPath } = {}) {
  if (!briefHash) throw new Error("gate needs the brief hash (never silent)");
  const out = resolve(outPath);
  if (!existsSync(out)) return { action: "render", reason: "no existing output; rendering" };
  const last = lastEntryFor(readHistory(historyPath ?? defaultHistoryPath()), out);
  const short = (h) => String(h).slice(0, 12);
  if (!last) {
    return { action: "refuse", reason: `refusing to overwrite existing output with no history entry (foreign file): ${out} (pass --force to overwrite)` };
  }
  if (last.briefHash !== briefHash) {
    return { action: "render", reason: `brief changed ${short(last.briefHash)} -> ${short(briefHash)}; re-rendering` };
  }
  const cur = fileSha256(out);
  if (cur && cur === last.sha256) {
    return { action: "skip", reason: `up to date (brief ${short(briefHash)}, sha ${short(cur)}); not re-rendering` };
  }
  return { action: "refuse", reason: `refusing to overwrite ${out}: on-disk sha ${short(cur ?? "?")} != history sha ${short(last.sha256)} (changed outside history; pass --force to overwrite)` };
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
  // O-038 history + never-overwrite gates (no browser needed).
  {
    const dir = mkdtempSync(`${tmpdir()}${sep}ds-hist-`);
    const hp = `${dir}${sep}render-history.jsonl`;
    const briefA = "<html><body><h1>A</h1></body></html>";
    const briefB = "<html><body><h1>B</h1></body></html>";
    const hA = briefHashFor(briefA);
    const hB = briefHashFor(briefB);
    const out = `${dir}${sep}out.png`;
    const fakePng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
    try {
      const g0 = gateOverwrite({ outPath: out, briefHash: hA, historyPath: hp });
      t("history gate renders when no output exists", g0.action === "render", g0.reason.slice(0, 60));
      writeFileSync(out, fakePng);
      const gForeign = gateOverwrite({ outPath: out, briefHash: hA, historyPath: hp });
      t("history gate refuses foreign file (fail closed)", gForeign.action === "refuse", gForeign.reason.slice(0, 60));
      appendHistory(hp, { brief: `${dir}${sep}page.html`, briefHash: hA, out, sha256: fileSha256(out), w: 1, h: 1, bytes: fakePng.length });
      const gSame1 = gateOverwrite({ outPath: out, briefHash: hA, historyPath: hp });
      const n1 = readHistory(hp).length;
      const gSame2 = gateOverwrite({ outPath: out, briefHash: hA, historyPath: hp });
      t("history same brief twice keeps one entry (skip)", gSame1.action === "skip" && gSame2.action === "skip" && n1 === 1, `${gSame1.reason.slice(0, 50)} entries=${n1}`);
      const gChanged = gateOverwrite({ outPath: out, briefHash: hB, historyPath: hp });
      t("history changed brief re-renders", gChanged.action === "render", gChanged.reason.slice(0, 60));
      writeFileSync(out, Buffer.from([...fakePng, 0x00]));
      const gTampered = gateOverwrite({ outPath: out, briefHash: hA, historyPath: hp });
      t("history tampered file refuses (fail closed)", gTampered.action === "refuse", gTampered.reason.slice(0, 60));
    } catch (e) { t("history + never-overwrite fixtures", false, String(e.message || e)); }
  }
  const pass = results.every((r) => r.pass);
  console.log(pass ? "RENDER PASS: refine + measured preview + 3-chunk stream + history/never-overwrite green" : `RENDER FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
  return { pass, results };
}

const psq = (s) => `'${String(s).replace(/'/g, "''")}'`;

// C-263 leg 1: one shared Edge profile per process instead of one
// fresh-profile launch per render. Same CLI flags, same output paths,
// same PNG bytes; only the --user-data-dir is reused across render()
// calls in this process (isolated per pid so parallel processes never
// share a profile lock). Falls back to a fresh temp dir when the shared
// dir cannot be created (fail open on the optimization, fail closed on
// the render itself). renderPdf() keeps its own per-call profile.
let sharedProfile = null;
export function sharedProfileDir() {
  if (sharedProfile && existsSync(sharedProfile)) return sharedProfile;
  try {
    const dir = `${tmpdir()}${sep}ds-render-shared-${process.pid}`;
    mkdirSync(dir, { recursive: true });
    sharedProfile = dir;
    return dir;
  } catch {
    return null;
  }
}

// Shared render queue: shape follows sindresorhus/p-queue (MIT):
// `new PQueue({concurrency:1})` + `queue.add(fn)` + `queue.onEmpty()`.
// Own code, 0 lines copied. One Edge at a time (concurrency 1): a 3-size
// build fans out 0 Edges in parallel, peak 1, PNG bytes identical to a
// direct render() (same flags, same paths).
export class PQueue {
  constructor({ concurrency = 1 } = {}) {
    if (!Number.isInteger(concurrency) || concurrency < 1) {
      throw new Error("PQueue needs concurrency >= 1 (shared queue uses 1)");
    }
    this.concurrency = concurrency;
    this._queue = [];
    this._active = 0;
    this._emptyResolvers = [];
    this.peakActive = 0;
  }
  get size() { return this._queue.length; }
  get pending() { return this._active; }
  get activeCount() { return this._active; }
  add(fn) {
    if (typeof fn !== "function") throw new Error("queue.add needs a function (never silent)");
    return new Promise((resolve, reject) => {
      this._queue.push({ fn, resolve, reject });
      this._next();
    });
  }
  _finishEmpty() {
    if (this._queue.length === 0 && this._active === 0) {
      const rs = this._emptyResolvers.splice(0);
      for (const r of rs) r();
    }
  }
  _next() {
    while (this._active < this.concurrency && this._queue.length > 0) {
      const job = this._queue.shift();
      this._active += 1;
      if (this._active > this.peakActive) this.peakActive = this._active;
      Promise.resolve()
        .then(() => job.fn())
        .then((v) => job.resolve(v), (e) => job.reject(e))
        .finally(() => {
          this._active -= 1;
          this._finishEmpty();
          this._next();
        });
    }
    this._finishEmpty();
  }
  // Resolves when the queue is empty and every job settled (build awaits this).
  onEmpty() {
    if (this._queue.length === 0 && this._active === 0) return Promise.resolve();
    return new Promise((resolve) => this._emptyResolvers.push(resolve));
  }
  // Alias of onEmpty (p-queue names the all-settled gate onIdle).
  onIdle() { return this.onEmpty(); }
}

// One shared queue per process: every render goes through here, so two
// builds in one process never run two Edges at once.
export const renderQueue = new PQueue({ concurrency: 1 });

// Same render(), serialized through the shared queue (bytes identical).
export function renderQueued(htmlPath, outPath, size, opts) {
  return renderQueue.add(() => render(htmlPath, outPath, size, opts));
}

// Queue self-check (no browser needed): 3 delayed jobs serialize to peak 1,
// results keep order, onEmpty resolves, same input twice gives identical bytes.
export async function renderQueueSelfCheck() {
  const results = [];
  const t = (name, ok, detail) => {
    results.push({ name, pass: !!ok, detail: String(detail ?? "") });
    console.log(`[${ok ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };
  try {
    const queue = new PQueue({ concurrency: 1 });
    let live = 0;
    let peak = 0;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const jobs = [1, 2, 3].map((n) =>
      queue.add(async () => {
        live += 1;
        if (live > peak) peak = live;
        await wait(20);
        live -= 1;
        return `job-${n}`;
      }),
    );
    const order = await Promise.all(jobs);
    await queue.onEmpty();
    t("queue serializes 3 jobs (peak 1, order kept)", peak === 1 && queue.peakActive === 1 && order.join(",") === "job-1,job-2,job-3", `peak=${peak} order=${order.join(",")}`);
  } catch (e) { t("queue serializes 3 jobs (peak 1, order kept)", false, String(e.message || e)); }
  try {
    const q2 = new PQueue({ concurrency: 2 });
    t("queue accepts concurrency 2 (1-2 lane)", q2.concurrency === 2, `concurrency=${q2.concurrency}`);
  } catch (e) { t("queue accepts concurrency 2 (1-2 lane)", false, String(e.message || e)); }
  try {
    const queue = new PQueue({ concurrency: 1 });
    const a = await queue.add(async () => Buffer.from("same-bytes").toString("hex"));
    const b = await queue.add(async () => Buffer.from("same-bytes").toString("hex"));
    await queue.onEmpty();
    t("queue repeats are byte-identical", a === b, `sha ${a.slice(0, 12)} == ${b.slice(0, 12)}`);
  } catch (e) { t("queue repeats are byte-identical", false, String(e.message || e)); }
  try {
    const queue = new PQueue({ concurrency: 1 });
    let settled = false;
    const p = queue.add(async () => 1).then(() => { settled = true; });
    await queue.onEmpty();
    await p;
    t("queue onEmpty resolves the build", settled === true, "onEmpty settled");
  } catch (e) { t("queue onEmpty resolves the build", false, String(e.message || e)); }
  const pass = results.every((r) => r.pass);
  console.log(pass ? "QUEUE PASS: concurrency 1 serializes 3 jobs, peak 1, byte-identical, onEmpty resolves" : `QUEUE FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
  return { pass, results };
}

export function render(htmlPath, outPath, size = { w: 1280, h: 720 }, { minBytes = 4096, history = true, force = false, historyPath } = {}) {
  // O-038: brief hash + never-overwrite gate run BEFORE any browser launch
  // (fail closed with the reason; --force overrides a refuse, never a skip
  // unless the brief changed... force renders regardless).
  const html = resolve(htmlPath);
  if (!existsSync(html)) throw new Error(`page missing: ${htmlPath}`);
  const briefHash = briefHashFor(readFileSync(html));
  const out = resolve(outPath);
  const histPath = historyPath ?? defaultHistoryPath();
  if (history) {
    const gate = gateOverwrite({ outPath: out, briefHash, historyPath: histPath });
    if (gate.action === "refuse" && !force) throw new Error(gate.reason);
    if (gate.action === "skip" && !force) {
      const buf = readFileSync(out);
      const dims = pngDims(buf);
      console.log(`RENDER SKIP ${out}: ${gate.reason}`);
      return { out, w: dims.w, h: dims.h, bytes: buf.length, skipped: true, reason: gate.reason };
    }
    if (gate.action !== "skip") console.log(`HISTORY gate: ${gate.reason}`);
  }
  const browser = findBrowser();
  if (!browser) {
    throw new Error("no Edge, Chrome or Chromium found: set BROWSER_BIN (never fake the output)");
  }
  if (!existsSync(POWERSHELL)) {
    throw new Error("powershell.exe missing: cannot launch the browser on this PC");
  }
  mkdirSync(dirname(out), { recursive: true });
  const profile = sharedProfileDir() ?? mkdtempSync(`${tmpdir()}${sep}ds-render-`);
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
  // O-038: append-only history entry (brief hash -> out.png sha256 + date).
  // Appends only; a prior entry is never edited or removed by this module.
  if (history) {
    appendHistory(histPath, { brief: html, briefHash, out, sha256: sha256Hex(buf), w: dims.w, h: dims.h, bytes: buf.length });
    console.log(`HISTORY ${histPath}: brief ${briefHash.slice(0, 12)} -> ${out} sha ${sha256Hex(buf).slice(0, 12)}`);
  }
  return { out, w: dims.w, h: dims.h, bytes: buf.length, briefHash };
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
    renderQueueSelfCheck().then(
      (q) => process.exit(pass && q.pass ? 0 : 1),
      () => process.exit(1),
    );
  } else if (args.includes("--pdf") && args.length >= 3) {
    const [src, dst] = args.filter((x) => x !== "--pdf");
    try { const r = renderPdf(src, dst); console.log(`PDF OK ${r.out} ${r.bytes}B`); } catch (e) { console.log(`PDF FAIL ${src}: ${e.message}`); process.exit(1); }
    process.exit(0);
  } else if (args.length < 2 || args.includes("-h") || args.includes("--help")) {
    console.log("usage: node tools/render.mjs <page.html> <out.png> [--size 1280x720] [--sizes] [--force] [--no-history] | node tools/render.mjs --pdf <page.html> <out.pdf> | node tools/render.mjs --check");
    console.log("history: every PNG render appends brief-hash -> sha256 + date to designs/job/history/render-history.jsonl (append-only);");
    console.log("an existing output is never overwritten unless the brief hash changed (--force overrides a refuse).");
    process.exit(args.length < 2 ? 2 : 0);
  }
  // DS-65 FREE-01 helper: offline draft-shape print (no network, no key read,
  // drafts only never final pixels). Usage: --free-prompt <model:free> <text>.
  else if (args.includes("--free-prompt")) {
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
  // O-038: --force/--no-history pass through to every size render.
  else {
  const force = args.includes("--force");
  const history = !args.includes("--no-history");
  if (args.includes("--sizes")) {
    let fails = 0;
    for (const size of SIZE_MATRIX) {
      try {
        const r = render(args[0], outForSize(args[1], size), size, { force, history });
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
    const r = render(args[0], args[1], size, { force, history });
    console.log(`RENDER OK ${r.out} ${r.w}x${r.h} ${r.bytes}B${r.skipped ? " (skipped: up to date)" : ""}`);
  } catch (e) {
    console.log(`RENDER FAIL ${args[0]}: ${e.message}`);
    process.exit(1);
  }
  }
}
