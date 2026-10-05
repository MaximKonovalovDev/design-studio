// tools/brief.mjs: DS-80 brief gate (S60 TOKEN-100x packet 065).
// Refuses bad briefs BEFORE any lane builds: required fields present
// (product, sizes with exact pixels, headline where the lane needs one),
// facts source exists on disk, no forbidden words (engine names, scores,
// personal data markers).
//
// Validator: hand-rolled with the zod shape (required/optional fields,
// fail-closed on unknown shapes), ZERO deps — no zod install, no LICENSE
// to pin, no network. (Packet allowed either; this file says which: hand-rolled.)
//
//   node tools/brief.mjs --check        self-test incl. fixtures (exit 0 green)
//   node tools/brief.mjs gate <brief>   exit 0 PASS with field report,
//                                      exit 1 FAIL naming the first bad field,
//                                      exit 2 SKIP for a missing file —
//                                      never a false PASS.
import { existsSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Engine names a cover/page never shows (same pattern as tools/cover.mjs
// FORBIDDEN: game engines and kit brands the orders forbid).
export const FORBIDDEN_ENGINES = [
  "unity",
  "godot",
  "unreal",
  "gamemaker",
  "game maker",
  "rpg maker",
  "rpgmaker",
  "construct 3",
  "pygame",
];

// Score words a brief never carries (sample audits are synthetic; the lane
// forbids audit numbers on visuals). N/10 and out-of-N phrases are regexes.
export const FORBIDDEN_SCORE_WORDS = ["score", "scored", "rating", "rated"];
export const FORBIDDEN_SCORE_RES = [
  /\b\d+(\.\d+)?\s*\/\s*10\b/i, // 9/10, 8.5 / 10
  /\bout of (10|5)\b/i, // out of 10
  /\b\d+(\.\d+)?\s*stars?\b/i, // 4.5 stars
];

// Personal-data markers: briefs carry placeholders only, never real PII
// (O-007 rule: no personal data in this repo). Words are literal, res are shapes.
export const FORBIDDEN_PII_WORDS = ["passport", "ssn", "social security", "id number"];
export const FORBIDDEN_PII_RES = [
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, // email
  // Phone-like only in real phone shapes (leading +, (555) groups, 3-3-4
  // groups, or 10+ bare digits) so slug dates like 2026-10-05 never trip it.
  /(?:\+\d[\d\s\-.()]{6,}\d|\(\d{2,4}\)[\s\-.]?\d{3,4}[\s\-.]?\d{4}|\b\d{3}[\s\-.]\d{3}[\s\-.]\d{4}\b|\b\d{10,}\b)/,
];

// String fields that are file paths: scanned for existence, never for words
// (a facts path like .../scoreboard.md must not trip the score gate).
const PATH_FIELDS = new Set([
  "tokens",
  "page",
  "image",
  "reference",
  "facts",
  "facts_source",
  "fact_source",
  "sources",
  "listing",
  "assets",
  "pdf",
  "template",
  "palette",
  "system",
]);

const PRODUCT_RE =
  /^(cover:(itch|gumroad)\/[a-z0-9-]+|post-visual:[a-z0-9-]+|cv-layout:[a-z0-9-]+|game-ui:[a-z0-9-]+|site-look:[a-z0-9-]+|page:[a-z0-9-]+|portfolio:[a-z0-9-]+|short-frame:[a-z0-9-]+|thumbnail:[a-z0-9-]+|order:[a-z0-9-]+)$/;

// Customer repo dirs (same source as tools/orders-check.mjs customerDirs).
let _dirs = null;
function customerDirs() {
  if (_dirs) return _dirs;
  _dirs = [];
  const f = process.env.EMPIRE_JSON || "C:/Users/me/Desktop/center/empire.json";
  try {
    const emp = JSON.parse(readFileSync(f, "utf8"));
    for (const r of Object.values(emp.repos ?? {})) if (r && r.dir) _dirs.push(String(r.dir));
  } catch {
    // empire.json unreadable: this repo only.
  }
  return _dirs;
}

function onDisk(p, dir) {
  if (!p) return false;
  if (isAbsolute(p) && existsSync(p)) return true;
  if (existsSync(join(dir, p))) return true;
  if (existsSync(join(ROOT, p))) return true;
  return customerDirs().some((d) => {
    try {
      return existsSync(join(d, p));
    } catch {
      return false;
    }
  });
}

function findOrderRow(order) {
  try {
    const csv = readFileSync(join(ROOT, "orders.csv"), "utf8");
    const line = csv.split(/\r?\n/).find((l) => l.startsWith(`${order},`));
    if (!line) return null;
    const f = line.split(",");
    // Tail-anchored: the brief text holds commas, so the last five fields
    // are status, delivered_path, adopted, date, adopted_commit.
    const n = f.length;
    return {
      order_id: f[0],
      from_repo: f[1],
      product: f[2],
      brief: f.slice(3, n - 5).join(","),
      status: f[n - 5],
      delivered_path: f[n - 4],
    };
  } catch {
    return null;
  }
}

function extractPaths(text) {
  const out = [];
  for (const m of String(text ?? "").matchAll(/[A-Za-z]:\/[^\s,;")\]]+/g)) out.push(m[0].replace(/[.,;:]+$/, ""));
  for (const m of String(text ?? "").matchAll(/[\w./-]+\.(?:md|json|txt|csv)\b/g)) {
    if (!out.includes(m[0])) out.push(m[0]);
  }
  return out;
}

// Facts provenance: brief-declared paths first (strict), legacy order-row
// grounding second (documented, never silent: the report names which won).
function resolveFacts(brief, dir) {
  const declared = [];
  for (const k of ["facts", "facts_source", "fact_source", "sources", "listing"]) {
    const v = brief[k];
    if (typeof v === "string" && v) declared.push(v);
    else if (Array.isArray(v)) for (const s of v) if (typeof s === "string" && s) declared.push(s);
  }
  if (declared.length > 0) {
    const missing = declared.filter((p) => !onDisk(p, dir));
    if (missing.length > 0) {
      return {
        ok: false,
        detail: `declared facts source missing on disk: ${missing[0]} — next: point brief.facts at a file on disk`,
      };
    }
    return { ok: true, provenance: `brief-declared: ${declared.join(", ")}` };
  }
  if (typeof brief.order === "string" && brief.order) {
    const row = findOrderRow(brief.order);
    if (!row) {
      return {
        ok: false,
        detail: `order ${brief.order} not in orders.csv and no brief.facts declared — next: declare "facts": "<listing file>"`,
      };
    }
    const hit = extractPaths(row.brief).find((p) => onDisk(p, dir));
    if (hit) return { ok: true, provenance: `orders.csv ${brief.order} brief names ${hit}` };
    if (row.delivered_path && onDisk(row.delivered_path, dir)) {
      return { ok: true, provenance: `orders.csv ${brief.order} delivered_path ${row.delivered_path} on disk (lane-grounded)` };
    }
    return {
      ok: false,
      detail: `no facts source on disk for order ${brief.order} (row brief names no existing file, ${row.delivered_path || "no delivered_path"} not on disk) — next: declare brief.facts`,
    };
  }
  return {
    ok: false,
    detail: `no facts source: declare brief.facts (a path on disk) or brief.order matching orders.csv — next: add "facts": "<listing file>"`,
  };
}

// Every string in the brief except path fields, with its JSON path.
function* stringsOf(v, path, skip) {
  if (typeof v === "string") {
    if (!skip) yield [path, v];
    return;
  }
  if (Array.isArray(v)) {
    for (let i = 0; i < v.length; i++) yield* stringsOf(v[i], `${path}[${i}]`, false);
    return;
  }
  if (v && typeof v === "object") {
    for (const [k, s] of Object.entries(v)) yield* stringsOf(s, path ? `${path}.${k}` : k, PATH_FIELDS.has(k));
  }
}

function scanForbidden(brief) {
  for (const [field, s] of stringsOf(brief, "", false)) {
    const low = s.toLowerCase();
    for (const w of FORBIDDEN_ENGINES) {
      if (low.includes(w)) return { field, word: w, kind: "engine name" };
    }
    for (const w of FORBIDDEN_SCORE_WORDS) {
      if (new RegExp(`\\b${w}\\b`, "i").test(s)) return { field, word: w, kind: "score claim" };
    }
    for (const re of FORBIDDEN_SCORE_RES) {
      const m = s.match(re);
      if (m) return { field, word: m[0], kind: "score claim" };
    }
    // "engine2040" is the customer repo, not an engine brand: the engine
    // list above never matches it, and bare "engine" is not forbidden.
    for (const w of FORBIDDEN_PII_WORDS) {
      if (low.includes(w)) return { field, word: w, kind: "personal data" };
    }
    for (const re of FORBIDDEN_PII_RES) {
      const m = s.match(re);
      if (m) return { field, word: m[0], kind: "personal data" };
    }
  }
  return null;
}

// Full gate on one brief file. Never throws: every failure is a FAIL check.
// Returns { pass, code, checks, errors, report } — code 0 PASS, 1 FAIL, 2 SKIP.
export function gateBrief(briefPath) {
  const file = resolve(briefPath);
  const dir = dirname(file);
  const checks = [];
  const errors = [];
  const check = (name, ok, detail) => {
    checks.push({ name, pass: !!ok, detail: String(detail ?? "") });
    if (!ok) errors.push(`${name}: ${detail}`);
  };

  if (!existsSync(file)) {
    checks.push({ name: "brief.json exists", pass: false, skipped: true, detail: "file not on disk — refusing to PASS what is not there" });
    return { pass: false, code: 2, checks, errors: ["brief.json exists: missing"], report: null };
  }
  check("brief.json exists", true, briefPath);

  let brief;
  try {
    brief = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    check("brief.json parses", false, `${String(e.message || e)} — next: fix JSON syntax`);
    return finish(false, 1, checks, errors, dir);
  }
  check("brief.json parses", true, brief.title ?? "untitled");

  if (typeof brief.product !== "string" || !brief.product) {
    check("product present", false, `product must be a non-empty product id (cover:itch/<slug>, order:<slug>, ...) — next: set brief.product`);
  } else if (!PRODUCT_RE.test(brief.product)) {
    check("product present", false, `product ${JSON.stringify(brief.product)} is not a known product shape — next: use cover:itch/<slug>, post-visual:<name>, order:<slug>, ...`);
  } else {
    check("product present", true, brief.product);
  }

  if (brief.noTitle === true) {
    check("headline present", true, "waived via noTitle (lane needs no headline)");
  } else if (typeof brief.title !== "string" || !brief.title.trim()) {
    check("headline present", false, `title must be a non-empty headline string — next: set brief.title verbatim`);
  } else {
    check("headline present", true, brief.title.slice(0, 60));
  }

  const sizes = brief.sizes;
  if (!Array.isArray(sizes) || sizes.length === 0) {
    check("sizes well-formed", false, `sizes must be a non-empty array of {w,h} exact pixels — next: set sizes e.g. [{"w":1280,"h":720,"name":"hero"}]`);
  } else {
    let bad = null;
    for (let i = 0; i < sizes.length && !bad; i++) {
      const s = sizes[i] ?? {};
      if (!Number.isInteger(s.w) || s.w < 16) bad = `sizes[${i}].w must be an int >= 16, got ${JSON.stringify(s.w)} — next: set exact pixels`;
      else if (!Number.isInteger(s.h) || s.h < 16) bad = `sizes[${i}].h must be an int >= 16, got ${JSON.stringify(s.h)} — next: set exact pixels`;
    }
    if (bad) check("sizes well-formed", false, bad);
    else {
      const solo = brief.size ?? {};
      if (brief.size != null && (!Number.isInteger(solo.w) || !Number.isInteger(solo.h) || solo.w < 16 || solo.h < 16)) {
        check("sizes well-formed", false, `size must be {w,h} ints >= 16 — next: set size to e.g. {"w":1280,"h":720}`);
      } else {
        check("sizes well-formed", true, sizes.map((s) => `${s.w}x${s.h}${s.name ? ` ${s.name}` : ""}`).join(" + "));
      }
    }
  }

  const facts = resolveFacts(brief, dir);
  check("facts source exists", facts.ok, facts.ok ? facts.provenance : facts.detail);

  const hit = scanForbidden(brief);
  if (hit) {
    check("no forbidden words", false, `forbidden ${hit.kind} ${JSON.stringify(hit.word)} in field "${hit.field}" — next: drop it from the brief`);
  } else {
    check("no forbidden words", true, "no engine names, score claims or personal data in brief strings");
  }

  const pass = errors.length === 0;
  return finish(pass, pass ? 0 : 1, checks, errors, dir);
}

function finish(pass, code, checks, errors, dir) {
  const report = { pass, code, checks, errors, at: new Date().toISOString().slice(0, 10) };
  try {
    writeFileSync(join(dir, "brief-gate.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  } catch {
    // Report write is best-effort; pass/fail still stands.
  }
  return { pass, code, checks, errors, report };
}

const isMain = (() => {
  try {
    return fileURLToPath(import.meta.url) === resolve(process.argv[1]);
  } catch {
    return false;
  }
})();

// --check self-test incl. fixtures. Temp briefs only; the one on-disk read
// is designs/O-042/brief.json (the real brief the gate must PASS).
export function briefSelfCheck() {
  const results = [];
  const t = (name, ok, detail) => {
    results.push({ name, pass: !!ok, detail: String(detail ?? "") });
    console.log(`[${ok ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };
  const mk = (brief) => {
    const d = mkdtempSync(`${tmpdir()}/ds-brief-`);
    writeFileSync(join(d, "facts.md"), "# facts\n- 3 skills, $19 one-time\n", "utf8");
    const withFacts = { ...brief };
    if (!withFacts.facts && !withFacts.order) withFacts.facts = "facts.md";
    writeFileSync(join(d, "brief.json"), JSON.stringify(withFacts), "utf8");
    return join(d, "brief.json");
  };
  const base = {
    title: "Fleet Vol 1",
    product: "cover:gumroad/fleet-pack",
    sizes: [
      { w: 1280, h: 720, name: "landscape" },
      { w: 630, h: 500, name: "store-card" },
    ],
    size: { w: 1280, h: 720 },
  };

  {
    const r = gateBrief(mk(base));
    t("good brief passes", r.pass && r.code === 0, r.pass ? r.checks.map((c) => c.name).join(", ") : r.errors.slice(0, 1).join("; "));
  }
  {
    const r = gateBrief(join(ROOT, "designs", "O-042", "brief.json"));
    t("real O-042 brief passes (legacy order-row provenance)", r.pass && r.code === 0, r.pass ? r.checks.find((c) => c.name === "facts source exists").detail : r.errors.slice(0, 1).join("; "));
  }
  {
    const bad = { ...base };
    delete bad.product;
    const r = gateBrief(mk(bad));
    t("missing product fails naming product", !r.pass && r.code === 1 && r.errors[0].startsWith("product present"), r.errors.slice(0, 1).join("; ") || "no errors?");
  }
  {
    const r = gateBrief(mk({ ...base, sizes: [{ w: "1280x720", h: 720 }] }));
    t("bad size fails naming sizes", !r.pass && r.errors.some((e) => e.startsWith("sizes well-formed")), r.errors.slice(0, 1).join("; ") || "no errors?");
  }
  {
    const r = gateBrief(mk({ ...base, title: "Unity engine showcase" }));
    t("engine name fails naming the title field", !r.pass && r.errors.some((e) => e.includes('"title"') && e.includes("unity")), r.errors.slice(0, 1).join("; ") || "no errors?");
  }
  {
    const r = gateBrief(mk({ ...base, subtitle: "Write to joe@example.com for help" }));
    t("email fails as personal data", !r.pass && r.errors.some((e) => e.includes("personal data")), r.errors.slice(0, 1).join("; ") || "no errors?");
  }
  {
    const r = gateBrief(mk({ ...base, facts: "no-such-file.md" }));
    t("declared-but-dead facts fails naming facts", !r.pass && r.errors.some((e) => e.startsWith("facts source exists")), r.errors.slice(0, 1).join("; ") || "no errors?");
  }
  {
    const r = gateBrief(join(ROOT, "designs", "job", "no-such-brief.json"));
    t("missing file is SKIP exit 2, never PASS", !r.pass && r.code === 2, `code ${r.code}`);
  }

  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `BRIEF FAIL: ${fails.length} failing fixture(s)` : `BRIEF PASS: ${results.length}/${results.length} fixtures green (hand-rolled validator, no deps)`);
  return { pass: fails.length === 0, results };
}

if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes("--check")) {
    const { pass } = briefSelfCheck();
    if (!pass) process.exitCode = 1;
  } else if (args[0] === "gate") {
    const target = args[1];
    if (!target) {
      console.log("usage: node tools/brief.mjs gate <brief.json> | node tools/brief.mjs --check");
      process.exitCode = 2;
    } else {
      const r = gateBrief(target);
      for (const c of r.checks) console.log(`[${c.pass ? "PASS" : c.skipped ? "SKIP" : "FAIL"}] ${c.name}: ${c.detail}`);
      if (r.code === 2) {
        console.log(`GATE SKIP: ${target} missing — refusing to PASS a file that is not there`);
        process.exitCode = 2;
      } else if (r.pass) {
        const facts = r.checks.find((c) => c.name === "facts source exists");
        console.log(`GATE PASS: ${target} (${r.checks.length} checks green, facts: ${facts ? facts.detail : "n/a"})`);
      } else {
        console.log(`GATE FAIL: ${target}: ${r.errors[0]}`);
        process.exitCode = 1;
      }
    }
  } else {
    console.log("usage: node tools/brief.mjs gate <brief.json> | node tools/brief.mjs --check");
    process.exitCode = args.length < 1 ? 2 : 0;
  }
}
