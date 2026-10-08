// tools/orders-check.mjs: the order book `orders.csv` (S80, finish bars D1-D5).
//   LF only (DS-77 r2): orders.csv must hold 0 CR bytes; any CR count FAILs loudly.
//   node tools/orders-check.mjs            check every row (header, status, delivered path, adopted commit)
//   node tools/orders-check.mjs --covers   D5: live factory listings against adopted cover rows (exit 0 only when all are covered)
//   node tools/orders-check.mjs --desk [--date YYYY-MM-DD]
//                                          write sprint/queue/desk.md: one row per lane seat, derived only
//                                          from orders.csv and designs/<id>/ (tool sprint packet 0a)
//   node tools/orders-check.mjs --built <id>
//                                          packet 0b: folder completeness gate (exit 0 BUILT PASS, 1 BUILT FAIL)
//   node tools/orders-check.mjs --verdict <id> PASS|FAIL --line "BEATS ...; PICTURE ...; FACTS ...; FIT ...; LANE ..."
//                                          packet 0b: write designs/<id>/VERDICT.md (refuses PASS unless --built passes)
//   node tools/orders-check.mjs --deliver <id> [--check]
//                                          packet 0b remainder (NEED-09): copy a PASS folder into the customer
//                                          from-design-studio/<id>/, write designs/<id>/DELIVERED.json, set
//                                          orders.csv delivered; --check verifies the customer bytes
//   node tools/orders-check.mjs --round [--save]
//                                          packet 0b remainder (NEED-09): print the ROUND real yes/no line
//                                          (--save also writes sprint/queue/round.md; exit 1 when real no)
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pngDims } from "./render.mjs"; // single shared PNG-dims copy (home: tools/render.mjs)

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const HEADER = "order_id,from_repo,product,brief,status,delivered_path,adopted,date,adopted_commit";
export const STATUSES = ["open", "building", "delivered", "adopted", "rejected"];
export const REPOS = ["factory", "marketing-studio", "jobhunt", "engine2040", "forge", "center", "fp-research", "skillworks"];
const PRODUCT = /^(cover:(itch|gumroad)\/[a-z0-9-]+|post-visual:[a-z0-9-]+|cv-layout:[a-z0-9-]+|game-ui:[a-z0-9-]+|site-look:[a-z0-9-]+|page:[a-z0-9-]+|portfolio:[a-z0-9-]+|short-frame:[a-z0-9-]+|thumbnail:[a-z0-9-]+|order:[a-z0-9-]+)$/;
const HASH = /^[0-9a-f]{7,40}$/;
const SCOREBOARD = process.env.FACTORY_SCOREBOARD || "C:/Users/me/Desktop/autonomous-factory/board/scoreboard.json";

// Packet 0a: delivered_path counts in this repo or in any customer repo
// (dirs from C:/Users/me/Desktop/center/empire.json).
const EMPIRE_JSON = process.env.EMPIRE_JSON || "C:/Users/me/Desktop/center/empire.json";
let _dirs = null;
export function customerDirs() {
  if (_dirs) return _dirs;
  _dirs = [];
  try {
    const emp = JSON.parse(readFileSync(EMPIRE_JSON, "utf8"));
    for (const r of Object.values(emp.repos ?? {})) if (r && r.dir) _dirs.push(String(r.dir));
  } catch {
    // empire.json unreadable: the book still checks against this repo only.
  }
  return _dirs;
}

export function pathOnDisk(p) {
  if (!p) return false;
  if (existsSync(join(ROOT, p))) return true;
  return customerDirs().some((d) => {
    try {
      return existsSync(join(d, p));
    } catch {
      return false;
    }
  });
}

export function parseOrders(text) {
  const lines = String(text).split(/\r?\n/).filter((l) => l.trim());
  const head = lines.shift() ?? "";
  const rows = lines.map((l) => {
    const f = l.split(",");
    return { order_id: f[0], from_repo: f[1], product: f[2], brief: f[3], status: f[4], delivered_path: f[5], adopted: f[6], date: f[7], adopted_commit: f[8], fields: f.length };
  });
  return { head: head.trim(), rows };
}

// DS-77 r2: durable CR-byte gate. orders.csv is LF only: any CR byte (a CRLF
// regression) must FAIL loudly with the count, never pass silently.
export function countCR(buf) {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(String(buf ?? ""), "utf8");
  let n = 0;
  for (const x of b) if (x === 13) n += 1;
  return n;
}

