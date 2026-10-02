// tests/agent-block.test.mjs: DS-05 prompt-to-block loop unit tests (no browser needed).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { auditBrief } from "../tools/audit.mjs";
import { pngDims } from "../tools/render.mjs";
import { RUBRIC_ID, SHIP_FLOOR, judgeSample } from "../tools/judge.mjs";
import {
  BLOCK_ID,
  buildBlock,
  expandBrief,
  gateBlock,
  runBlockLoop,
  selfCheck,
  syntheticPng,
} from "../tools/agent-block.mjs";

const dir = () => mkdtempSync(`${tmpdir()}\\ds-block-test-`);

describe("agent-block loop", () => {
  it("reuses the shared rubric and floor (no fork)", () => {
    assert.equal(BLOCK_ID, "ds-agent-block-v1");
    assert.equal(RUBRIC_ID, "ds-quality-v1");
    assert.equal(SHIP_FLOOR, 8);
  });

  it("brief-in builds a shippable block-out", () => {
    const d = dir();
    const b = buildBlock({ title: "DESIGN THAT SHIPS" }, d);
    for (const f of ["brief.json", "tokens.css", "page.html", "out.png"]) {
      assert.ok(existsSync(join(d, f)), `${f} written`);
    }
    assert.ok(b.judged.score >= SHIP_FLOOR, `score ${b.judged.score} >= 8`);
    assert.equal(b.judged.pass, true);
    assert.equal(b.shippable, true);
    assert.equal(auditBrief(join(d, "brief.json")).pass, true);
  });

  it("fails closed below the floor (never SHIP)", () => {
    const d = dir();
    writeFileSync(join(d, "brief.json"), JSON.stringify({ ...expandBrief({ title: "DESIGN THAT SHIPS" }), image: "missing.png" }));
    writeFileSync(join(d, "tokens.css"), ":root{--ink:#999999;--paper:#ffffff;--accent:#999999;--font-a:Arial;}");
    writeFileSync(join(d, "page.html"), '<html dir="ltr"><body>no title here</body></html>');
    const r = judgeSample(join(d, "brief.json"));
    assert.ok(r.score < SHIP_FLOOR, `score ${r.score} < 8`);
    const g = gateBlock(r);
    assert.equal(g.ship, false);
    assert.ok(/REWORK/.test(g.verdict));
  });

  it("loop converges seed-fail then block-ship with a receipt", () => {
    const d = dir();
    const receipt = runBlockLoop({ prompt: { title: "DESIGN THAT SHIPS" }, outDir: d, maxIters: 3 });
    assert.ok(receipt.iterations.length >= 2, `${receipt.iterations.length} iters`);
    assert.equal(receipt.iterations[0].pass, false);
    assert.equal(receipt.best.pass, true);
    assert.equal(receipt.converged, true);
    assert.ok(existsSync(join(d, "iterations.json")));
    const review = readFileSync(receipt.review, "utf8");
    assert.ok(review.includes(RUBRIC_ID));
  });

  it("rtl prompt stays green", () => {
    const d = dir();
    const b = buildBlock({ title: "עיצוב שמנצח", dir: "rtl" }, d);
    assert.equal(b.judged.pass, true);
    assert.ok(b.judged.score >= SHIP_FLOOR);
  });

  it("synthetic placeholder PNG carries true dims", () => {
    const buf = syntheticPng({ w: 1080, h: 1080 });
    const dims = pngDims(buf);
    assert.deepEqual(dims, { w: 1080, h: 1080 });
    assert.ok(buf.length >= 4096, `${buf.length}B >= 4096B`);
  });

  it("self-check passes (no browser needed)", () => {
    const { pass, results } = selfCheck();
    assert.equal(pass, true, results.filter((x) => !x.pass).map((x) => x.name).join("; "));
  });
});
