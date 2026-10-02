// tests/thumb.test.mjs: 256px thumbnail math (no browser needed).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { THUMB_W, thumbSize } from "../tools/thumb.mjs";

describe("thumb", () => {
  it("is 256px wide and keeps the aspect", () => {
    assert.equal(THUMB_W, 256);
    assert.deepEqual(thumbSize(1280, 720), { w: 256, h: 144 });
    assert.deepEqual(thumbSize(1080, 1080), { w: 256, h: 256 });
    assert.deepEqual(thumbSize(1080, 1920), { w: 256, h: 455 });
    assert.deepEqual(thumbSize(616, 353), { w: 256, h: 147 });
  });

  it("rejects insane sizes", () => {
    assert.throws(() => thumbSize(0, 0), /ints >= 16/);
  });
});