// Returns the list of problems; empty means the book is clean.
export function checkOrders({ head, rows }, exists = pathOnDisk) {
  const bad = [];
  if (head !== HEADER) bad.push(`header is not: ${HEADER}`);
  const seen = new Set();
  for (const r of rows) {
    const id = r.order_id || "(no id)";
    if (r.fields !== 9) bad.push(`${id}: ${r.fields} fields, want 9 (no comma inside a field)`);
    if (seen.has(r.order_id)) bad.push(`${id}: order_id twice`);
    seen.add(r.order_id);
    if (!REPOS.includes(r.from_repo)) bad.push(`${id}: from_repo ${r.from_repo} unknown`);
    if (!PRODUCT.test(r.product ?? "")) bad.push(`${id}: product ${r.product} must be <kind>:<slug> for cover:<itch|gumroad>/<slug>, post-visual, cv-layout, game-ui, site-look, page, portfolio, short-frame, thumbnail or order`);
    if (!STATUSES.includes(r.status)) bad.push(`${id}: status ${r.status} not one of ${STATUSES.join("/")}`);
    const out = r.status === "delivered" || r.status === "adopted";
    if (out && !(r.delivered_path && exists(r.delivered_path))) bad.push(`${id}: ${r.status} but delivered_path ${r.delivered_path || "(empty)"} is not on disk here or in a customer repo`);
    if (r.status === "adopted" && !HASH.test(r.adopted_commit ?? "")) bad.push(`${id}: adopted needs the customer's commit hash in adopted_commit`);
    if ((r.adopted === "yes") !== (r.status === "adopted")) bad.push(`${id}: adopted ${r.adopted} does not match status ${r.status}`);
    if (r.status !== "adopted" && r.adopted_commit) bad.push(`${id}: adopted_commit set while status is ${r.status}`);
  }
  return bad;
}

// D5: every published factory listing needs a row cover:<store>/<slug> with status adopted.
export function coverStatus(rows, scoreboard) {
  const live = (scoreboard.products ?? []).filter((p) => p.published === true).map((p) => {
    const slug = String(p.url ?? "").split("/").filter(Boolean).pop();
    return `cover:${p.store === "itch.io" ? "itch" : "gumroad"}/${slug}`;
  });
  const adopted = new Set(rows.filter((r) => r.status === "adopted").map((r) => r.product));
  const missing = live.filter((k) => !adopted.has(k));
  return { live: live.length, covered: live.length - missing.length, missing };
}

// ---- packet 0a: the lane desk -----------------------------------------------
// Derived ONLY from orders.csv rows and the files in designs/<id>/. No clock
// inside a row: a row's text changes only when its state changes.
export const DESK_HEADER = "| ID | Status | Role | Stage | Order | What |";
// "Built" for packet 0a: the render plus its audit plus its review (packet 0b
// swaps this for --built).
export const WANTED = ["out.png", "design-audit.json", "DESIGN-REVIEW.md"];
export const LANES = {
  factory: "store",
  "marketing-studio": "social",
  jobhunt: "career",
  engine2040: "game",
  forge: "game",
  "fp-research": "lab",
  skillworks: "store",
};
export const laneFor = (repo) => LANES[repo] ?? String(repo);
const IMG = /\.(png|jpe?g|webp|gif|svg)$/i;

function dirEntries(id, designsDir) {
  try {
    return readdirSync(join(designsDir, id), { withFileTypes: true });
  } catch {
    return null;
  }
}

export function builtState(id, designsDir = join(ROOT, "designs")) {
  const entries = dirEntries(id, designsDir);
  if (!entries) return { folder: false, present: 0, wanted: WANTED.length, missing: WANTED.slice(), built: false };
  const names = new Set(entries.filter((e) => e.isFile()).map((e) => e.name));
  const missing = WANTED.filter((f) => !names.has(f));
  return { folder: true, present: WANTED.length - missing.length, wanted: WANTED.length, missing, built: missing.length === 0 };
}

// PASS, FAIL, or null (no verdict yet). Packet 0b owns the writer (--verdict).
export function readVerdict(id, designsDir = join(ROOT, "designs")) {
  let first = "";
  try {
    first = String(readFileSync(join(designsDir, id, "VERDICT.md"), "utf8")).split(/\r?\n/)[0] ?? "";
  } catch {
    return null;
  }
  const m = first.match(/^VERDICT:\s*(PASS|FAIL)\b/);
  return m ? m[1] : null;
}

// ---- packet 0b: the build gate and the verdict writer -----------------------
// --built <id>: the folder is complete (every file AGENTS.md "Orders and
// delivery" lists, every brief size at exact pixels, audit PASS, SHIP at 8
// or more, every real image it uses listed in assets.json). checkBuilt
// returns every check plus the first failing line; the CLI prints one
// BUILT line (exit 0 PASS, 1 FAIL).
// --verdict <id> PASS|FAIL --line "...": writes designs/<id>/VERDICT.md in
// the form readVerdict parses. Refuses PASS unless --built passes and the
// line carries all five sections; FAIL writes with any non-empty line (a
// built failure travels as its first failing line).
export const BUILT_FILES = ["brief.json", "page.html", "tokens.css", "thumb-256.png", "design-audit.json", "DESIGN-REVIEW.md", "DELIVERY.md"];
export const VERDICT_LABELS = ["BEATS", "PICTURE", "FACTS", "FIT", "LANE"];

// pngDims: single shared copy lives in ./render.mjs (imported above).

