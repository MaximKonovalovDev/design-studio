// tools/orders-check.mjs: the order book `orders.csv` (S80, finish bars D1-D5).
//   node tools/orders-check.mjs            check every row (header, status, delivered path, adopted commit)
//   node tools/orders-check.mjs --covers   D5: live factory listings against adopted cover rows (exit 0 only when all are covered)
//   node tools/orders-check.mjs --desk [--date YYYY-MM-DD]
//                                          write sprint/queue/desk.md: one row per lane seat, derived only
//                                          from orders.csv and designs/<id>/ (tool sprint packet 0a)
// Plain CSV: 9 fields, no comma inside a field. Rules live in AGENTS.md "Orders and delivery".
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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
    const d = buildDesk(book.rows, { designsDir: join(ROOT, "designs"), date });
    mkdirSync(join(ROOT, "sprint/queue"), { recursive: true });
    writeFileSync(join(ROOT, "sprint/queue/desk.md"), `${d.lines.join("\n")}\n`);
    console.log(d.deskLine);
    process.exit(0);
  }
  const book = parseOrders(readFileSync(file, "utf8"));
  const bad = checkOrders(book);
  const n = (s) => book.rows.filter((r) => r.status === s).length;
  for (const b of bad) console.log(`[FAIL] ${b}`);
  console.log(`ORDERS ${bad.length ? "FAIL" : "PASS"}: ${book.rows.length} orders (${STATUSES.map((s) => `${n(s)} ${s}`).join(", ")})${bad.length ? `, ${bad.length} problems` : ""}`);
  process.exit(bad.length ? 1 : 0);
}
