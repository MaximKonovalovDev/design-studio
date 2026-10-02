// tests/render.test.mjs: DS-01 render unit tests (no browser launch needed).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { findBrowser, parseSize, pngDims } from "../tools/render.mjs";

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
});
