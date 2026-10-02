// tests/brandkit.test.mjs: DS-10 brand-01 unit tests (no browser needed).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { checkBrandkit } from "../tools/brandkit.mjs";

const ROOT_KIT = JSON.parse(readFileSync(new URL("../brand-kits/studio.json", import.meta.url), "utf8"));

function setup(kit) {
  const d = mkdtempSync(`${tmpdir()}\\ds-brand-`);
  writeFileSync(join(d, "registry.json"), JSON.stringify({ name: "t", kits: [{ id: kit.id, name: kit.name, file: "kit.json" }] }));
  writeFileSync(join(d, "kit.json"), JSON.stringify(kit));
  return d;
}

describe("brandkit", () => {
  it("--check passes the shipped studio kit", () => {
    const { pass, results } = checkBrandkit();
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
  });

  it("fails a low-contrast palette", () => {
    const bad = { ...ROOT_KIT, palette: { ...ROOT_KIT.palette, ink: "#faf7f0" } };
    const d = setup(bad);
    const { pass, results } = checkBrandkit({ dir: d, registryPath: join(d, "registry.json") });
    assert.equal(pass, false);
    assert.ok(results.some((r) => r.name.includes("pairs") && !r.pass));
  });

  it("fails a kit with no voice", () => {
    const bad = { ...ROOT_KIT, voice: {} };
    const d = setup(bad);
    const { pass } = checkBrandkit({ dir: d, registryPath: join(d, "registry.json") });
    assert.equal(pass, false);
  });

  it("fails a tokens export that drifts from the palette", () => {
    const bad = { ...ROOT_KIT, tokens: { ...ROOT_KIT.tokens, colors: { ...ROOT_KIT.tokens.colors, paper: "#000000" } } };
    const d = setup(bad);
    const { pass, results } = checkBrandkit({ dir: d, registryPath: join(d, "registry.json") });
    assert.equal(pass, false);
    assert.ok(results.some((r) => r.name.includes("mirrors") && !r.pass));
  });
});
