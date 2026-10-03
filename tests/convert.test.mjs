// tests/convert.test.mjs: DS-17 conversion harness unit tests (no browser needed).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkConvert } from "../tools/convert.mjs";

describe("convert", () => {
  it("--check passes (2 variants differ, click plan covers A+B)", () => {
    const { pass, results } = checkConvert();
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
  });

  it("fails closed when the variants are identical", () => {
    const tmp = mkdtempSync(join(tmpdir(), "ds-convert-"));
    mkdirSync(join(tmp, "convert", "variants"), { recursive: true });
    cpSync(join("convert", "variants", "a.html"), join(tmp, "convert", "variants", "a.html"));
    cpSync(join("convert", "variants", "a.html"), join(tmp, "convert", "variants", "b.html"));
    cpSync(join("convert", "plan.json"), join(tmp, "convert", "plan.json"));
    cpSync(join("samples", "cover-b"), join(tmp, "samples", "cover-b"), { recursive: true });
    const { pass, results } = checkConvert({ root: tmp });
    assert.equal(pass, false, "identical variants must FAIL");
    assert.ok(results.some((r) => !r.pass && r.name.includes("differ")), "names the differ gate");
  });

  it("fails closed when a plan selector names nothing on the page", () => {
    const tmp = mkdtempSync(join(tmpdir(), "ds-convert-plan-"));
    cpSync(join("convert"), join(tmp, "convert"), { recursive: true });
    cpSync(join("samples", "cover-b"), join(tmp, "samples", "cover-b"), { recursive: true });
    const plan = JSON.parse(readFileSync(join(tmp, "convert", "plan.json"), "utf8"));
    plan.steps.push({ page: "a", selector: ".does-not-exist", action: "click", expect: "boom" });
    writeFileSync(join(tmp, "convert", "plan.json"), JSON.stringify(plan), "utf8");
    const { pass } = checkConvert({ root: tmp });
    assert.equal(pass, false, "dangling selector must FAIL");
  });

  it("fails closed when the live page receipt rev is stale (LAND-03)", () => {
    const tmp = mkdtempSync(join(tmpdir(), "ds-convert-live-"));
    cpSync(join("convert"), join(tmp, "convert"), { recursive: true });
    cpSync(join("samples", "cover-b"), join(tmp, "samples", "cover-b"), { recursive: true });
    const rp = join(tmp, "samples", "cover-b", "receipt.json");
    const r = JSON.parse(readFileSync(rp, "utf8"));
    r.rev = "0000000deadbeef";
    writeFileSync(rp, JSON.stringify(r), "utf8");
    const { pass, results } = checkConvert({ root: tmp });
    assert.equal(pass, false, "stale live rev must FAIL");
    assert.ok(results.some((x) => !x.pass && x.name.includes("rev pinned")), "names the rev pin gate");
  });

  it("fails closed when plan.live is missing (LAND-03)", () => {
    const tmp = mkdtempSync(join(tmpdir(), "ds-convert-nolive-"));
    cpSync(join("convert"), join(tmp, "convert"), { recursive: true });
    cpSync(join("samples", "cover-b"), join(tmp, "samples", "cover-b"), { recursive: true });
    const plan = JSON.parse(readFileSync(join(tmp, "convert", "plan.json"), "utf8"));
    delete plan.live;
    writeFileSync(join(tmp, "convert", "plan.json"), JSON.stringify(plan), "utf8");
    const { pass, results } = checkConvert({ root: tmp });
    assert.equal(pass, false, "missing plan.live must FAIL");
    assert.ok(results.some((x) => !x.pass && x.name.includes("live page receipt declared")), "names the live gate");
  });
});
