// tests/workshop.test.mjs: DS-78c retired workshop (no browser needed).
// Stories + snapshots moved to archive/2026-10-04/old-starters/workshop/;
// tools/workshop.mjs is a stub keeping only the pure normalizeStory.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkWorkshop, normalizeStory, writeSnapshots, RETIRED } from "../tools/workshop.mjs";

describe("workshop (retired DS-78c)", () => {
  it("--check reports retired and passes without the archived workshop", () => {
    const { pass, retired, results } = checkWorkshop();
    assert.equal(retired, true, "marks itself retired");
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
  });

  it("normalizeStory is idempotent", () => {
    const once = normalizeStory("a  \r\nb\n");
    assert.equal(normalizeStory(once), once, "second pass is a fixed point");
  });

  it("--write fails closed with the archive path", () => {
    assert.throws(() => writeSnapshots(), /retired|archive/i);
  });

  it("names the archived workshop", () => {
    assert.match(RETIRED.archive, /archive\/2026-10-04\/old-starters\/workshop/);
  });
});
