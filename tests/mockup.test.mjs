// tests/mockup.test.mjs: mockup unit gates (no browser, no network).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BGS, FRAMES, buildMockupHtml, parseArgs, parseSize, runMockup } from "../tools/mockup.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOT = join(ROOT, "designs", "O-026", "assets", "screenshot-pairs.png");

describe("mockup args", () => {
  it("parses shot/frame/out with defaults", () => {
    const p = parseArgs(["--shot", "a.png", "--frame", "iphone", "--out", "b.png"]);
    assert.equal(p.frame, "iphone");
    assert.equal(p.bg, "charcoal");
    assert.equal(p.size, "1280x720");
  });
  it("parses = flags", () => {
    const p = parseArgs(["--shot=a.png", "--frame=macbook", "--out=b.png", "--bg=pearl", "--caption=Hi"]);
    assert.equal(p.bg, "pearl");
    assert.equal(p.caption, "Hi");
  });
  it("FAILs closed on a bad size", () => {
    assert.throws(() => parseSize("huge"), /bad --size/);
  });
  it("FAILs closed on a missing shot", () => {
    assert.throws(() => runMockup({ shot: join(ROOT, "designs", "O-026", "nope.png"), frame: "browser", out: "x.png" }), /missing/);
  });
  it("FAILs closed on an unknown frame", () => {
    assert.throws(() => runMockup({ shot: SHOT, frame: "toaster", out: "x.png" }), /unknown frame/);
  });
  it("FAILs closed without --out", () => {
    assert.throws(() => runMockup({ shot: SHOT, frame: "browser" }), /no --out/);
  });
});

describe("mockup html", () => {
  it("is CSS-only with the real shot", () => {
    const h = buildMockupHtml({ shotUrl: "file:///x/screenshot-pairs.png", frame: "browser", shotW: 1, shotH: 1, caption: "Fleet", bg: "charcoal" });
    assert.ok(h.includes("screenshot-pairs.png") && h.includes("Fleet"));
    assert.ok(!/unsplash|dribbble/i.test(h));
  });
  it("all frames carry a screen", () => {
    assert.deepEqual(FRAMES, ["browser", "macbook", "iphone", "ipad"]);
    for (const frame of FRAMES) {
      const h = buildMockupHtml({ shotUrl: "x", frame, shotW: 1, shotH: 1, caption: "", bg: "charcoal" });
      assert.ok(h.includes("scr"), frame);
    }
    assert.equal(Object.keys(BGS).length, 4);
  });
});
