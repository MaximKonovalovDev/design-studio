// tests/registry.test.mjs: DS-78c retired block registry (no browser needed).
// The starters moved to archive/2026-10-04/old-starters/; tools/registry.mjs is a stub.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkRegistry, emitBlock, RETIRED } from "../tools/registry.mjs";

describe("registry (retired DS-78c)", () => {
  it("--check reports retired and passes without the archived starters", () => {
    const { pass, retired, results } = checkRegistry();
    assert.equal(retired, true, "marks itself retired");
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
  });

  it("--emit entry point fails closed with the archive path", () => {
    assert.throws(() => emitBlock("hero"), /retired|archive/i);
  });

  it("names the archive and the v1 successor", () => {
    assert.match(RETIRED.archive, /archive\/2026-10-04\/old-starters/);
    assert.match(RETIRED.successor, /template\.mjs/);
  });
});
