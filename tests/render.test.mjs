// tests/render.test.mjs: DS-01 render unit tests (no browser launch needed).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { sep } from "node:path";
import { findBrowser, parseSize, pngDims, briefHashFor, fileSha256, readHistory, appendHistory, gateOverwrite, lastEntryFor, defaultHistoryPath } from "../tools/render.mjs";

describe("render", () => {
  it("finds an Edge/Chrome/Chromium binary on this PC", () => {
    const b = findBrowser();
    assert.ok(b, "BROWSER_BIN or a known install must exist (else set BROWSER_BIN)");
    assert.ok(existsSync(b), `browser path exists: ${b}`);
  });

  it("parses WIDTHxHEIGHT and rejects junk", () => {
    assert.deepEqual(parseSize("1280x720"), { w: 1280, h: 720 });
    assert.throws(() => parseSize("1280"), /WIDTHxHEIGHT/);
    assert.throws(() => parseSize("10x10"), /between 16 and 8192/);
  });

  it("reads PNG dimensions from the IHDR header", () => {
    // 1x1 transparent PNG.
    const tiny = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    assert.deepEqual(pngDims(tiny), { w: 1, h: 1 });
    assert.throws(() => pngDims(Buffer.from("not a png")), /not a PNG/);
  });

  it("O-038: default history log lives under designs/job/history/", () => {
    assert.ok(defaultHistoryPath().replace(/\\/g, "/").endsWith("designs/job/history/render-history.jsonl"));
  });

  it("O-038: same brief twice keeps one entry (skip, append-only)", () => {
    const dir = mkdtempSync(`${tmpdir()}${sep}ds-rt-`);
    const hp = `${dir}${sep}h.jsonl`;
    const out = `${dir}${sep}out.png`;
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
    const h = briefHashFor("<html><h1>same</h1></html>");
    assert.equal(gateOverwrite({ outPath: out, briefHash: h, historyPath: hp }).action, "render");
    writeFileSync(out, png);
    appendHistory(hp, { brief: `${dir}/page.html`, briefHash: h, out, sha256: fileSha256(out), w: 1, h: 1, bytes: png.length });
    assert.equal(gateOverwrite({ outPath: out, briefHash: h, historyPath: hp }).action, "skip");
    assert.equal(readHistory(hp).length, 1);
    // Second identical gate appends nothing: still one entry.
    assert.equal(gateOverwrite({ outPath: out, briefHash: h, historyPath: hp }).action, "skip");
    assert.equal(readHistory(hp).length, 1);
  });

  it("O-038: changed brief re-renders and appends a new entry", () => {
    const dir = mkdtempSync(`${tmpdir()}${sep}ds-rt-`);
    const hp = `${dir}${sep}h.jsonl`;
    const out = `${dir}${sep}out.png`;
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
    writeFileSync(out, png);
    const h1 = briefHashFor("<html><h1>v1</h1></html>");
    const h2 = briefHashFor("<html><h1>v2</h1></html>");
    appendHistory(hp, { brief: `${dir}/page.html`, briefHash: h1, out, sha256: fileSha256(out), w: 1, h: 1, bytes: png.length });
    const g = gateOverwrite({ outPath: out, briefHash: h2, historyPath: hp });
    assert.equal(g.action, "render");
    appendHistory(hp, { brief: `${dir}/page.html`, briefHash: h2, out, sha256: fileSha256(out), w: 1, h: 1, bytes: png.length });
    const rows = readHistory(hp);
    assert.equal(rows.length, 2);
    assert.equal(lastEntryFor(rows, out).briefHash, h2);
    assert.equal(rows[0].briefHash, h1);
  });

  it("O-038: existing foreign file is not overwritten (refuse, fail closed)", () => {
    const dir = mkdtempSync(`${tmpdir()}${sep}ds-rt-`);
    const hp = `${dir}${sep}h.jsonl`;
    const out = `${dir}${sep}out.png`;
    writeFileSync(out, Buffer.from("someone else wrote this"));
    const g = gateOverwrite({ outPath: out, briefHash: briefHashFor("<html/>"), historyPath: hp });
    assert.equal(g.action, "refuse");
    assert.match(g.reason, /foreign file|refusing/i);
    assert.ok(existsSync(out));
  });

  it("O-038: brief hash rejects empty source (never silent)", () => {
    assert.throws(() => briefHashFor(""), /needs source bytes/);
    assert.throws(() => gateOverwrite({ outPath: "x.png", historyPath: "y.jsonl" }), /needs the brief hash/);
  });
});
