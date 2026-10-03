// tools/image.mjs (DS-66 IMAGE-01): paid Image API opt-in lane (OpenRouter
// POST /api/v1/images shape, idea-only, 0 lines copied: proprietary docs).
// Opt-in only, never the default loop: no caller runs a paid call unless it
// passes { model, prompt } explicitly. Key from env only (OPENROUTER_API_KEY),
// never in repo, never printed. Receipts carry serving model + usage.cost +
// media_type beside url/date/rev so spend stays honest. Offline --check:
// request-shape + fail-closed gates only, zero network, zero spend.
//   node tools/image.mjs --check
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const IMAGE_API = "https://openrouter.ai/api/v1/images";

// Fail-closed env read: the key is never logged, never defaulted.
export function imageKey() {
  const k = String(process.env.OPENROUTER_API_KEY ?? "").trim();
  if (!k) throw new Error("OPENROUTER_API_KEY missing from env (opt-in lane stays off, never commit a key)");
  return k;
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

// Paid call (opt-in only): POSTs the built body with the env key, parses
// { data:[{ b64_json, media_type }], usage:{ cost } }. Billing is
// all-or-nothing (failed/cancelled = no charge); non-2xx throws fail-closed.
export async function requestImage(req, { key = null } = {}) {
  const k = key ?? imageKey();
  const res = await fetch(req.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${k}`, "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });
  if (!res.ok) throw new Error(`image API ${res.status} (not billed: fail/cancel = 502 no charge)`);
  const j = await res.json();
  const first = j?.data?.[0];
  if (!first?.b64_json) throw new Error("image API returned no b64_json (never silent)");
  return { b64: String(first.b64_json), mediaType: String(first.media_type ?? "image/png"), cost: j?.usage?.cost ?? null, model: String(req.body.model) };
}

// Receipt carrier: base { url, date, rev } plus serving model + cost +
// media_type. Extra fields never break tools/check.mjs (it gates url/date/rev).
export function imageReceipt(base, { model, cost = null, mediaType = "image/png" } = {}) {
  const m = String(model ?? "").trim();
  if (!m) throw new Error("image receipt needs the serving model (pin what served, never silent)");
  return { ...base, model: m, usage: { cost }, media_type: String(mediaType) };
}

function selfCheck() {
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
  const saved = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  try { imageKey(); t("missing key fixture FAILs closed", false, "no throw?"); }
  catch (e) { t("missing key fixture FAILs closed", /missing from env/.test(e.message), "env-only, never committed"); }
  if (saved != null) process.env.OPENROUTER_API_KEY = saved;
  try {
    const rc = imageReceipt({ url: "https://x.local/h", date: "2026-10-03", rev: "abc1234" }, { model: "m", cost: 0.018, mediaType: "image/png" });
    t("receipt carries model+cost+media_type", rc.model === "m" && rc.usage.cost === 0.018 && rc.media_type === "image/png" && !!rc.rev, `${rc.model} cost=${rc.usage.cost}`);
  } catch (e) { t("receipt carries model+cost+media_type", false, String(e.message || e)); }
  const pass = results.every((r) => r.pass);
  console.log(pass ? "IMAGE PASS: opt-in POST shape + env-only key + receipt carrier green (no network, no spend)" : `IMAGE FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
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
  if (args.includes("--check")) {
    if (!selfCheck().pass) process.exitCode = 1;
  } else {
    console.log("usage: node tools/image.mjs --check (opt-in paid lane; key from OPENROUTER_API_KEY env only)");
    process.exit(2);
  }
}