function expectedPngs(brief) {
  const main = brief?.size;
  const sizes = Array.isArray(brief?.sizes) && brief.sizes.length ? brief.sizes : (main ? [main] : []);
  return sizes.map((s) => ({ w: s?.w, h: s?.h, file: (main && s?.w === main.w && s?.h === main.h) ? "out.png" : `out-${s?.w}x${s?.h}.png` }));
}

const countLines = (text) => {
  const lines = String(text).split(/\r?\n/);
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.length;
};

export function checkBuilt(id, { designsDir = join(ROOT, "designs") } = {}) {
  const dir = join(designsDir, id);
  const checks = [];
  const t = (name, pass, detail) => { checks.push({ name, pass: !!pass, detail }); return !!pass; };
  const done = () => {
    const f0 = checks.find((c) => !c.pass);
    return { id, pass: !f0, checks, fail: f0 ? `${f0.name}: ${f0.detail}` : null };
  };
  if (!existsSync(dir)) {
    t("folder", false, `no folder designs/${id}`);
    return done();
  }
  t("folder", true, `designs/${id} exists`);
  for (const f of BUILT_FILES) t(`file ${f}`, existsSync(join(dir, f)), existsSync(join(dir, f)) ? `${f} on disk` : `missing designs/${id}/${f}`);
  let brief = null;
  if (existsSync(join(dir, "brief.json"))) {
    try {
      brief = JSON.parse(readFileSync(join(dir, "brief.json"), "utf8"));
      t("brief parses", true, String(brief.title ?? id));
    } catch (e) { t("brief parses", false, `brief.json does not parse: ${e.message}`); }
  }
  if (brief) {
    const want = expectedPngs(brief);
    if (!want.length) t("sizes", false, "brief.json has no size");
    for (const s of want) {
      const p = join(dir, s.file);
      if (!existsSync(p)) { t(`size ${s.w}x${s.h}`, false, `missing designs/${id}/${s.file}, want ${s.w}x${s.h}`); continue; }
      let d = null;
      try { d = pngDims(readFileSync(p)); } catch { t(`size ${s.w}x${s.h}`, false, `${s.file} is not a PNG`); continue; }
      t(`size ${s.w}x${s.h}`, d.w === s.w && d.h === s.h, d.w === s.w && d.h === s.h ? `${s.file} ${d.w}x${d.h}` : `${s.file} is ${d.w}x${d.h}, want ${s.w}x${s.h}`);
    }
  }
  if (existsSync(join(dir, "thumb-256.png"))) {
    try {
      const d = pngDims(readFileSync(join(dir, "thumb-256.png")));
      t("thumb", d.w === 256, d.w === 256 ? `thumb-256.png ${d.w}x${d.h}` : `thumb-256.png is ${d.w}x${d.h}, want width 256`);
    } catch { t("thumb", false, "thumb-256.png is not a PNG"); }
  }
  if (existsSync(join(dir, "design-audit.json"))) {
    try {
      const a = JSON.parse(readFileSync(join(dir, "design-audit.json"), "utf8"));
      if (a.pass === true) t("audit", true, "design-audit.json PASS");
      else {
        const f0 = (a.checks ?? []).find((c) => !c.pass);
        t("audit", false, `design-audit.json is not PASS${f0 ? ` (first: ${f0.name})` : ""}`);
      }
    } catch (e) { t("audit", false, `design-audit.json does not parse: ${e.message}`); }
  }
  if (existsSync(join(dir, "DESIGN-REVIEW.md"))) {
    const text = String(readFileSync(join(dir, "DESIGN-REVIEW.md"), "utf8"));
    const m = text.match(/(\d+)\s*\/\s*10/);
    const score = m ? Number(m[1]) : null;
    const ship = /\bSHIP\b/.test(text);
    const ok = ship && score !== null && score >= 8;
    t("review", ok, ok ? `DESIGN-REVIEW.md SHIP ${score}/10` : `DESIGN-REVIEW.md is ${ship ? `SHIP ${score ?? "?"}/10` : "not SHIP"}, want SHIP >=8/10`);
  }
  if (existsSync(join(dir, "DELIVERY.md"))) {
    const n = countLines(readFileSync(join(dir, "DELIVERY.md"), "utf8"));
    t("delivery", n >= 1 && n <= 10, n >= 1 && n <= 10 ? `DELIVERY.md ${n} lines` : `DELIVERY.md has ${n} lines, want 1-10`);
  }
  if (existsSync(join(dir, "assets.json"))) {
    let aj = null;
    try { aj = JSON.parse(readFileSync(join(dir, "assets.json"), "utf8")); } catch (e) { t("assets", false, `assets.json does not parse: ${e.message}`); }
    if (aj) {
      if (!Array.isArray(aj.assets)) t("assets", false, "assets.json has no assets array");
      else {
        const listed = new Map(aj.assets.map((a) => [String(a?.file), a]));
        const refs = new Set();
        if (existsSync(join(dir, "page.html"))) {
          for (const m of String(readFileSync(join(dir, "page.html"), "utf8")).matchAll(/assets\/[A-Za-z0-9._-]+/g)) refs.add(m[0]);
        }
        if (Array.isArray(brief?.assets)) for (const a of brief.assets) { const s = String(a); if (s.startsWith("assets/")) refs.add(s); }
        let ok = true;
        for (const r of [...refs].sort()) {
          if (!listed.has(r)) { t("assets", false, `${r} used but not listed in assets.json`); ok = false; }
        }
        if (ok) {
          for (const [f, e] of [...listed.entries()].sort()) {
            const fp = join(dir, f);
            if (!existsSync(fp)) { t("assets", false, `${f} listed in assets.json but missing on disk`); ok = false; break; }
            const size = statSync(fp).size;
            if (e && e.bytes != null && size !== Number(e.bytes)) { t("assets", false, `${f} is ${size}B on disk, assets.json says ${e.bytes}B`); ok = false; break; }
            if (e && e.sha256) {
              const h = createHash("sha256").update(readFileSync(fp)).digest("hex");
              if (h !== String(e.sha256).toLowerCase()) { t("assets", false, `${f} sha256 mismatch`); ok = false; break; }
            }
          }
        }
        if (ok) t("assets", true, listed.size ? `${listed.size} asset(s) listed and on disk` : "no real pictures used (typographic build)");
      }
    }
  }
  return done();
}

