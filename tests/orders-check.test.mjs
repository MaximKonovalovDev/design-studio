// tests/orders-check.test.mjs: the order book rules (S80) without touching the real orders.csv.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HEADER, beatAsset, buildDesk, checkBuilt, checkDeliver, checkOrders, collectDesignFiles, coverStatus, customerDirFor, laneFor, parseOrders, pathOnDisk, readVerdict, resolveLanding, roundState, runDeliver, writeVerdict, DESK_HEADER } from "../tools/orders-check.mjs";

const row = (o) => ({ order_id: "O-9", from_repo: "factory", product: "cover:gumroad/x", brief: "b", status: "open", delivered_path: "", adopted: "no", date: "2026-10-03", adopted_commit: "", ...o });
const csv = (...rows) => [HEADER, ...rows.map((r) => Object.values(row(r)).join(","))].join("\n");
const book = (...rows) => parseOrders(csv(...rows));

describe("orders.csv rules", () => {
  it("a clean open order passes, CRLF too", () => {
    assert.deepEqual(checkOrders(book({})), []);
    assert.deepEqual(checkOrders(parseOrders(csv({}).replace(/\n/g, "\r\n"))), []);
  });
  it("a wrong header, status, product or field count fails", () => {
    assert.ok(checkOrders(parseOrders(csv({}).replace("order_id", "id"))).length);
    assert.ok(checkOrders(book({ status: "done" })).length);
    assert.ok(checkOrders(book({ product: "cover:etsy/x" })).length);
    assert.ok(checkOrders(parseOrders(`${HEADER}\nO-1,factory,cover:gumroad/x,a,b,open,,no,2026-10-03,`)).length);
  });
  it("delivered needs a path on disk; adopted needs a commit hash and adopted yes", () => {
    assert.ok(checkOrders(book({ status: "delivered", delivered_path: "designs/O-9" }), () => false).length);
    assert.deepEqual(checkOrders(book({ status: "delivered", delivered_path: "designs/O-9" }), () => true), []);
    assert.ok(checkOrders(book({ status: "adopted", adopted: "yes", delivered_path: "designs/O-9" }), () => true).length);
    assert.deepEqual(checkOrders(book({ status: "adopted", adopted: "yes", delivered_path: "designs/O-9", adopted_commit: "abc1234" }), () => true), []);
  });
  it("accepts fp-research and every empire kind, including order:", () => {
    const kinds = ["cover:gumroad/x", "cover:itch/x", "post-visual:c", "cv-layout:c", "game-ui:k", "site-look:s", "page:p", "portfolio:pf", "short-frame:sf", "thumbnail:t", "order:my-slug-1"];
    for (const product of kinds) assert.deepEqual(checkOrders(book({ product })), [], product);
    assert.deepEqual(checkOrders(book({ from_repo: "fp-research", product: "order:probe-kit" })), []);
    assert.ok(checkOrders(book({ from_repo: "nope" })).length);
    assert.ok(checkOrders(book({ product: "banner:x" })).length);
  });
  it("delivered_path counts in this repo or a customer repo", () => {
    assert.equal(pathOnDisk("orders.csv"), true);
    assert.equal(pathOnDisk("no-such-thing-xyz"), false);
  });
});

describe("D5 cover coverage", () => {
  const sb = { products: [
    { store: "gumroad", url: "https://maxkonova.gumroad.com/l/a", published: true },
    { store: "itch.io", url: "https://sabako.itch.io/b", published: true },
    { store: "itch.io", url: "https://sabako.itch.io/c", published: false },
  ] };
  it("counts only published listings and only adopted rows", () => {
    const rows = [row({ product: "cover:gumroad/a", status: "adopted" }), row({ order_id: "O-8", product: "cover:itch/b", status: "delivered" })];
    const c = coverStatus(rows, sb);
    assert.equal(c.live, 2);
    assert.equal(c.covered, 1);
    assert.deepEqual(c.missing, ["cover:itch/b"]);
  });
});

