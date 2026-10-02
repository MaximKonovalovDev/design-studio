// tests/brandkit.test.mjs: DS-10 brand-01 unit tests (no browser needed).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { checkBrandkit, mergeKits } from "../tools/brandkit.mjs";

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

describe("DS-35 pair convention + registry merge (brandkit-vision-r9 C1/C2)", () => {
  it("fails a kit whose accent ships without on-accent", () => {
    const bad = JSON.parse(JSON.stringify(ROOT_KIT));
    delete bad.palette["on-accent"];
    delete bad.tokens.colors["on-accent"];
    const d = setup(bad);
    const { pass, results } = checkBrandkit({ dir: d, registryPath: join(d, "registry.json") });
    assert.equal(pass, false);
    assert.ok(results.some((r) => r.name.includes("bg/fg convention") && !r.pass));
  });

  it("fails a kit whose dark theme drops a surface pair", () => {
    const bad = JSON.parse(JSON.stringify(ROOT_KIT));
    delete bad.paletteDark.accent;
    const d = setup(bad);
    const { pass, results } = checkBrandkit({ dir: d, registryPath: join(d, "registry.json") });
    assert.equal(pass, false);
    assert.ok(results.some((r) => r.name.includes("overrides every surface pair") && !r.pass));
  });

  it("merges base+overlay with overlay wins and a collision count", () => {
    const base = { palette: { paper: "#faf7f0", accent: "#c2410c" }, spacing: { sm: "16px" } };
    const overlay = { palette: { accent: "#fb923c" }, spacing: { sm: "16px", md: "24px" } };
    const { merged, collisions } = mergeKits(base, overlay);
    assert.equal(merged.palette.accent, "#fb923c");
    assert.equal(merged.palette.paper, "#faf7f0");
    assert.equal(merged.spacing.md, "24px");
    assert.equal(collisions, 1);
  });

  it("two-kit registry still passes with the merge gate green (overlay wins)", () => {
    const overlay = JSON.parse(JSON.stringify(ROOT_KIT));
    overlay.id = "overlay";
    overlay.name = "Overlay";
    overlay.palette = { ...ROOT_KIT.palette, accent: "#9a3412" };
    overlay.tokens = { ...ROOT_KIT.tokens, colors: { ...ROOT_KIT.tokens.colors, accent: "#9a3412" } };
    const d = setup(ROOT_KIT);
    writeFileSync(join(d, "overlay.json"), JSON.stringify(overlay));
    writeFileSync(join(d, "registry.json"), JSON.stringify({ name: "t", kits: [{ id: "studio", name: "Design Studio", file: "kit.json" }, { id: "overlay", name: "Overlay", file: "overlay.json" }] }));
    const { pass, results } = checkBrandkit({ dir: d, registryPath: join(d, "registry.json") });
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
    assert.ok(results.some((r) => r.name.startsWith("registry: base+overlay merge") && r.pass && r.detail.includes("2 kit(s), 1 collision")));
  });
});