// Split only before a known label so a section may carry ";" inside (O-024 BEATS does).
export function parseVerdictLine(line) {
  const parts = String(line ?? "").split(/;\s*(?=(?:BEATS|PICTURE|FACTS|FIT|LANE)\s*:?)/g).map((s) => s.trim()).filter(Boolean);
  const map = new Map();
  for (const p of parts) {
    const m = p.match(/^([A-Z]+)\s*:?\s*([\s\S]*)$/);
    if (m && VERDICT_LABELS.includes(m[1]) && !map.has(m[1])) map.set(m[1], `${m[1]}: ${m[2].trim()}`);
  }
  return { parts, map };
}

export function writeVerdict(id, verdict, line, { designsDir = join(ROOT, "designs") } = {}) {
  const v = String(verdict ?? "").toUpperCase();
  if (v !== "PASS" && v !== "FAIL") return { ok: false, message: `VERDICT REFUSED: ${id} wants ${verdict ?? "(no verdict)"}, want PASS or FAIL` };
  const { parts, map } = parseVerdictLine(line);
  if (!parts.length) return { ok: false, message: `VERDICT REFUSED: ${id} ${v} refused (empty --line)` };
  if (v === "PASS") {
    const built = checkBuilt(id, { designsDir });
    if (!built.pass) return { ok: false, message: `VERDICT REFUSED: ${id} PASS refused (BUILT FAIL: ${built.fail})` };
    const missing = VERDICT_LABELS.filter((l) => !map.has(l));
    if (missing.length) return { ok: false, message: `VERDICT REFUSED: ${id} PASS refused (missing ${missing.join(", ")})` };
  }
  const dir = join(designsDir, id);
  if (!existsSync(dir)) return { ok: false, message: `VERDICT REFUSED: ${id} refused (no folder designs/${id})` };
  const body = v === "PASS" ? VERDICT_LABELS.map((l) => map.get(l)) : parts;
  const path = join(dir, "VERDICT.md");
  writeFileSync(path, [`VERDICT: ${v} ${id}`, ...body].join("\n") + "\n");
  return { ok: true, path, message: `VERDICT ${v}: ${id} -> designs/${id}/VERDICT.md` };
}

// ---- packet 0b remainder: --deliver and --round ---------------------------
// --deliver <id>: copies a PASS folder into the customer repo under
// from-design-studio/<id>/ (factory: <product folder>/covers/
// from-design-studio/<id>/, Maxim S84), writes designs/<id>/DELIVERED.json
// (customer path + sha256 of each file) and sets the orders.csv row to
// delivered with delivered_path. Refuses unless VERDICT is PASS and --built
// passes; refuses to overwrite a customer file that differs. Never touches
// a customer file outside from-design-studio/.
// --deliver <id> --check: verifies every file in the customer folder has
// the bytes+sha256 in designs/<id>/DELIVERED.json.
// --round [--save]: prints ROUND: real yes|no | built | judged | delivered
// | adopted | tools | unjudged-oldest | in-flight. real no (exit 1) means
// no uncommitted real file (designs/, tools/, tests/, packs/, kits/,
// samples/, fonts/, templates/) this round: no handoff commit. --save also
// writes sprint/queue/round.md.
export function customerDirFor(repo, empireJson = EMPIRE_JSON) {
  try {
    const emp = JSON.parse(readFileSync(empireJson, "utf8"));
    const d = emp?.repos?.[repo]?.dir;
    return d ? String(d) : null;
  } catch {
    return null;
  }
}