describe("desk (tool sprint packet 0a)", () => {
  const TRIO = ["out.png", "design-audit.json", "DESIGN-REVIEW.md"];
  const fixture = () => {
    const dz = join(mkdtempSync(join(tmpdir(), "desk-")), "designs");
    const mk = (id, files, verdict) => {
      mkdirSync(join(dz, id), { recursive: true });
      for (const f of files) writeFileSync(join(dz, id, f), "x");
      if (verdict) writeFileSync(join(dz, id, "VERDICT.md"), `VERDICT: ${verdict}\nBEATS x\nPICTURE x\nFACTS x\nFIT x\nLANE x\n`);
    };
    mk("O-B", TRIO, null);
    mkdirSync(join(dz, "O-B", "preview"), { recursive: true });
    writeFileSync(join(dz, "O-B", "preview", "cover-a-1280x720.png"), "x");
    mk("O-C", TRIO, "PASS");
    mk("O-D", TRIO, "FAIL");
    mk("O-E", TRIO, null);
    mk("O-F", ["out.png"], null);
    // O-A has no folder at all.
    const rows = parseOrders(csv(
      { order_id: "O-A", product: "post-visual:c", from_repo: "marketing-studio", brief: "launch art" },
      { order_id: "O-B", product: "cover:gumroad/x", brief: "Factory-made cover to beat: preview/cover-old.png." },
      { order_id: "O-C", product: "cover:itch/y", brief: "re-cover" },
      { order_id: "O-D", product: "page:z", from_repo: "fp-research", brief: "lab page" },
      { order_id: "O-E", product: "cover:gumroad/w", status: "delivered", delivered_path: "designs/O-E" },
      { order_id: "O-F", product: "order:probe-kit", from_repo: "fp-research", brief: "lab order with no preview token" },
    )).rows;
    return { dz, rows };
  };
  it("lanes map every customer", () => {
    assert.equal(laneFor("factory"), "store");
    assert.equal(laneFor("marketing-studio"), "social");
    assert.equal(laneFor("jobhunt"), "career");
    assert.equal(laneFor("forge"), "game");
    assert.equal(laneFor("fp-research"), "lab");
  });
  it("the beat asset is the brief path, else the newest preview cover, else none", () => {
    assert.equal(beatAsset("Beat: preview/cover-old.png.", null), "preview/cover-old.png");
    assert.equal(beatAsset("nothing named", "cover-z-630x500.png"), "preview/cover-z-630x500.png");
    assert.equal(beatAsset("nothing named", null), "none");
  });
  it("lists deliver, judge, then oldest-first build rows plus one eye row", () => {
    const { dz, rows } = fixture();
    const d = buildDesk(rows, { designsDir: dz, date: "2026-10-04" });
    assert.equal(d.lines[0], DESK_HEADER);
    const ids = d.lines.slice(1).map((l) => l.split("|")[1].trim());
    assert.deepEqual(ids, ["DLV-O-C", "JDG-O-B", "BLD-O-A", "BLD-O-F", "EYE-2026-10-04"]);
    assert.equal(d.deskLine, "DESK: build 2 | judge 1 | failed 1 | deliver 1 | eye 1");
    const byId = new Map(d.lines.slice(1).map((l) => [l.split("|")[1].trim(), l]));
    assert.match(byId.get("BLD-O-F"), /stage=build-lab/);
    assert.match(byId.get("BLD-O-F"), /repair: missing design-audit\.json \|$/);
    assert.doesNotMatch(byId.get("BLD-O-A"), /repair:/);
    assert.match(byId.get("JDG-O-B"), /CHAIN/);
    assert.match(byId.get("JDG-O-B"), /1 preview pics/);
    assert.match(byId.get("JDG-O-B"), /beat: preview\/cover-old\.png/);
    for (const l of d.lines.slice(1)) {
      const what = l.split("|")[6];
      assert.doesNotMatch(what, /stage=/, l);
    }
  });
});

