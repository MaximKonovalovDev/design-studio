// tests/cover.test.mjs: tools/cover.mjs checks on the delivered order folders (reads designs/<id>/, writes nothing).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { factsCheck } from "../tools/cover.mjs";
import { cacheDirFor, cacheKeyFor, cacheKeyForParts, cacheOutputsFor } from "../tools/cover.mjs";
import { pngDims } from "../tools/render.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COVERS = ["O-001", "O-002", "O-003", "O-004", "O-005", "O-012", "O-013", "O-014", "O-015", "O-016", "O-017", "O-018", "O-019", "O-020", "O-021", "O-022"];

describe("delivered store covers", () => {
  it("every number on each cover is in its listing file and no engine name is on it", () => {
    for (const id of COVERS) {
      const f = factsCheck(id);
      assert.deepEqual(f.missing, [], `${id} numbers not in the listing: ${f.missing.join(" ")}`);
      assert.deepEqual(f.forbidden, [], `${id} forbidden words: ${f.forbidden.join(",")}`);
    }
  });
  it("every cover folder carries both sizes at exact pixels, a thumbnail, an audit PASS, a verdict and a delivery note", () => {
    for (const id of COVERS) {
      const d = join(ROOT, "designs", id);
      for (const f of ["page.html", "tokens.css", "brief.json", "assets.json", "DELIVERY.md", "VERDICT.md", "DESIGN-REVIEW.md", "thumb-256.png"]) assert.ok(existsSync(join(d, f)), `${id}/${f}`);
      const a = pngDims(readFileSync(join(d, "out.png")));
      const b = pngDims(readFileSync(join(d, "out-630x500.png")));
      assert.deepEqual([a.w, a.h, b.w, b.h], [1280, 720, 630, 500], id);
      assert.equal(JSON.parse(readFileSync(join(d, "design-audit.json"), "utf8")).pass, true, `${id} audit`);
      assert.ok(readFileSync(join(d, "VERDICT.md"), "utf8").startsWith(`# VERDICT ${id}: PASS`), `${id} verdict`);
      assert.ok(readFileSync(join(d, "DELIVERY.md"), "utf8").split("\n").filter(Boolean).length <= 10, `${id} DELIVERY.md over 10 lines`);
    }
  });
});

describe("cover result cache (brief + template + tokens + assets, never brief alone)", () => {
  const parts = {
    brief: "cover.json + brief.json bytes",
    template: "page.html bytes",
    tokens: "tokens.css bytes",
    assets: [{ path: "hero.png", bytes: Buffer.from([1, 2, 3]) }],
  };
  it("key is a stable 64-hex sha256", () => {
    const a = cacheKeyForParts(parts);
    const b = cacheKeyForParts({ ...parts, assets: [{ path: "hero.png", bytes: Buffer.from([1, 2, 3]) }] });
    assert.match(a, /^[0-9a-f]{64}$/);
    assert.equal(a, b);
  });
  it("changing template, tokens or assets changes the key (brief alone never hits)", () => {
    const base = cacheKeyForParts(parts);
    assert.notEqual(cacheKeyForParts({ ...parts, template: "other page" }), base, "template matters");
    assert.notEqual(cacheKeyForParts({ ...parts, tokens: "other tokens" }), base, "tokens matter");
    assert.notEqual(cacheKeyForParts({ ...parts, assets: [{ path: "hero.png", bytes: Buffer.from([9]) }] }), base, "asset bytes matter");
    assert.notEqual(cacheKeyForParts({ ...parts, assets: [] }), base, "asset list matters");
  });
  it("O-037 key is stable and its outputs cover sizes plus the thumbnail", () => {
    assert.equal(cacheKeyFor("O-037"), cacheKeyFor("O-037"));
    assert.match(cacheKeyFor("O-037"), /^[0-9a-f]{64}$/);
    const out = cacheOutputsFor("O-037");
    assert.ok(out.includes("out.png"), "sizes cached");
    assert.ok(out.includes("thumb-256.png"), "thumbnail cached");
    assert.ok(cacheDirFor("O-037", cacheKeyFor("O-037")).includes(".cache"), "file cache dir");
  });
});
