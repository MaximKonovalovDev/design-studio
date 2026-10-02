// tests/figma.test.mjs: DS-08 figma-01 file-drop + mapping unit tests (no network).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MAPPING, checkFigma, dropFixture, resolveMapping } from "../tools/figma.mjs";

describe("figma file-drop + mapping", () => {
  it("mapping covers landing hero+cta and resolves", () => {
    assert.ok(MAPPING.length >= 4);
    assert.equal(resolveMapping("Landing/Hero")?.block, "hero");
    assert.equal(resolveMapping("Landing/CTA")?.block, "cta");
    assert.equal(resolveMapping("Nope/Missing"), null);
  });

  it("embedded fixture has 6 mapped frames with text slots", () => {
    const drop = dropFixture();
    assert.equal(drop.document.children.length, 6);
    for (const f of drop.document.children) assert.ok(resolveMapping(f.name), `${f.name} unmapped`);
  });

  it("--check passes on the real repo (registry + blocks + no MCP + no network)", () => {
    const { pass, results } = checkFigma();
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
  });

  it("unmapped frame fails closed", () => {
    const drop = dropFixture();
    drop.document.children.push({ id: "9:9", name: "Landing/Mystery", type: "FRAME", absoluteBoundingBox: { x: 0, y: 0, width: 400, height: 200 }, children: [] });
    const { pass, results } = checkFigma({ drop });
    assert.equal(pass, false);
    assert.ok(results.some((r) => !r.pass && r.name.includes("Landing/Mystery")));
  });

  it("drop with a URL fails the no-network gate", () => {
    const drop = dropFixture();
    drop.document.children[0].children[0].characters = "see https://example.com";
    const { pass } = checkFigma({ drop });
    assert.equal(pass, false);
  });

  it("file-drop path: fixture round-trips through a temp JSON file", () => {
    const dir = mkdtempSync(join(tmpdir(), "figma-"));
    const p = join(dir, "drop.json");
    writeFileSync(p, JSON.stringify(dropFixture()), "utf8");
    const drop = JSON.parse(readFileSync(p, "utf8"));
    const { pass, results } = checkFigma({ drop });
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
  });
});
