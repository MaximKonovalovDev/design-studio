// tests/donor.test.mjs: donor system unit gates (no network, no clone).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SYSTEMS, donorStatus, nearestSlugs, normalizeSlug, resolveSystem, writeReceipt } from "../tools/donor.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("donor slugs", () => {
  it("normalizes case and separators", () => {
    assert.equal(normalizeSlug(" Warm_Editorial "), "warm-editorial");
  });
  it("resolves clean to clean-professional", () => {
    const r = resolveSystem("clean");
    assert.equal(r.palette, "clean-professional");
    assert.ok(r.tokens.bg && r.fonts.display);
  });
  it("FAILs closed on an unknown slug with nearest", () => {
    assert.throws(() => resolveSystem("cleen"), /nearest:.*clean/);
  });
  it("compound input holds its system", () => {
    assert.equal(nearestSlugs("clean-developer")[0], "clean");
  });
  it("the 5 donor-less brief slugs resolve hand-picked", () => {
    for (const s of ["epic", "painterly", "pixel", "playful", "geometric"])
      assert.match(resolveSystem(s).note, /hand-picked/, s);
  });
});

describe("donor catalog", () => {
  it("every system maps to a palette in palettes.json", () => {
    const all = JSON.parse(readFileSync(join(ROOT, "templates", "palettes.json"), "utf8")).palettes;
    for (const [k, v] of Object.entries(SYSTEMS)) assert.ok(all[v.palette], `${k} -> ${v.palette}`);
  });
  it("status reports without cloning", () => {
    const st = donorStatus();
    assert.equal(typeof st.present, "boolean");
  });
  it("receipt round-trips", () => {
    const out = join(tmpdir(), `ds-donor-test-${process.pid}.json`);
    const p = writeReceipt(resolveSystem("clean"), out);
    const back = JSON.parse(readFileSync(p, "utf8"));
    assert.ok(existsSync(p) && back.system === "clean" && back.tokens.bg);
  });
});