export function resolveLanding(id, row, designsDir = join(ROOT, "designs")) {
  const dir = join(designsDir, id);
  try {
    const spec = JSON.parse(readFileSync(join(dir, "cover.json"), "utf8"));
    if (spec?.landing && String(spec.landing).includes("from-design-studio")) {
      return String(spec.landing).replace(/\/+$/, "");
    }
  } catch { /* no cover.json landing */ }
  try {
    const md = String(readFileSync(join(dir, "DELIVERY.md"), "utf8"));
    const m = md.match(/`([^`]*from-design-studio\/[^`]*)`/);
    if (m) return m[1].replace(/\/+$/, "");
  } catch { /* no DELIVERY.md landing */ }
  if (row?.from_repo === "factory") return null;
  return `from-design-studio/${id}`;
}

function walkFiles(abs) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) out.push(p);
    }
  };
  walk(abs);
  return out;
}

export function collectDesignFiles(id, designsDir = join(ROOT, "designs")) {
  const dir = join(designsDir, id);
  return walkFiles(dir)
    .filter((p) => !p.replace(/\\/g, "/").endsWith("/DELIVERED.json"))
    .map((abs) => {
      const rel = abs.slice(dir.length + 1).replace(/\\/g, "/");
      const buf = readFileSync(abs);
      return { rel, abs, bytes: buf.length, sha256: createHash("sha256").update(buf).digest("hex") };
    })
    .sort((a, b) => (a.rel < b.rel ? -1 : 1));
}

