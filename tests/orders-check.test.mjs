// tests/orders-check.test.mjs: the order book rules (S80) without touching the real orders.csv.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HEADER, beatAsset, buildDesk, checkOrders, coverStatus, laneFor, parseOrders, pathOnDisk, DESK_HEADER } from "../tools/orders-check.mjs";

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
