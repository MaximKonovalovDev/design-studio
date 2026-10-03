// tools/orders-check.mjs: the order book `orders.csv` (S80, finish bars D1-D5).
//   node tools/orders-check.mjs            check every row (header, status, delivered path, adopted commit)
//   node tools/orders-check.mjs --covers   D5: live factory listings against adopted cover rows (exit 0 only when all are covered)
// Plain CSV: 9 fields, no comma inside a field. Rules live in AGENTS.md "Orders and delivery".
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const HEADER = "order_id,from_repo,product,brief,status,delivered_path,adopted,date,adopted_commit";
export const STATUSES = ["open", "building", "delivered", "adopted", "rejected"];
export const REPOS = ["factory", "marketing-studio", "jobhunt", "engine2040", "forge", "center"];
const PRODUCT = /^(cover:(itch|gumroad)\/[a-z0-9-]+|post-visual:[a-z0-9-]+|cv-layout:[a-z0-9-]+|game-ui:[a-z0-9-]+)$/;
const HASH = /^[0-9a-f]{7,40}$/;
const SCOREBOARD = process.env.FACTORY_SCOREBOARD || "C:/Users/me/Desktop/autonomous-factory/board/scoreboard.json";

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
export function checkOrders({ head, rows }, exists = (p) => existsSync(join(ROOT, p))) {
  const bad = [];
  if (head !== HEADER) bad.push(`header is not: ${HEADER}`);
  const seen = new Set();
  for (const r of rows) {
    const id = r.order_id || "(no id)";
    if (r.fields !== 9) bad.push(`${id}: ${r.fields} fields, want 9 (no comma inside a field)`);
    if (seen.has(r.order_id)) bad.push(`${id}: order_id twice`);
    seen.add(r.order_id);
    if (!REPOS.includes(r.from_repo)) bad.push(`${id}: from_repo ${r.from_repo} unknown`);
    if (!PRODUCT.test(r.product ?? "")) bad.push(`${id}: product ${r.product} must be cover:<itch|gumroad>/<slug>, post-visual:<campaign>, cv-layout:<name> or game-ui:<name>`);
    if (!STATUSES.includes(r.status)) bad.push(`${id}: status ${r.status} not one of ${STATUSES.join("/")}`);
    const out = r.status === "delivered" || r.status === "adopted";
    if (out && !(r.delivered_path && exists(r.delivered_path))) bad.push(`${id}: ${r.status} but delivered_path ${r.delivered_path || "(empty)"} is not on disk`);
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

const isMain = process.argv[1] && fileURLToPath(import.meta.url).replace(/\\/g, "/").toLowerCase() === process.argv[1].replace(/\\/g, "/").toLowerCase();
if (isMain) {
  const file = join(ROOT, "orders.csv");
  if (!existsSync(file)) { console.log("ORDERS FAIL: orders.csv is missing"); process.exit(1); }
  const book = parseOrders(readFileSync(file, "utf8"));
  if (process.argv.includes("--covers")) {
    let sb;
    try { sb = JSON.parse(readFileSync(SCOREBOARD, "utf8").replace(/^\uFEFF/, "")); } catch (e) { console.log(`COVERS FAIL: cannot read ${SCOREBOARD}: ${e.message}`); process.exit(1); }
    const c = coverStatus(book.rows, sb);
    const open = book.rows.filter((r) => c.missing.includes(r.product) && r.status !== "rejected").map((r) => `${r.order_id} ${r.status}`);
    console.log(`COVERS ${c.covered === c.live ? "PASS" : "OPEN"}: ${c.covered} of ${c.live} live factory listings have an adopted design-studio cover; ${open.length} of the missing ones have an order (${open.slice(0, 5).join(", ") || "none"})`);
    process.exit(c.covered === c.live && c.live > 0 ? 0 : 1);
  }
  const bad = checkOrders(book);
  const n = (s) => book.rows.filter((r) => r.status === s).length;
  for (const b of bad) console.log(`[FAIL] ${b}`);
  console.log(`ORDERS ${bad.length ? "FAIL" : "PASS"}: ${book.rows.length} orders (${STATUSES.map((s) => `${n(s)} ${s}`).join(", ")})${bad.length ? `, ${bad.length} problems` : ""}`);
  process.exit(bad.length ? 1 : 0);
}
