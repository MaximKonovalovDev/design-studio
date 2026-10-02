// tests/registry.test.mjs: DS-03 block registry unit tests (no browser needed).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkRegistry } from "../tools/registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("registry", () => {
  it("names 4 blocks and 4 templates at the 4 sizes", () => {
    const reg = JSON.parse(readFileSync(join(ROOT, "templates", "registry.json"), "utf8"));
    assert.deepEqual(reg.blocks.map((b) => b.id), ["hero", "feature-grid", "pricing", "cta"]);
    const sizes = Object.fromEntries(reg.templates.map((t) => [t.id, `${t.size.w}x${t.size.h}`]));
    assert.deepEqual(sizes, { cover: "1280x720", "ad-square": "1080x1080", story: "1080x1920", capsule: "616x353" });
  });

  it("--check passes (files exist, 0 hardcoded colors, dir + action)", () => {
    const { pass, results } = checkRegistry();
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
  });
});