export function runDeliver(id, { designsDir = join(ROOT, "designs"), ordersPath = join(ROOT, "orders.csv"), empireJson = EMPIRE_JSON, now = null } = {}) {
  const raw = readFileSync(ordersPath, "utf8");
  const crDeliver = countCR(Buffer.from(raw, "utf8"));
  if (crDeliver > 0) return { ok: false, message: `DELIVER FAIL: orders.csv holds ${crDeliver} CR bytes (want 0, LF only)` };
  const book = parseOrders(raw);
  const row = book.rows.find((r) => r.order_id === id);
  if (!row) return { ok: false, message: `DELIVER FAIL: ${id} has no orders.csv row` };
  if (!REPOS.includes(row.from_repo)) return { ok: false, message: `DELIVER FAIL: ${id} from_repo ${row.from_repo} unknown` };
  const verdict = readVerdict(id, designsDir);
  if (verdict !== "PASS") return { ok: false, message: `DELIVER REFUSED: ${id} needs VERDICT PASS (has ${verdict ?? "none"})` };
  const built = checkBuilt(id, { designsDir });
  if (!built.pass) return { ok: false, message: `DELIVER REFUSED: ${id} BUILT FAIL: ${built.fail}` };
  const landing = resolveLanding(id, row, designsDir);
  if (!landing) return { ok: false, message: `DELIVER REFUSED: ${id} factory order needs its landing in cover.json or DELIVERY.md (covers/from-design-studio/${id}/)` };
  if (!landing.includes("from-design-studio/")) return { ok: false, message: `DELIVER REFUSED: ${id} landing ${landing} is outside from-design-studio/` };
  const customerRoot = customerDirFor(row.from_repo, empireJson);
  if (!customerRoot) return { ok: false, message: `DELIVER FAIL: ${id} no customer dir for ${row.from_repo} in empire.json` };
  const dest = join(customerRoot, landing.replace(/\//g, process.platform === "win32" ? "\\" : "/"));
  const files = collectDesignFiles(id, designsDir);
  if (!files.length) return { ok: false, message: `DELIVER FAIL: ${id} designs/${id} holds no files` };
  mkdirSync(dest, { recursive: true });
  let copied = 0;
  let identical = 0;
  for (const f of files) {
    const target = join(dest, f.rel.replace(/\//g, process.platform === "win32" ? "\\" : "/"));
    mkdirSync(dirname(target), { recursive: true });
    if (existsSync(target)) {
      const cur = readFileSync(target);
      const h = createHash("sha256").update(cur).digest("hex");
      if (h !== f.sha256) return { ok: false, message: `DELIVER REFUSED: ${id} ${f.rel} differs in ${row.from_repo} (refuses to overwrite a file that differs)` };
      identical += 1;
      continue;
    }
    copyFileSync(f.abs, target);
    copied += 1;
  }
  const utc = now ?? `${new Date().toISOString().slice(0, 16)}Z`;
  const delivered = {
    order_id: id,
    from_repo: row.from_repo,
    maker: "design-studio",
    product: row.product,
    delivered_utc: utc,
    source: `design-studio designs/${id}`,
    landing: landing.replace(/\/+$/, ""),
    customer: customerRoot.replace(/\\/g, "/"),
    delivered: [`${files.length} files copied verbatim (refuse-overwrite-if-differs)`, `landing ${landing.replace(/\/+$/, "")}/ in ${row.from_repo}`],
    files: files.map((f) => ({ name: f.rel, bytes: f.bytes, sha256: f.sha256 })),
  };
  writeFileSync(join(designsDir, id, "DELIVERED.json"), `${JSON.stringify(delivered, null, 2)}\n`);
  const endsNl = raw.endsWith("\n");
  const lines = String(raw).replace(/\r\n/g, "\n").split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  const idx = lines.findIndex((l) => l.split(",")[0] === id);
  if (idx !== -1) {
    const f = lines[idx].split(",");
    f[4] = "delivered";
    f[5] = landing.replace(/\/+$/, "");
    lines[idx] = f.join(",");
    writeFileSync(ordersPath, `${lines.join("\n")}${endsNl ? "\n" : ""}`);
  }
  return { ok: true, dest, copied, identical, files: files.length, landing: landing.replace(/\/+$/, ""), message: `DELIVER PASS: ${id} -> ${row.from_repo}/${landing.replace(/\/+$/, "")}/ (${files.length} files, ${copied} copied ${identical} identical)` };
}

export function checkDeliver(id, { designsDir = join(ROOT, "designs"), empireJson = EMPIRE_JSON } = {}) {
  const dir = join(designsDir, id);
  let rec = null;
  try {
    rec = JSON.parse(readFileSync(join(dir, "DELIVERED.json"), "utf8"));
  } catch (e) {
    return { ok: false, message: `DELIVER CHECK FAIL: ${id} designs/${id}/DELIVERED.json unreadable (${e.message})` };
  }
  const customerRoot = customerDirFor(rec.from_repo, empireJson);
  if (!customerRoot) return { ok: false, message: `DELIVER CHECK FAIL: ${id} no customer dir for ${rec.from_repo}` };
  const dest = join(customerRoot, String(rec.landing ?? "").replace(/\//g, process.platform === "win32" ? "\\" : "/"));
  if (!existsSync(dest)) return { ok: false, message: `DELIVER CHECK FAIL: ${id} customer folder ${rec.from_repo}/${rec.landing}/ is missing` };
  const want = new Map((rec.files ?? []).map((f) => [String(f.name), f]));
  const actual = walkFiles(dest).map((abs) => abs.slice(dest.length + 1).replace(/\\/g, "/")).sort();
  for (const rel of actual) {
    const w = want.get(rel);
    if (!w) return { ok: false, message: `DELIVER CHECK FAIL: ${id} ${rel} in customer folder but not in DELIVERED.json` };
    const buf = readFileSync(join(dest, rel.replace(/\//g, process.platform === "win32" ? "\\" : "/")));
    if (buf.length !== Number(w.bytes)) return { ok: false, message: `DELIVER CHECK FAIL: ${id} ${rel} is ${buf.length}B, DELIVERED.json says ${w.bytes}B` };
    const h = createHash("sha256").update(buf).digest("hex");
    if (h !== String(w.sha256).toLowerCase()) return { ok: false, message: `DELIVER CHECK FAIL: ${id} ${rel} sha256 mismatch` };
  }
  for (const rel of [...want.keys()].sort()) {
    if (!actual.includes(rel)) return { ok: false, message: `DELIVER CHECK FAIL: ${id} ${rel} in DELIVERED.json but missing in customer folder` };
  }
  return { ok: true, message: `DELIVER CHECK PASS: ${id} (${actual.length}/${want.size} files)` };
}

const REAL_PREFIXES = ["designs/", "tools/", "tests/", "packs/", "kits/", "samples/", "fonts/", "templates/"];

export function roundState({ rows, designsDir = join(ROOT, "designs"), arsenalPath = join(ROOT, "arsenal.json"), porcelain = null } = {}) {
  let built = 0;
  let judged = 0;
  for (const r of rows) {
    try {
      if (checkBuilt(r.order_id, { designsDir }).pass) built += 1;
    } catch { /* a broken folder counts as not built */ }
    if (readVerdict(r.order_id, designsDir) === "PASS") judged += 1;
  }
  const delivered = rows.filter((r) => r.status === "delivered").length;
  const adopted = rows.filter((r) => r.status === "adopted").length;
  let tools = 0;
  try {
    tools = (JSON.parse(readFileSync(arsenalPath, "utf8")).tools ?? []).length;
  } catch { tools = 0; }
  const unjudged = rows.find((r) => (r.status === "open" || r.status === "building") && readVerdict(r.order_id, designsDir) == null);
  const inFlight = rows.filter((r) => r.status === "open" || r.status === "building").length;
  let real = false;
  try {
    const p = porcelain ?? String(execSync("git status --porcelain", { cwd: ROOT, encoding: "utf8" }));
    real = p.split("\n").some((l) => {
      const f = l.slice(3).trim().replace(/\\/g, "/").replace(/^"|"$/g, "");
      return REAL_PREFIXES.some((pre) => f.startsWith(pre));
    });
  } catch {
    real = built > 0 && judged > 0;
  }
  const line = `ROUND: real ${real ? "yes" : "no"} | built ${built} | judged ${judged} | delivered ${delivered} | adopted ${adopted} | tools ${tools} | unjudged-oldest ${unjudged ? unjudged.order_id : "none"} | in-flight ${inFlight}`;
  return { built, judged, delivered, adopted, tools, unjudged: unjudged ? unjudged.order_id : "none", inFlight, real, line };
}

function previewPics(id, designsDir) {
  let entries = null;
  try {
    entries = readdirSync(join(designsDir, id, "preview"), { withFileTypes: true });
  } catch {
    return { count: 0, newest: null };
  }
  const pics = entries.filter((e) => e.isFile() && IMG.test(e.name)).map((e) => e.name);
  let newest = null;
  let newestT = -1;
  for (const n of pics) {
    if (!/^cover-.*\.png$/i.test(n)) continue;
    let t = 0;
    try {
      t = statSync(join(designsDir, id, "preview", n)).mtimeMs;
    } catch {
      continue;
    }
    if (t > newestT || (t === newestT && (newest === null || n < newest))) {
      newest = n;
      newestT = t;
    }
  }
  return { count: pics.length, newest };
}

// The current asset to beat: the preview path the brief names, else the
// newest preview/cover-*.png, else none.
export function beatAsset(brief, previewNewest) {
  const m = String(brief ?? "").match(/\S*preview\/\S+/);
  if (m) return m[0].replace(/[.,;)"']+$/, "");
  if (previewNewest) return `preview/${previewNewest}`;
  return "none";
}

const cell = (s) => String(s ?? "").replace(/[|\r\n]+/g, " ").trim();
const deskRow = (id, status, role, stage, order, what) =>
  `| ${cell(id)} | ${cell(status)} | ${cell(role)} | ${cell(stage)} | ${cell(order)} | ${cell(what)} |`;

export function buildDesk(rows, { designsDir = join(ROOT, "designs"), date = new Date().toISOString().slice(0, 10) } = {}) {
  const verdictOf = new Map(rows.map((r) => [r.order_id, readVerdict(r.order_id, designsDir)]));
  const failed = rows.filter((r) => verdictOf.get(r.order_id) === "FAIL").length;
  const dlv = [];
  const jdg = [];
  const bld = [];
  for (const r of rows) {
    if (r.status !== "open" && r.status !== "building") continue;
    const verdict = verdictOf.get(r.order_id);
    if (verdict === "FAIL") continue; // keeper's chain owns the repair run, not the desk
    const st = builtState(r.order_id, designsDir);
    const prev = previewPics(r.order_id, designsDir);
    const what = `${r.product} ${r.from_repo} ${st.present}/${st.wanted} files ${prev.count} preview pics beat: ${beatAsset(r.brief, prev.newest)}`;
    if (verdict === "PASS") {
      dlv.push(deskRow(`DLV-${r.order_id}`, "READY", "builder", "stage=deliver", r.order_id, what));
    } else if (st.built) {
      jdg.push(deskRow(`JDG-${r.order_id}`, "CHAIN", "judge", "stage=judge", r.order_id, what));
    } else {
      const repair = st.folder && st.missing.length ? ` repair: missing ${st.missing[0]}` : "";
      bld.push(deskRow(`BLD-${r.order_id}`, "READY", "builder", `stage=build-${laneFor(r.from_repo)}`, r.order_id, what + repair));
    }
  }
  const openCount = rows.filter((r) => r.status === "open" || r.status === "building").length;
  const eye = deskRow(`EYE-${date}`, "READY", "pilot", "stage=eye", date, `daily eye sweep over ${openCount} open orders (${jdg.length} unjudged)`);
  const lines = [DESK_HEADER, ...dlv, ...jdg, ...bld, eye];
  const deskLine = `DESK: build ${bld.length} | judge ${jdg.length} | failed ${failed} | deliver ${dlv.length} | eye 1`;
  return { header: DESK_HEADER, lines, deskLine, counts: { build: bld.length, judge: jdg.length, failed, deliver: dlv.length, eye: 1 } };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url).replace(/\\/g, "/").toLowerCase() === process.argv[1].replace(/\\/g, "/").toLowerCase();
if (isMain) {
  const file = join(ROOT, "orders.csv");
  if (!existsSync(file)) { console.log("ORDERS FAIL: orders.csv is missing"); process.exit(1); }
  if (process.argv.includes("--covers")) {
    let sb;
    try { sb = JSON.parse(readFileSync(SCOREBOARD, "utf8").replace(/^\uFEFF/, "")); } catch (e) { console.log(`COVERS FAIL: cannot read ${SCOREBOARD}: ${e.message}`); process.exit(1); }
    const book = parseOrders(readFileSync(file, "utf8"));
    const c = coverStatus(book.rows, sb);
    const crCovers = countCR(readFileSync(file));
    if (crCovers > 0) { console.log(`COVERS FAIL: orders.csv holds ${crCovers} CR bytes (want 0, LF only)`); process.exit(1); }
    const open = book.rows.filter((r) => c.missing.includes(r.product) && r.status !== "rejected").map((r) => `${r.order_id} ${r.status}`);
    console.log(`COVERS ${c.covered === c.live ? "PASS" : "OPEN"}: ${c.covered} of ${c.live} live factory listings have an adopted design-studio cover; ${open.length} of the missing ones have an order (${open.slice(0, 5).join(", ") || "none"})`);
    process.exit(c.covered === c.live && c.live > 0 ? 0 : 1);
  }
  if (process.argv.includes("--desk")) {
    const di = process.argv.indexOf("--date");
    let date = new Date().toISOString().slice(0, 10);
    if (di !== -1) {
      date = process.argv[di + 1] ?? "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { console.log("DESK FAIL: --date wants YYYY-MM-DD"); process.exit(1); }
    }
    const book = parseOrders(readFileSync(file, "utf8"));
    const crDesk = countCR(readFileSync(file));
    if (crDesk > 0) { console.log(`DESK FAIL: orders.csv holds ${crDesk} CR bytes (want 0, LF only)`); process.exit(1); }
    const d = buildDesk(book.rows, { designsDir: join(ROOT, "designs"), date });
    mkdirSync(join(ROOT, "sprint/queue"), { recursive: true });
    writeFileSync(join(ROOT, "sprint/queue/desk.md"), `${d.lines.join("\n")}\n`);
    console.log(d.deskLine);
    process.exit(0);
  }
  if (process.argv.includes("--built")) {
    const id = process.argv[process.argv.indexOf("--built") + 1];
    if (!id || id.startsWith("--")) { console.log("BUILT FAIL: (no id) usage: node tools/orders-check.mjs --built <order-id>"); process.exit(1); }
    const r = checkBuilt(id);
    const n = r.checks.filter((c) => c.pass).length;
    console.log(r.pass ? `BUILT PASS: ${id} (${n}/${r.checks.length} checks)` : `BUILT FAIL: ${id} ${r.fail}`);
    process.exit(r.pass ? 0 : 1);
  }
  if (process.argv.includes("--verdict")) {
    const vi = process.argv.indexOf("--verdict");
    const id = process.argv[vi + 1];
    const verdict = process.argv[vi + 2];
    const li = process.argv.indexOf("--line");
    const line = li !== -1 ? process.argv[li + 1] : undefined;
    if (!id || id.startsWith("--") || !verdict || verdict.startsWith("--") || !line) {
      console.log(`VERDICT REFUSED: usage: node tools/orders-check.mjs --verdict <id> PASS|FAIL --line "BEATS ...; PICTURE ...; FACTS ...; FIT ...; LANE ..."`);
      process.exit(1);
    }
    const r = writeVerdict(id, verdict, line);
    console.log(r.ok ? r.message : r.message);
    process.exit(r.ok ? 0 : 1);
  }
  if (process.argv.includes("--deliver")) {
    const di = process.argv.indexOf("--deliver");
    const id = process.argv[di + 1];
    if (!id || id.startsWith("--")) { console.log("DELIVER FAIL: (no id) usage: node tools/orders-check.mjs --deliver <order-id> [--check]"); process.exit(1); }
    try {
      if (process.argv.includes("--check")) {
        const r = checkDeliver(id);
        console.log(r.message);
        process.exit(r.ok ? 0 : 1);
      }
      const r = runDeliver(id);
      console.log(r.message);
      process.exit(r.ok ? 0 : 1);
    } catch (e) {
      console.log(`DELIVER FAIL: ${id} ${e.message}`);
      process.exit(1);
    }
  }
  if (process.argv.includes("--round")) {
    const rawRound = readFileSync(file);
    const crRound = countCR(rawRound);
    if (crRound > 0) { console.log(`ROUND FAIL: orders.csv holds ${crRound} CR bytes (want 0, LF only)`); process.exit(1); }
    const book = parseOrders(rawRound.toString("utf8"));
    const r = roundState({ rows: book.rows });
    if (process.argv.includes("--save")) {
      mkdirSync(join(ROOT, "sprint/queue"), { recursive: true });
      const date = new Date().toISOString().slice(0, 10);
      writeFileSync(join(ROOT, "sprint/queue/round.md"), `# round ${date}\n${r.line}\n`);
    }
    console.log(r.line);
    process.exit(r.real ? 0 : 1);
  }
  const rawOrders = readFileSync(file);
  const crOrders = countCR(rawOrders);
  const book = parseOrders(rawOrders.toString("utf8"));
  const bad = checkOrders(book);
  if (crOrders > 0) bad.unshift(`orders.csv holds ${crOrders} CR bytes (want 0, LF only)`);
  const n = (s) => book.rows.filter((r) => r.status === s).length;
  for (const b of bad) console.log(`[FAIL] ${b}`);
  console.log(`ORDERS ${bad.length ? "FAIL" : "PASS"}: ${book.rows.length} orders (${STATUSES.map((s) => `${n(s)} ${s}`).join(", ")})${bad.length ? `, ${bad.length} problems` : ""}`);
  process.exit(bad.length ? 1 : 0);
}