describe("built gate (tool sprint packet 0b)", () => {
  const png = (w, h) => Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]),
    Buffer.from("IHDR"),
    Buffer.from([(w >>> 24) & 255, (w >>> 16) & 255, (w >>> 8) & 255, w & 255, (h >>> 24) & 255, (h >>> 16) & 255, (h >>> 8) & 255, h & 255]),
  ]);
  const brief = (id) => ({ title: "T", order: id, size: { w: 1280, h: 720 }, sizes: [{ w: 1280, h: 720, name: "landscape" }, { w: 630, h: 500, name: "store-card" }], dir: "ltr", page: "page.html", image: "out.png", tokens: "tokens.css" });
  const mk = (id, mutate) => {
    const dz = join(mkdtempSync(join(tmpdir(), "built-")), "designs");
    const dir = join(dz, id);
    mkdirSync(dir, { recursive: true });
    const files = {
      "brief.json": JSON.stringify(brief(id)),
      "page.html": "<html><body><h1>T</h1></body></html>",
      "tokens.css": ":root{--bg:#fff}",
      "design-audit.json": JSON.stringify({ pass: true, checks: [] }),
      "DESIGN-REVIEW.md": "# DESIGN-REVIEW.md: rubric ds-quality-v1 v1 — 10/10 SHIP\n\nSHIP: 10/10 meets the floor.",
      "DELIVERY.md": ["# DELIVERY", "1.", "2.", "3.", "4.", "5.", "6.", "7."].join("\n") + "\n",
      "assets.json": JSON.stringify({ assets: [], note: "t" }),
    };
    const bins = { "out.png": png(1280, 720), "out-630x500.png": png(630, 500), "thumb-256.png": png(256, 144) };
    if (mutate) mutate(files, bins);
    for (const [n, c] of Object.entries(files)) if (c !== null) writeFileSync(join(dir, n), c);
    for (const [n, b] of Object.entries(bins)) if (b !== null) writeFileSync(join(dir, n), b);
    return dz;
  };
  it("a complete folder passes every check", () => {
    const r = checkBuilt("O-9", { designsDir: mk("O-9") });
    assert.equal(r.pass, true, r.fail ?? "unexpected fail");
    assert.ok(r.checks.every((c) => c.pass));
  });
  it("a missing folder, file, size or thumb fails with that line first", () => {
    assert.match(checkBuilt("O-9", { designsDir: join(tmpdir(), "built-nope") }).fail, /no folder/);
    assert.match(checkBuilt("O-9", { designsDir: mk("O-9", (f) => { f["design-audit.json"] = null; }) }).fail, /missing designs\/O-9\/design-audit\.json/);
    assert.match(checkBuilt("O-9", { designsDir: mk("O-9", (f, b) => { b["out-630x500.png"] = null; }) }).fail, /missing designs\/O-9\/out-630x500\.png/);
    assert.match(checkBuilt("O-9", { designsDir: mk("O-9", (f, b) => { b["out.png"] = png(800, 600); }) }).fail, /out\.png is 800x600, want 1280x720/);
    assert.match(checkBuilt("O-9", { designsDir: mk("O-9", (f, b) => { b["thumb-256.png"] = png(128, 72); }) }).fail, /want width 256/);
  });
  it("a red audit, a REWORK review or a long DELIVERY fails", () => {
    assert.match(checkBuilt("O-9", { designsDir: mk("O-9", (f) => { f["design-audit.json"] = JSON.stringify({ pass: false, checks: [{ name: "contrast title", pass: false }] }); }) }).fail, /not PASS \(first: contrast title\)/);
    assert.match(checkBuilt("O-9", { designsDir: mk("O-9", (f) => { f["DESIGN-REVIEW.md"] = "REWORK: 5/10 below floor."; }) }).fail, /want SHIP >=8\/10/);
    assert.match(checkBuilt("O-9", { designsDir: mk("O-9", (f) => { f["DELIVERY.md"] = Array.from({ length: 11 }, (_, i) => `${i + 1}.`).join("\n") + "\n"; }) }).fail, /has 11 lines, want 1-10/);
  });
  it("every used picture must be listed, every listed one on disk with matching bytes", () => {
    const pic = Buffer.from("real picture bytes");
    const hex = createHash("sha256").update(pic).digest("hex");
    const dzGood = mk("O-9");
    {
      const dir = join(dzGood, "O-9");
      mkdirSync(join(dir, "assets"), { recursive: true });
      writeFileSync(join(dir, "assets", "shot.png"), pic);
      writeFileSync(join(dir, "page.html"), '<img src="assets/shot.png">');
      writeFileSync(join(dir, "assets.json"), JSON.stringify({ assets: [{ file: "assets/shot.png", bytes: pic.length, sha256: hex }] }));
    }
    assert.equal(checkBuilt("O-9", { designsDir: dzGood }).pass, true);
    assert.match(checkBuilt("O-9", { designsDir: mk("O-9", (f) => { f["page.html"] = '<img src="assets/ghost.png">'; }) }).fail, /ghost\.png used but not listed/);
    assert.match(checkBuilt("O-9", { designsDir: mk("O-9", (f) => { f["assets.json"] = JSON.stringify({ assets: [{ file: "assets/gone.png" }] }); }) }).fail, /gone\.png listed .* missing on disk/);
  });
});

