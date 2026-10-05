// tests/c04-frame-pull.test.mjs: C-04 framelink frame pull proof.
// No network. No secrets. Fixture pull only.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  pullFrame,
  tokenNamesSurvive,
  tokenFromEnv,
  checkC04,
  FIXTURE_PULL,
  FIXTURE_TOKEN_NAMES,
} from "../tools/c04-frame-pull.mjs";
import { FIXTURE_FRAME_URL } from "../tools/g09-figma-rtl.mjs";

const NO_TOKEN_ENV = {};

describe("c04 frame pull (fixture)", () => {
  it("pulls fixture JSON with an honest NO-TOKEN label", () => {
    const r = pullFrame({ frameUrl: FIXTURE_FRAME_URL, env: NO_TOKEN_ENV });
    assert.equal(r.ok, true);
    assert.equal(r.mode, "fixture");
    assert.equal(r.label, "NO-TOKEN");
    assert.equal(r.data.frameId, "12:34");
  });

  it("builds a live-shape (not a live call) when a token is set", () => {
    const r = pullFrame({ frameUrl: FIXTURE_FRAME_URL, env: { FIGMA_TOKEN: "secret-123" } });
    assert.equal(r.ok, true);
    assert.equal(r.mode, "live-shape");
    assert.equal(JSON.stringify(r).includes("secret-123"), false);
  });

  it("reads the token env read-only and names it without the value", () => {
    assert.deepEqual(tokenFromEnv(NO_TOKEN_ENV), { present: false, name: null });
    const t = tokenFromEnv({ FIGMA_DOC_TOKEN: "secret-123" });
    assert.equal(t.present, true);
    assert.equal(t.name, "FIGMA_DOC_TOKEN");
  });

  it("token names survive the fixture pull", () => {
    const s = tokenNamesSurvive(FIXTURE_PULL.tokens, FIXTURE_TOKEN_NAMES);
    assert.equal(s.pass, true);
    assert.deepEqual(s.missing, []);
  });

  it("spots a dropped token name", () => {
    const thin = { "--paper": "#faf7f0" };
    const s = tokenNamesSurvive(thin, FIXTURE_TOKEN_NAMES);
    assert.equal(s.pass, false);
    assert.ok(s.missing.includes("--ink"));
  });

  it("fails closed on a bad frame URL", () => {
    const r = pullFrame({ frameUrl: "https://example.com/nope", env: NO_TOKEN_ENV });
    assert.equal(r.ok, false);
  });

  it("--check passes offline", () => {
    const { pass, results, mode, label } = checkC04({ env: NO_TOKEN_ENV });
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
    assert.equal(mode, "fixture");
    assert.equal(label, "NO-TOKEN");
  });
});
