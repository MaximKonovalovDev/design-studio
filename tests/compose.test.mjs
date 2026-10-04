// tests/compose.test.mjs: compose compare/svg2png unit gates (no browser, no network).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildCompareHtml,
  parseArgs,
  parseWidths,
  runCompare,
  runSvg2png,
  svgSize,
} from "../tools/compose.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OURS = join(ROOT, "designs", "O-026", "out.png");
const THEIRS = "C:/Users/me/Desktop/autonomous-factory/products/skill-pack/fleet-pack/preview/cover-1280x720.png";

describe("compose widths", () => {
  it("defaults to 256,315", () => {
    assert.deepEqual(parseWidths(null), [256, 315]);
  });
  it("sorts and dedupes", () => {
    assert.deepEqual(parseWidths("315,256,256"), [256, 315]);
  });
  it("FAILs closed on garbage", () => {
    assert.throws(() => parseWidths("huge,0,-3"), /bad --widths/);
  });
  it("parseArgs reads --widths/--out positionals", () => {
    const p = parseArgs(["compare", "a.png", "b.png", "--widths", "256", "--out", "c.png"]);
    assert.deepEqual(p.widths, [256]);
    assert.equal(p.out, "c.png");
    assert.deepEqual(p.rest, ["compare", "a.png", "b.png"]);
  });
});

describe("compose compare", () => {
  it("html carries both files at both widths", () => {
    assert.ok(existsSync(OURS) && existsSync(THEIRS), "O-026 fixtures on disk");
    const { html, height } = buildCompareHtml(OURS, THEIRS, [256, 315]);
    assert.ok(html.includes("ours 256px") && html.includes("theirs 315px"), "two labeled rows");
    assert.ok(height > 200 && height <= 1600, `${height}`);
  });
  it("FAILs closed on a missing input", () => {
    assert.throws(() => runCompare({ ours: join(ROOT, "designs", "O-026", "nope.png"), theirs: THEIRS, widths: [256], out: "x.png" }), /missing/);
  });
  it("FAILs closed without --out", () => {
    assert.throws(() => runCompare({ ours: OURS, theirs: THEIRS, widths: [256] }), /no --out/);
  });
});

describe("compose svg2png", () => {
  it("reads width/height attrs", () => {
    assert.deepEqual(svgSize('<svg width="64" height="32" xmlns="http://www.w3.org/2000/svg"></svg>', 1280), { w: 64, h: 32 });
  });
  it("falls back to viewBox", () => {
    assert.deepEqual(svgSize('<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"></svg>', 200), { w: 100, h: 50 });
  });
  it("FAILs closed on a missing svg", () => {
    assert.throws(() => runSvg2png({ svg: join(ROOT, "nope.svg"), out: "x.png" }), /missing/);
  });
});
