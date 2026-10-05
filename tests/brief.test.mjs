// tests/brief.test.mjs: tools/brief.mjs checks (DS-80 brief gate).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gateBrief, briefSelfCheck, FORBIDDEN_ENGINES } from "../tools/brief.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const BASE = {
  title: "Fleet Vol 1",
  product: "cover:gumroad/fleet-pack",
  sizes: [
    { w: 1280, h: 720, name: "landscape" },
    { w: 630, h: 500, name: "store-card" },
  ],
  size: { w: 1280, h: 720 },
};

function mk(brief) {
  const d = mkdtempSync(`${tmpdir()}\\ds-brief-test-`);
  writeFileSync(join(d, "facts.md"), "# facts\n- 3 skills\n", "utf8");
  const b = { ...brief };
  if (!b.facts && !b.order) b.facts = "facts.md";
  writeFileSync(join(d, "brief.json"), JSON.stringify(b), "utf8");
  return join(d, "brief.json");
}

describe("brief gate", () => {
  it("self-check is green", () => {
    const { pass, results } = briefSelfCheck();
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
  });

  it("passes a good brief with code 0", () => {
    const r = gateBrief(mk(BASE));
    assert.equal(r.pass, true);
    assert.equal(r.code, 0);
    assert.equal(r.errors.length, 0);
  });

  it("passes the real O-042 brief (legacy order-row provenance)", () => {
    const r = gateBrief(join(ROOT, "designs", "O-042", "brief.json"));
    assert.equal(r.pass, true, r.errors.slice(0, 1).join("; "));
    assert.equal(r.code, 0);
  });

  it("fails a missing product naming the product field", () => {
    const bad = { ...BASE };
    delete bad.product;
    const r = gateBrief(mk(bad));
    assert.equal(r.pass, false);
    assert.equal(r.code, 1);
    assert.ok(r.errors[0].startsWith("product present"), r.errors[0]);
  });

  it("fails a bad size naming the sizes field", () => {
    const r = gateBrief(mk({ ...BASE, sizes: [{ w: 0, h: 720 }] }));
    assert.equal(r.pass, false);
    assert.ok(r.errors.some((e) => e.startsWith("sizes well-formed")), r.errors.join("; "));
  });

  it("fails an engine name naming the field that carries it", () => {
    const r = gateBrief(mk({ ...BASE, title: "Godot starter cover" }));
    assert.equal(r.pass, false);
    assert.ok(r.errors.some((e) => e.includes('"title"') && e.includes("godot")), r.errors.join("; "));
  });

  it("fails a score claim (9/10) as a score", () => {
    const r = gateBrief(mk({ ...BASE, title: "Rated 9/10 by buyers" }));
    assert.equal(r.pass, false);
    assert.ok(r.errors.some((e) => e.includes("score claim")), r.errors.join("; "));
  });

  it("fails a phone number as personal data", () => {
    const r = gateBrief(mk({ ...BASE, title: "Call +1 555-010-2030 today" }));
    assert.equal(r.pass, false);
    assert.ok(r.errors.some((e) => e.includes("personal data")), r.errors.join("; "));
  });

  it("never trips on engine2040 or slug dates (O-042 regression)", () => {
    assert.ok(!FORBIDDEN_ENGINES.some((w) => "engine2040 ui-1 kit".includes(w)));
    const r = gateBrief(
      mk({ ...BASE, title: "Engine2040 UI-1 Kit", product: "order:game-ui-for-engine2040-eb-2026-10-05-s29" }),
    );
    assert.equal(r.pass, true, r.errors.slice(0, 1).join("; "));
  });

  it("a missing file is SKIP code 2, never PASS", () => {
    const r = gateBrief(join(tmpdir(), "ds-brief-no-such-file.json"));
    assert.equal(r.pass, false);
    assert.equal(r.code, 2);
  });

  it("the samples/cover sketch fails (no product: sketches are not lane briefs)", () => {
    const r = gateBrief(join(ROOT, "samples", "cover", "brief.json"));
    assert.equal(r.pass, false);
    assert.ok(r.errors.some((e) => e.startsWith("product present")), r.errors.join("; "));
  });
});
