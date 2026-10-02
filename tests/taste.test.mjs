// tests/taste.test.mjs: DS-18 taste library unit tests (no browser needed).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { checkTaste } from "../tools/taste.mjs";

const LIB = JSON.parse(readFileSync(new URL("../taste/library.json", import.meta.url), "utf8"));

function setup(lib) {
  const d = mkdtempSync(`${tmpdir()}\\ds-taste-`);
  writeFileSync(join(d, "library.json"), JSON.stringify(lib));
  return join(d, "library.json");
}

describe("taste", () => {
  it("--check passes the shipped 20-exemplar library", () => {
    const { pass, results } = checkTaste();
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
  });

  it("library holds 20 uniquely-id'd exemplars with tokens", () => {
    assert.equal(LIB.exemplars.length, 20);
    assert.equal(new Set(LIB.exemplars.map((e) => e.id)).size, 20);
    for (const e of LIB.exemplars) assert.ok(e.tokens?.colors?.paper, e.id);
  });

  it("fails a short library", () => {
    const p = setup({ ...LIB, exemplars: LIB.exemplars.slice(0, 19) });
    const { pass, results } = checkTaste({ libraryPath: p });
    assert.equal(pass, false);
    assert.ok(results.some((r) => r.name.includes("20 exemplars") && !r.pass));
  });

  it("fails a low-contrast exemplar", () => {
    const bad = JSON.parse(JSON.stringify(LIB));
    bad.exemplars[0].tokens.colors.ink = "#faf7f0";
    const { pass } = checkTaste({ libraryPath: setup(bad) });
    assert.equal(pass, false);
  });
});
