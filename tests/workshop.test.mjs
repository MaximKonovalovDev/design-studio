// tests/workshop.test.mjs: DS-07 workshop unit tests (no browser needed).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { checkWorkshop, normalizeStory } from "../tools/workshop.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("workshop", () => {
  it("--check passes (story per block, 256px titles, snapshots match)", () => {
    const { pass, results } = checkWorkshop();
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
  });

  it("256px math holds for every story title", () => {
    const { results } = checkWorkshop();
    const legs = results.filter((r) => r.name.endsWith("title legible at 256px"));
    assert.ok(legs.length >= 4, `expected 4+ legibility gates, got ${legs.length}`);
    assert.ok(legs.every((r) => r.pass), "every story title >= 12px at 256w");
  });

  it("fails closed when a story drifts from its snapshot", () => {
    const tmp = mkdtempSync(join(tmpdir(), "ds-workshop-"));
    cpSync(join(ROOT, "templates"), join(tmp, "templates"), { recursive: true });
    cpSync(join(ROOT, "workshop"), join(tmp, "workshop"), { recursive: true });
    const story = join(tmp, "workshop", "stories", "hero.html");
    writeFileSync(story, readFileSync(story, "utf8") + "\n<!-- drift -->\n", "utf8");
    const { pass, results } = checkWorkshop({ root: tmp });
    assert.equal(pass, false, "drifted story must FAIL");
    assert.ok(results.some((r) => !r.pass && r.name.includes("matches story")), "names the snapshot mismatch");
  });

  it("normalizeStory is idempotent", () => {
    const once = normalizeStory("a  \r\nb\n");
    assert.equal(normalizeStory(once), once, "second pass is a fixed point");
  });

  it("fails closed when a story is missing", () => {
    const tmp = mkdtempSync(join(tmpdir(), "ds-workshop-miss-"));
    mkdirSync(join(tmp, "templates"), { recursive: true });
    mkdirSync(join(tmp, "workshop", "stories"), { recursive: true });
    mkdirSync(join(tmp, "workshop", "snapshots"), { recursive: true });
    writeFileSync(join(tmp, "templates", "registry.json"), JSON.stringify({ blocks: [{ id: "ghost" }] }), "utf8");
    const { pass } = checkWorkshop({ root: tmp });
    assert.equal(pass, false, "missing story must FAIL");
  });

  it("fails closed when a thumb-256 claim disagrees with the math (DS-40)", () => {
    const tmp = mkdtempSync(join(tmpdir(), "ds-workshop-lie-"));
    cpSync(join(ROOT, "templates"), join(tmp, "templates"), { recursive: true });
    cpSync(join(ROOT, "workshop"), join(tmp, "workshop"), { recursive: true });
    const story = join(tmp, "workshop", "stories", "hero.html");
    const lied = readFileSync(story, "utf8").replace("12.8px at 256w", "18.0px at 256w");
    writeFileSync(story, lied, "utf8");
    writeFileSync(join(tmp, "workshop", "snapshots", "hero.txt"), normalizeStory(lied), "utf8");
    const { pass, results } = checkWorkshop({ root: tmp });
    assert.equal(pass, false, "lying thumb claim must FAIL");
    assert.ok(results.some((r) => !r.pass && r.name === "story hero thumb claim matches math"), "names the claim mismatch");
  });

  it("every story thumb-256 claim matches its computed 256px size (DS-40)", () => {
    const { results } = checkWorkshop();
    const claims = results.filter((r) => r.name.endsWith("thumb claim matches math"));
    assert.ok(claims.length >= 10, `expected 10 claim gates, got ${claims.length}`);
    assert.ok(claims.every((r) => r.pass), "every story claim agrees with the math");
  });
});
