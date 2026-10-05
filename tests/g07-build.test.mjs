// tests/g07-build.test.mjs (G-07): twice-same-hash proof for tokens/g07-build.mjs.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { G07_TOKENS, SD_FIXTURE_SHA, LOCAL_FIXTURE_CSS, localBuildCss, sha256Hex, buildTwice } from "../tokens/g07-build.mjs";

describe("G-07 tokens twice-same-hash", () => {
  it("holds one 3-color token file", () => {
    assert.deepEqual(Object.keys(G07_TOKENS.color).sort(), ["accent", "ink", "paper"]);
  });

  it("local emit matches its fixture (offline path docs)", () => {
    assert.equal(localBuildCss(), LOCAL_FIXTURE_CSS);
    assert.equal(sha256Hex(LOCAL_FIXTURE_CSS).length, 64);
  });

  it("online fixture SHA is a 64-char hex (docs, not a gate)", () => {
    assert.match(SD_FIXTURE_SHA, /^[0-9a-f]{64}$/);
  });

  it("builds twice with the same SHA", () => {
    const r = buildTwice();
    assert.equal(r.hash1, r.hash2, `hashes differ: ${r.hash1} vs ${r.hash2}`);
    assert.equal(r.match, true, r.detail);
    for (const css of [r.css1, r.css2]) {
      assert.ok(css.includes("--color-paper"), "paper present");
      assert.ok(css.includes("--color-ink"), "ink present");
      assert.ok(css.includes("--color-accent"), "accent present");
    }
    if (r.method.startsWith("local-fixture")) {
      assert.equal(r.css1, LOCAL_FIXTURE_CSS, "offline build equals fixture");
    }
  });
});