describe("verdict writer (tool sprint packet 0b)", () => {
  const FIVE = "LANE: l; FACTS: f; FIT: t; PICTURE: p; BEATS: beats; inner; text";
  it("FAIL writes even when built fails, and the first line parses", () => {
    const dz = join(mkdtempSync(join(tmpdir(), "verdict-")), "designs");
    mkdirSync(join(dz, "O-9"), { recursive: true });
    const r = writeVerdict("O-9", "FAIL", "missing designs/O-9/design-audit.json", { designsDir: dz });
    assert.equal(r.ok, true);
    assert.equal(readVerdict("O-9", dz), "FAIL");
  });
  it("PASS refuses when built fails, when a section is missing, or with no line", () => {
    const dz = join(mkdtempSync(join(tmpdir(), "verdict-")), "designs");
    mkdirSync(join(dz, "O-9"), { recursive: true });
    const r1 = writeVerdict("O-9", "PASS", FIVE, { designsDir: dz });
    assert.equal(r1.ok, false);
    assert.match(r1.message, /BUILT FAIL/);
    assert.equal(r1.message.includes("VERDICT.md"), false);
  });
  it("PASS writes the five sections in canonical order and reads back PASS", () => {
    const dz = join(mkdtempSync(join(tmpdir(), "verdict-")), "designs");
    const dir = join(dz, "O-9");
    mkdirSync(dir, { recursive: true });
    const png = (w, h) => Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]), Buffer.from("IHDR"), Buffer.from([0, 0, (w >> 8) & 255, w & 255, 0, 0, (h >> 8) & 255, h & 255])]);
    writeFileSync(join(dir, "brief.json"), JSON.stringify({ title: "T", size: { w: 1280, h: 720 } }));
    writeFileSync(join(dir, "page.html"), "<h1>T</h1>");
    writeFileSync(join(dir, "tokens.css"), ":root{--bg:#fff}");
    writeFileSync(join(dir, "out.png"), png(1280, 720));
    writeFileSync(join(dir, "thumb-256.png"), png(256, 144));
    writeFileSync(join(dir, "design-audit.json"), JSON.stringify({ pass: true, checks: [] }));
    writeFileSync(join(dir, "DESIGN-REVIEW.md"), "SHIP: 10/10 meets the floor.");
    writeFileSync(join(dir, "DELIVERY.md"), "a\nb\n");
    writeFileSync(join(dir, "assets.json"), JSON.stringify({ assets: [] }));
    const rMissing = writeVerdict("O-9", "PASS", "BEATS: b; PICTURE: p; FACTS: f; FIT: t", { designsDir: dz });
    assert.equal(rMissing.ok, false);
    assert.match(rMissing.message, /missing LANE/);
    const r = writeVerdict("O-9", "PASS", FIVE, { designsDir: dz });
    assert.equal(r.ok, true, r.message);
    assert.equal(readVerdict("O-9", dz), "PASS");
    const lines = String(readFileSync(join(dir, "VERDICT.md"), "utf8")).split("\n");
    assert.deepEqual(lines.slice(0, 6).map((l) => l.split(":")[0]), ["VERDICT", "BEATS", "PICTURE", "FACTS", "FIT", "LANE"]);
    assert.match(lines[1], /beats; inner; text/);
  });
  it("the old hand header never counted for the desk", () => {
    const dz = join(mkdtempSync(join(tmpdir(), "verdict-")), "designs");
    mkdirSync(join(dz, "O-9"), { recursive: true });
    writeFileSync(join(dz, "O-9", "VERDICT.md"), "# VERDICT O-9: PASS (worker self-review)\n");
    assert.equal(readVerdict("O-9", dz), null);
  });
});

