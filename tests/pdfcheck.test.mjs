// tests/pdfcheck.test.mjs: pdfcheck unit + live O-007 PDF gates (no network).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { countScripts, checkOrder, linesFromItems, gateInfo, pdfInfo, parseArgs } from "../tools/pdfcheck.mjs";

describe("pdfcheck scripts", () => {
  it("counts Hebrew and Latin letters, ignores digits", () => {
    const c = countScripts("שלום Hello 123 [brackets]");
    assert.equal(c.hebrew, 4);
    assert.ok(c.latin >= 5);
  });

  it("handles empty input", () => {
    assert.deepEqual(countScripts(""), { chars: 0, hebrew: 0, latin: 0 });
  });
});

describe("pdfcheck order", () => {
  it("accepts words in order", () => {
    assert.equal(checkOrder("תקציר מערך הוכחות", ["תקציר", "הוכחות"]).pass, true);
  });

  it("rejects reversed words and names the culprit", () => {
    const r = checkOrder("תקציר מערך הוכחות", ["הוכחות", "תקציר"]);
    assert.equal(r.pass, false);
    assert.equal(r.missing, "תקציר");
  });

  it("rejects a missing word", () => {
    assert.equal(checkOrder("א ב ג", ["א", "ז"]).pass, false);
  });

  it("passes with no expectations", () => {
    assert.equal(checkOrder("anything", []).pass, true);
  });
});

describe("pdfcheck lines", () => {
  it("groups items into top-down rows", () => {
    const items = [
      { str: "world", transform: [1, 0, 0, 1, 100, 700] },
      { str: "hello", transform: [1, 0, 0, 1, 50, 700] },
      { str: "next", transform: [1, 0, 0, 1, 50, 680] },
    ];
    const lines = linesFromItems(items);
    assert.equal(lines.length, 2);
    assert.match(lines[0], /hello.*world/);
  });
});

describe("pdfcheck args", () => {
  it("parses files + flags", () => {
    const r = parseArgs(["a.pdf", "b.pdf", "--expect-pages", "1", "--expect", "x,y", "--json", "o.json"]);
    assert.deepEqual(r.files, ["a.pdf", "b.pdf"]);
    assert.equal(r.expectPages, 1);
    assert.deepEqual(r.expectWords, ["x", "y"]);
    assert.equal(r.jsonOut, "o.json");
  });
});

describe("pdfcheck live O-007 PDFs", () => {
  it("cv-he.pdf: 1 A4 page, Hebrew text, no images", async () => {
    const info = await pdfInfo("designs/O-007/cv-he.pdf");
    assert.equal(info.pages, 1);
    assert.ok(info.hebrew >= 500, `hebrew=${info.hebrew}`);
    assert.equal(info.images, 0);
    const g = gateInfo(info, { expectPages: 1 });
    assert.equal(g.pass, true, g.results.filter((r) => !r.pass).map((r) => r.name).join("; "));
  });

  it("cv-en.pdf: 1 page, Latin text, zero Hebrew", async () => {
    const info = await pdfInfo("designs/O-007/cv-en.pdf");
    assert.equal(info.pages, 1);
    assert.ok(info.latin >= 500, `latin=${info.latin}`);
    assert.equal(info.hebrew, 0);
  });

  it("gate fails a scanned-style empty layer", () => {
    const g = gateInfo({ pages: 1, sizes: [{ w: 595.28, h: 841.89 }], chars: 0, hebrew: 0, latin: 0, images: 3, fonts: [], fullText: "" }, { expectPages: 1 });
    assert.equal(g.pass, false);
  });
});
