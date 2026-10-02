// tests/judge.test.mjs: DS-06 rubric judge unit tests (no browser needed).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RUBRIC_ID, SHIP_FLOOR, CHECK_IDS, judgeSample, writeReview, selfCheck } from "../tools/judge.mjs";

const dir = () => mkdtempSync(`${tmpdir()}\\ds-judge-test-`);
const brief = (over = {}) => ({
  title: "HELLO WORLD",
  size: { w: 1280, h: 720 },
  dir: "ltr",
  tokens: "tokens.css",
  page: "page.html",
  image: "missing.png",
  text: [{ label: "title", fg: "var(--ink)", bg: "var(--paper)", min: 4.5 }],
  title_box: [0, 0, 1, 1],
  title_px: 64,
  ...over,
});
const page = (title = "HELLO WORLD") =>
  `<html dir="ltr"><head><link rel="stylesheet" href="tokens.css"><style>body{color:var(--ink);background:var(--paper);font-family:var(--font-a)}h1{font-size:64px}</style></head><body><h1>${title}</h1><span class="cta">go</span></body></html>`;

describe("judge rubric", () => {
  it("is ds-quality-v1 with 10 checks and floor 8", () => {
    assert.equal(RUBRIC_ID, "ds-quality-v1");
    assert.equal(CHECK_IDS.length, 10);
    assert.equal(SHIP_FLOOR, 8);
  });

  it("rejects a broken sample below the floor with named faults", () => {
    const d = dir();
    writeFileSync(join(d, "brief.json"), JSON.stringify(brief()));
    writeFileSync(join(d, "tokens.css"), ":root{--ink:#999999;--paper:#ffffff;--accent:#999999;--font-a:Arial;}");
    writeFileSync(join(d, "page.html"), '<html dir="ltr"><body>no title here</body></html>');
    const r = judgeSample(join(d, "brief.json"));
    assert.equal(r.max, 10);
    assert.ok(r.score < SHIP_FLOOR, `score ${r.score} should be < 8`);
    assert.equal(r.pass, false);
    assert.ok(r.errors.length > 0);
  });

  it("writes DESIGN-REVIEW.md with rubric and verdict", () => {
    const d = dir();
    writeFileSync(join(d, "brief.json"), JSON.stringify(brief()));
    writeFileSync(join(d, "tokens.css"), ":root{--ink:#000000;--paper:#ffffff;--accent:#c2410c;--font-a:Arial;}");
    writeFileSync(join(d, "page.html"), page());
    const r = judgeSample(join(d, "brief.json"));
    const out = writeReview(join(d, "brief.json"), r);
    const text = readFileSync(out, "utf8");
    assert.ok(text.includes(RUBRIC_ID));
    assert.ok(/SHIP|REWORK/.test(text));
  });

  it("self-check passes (fixtures + real samples/cover)", () => {
    const { pass, results } = selfCheck();
    assert.equal(pass, true, results.filter((x) => !x.pass).map((x) => x.name).join("; "));
  });
});
