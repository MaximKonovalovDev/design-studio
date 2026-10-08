// tools/image.mjs (DS-66 IMAGE-01): OpenRouter Image API opt-in lane (POST
// /api/v1/images shape, idea-only, 0 lines copied: proprietary docs).
// Opt-in only, never the default loop: no caller runs a call unless it passes
// { model, prompt } explicitly. Keys (Maxim saves them himself, 2026-10-04): env
// OPENROUTER_API_KEY first; only when that is empty the first line of each of
// %USERPROFILE%\.empire\secrets\openrouter.txt and openrouter2.txt, in that order.
// On HTTP 429 or a credit error the call tries the next key once. A key is never
// in the repo, never logged, never printed, never copied. Only the two free
// models run by default; any other image model needs an explicit budget
// (env DS_IMAGE_BUDGET_USD, default 0). Receipts carry serving model +
// usage.cost + media_type beside url/date/rev so spend stays honest. Offline
// --check: request-shape + fail-closed gates only, zero network, zero spend.
//   node tools/image.mjs --check
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const IMAGE_API = "https://openrouter.ai/api/v1/images";

// The two image models that listed at price 0 on OpenRouter's live model list
// on 2026-10-04 (image out: text to image with readable text; image to layers).
// A snapshot for tests and docs, not a source of truth: the live list decides
// (tool 2 `--free` re-reads it) and a call checks usage.cost.
export const KNOWN_FREE_IMAGE_MODELS = ["inclusionai/ming-image-0.1-design", "inclusionai/ming-image-0.1-design-layer"];

// Free vision models (text out) for a second look at a design, best first
// (checked 2026-10-04). The judge seat opens pictures itself; these are the
// free fallback when a call is wanted. Not used by any code path yet.
export const FREE_VISION_MODELS = ["qwen/qwen3.8-27b:free", "google/gemma-4-31b-it:free"];

// Where the file key sources live, in order. A file is never created, printed
// or copied by any tool; only its first line is read, and only when env is empty.
export const KEY_FILE_NAMES = ["openrouter.txt", "openrouter2.txt"];
export function keyFilePaths(home = process.env.USERPROFILE || homedir()) {
  return KEY_FILE_NAMES.map((name) => join(home, ".empire", "secrets", name));
}

// First line of a text file, trimmed. A Notepad BOM and a Windows PowerShell
// UTF-16 file both read right. Empty string when the file is missing or empty.
function firstLine(file, read) {
  let buf;
  try { buf = read(file); } catch { return ""; }
  if (!Buffer.isBuffer(buf)) buf = Buffer.from(String(buf ?? ""), "utf8");
  const text = buf[0] === 0xff && buf[1] === 0xfe ? buf.subarray(2).toString("utf16le") : buf.toString("utf8").replace(/^﻿/, "");
  return (text.split(/\r?\n/)[0] ?? "").trim();
}

// Fail-closed key list: [env key] when env is set (the files are not even read),
// else the distinct first lines of the key files, in order. Never logged, never
// defaulted. `files` and `read` exist so a test can use temp files and see that
// no file is touched while env is set.
export function imageKeys({ files = keyFilePaths(), read = readFileSync } = {}) {
  const env = String(process.env.OPENROUTER_API_KEY ?? "").trim();
  if (env) return [env];
  const keys = [];
  for (const f of files) {
    const k = firstLine(f, read);
    if (k && !keys.includes(k)) keys.push(k);
  }
  if (!keys.length) throw new Error("OpenRouter key missing: set env OPENROUTER_API_KEY, or save it as the first line of %USERPROFILE%\\.empire\\secrets\\openrouter.txt (and openrouter2.txt) (opt-in lane stays off, never commit a key)");
  return keys;
}

// The first key (the one a call tries first).
export function imageKey(opts) {
  return imageKeys(opts)[0];
}