describe("deliver (tool sprint packet 0b remainder, NEED-09)", () => {
  const png = (w, h) => Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]), Buffer.from("IHDR"), Buffer.from([0, 0, (w >> 8) & 255, w & 255, 0, 0, (h >> 8) & 255, h & 255])]);
  const sandbox = () => {
    const base = mkdtempSync(join(tmpdir(), "deliver-"));
    const dz = join(base, "designs");
    const cust = join(base, "customer");
    const dir = join(dz, "O-9");
    mkdirSync(join(dir, "assets"), { recursive: true });
    mkdirSync(cust, { recursive: true });
    writeFileSync(join(dir, "brief.json"), JSON.stringify({ title: "T", size: { w: 1280, h: 720 } }));
    writeFileSync(join(dir, "page.html"), "<h1>T</h1>");
    writeFileSync(join(dir, "tokens.css"), ":root{--bg:#fff}");
    writeFileSync(join(dir, "out.png"), png(1280, 720));
    writeFileSync(join(dir, "thumb-256.png"), png(256, 144));
    writeFileSync(join(dir, "design-audit.json"), JSON.stringify({ pass: true, checks: [] }));
    writeFileSync(join(dir, "DESIGN-REVIEW.md"), "SHIP: 10/10 meets the floor.");
    writeFileSync(join(dir, "DELIVERY.md"), "# DELIVERY O-9\n1. Landing in lab: `from-design-studio/O-9/` (copy this whole folder).\n");
    writeFileSync(join(dir, "assets.json"), JSON.stringify({ assets: [] }));
    writeFileSync(join(dir, "VERDICT.md"), "VERDICT: PASS O-9\nBEATS: b\nPICTURE: p\nFACTS: f\nFIT: t\nLANE: l\n");
    const ordersPath = join(base, "orders.csv");
    writeFileSync(ordersPath, [HEADER, "O-9,fp-research,order:probe-kit,b,open,,no,2026-10-03,"].join("\n") + "\n");
    const empireJson = join(base, "empire.json");
    writeFileSync(empireJson, JSON.stringify({ repos: { "fp-research": { dir: cust } } }));
    return { base, dz, cust, ordersPath, empireJson };
  };
  it("landing comes from DELIVERY.md, refused outside from-design-studio", () => {
    const s = sandbox();
    const rows = parseOrders(readFileSync(s.ordersPath, "utf8")).rows;
    assert.equal(resolveLanding("O-9", rows[0], s.dz), "from-design-studio/O-9");
    assert.equal(customerDirFor("fp-research", s.empireJson), s.cust);
    assert.equal(customerDirFor("nope", s.empireJson), null);
  });
  it("refuses without VERDICT PASS and refuses to overwrite a differing file", () => {
    const s = sandbox();
    writeFileSync(join(s.dz, "O-9", "VERDICT.md"), "VERDICT: FAIL O-9\nnope\n");
    const r1 = runDeliver("O-9", { designsDir: s.dz, ordersPath: s.ordersPath, empireJson: s.empireJson });
    assert.equal(r1.ok, false);
    assert.match(r1.message, /VERDICT PASS/);
    writeFileSync(join(s.dz, "O-9", "VERDICT.md"), "VERDICT: PASS O-9\nBEATS: b\nPICTURE: p\nFACTS: f\nFIT: t\nLANE: l\n");
    const r2 = runDeliver("O-9", { designsDir: s.dz, ordersPath: s.ordersPath, empireJson: s.empireJson, now: "2026-10-04T13:00Z" });
    assert.equal(r2.ok, true, r2.message);
    assert.match(r2.message, /DELIVER PASS: O-9/);
    writeFileSync(join(s.cust, "from-design-studio", "O-9", "page.html"), "changed bytes");
    const r3 = runDeliver("O-9", { designsDir: s.dz, ordersPath: s.ordersPath, empireJson: s.empireJson });
    assert.equal(r3.ok, false);
    assert.match(r3.message, /differs/);
  });
  it("copies the folder, writes DELIVERED.json, sets delivered, --check verifies", () => {
    const s = sandbox();
    const r = runDeliver("O-9", { designsDir: s.dz, ordersPath: s.ordersPath, empireJson: s.empireJson, now: "2026-10-04T13:00Z" });
    assert.equal(r.ok, true, r.message);
    const rec = JSON.parse(readFileSync(join(s.dz, "O-9", "DELIVERED.json"), "utf8"));
    assert.equal(rec.order_id, "O-9");
    assert.equal(rec.landing, "from-design-studio/O-9");
    assert.ok(rec.files.length >= 8);
    const listed = new Map(rec.files.map((f) => [f.name, f]));
    assert.ok(listed.has("page.html"));
    assert.equal(listed.has("DELIVERED.json"), false);
    const rows = parseOrders(readFileSync(s.ordersPath, "utf8")).rows;
    assert.equal(rows[0].status, "delivered");
    assert.equal(rows[0].delivered_path, "from-design-studio/O-9");
    assert.deepEqual(checkOrders(parseOrders(readFileSync(s.ordersPath, "utf8")), (p) => p === "from-design-studio/O-9" || pathOnDisk(p)), []);
    const c = checkDeliver("O-9", { designsDir: s.dz, empireJson: s.empireJson });
    assert.equal(c.ok, true, c.message);
    assert.match(c.message, /DELIVER CHECK PASS: O-9/);
    assert.equal(collectDesignFiles("O-9", s.dz).some((f) => f.rel === "DELIVERED.json"), false);
  });
});

describe("round (tool sprint packet 0b remainder, NEED-09)", () => {
  it("prints the real yes/no line with all seven fields", () => {
    const rows = parseOrders([HEADER, "O-9,fp-research,order:probe-kit,b,open,,no,2026-10-03,"].join("\n")).rows;
    const dz = join(mkdtempSync(join(tmpdir(), "round-")), "designs");
    const rNo = roundState({ rows, designsDir: dz, arsenalPath: join(dz, "missing.json"), porcelain: "" });
    assert.equal(rNo.real, false);
    assert.match(rNo.line, /^ROUND: real no \| built 0 \| judged 0 \| delivered 0 \| adopted 0 \| tools 0 \| unjudged-oldest O-9 \| in-flight 1$/);
    const rYes = roundState({ rows, designsDir: dz, arsenalPath: join(dz, "missing.json"), porcelain: " M designs/O-9/page.html\n" });
    assert.equal(rYes.real, true);
    assert.match(rYes.line, /^ROUND: real yes /);
    const rClean = roundState({ rows, designsDir: dz, arsenalPath: join(dz, "missing.json"), porcelain: " M sprint/handoff.md\n" });
    assert.equal(rClean.real, false);
  });
});
