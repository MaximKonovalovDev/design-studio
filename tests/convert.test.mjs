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
    const { pass, results } = checkConvert({ root: tmp });
    assert.equal(pass, false, "identical variants must FAIL");
    assert.ok(results.some((r) => !r.pass && r.name.includes("differ")), "names the differ gate");
  });

  it("fails closed when a plan selector names nothing on the page", () => {
    const tmp = mkdtempSync(join(tmpdir(), "ds-convert-plan-"));
    cpSync(join("convert"), join(tmp, "convert"), { recursive: true });
    const plan = JSON.parse(readFileSync(join(tmp, "convert", "plan.json"), "utf8"));
    plan.steps.push({ page: "a", selector: ".does-not-exist", action: "click", expect: "boom" });
    writeFileSync(join(tmp, "convert", "plan.json"), JSON.stringify(plan), "utf8");
    const { pass } = checkConvert({ root: tmp });
    assert.equal(pass, false, "dangling selector must FAIL");
  });
});