// The explicit budget gate: USD a caller may spend on a model that is not on the
// free list. Defaults to 0 (Maxim has not set a budget); junk or negative is 0.
export function imageBudget(env = process.env) {
  const n = Number(env.DS_IMAGE_BUDGET_USD ?? 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// A key that ran out: HTTP 429 (rate or daily limit) or a credit error (402, or
// a 4xx whose text names credits or a key limit). Only then the next key is tried.
export function keyExhausted(status, text = "") {
  if (status === 429 || status === 402) return true;
  return status >= 400 && status < 500 && /insufficient credits|out of credits|credit limit|key limit|quota/i.test(String(text));
}

// Pure request builder (no fetch): { model, prompt, w, h, n?, seed? } ->
// { url, headers, body }. Size as WxH pixels; n defaults 1.
export function buildImageRequest({ model, prompt, w = 1280, h = 720, n = 1, seed = null } = {}) {
  const m = String(model ?? "").trim();
  if (!m) throw new Error("image request needs model (e.g. bytedance-seed/seedream-4.5)");
  const p = String(prompt ?? "").trim();
  if (!p) throw new Error("image request needs a prompt (never silent)");
  const W = Number(w);
  const H = Number(h);
  if (!(W >= 16 && W <= 8192 && H >= 16 && H <= 8192)) throw new Error("image size must be 16..8192 each side");
  const N = Number(n ?? 1);
  if (!(N >= 1 && N <= 4)) throw new Error("image n must be 1..4 (credit guard)");
  const body = { model: m, prompt: p, size: `${W}x${H}`, n: N };
  if (seed != null) body.seed = Number(seed);
  return { url: IMAGE_API, headers: { Authorization: "Bearer <env>", "Content-Type": "application/json" }, body };
}

// The call (opt-in only): POSTs the built body with the first key; on 429 or a
// credit error it tries the next key once (at most 2 attempts). Parses
// { data:[{ b64_json, media_type }], usage:{ cost } }. Billing is
// all-or-nothing (failed/cancelled = no charge); non-2xx throws fail-closed with
// the status only, never the key and never the response text. A model that is
// not in `freeModels` (the live free list from tool 2, else the known snapshot)
// is refused while the budget is 0. `key` (one key) or `keys` skip the lookup;
// `fetchImpl` lets a test run with no network.
export async function requestImage(req, { key = null, keys = null, fetchImpl = fetch, freeModels = KNOWN_FREE_IMAGE_MODELS, budget = imageBudget() } = {}) {
  const model = String(req?.body?.model ?? "");
  if (!freeModels.includes(model) && !(budget > 0)) throw new Error(`image model ${model || "?"} is not on the free list and the image budget is 0 (a paid model needs an explicit DS_IMAGE_BUDGET_USD)`);
  const list = (key ? [key] : keys ?? imageKeys()).slice(0, 2);
  let res = null;
  for (let i = 0; i < list.length; i++) {
    res = await fetchImpl(req.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${list[i]}`, "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    if (res.ok) break;
    const text = await res.text().catch(() => "");
    if (i + 1 < list.length && keyExhausted(res.status, text)) continue;
    throw new Error(`image API ${res.status}${i > 0 ? " on the second key" : ""} (not billed: fail/cancel = 502 no charge)`);
  }
  const j = await res.json();
  const first = j?.data?.[0];
  if (!first?.b64_json) throw new Error("image API returned no b64_json (never silent)");
  return { b64: String(first.b64_json), mediaType: String(first.media_type ?? "image/png"), cost: j?.usage?.cost ?? null, model };
}

// Receipt carrier: base { url, date, rev } plus serving model + cost +
// media_type. Extra fields never break tools/check.mjs (it gates url/date/rev).
export function imageReceipt(base, { model, cost = null, mediaType = "image/png" } = {}) {
  const m = String(model ?? "").trim();
  if (!m) throw new Error("image receipt needs the serving model (pin what served, never silent)");
  return { ...base, model: m, usage: { cost }, media_type: String(mediaType) };
}

// The free image lane (tool 2): the live model list decides what is free, never
// the snapshot. A model is free when its pricing block exists and every price
// field is 0. Lane ON for covers (Maxim 2026-10-08): the builder seat may run one
// render per cover; --free without a key only lists, and a paid cost aborts.
export const MODELS_URL = "https://openrouter.ai/api/v1/models";
export function filterFreeModels(data) {
  const list = Array.isArray(data) ? data : data?.data ?? [];
  return list.filter((m) => {
    const p = m?.pricing;
    if (!p || typeof p !== "object") return false;
    const vals = Object.values(p);
    return vals.length > 0 && vals.every((v) => Number(v) === 0);
  }).map((m) => String(m.id));
}
export async function fetchFreeModels({ fetchImpl = fetch } = {}) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetchImpl(`${MODELS_URL}?output_modalities=image`, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`model list ${r.status}`);
    return filterFreeModels(await r.json());
  } finally { clearTimeout(to); }
}

// One 1280x720 background call on the first free model (a generated picture is a
// background only, never a product picture, terms per model). Aborts when
// usage.cost is not 0. Call requestImage only, never another key read.
export async function freeBackground(prompt, outPng, { keys = null, fetchImpl = fetch, freeModels = null } = {}) {
  const models = freeModels ?? await fetchFreeModels({ fetchImpl });
  if (!models.length) throw new Error("no free image model on the live list (nothing runs at budget 0)");
  const req = buildImageRequest({ model: models[0], prompt, w: 1280, h: 720 });
  const out = await requestImage(req, { keys, fetchImpl, freeModels: models, budget: 0 });
  if (Number(out.cost) !== 0) throw new Error(`free lane abort: usage.cost=${out.cost} (expected 0)`);
  const { writeFileSync: w } = await import("node:fs");
  const { createHash: h } = await import("node:crypto");
  w(outPng, Buffer.from(out.b64, "base64"));
  const rev = h("sha256").update(Buffer.from(out.b64, "base64")).digest("hex").slice(0, 12);
  const receipt = imageReceipt({ url: `openrouter:${out.model}`, date: new Date().toISOString().slice(0, 10), rev }, { model: out.model, cost: out.cost, mediaType: out.mediaType });
  w(`${outPng}.receipt.json`, `${JSON.stringify(receipt, null, 2)}\n`);
  return { out: outPng, receipt: `${outPng}.receipt.json`, model: out.model };
}

// Offline fixture for --free --check: the live shape with the two known free ids
// plus two paid ones; the filter must keep exactly the known two. No network, no key.
export function freeFixtureCheck() {
  const data = [
    { id: KNOWN_FREE_IMAGE_MODELS[0], pricing: { prompt: "0", completion: "0", image: "0", request: "0" } },
    { id: KNOWN_FREE_IMAGE_MODELS[1], pricing: { prompt: "0", completion: "0", image: "0", request: "0" } },
    { id: "bytedance-seed/seedream-4.5", pricing: { prompt: "0.001", completion: "0.001", image: "0.02", request: "0" } },
    { id: "google/gemini-2.5-flash-image", pricing: { prompt: "0.0003", completion: "0.0025", image: "0.0001", request: "0" } },
    { id: "mystery/no-pricing", pricing: {} },
  ];
  const kept = filterFreeModels(data);
  const ok = kept.length === 2 && KNOWN_FREE_IMAGE_MODELS.every((m) => kept.includes(m));
  for (const m of kept) console.log(`FREE-MODEL: ${m}`);
  console.log(ok ? `FREE-IMAGE-CHECK PASS: live-shape fixture keeps exactly the 2 free models (${kept.join(", ")})` : `FREE-IMAGE-CHECK FAIL: kept ${kept.join(",")}`);
  return ok;
}

// A fake fetch for the offline checks: answers each call from a list of statuses.
function fakeFetch(statuses, seen) {
  let i = 0;
  return async (url, init) => {
    seen.push(String(init.headers.Authorization));
    const status = statuses[Math.min(i++, statuses.length - 1)];
    return { ok: status === 200, status, text: async () => (status === 402 ? "Insufficient credits" : ""), json: async () => ({ data: [{ b64_json: "AAAA", media_type: "image/png" }], usage: { cost: 0 } }) };
  };
}

async function selfCheck() {
  const results = [];
  const t = (name, ok, detail) => {
    results.push({ name, pass: !!ok });
    console.log(`[${ok ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };
  try {
    const r = buildImageRequest({ model: "bytedance-seed/seedream-4.5", prompt: "landing hero, dawn", w: 1280, h: 720 });
    t("request builds POST shape", r.url === IMAGE_API && r.body.size === "1280x720" && r.body.n === 1, `${r.body.model} ${r.body.size}`);
  } catch (e) { t("request builds POST shape", false, String(e.message || e)); }
  try { buildImageRequest({ model: "", prompt: "x" }); t("empty model fixture FAILs closed", false, "no throw?"); }
  catch (e) { t("empty model fixture FAILs closed", /needs model/.test(e.message), e.message); }
  try { buildImageRequest({ model: "m", prompt: "   " }); t("empty prompt fixture FAILs closed", false, "no throw?"); }
  catch (e) { t("empty prompt fixture FAILs closed", /needs a prompt/.test(e.message), e.message); }
  // The fixtures always pass explicit temp or missing files: the check never reads the real key files.
  const saved = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  const noFile = join(tmpdir(), "design-studio-no-such-openrouter-key.txt");
  try { imageKeys({ files: [noFile] }); t("missing key fixture FAILs closed", false, "no throw?"); }
  catch (e) { t("missing key fixture FAILs closed", /key missing/.test(e.message), "env or key files, never committed"); }
  const dir = mkdtempSync(join(tmpdir(), "ds-imagekey-"));
  try {
    const f1 = join(dir, "openrouter.txt");
    const f2 = join(dir, "openrouter2.txt");
    writeFileSync(f1, "﻿  fixture-key-one  \r\nsecond line is ignored\r\n");
    writeFileSync(f2, "fixture-key-two\n");
    const ks = imageKeys({ files: [f1, f2] });
    t("two key files read in order, first line trimmed", ks.join(",") === "fixture-key-one,fixture-key-two", "temp files, BOM and CRLF");
    process.env.OPENROUTER_API_KEY = "fixture-key-from-env";
    let touched = 0;
    t("env key wins and no file is read", imageKeys({ files: [f1, f2], read: () => { touched += 1; return Buffer.from("x"); } }).join(",") === "fixture-key-from-env" && touched === 0, `file reads ${touched}`);
    delete process.env.OPENROUTER_API_KEY;
    writeFileSync(f1, "\r\n   \r\n");
    t("an empty first file falls through to the second", imageKeys({ files: [f1, f2] }).join(",") === "fixture-key-two", "empty file skipped");
    writeFileSync(f2, "");
    try { imageKeys({ files: [f1, f2] }); t("empty key files fixture FAILs closed", false, "no throw?"); }
    catch (e) { t("empty key files fixture FAILs closed", /key missing/.test(e.message) && !/fixture/.test(e.message), "no key text in the error"); }
  } finally { rmSync(dir, { recursive: true, force: true }); }
  if (saved != null) process.env.OPENROUTER_API_KEY = saved;
  try {
    const ok = KNOWN_FREE_IMAGE_MODELS.length === 2 && KNOWN_FREE_IMAGE_MODELS.every((m) => buildImageRequest({ model: m, prompt: "x" }).body.model === m);
    t("known free model ids build requests", ok, KNOWN_FREE_IMAGE_MODELS.join(", "));
  } catch (e) { t("known free model ids build requests", false, String(e.message || e)); }
  try {
    const free = buildImageRequest({ model: KNOWN_FREE_IMAGE_MODELS[0], prompt: "x" });
    const paid = buildImageRequest({ model: "bytedance-seed/seedream-4.5", prompt: "x" });
    const seen = [];
    await requestImage(free, { keys: ["k1", "k2"], fetchImpl: fakeFetch([200], seen), budget: 0 });
    let refused = false;
    try { await requestImage(paid, { keys: ["k1"], fetchImpl: fakeFetch([200], seen), budget: 0 }); } catch (e) { refused = /budget is 0/.test(e.message); }
    const allowed = await requestImage(paid, { keys: ["k1"], fetchImpl: fakeFetch([200], []), budget: 1 }).then(() => true, () => false);
    t("a paid model needs a budget above 0 (default 0)", refused && allowed && imageBudget({}) === 0 && imageBudget({ DS_IMAGE_BUDGET_USD: "-3" }) === 0, "free model runs, paid refused at 0, allowed at 1");
    const a = [];
    await requestImage(free, { keys: ["k1", "k2"], fetchImpl: fakeFetch([429, 200], a) });
    const b = [];
    await requestImage(free, { keys: ["k1", "k2"], fetchImpl: fakeFetch([402, 200], b) });
    const c = [];
    let both = false;
    try { await requestImage(free, { keys: ["k1", "k2", "k3"], fetchImpl: fakeFetch([429], c) }); } catch (e) { both = /429 on the second key/.test(e.message) && !/k[123]/.test(e.message); }
    t("429 or a credit error tries the next key once", a.join("|") === "Bearer k1|Bearer k2" && b.join("|") === "Bearer k1|Bearer k2" && both && c.length === 2, "fake fetch, no network");
  } catch (e) { t("request lane gates", false, String(e.message || e)); }
  try {
    const rc = imageReceipt({ url: "https://x.local/h", date: "2026-10-03", rev: "abc1234" }, { model: "m", cost: 0.018, mediaType: "image/png" });
    t("receipt carries model+cost+media_type", rc.model === "m" && rc.usage.cost === 0.018 && rc.media_type === "image/png" && !!rc.rev, `${rc.model} cost=${rc.usage.cost}`);
  } catch (e) { t("receipt carries model+cost+media_type", false, String(e.message || e)); }
  const pass = results.every((r) => r.pass);
  console.log(pass ? "IMAGE PASS: opt-in POST shape + env-or-two-files key + 429 fallback + budget gate + receipt carrier green (no network, no spend)" : `IMAGE FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
  return { pass, results };
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
  if (args.includes("--free")) {
    if (args.includes("--check")) {
      if (!freeFixtureCheck()) process.exitCode = 1;
    } else {
      const models = await fetchFreeModels();
      console.log(`FREE-IMAGE MODELS ${models.length}: ${models.join(", ")}`);
      let keys = null;
      try { keys = imageKeys(); } catch { keys = null; }
      const pi = args.indexOf("--prompt");
      const oi = args.indexOf("--out");
      if (!keys) {
        console.log(`FREE-IMAGE: waiting for key (${models.length} models listed, no call made)`);
      } else if (pi < 0 || oi < 0 || !args[pi + 1] || !args[oi + 1]) {
        console.log(`FREE-IMAGE: key present (${models.length} models listed, no call made: pass --prompt "..." --out <png>)`);
      } else {
        const r = await freeBackground(args[pi + 1], resolve(args[oi + 1]), { keys, freeModels: models });
        console.log(`FREE-IMAGE: ${r.model} 1280x720 cost=0 -> ${r.out} + receipt`);
      }
    }
  } else if (args.includes("--check")) {
    if (!(await selfCheck()).pass) process.exitCode = 1;
  } else {
    console.log("usage: node tools/image.mjs --check | node tools/image.mjs --free [--check] [--prompt \"...\" --out <png>] (opt-in lane; key from env OPENROUTER_API_KEY, else the first line of %USERPROFILE%\\.empire\\secrets\\openrouter.txt then openrouter2.txt; a paid model needs DS_IMAGE_BUDGET_USD above 0)");
    process.exit(2);
  }
}
