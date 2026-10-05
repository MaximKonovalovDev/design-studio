// tests/g09-figma-rtl.test.mjs: G-09 figma truth link + RTL flip proof.
// No network. No secrets. Fixture fallback only.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseFrameUrl,
  buildFrameRequest,
  readFrame,
  flipCss,
  isNoFlipSelector,
  checkG09,
  FIXTURE_FRAME_URL,
  NO_FLIP_ICONS,
} from "../tools/g09-figma-rtl.mjs";

describe("g09 framelink shape", () => {
  it("--check passes offline", () => {
    const { pass, results } = checkG09();
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
  });

  it("parses file and design links, normalizes node-id", () => {
    const a = parseFrameUrl(FIXTURE_FRAME_URL);
    assert.equal(a.ok, true);
    assert.equal(a.documentKey, "AbC123XyZ");
    assert.equal(a.frameId, "12:34");
    const b = parseFrameUrl("https://www.figma.com/file/Xy9Qw2Ab/Landing?node-id=7%3A21");
    assert.equal(b.ok, true);
    assert.equal(b.frameId, "7:21");
  });

  it("fails closed on non-figma or id-less links", () => {
    assert.equal(parseFrameUrl("https://example.com/x").ok, false);
    assert.equal(parseFrameUrl("https://www.figma.com/design/AbC123XyZ/NoId").ok, false);
    assert.equal(parseFrameUrl("").ok, false);
  });

  it("falls back to fixture JSON with no token", () => {
    const r = readFrame({ frameUrl: FIXTURE_FRAME_URL });
    assert.equal(r.ok, true);
    assert.equal(r.from, "fixture");
    assert.equal(r.data.frameId, "12:34");
  });

  it("builds a read-only request and never echoes the token", () => {
    const r = buildFrameRequest({ documentToken: "secret-123", frameUrl: FIXTURE_FRAME_URL });
    assert.equal(r.ok, true);
    assert.equal(r.method, "GET");
    assert.match(r.endpoint, /api\.figma\.com\/v1\/files\//);
    assert.equal(JSON.stringify(r).includes("secret-123"), false);
  });
});

describe("g09 rtl flip", () => {
  it("mirrors sides and translateX", () => {
    const r = flipCss(".a{margin-left:4px;padding-right:2px;float:left;transform:translateX(8px);}");
    assert.match(r.css, /margin-right:4px/);
    assert.match(r.css, /padding-left:2px/);
    assert.match(r.css, /float:right/);
    assert.match(r.css, /translateX\(-8px\)/);
  });

  it("keeps allow-listed icons unflipped", () => {
    assert.ok(NO_FLIP_ICONS.includes(".icon"));
    assert.equal(isNoFlipSelector(".icon-arrow"), true);
    assert.equal(isNoFlipSelector(".hero"), false);
    const r = flipCss(".icon-arrow{margin-left:4px;left:0;}\n.hero{margin-left:4px;}", { allowList: NO_FLIP_ICONS });
    assert.match(r.css, /\.icon-arrow\{margin-left:4px;left:0;\}/);
    assert.match(r.css, /\.hero\{[^}]*margin-right/);
    assert.equal(r.skipped, 1);
  });

  it("respects [data-no-flip] blocks", () => {
    const r = flipCss('[data-no-flip] .logo{margin-left:4px;}');
    assert.match(r.css, /margin-left:4px/);
    assert.equal(r.flipped, 0);
  });
});
