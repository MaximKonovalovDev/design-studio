// tests/figma.test.mjs: DS-08 figma-01 verdict gate after the DS-78c mapping retirement
// (no network). The Landing/* -> templates/blocks mapping is retired with the archived
// starters; what stays is the LAND-04 verdict gate over the landing samples.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkFigma, checkLandingVerdict, verdictFor, LANDING_VERDICT_SAMPLES, RETIRED_MAPPING } from "../tools/figma.mjs";

describe("figma verdict gate (mapping retired DS-78c)", () => {
  it("verdict gate passes on the real repo (SHIP reviews on the landing samples)", () => {
    const rows = checkLandingVerdict();
    assert.ok(rows.length >= 2, `expected 2+ verdict rows, got ${rows.length}`);
    assert.ok(rows.every((r) => r.pass), rows.filter((r) => !r.pass).map((r) => r.name).join("; "));
    assert.deepEqual(rows.map((r) => r.name), LANDING_VERDICT_SAMPLES.map((s) => `landing verdict ${s} SHIP`));
  });

  it("--check passes (retired mapping noted, no MCP, no network, verdicts SHIP)", () => {
    const { pass, results } = checkFigma();
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
    assert.ok(results.some((r) => r.pass && r.name.includes("retired")), "notes the retired mapping");
  });

  it("verdict fails closed when the review is missing", () => {
    const tmp = mkdtempSync(join(tmpdir(), "ds-figma-verdict-"));
    const r = verdictFor("no-such-sample", tmp);
    assert.equal(r.pass, false);
    assert.match(r.detail, /missing|DESIGN-REVIEW/i);
  });

  it("names the archive behind the retired mapping", () => {
    assert.match(RETIRED_MAPPING.archive, /archive\/2026-10-04\/old-starters/);
  });
});
