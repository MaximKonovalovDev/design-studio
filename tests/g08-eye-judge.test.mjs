// tests/g08-eye-judge.test.mjs: G-08 eye judge unit tests (no browser needed).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EYE_VOTERS, SHIP_VOTES, TOUCH_MIN, toolFacts, eyeVotes, judgeEye, selfCheck } from "../tools/g08-eye-judge.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = () => mkdtempSync(`${tmpdir()}\\ds-g08-test-`);
const brief = (text) => ({
  title: "HELLO WORLD",
  size: { w: 1280, h: 720 },
  dir: "ltr",
  tokens: "tokens.css",
  page: "page.html",
  image: "out.png",
  text,
  title_box: [0, 0, 1, 1],
  title_px: 64,
});
const goodText = [{ label: "title", fg: "var(--ink)", bg: "var(--paper)", min: 4.5 }];
const goodTokens = ":root{--ink:#000000;--paper:#ffffff;--accent:#c2410c;--font-a:Arial;}";
const goodPage = '<html dir="ltr"><head><link rel="stylesheet" href="tokens.css"><style>body{color:var(--ink);background:var(--paper)}.cta{display:inline-block;font-size:32px;color:var(--paper);padding:20px 64px;min-height:44px}</style></head><body><h1>HELLO WORLD</h1><span class="cta">go</span></body></html>';
const mkSample = (text = goodText, tokens = goodTokens, page = goodPage) => {
  const d = dir();
  writeFileSync(join(d, "brief.json"), JSON.stringify(brief(text)));
  writeFileSync(join(d, "tokens.css"), tokens);
  writeFileSync(join(d, "page.html"), page);
  return join(d, "brief.json");
};

describe("g08 eye judge", () => {
  it("has 5 voters with floor 4 and a 44px touch gate", () => {
    assert.equal(EYE_VOTERS.length, 5);
    assert.equal(SHIP_VOTES, 4);
    assert.equal(TOUCH_MIN, 44);
  });

  it("tool-facts pass first on a good sample", () => {
    const f = toolFacts(mkSample());
    assert.ok(f.contrast.length >= 1);
    assert.equal(f.touch.length, 3);
    assert.equal(f.pass, true);
  });

  it("good sample ships 5/5", () => {
    const r = judgeEye(mkSample());
    assert.equal(r.agree, 5);
    assert.equal(r.ship, true);
  });

  it("one dissent still ships 4/5", () => {
    const r = judgeEye(mkSample([{ label: "title", fg: "#999999", bg: "#ffffff", min: 4.5 }]));
    assert.equal(r.agree, 4);
    assert.equal(r.ship, true);
  });

  it("broken sample reworks below 4", () => {
    const p = mkSample(
      [{ label: "title", fg: "#999999", bg: "#ffffff", min: 4.5 }],
      ":root{--ink:#999999;--paper:#ffffff;--accent:#999999;--font-a:Arial;}",
      '<html dir="ltr"><body>no title here</body></html>',
    );
    const r = judgeEye(p);
    assert.ok(r.agree < SHIP_VOTES, `${r.agree}/5 should be < 4`);
    assert.equal(r.ship, false);
  });

  it("tiny cta fails the touch eye but one dissent still ships", () => {
    const tiny = goodPage.replaceAll("32px", "10px").replaceAll("20px 64px", "1px 2px").replaceAll("min-height:44px", "min-height:10px");
    const r = eyeVotes(mkSample(goodText, goodTokens, tiny));
    assert.equal(r.votes.find((v) => v.voter === "touch")?.pass, false);
    assert.equal(r.agree, 4);
    assert.equal(r.ship, true);
  });

  it("samples/cover ships on real pixels", () => {
    const r = judgeEye(join(ROOT, "samples", "cover", "brief.json"));
    assert.ok(r.agree >= SHIP_VOTES, `${r.agree}/5 should ship`);
    assert.equal(r.ship, true);
  });

  it("self-check passes", () => {
    const { pass, results } = selfCheck();
    assert.equal(pass, true, results.filter((x) => !x.pass).map((x) => x.name).join("; "));
  });
});
