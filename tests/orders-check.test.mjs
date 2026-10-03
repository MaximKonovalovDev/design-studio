// tests/orders-check.test.mjs: the order book rules (S80) without touching the real orders.csv.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { HEADER, checkOrders, coverStatus, parseOrders } from "../tools/orders-check.mjs";

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
