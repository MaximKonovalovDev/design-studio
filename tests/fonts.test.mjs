// tests/fonts.test.mjs: self-hosted fonts unit tests (no network, temp HOME-safe).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseAddArgs, normalizeSlug, cssFor, pairText, checkFonts, HEBREW_PAIR, DISPLAY_PAIR } from "../tools/fonts.mjs";

describe("fonts args", () => {
  it("parses families + weights + subsets", () => {
    const r = parseAddArgs(["heebo", "frank-ruhl-libre", "--subsets", "hebrew,latin"]);
    assert.deepEqual(r.families, ["heebo", "frank-ruhl-libre"]);
    assert.deepEqual(r.weights, [400, 700]);
    assert.deepEqual(r.subsets, ["hebrew", "latin"]);
  });

  it("normalizes slugs", () => {
    assert.equal(normalizeSlug("Frank Ruhl Libre"), "frank-ruhl-libre");
  });

  it("defaults to 400,700 latin", () => {
    const r = parseAddArgs(["inter"]);
    assert.deepEqual(r.weights, [400, 700]);
    assert.deepEqual(r.subsets, ["latin"]);
  });
});

describe("fonts css", () => {
  it("emits relative @font-face with font-display swap", () => {
    const css = cssFor({ families: { heebo: { cssFamily: "Heebo", files: ["heebo-hebrew-400-normal.woff2"] } } });
    assert.match(css, /@font-face/);
    assert.match(css, /font-display: swap/);
    assert.match(css, /url\(\.\/heebo\/heebo-hebrew-400-normal\.woff2\)/);
  });
});

describe("fonts pairs", () => {
  it("hebrew pair is Heebo body + Frank Ruhl Libre headings", () => {
    assert.equal(HEBREW_PAIR.body.slug, "heebo");
    assert.equal(HEBREW_PAIR.headings.slug, "frank-ruhl-libre");
    assert.match(pairText("he"), /Heebo/);
    assert.match(pairText("he"), /Frank Ruhl Libre/);
  });

  it("display pair prints two OFL-1.1 latin families", () => {
    assert.equal(DISPLAY_PAIR.length, 2);
    assert.ok(DISPLAY_PAIR.every((d) => d.license === "OFL-1.1" && d.subsets.includes("latin")));
    assert.match(pairText("display"), /Rubik/);
    assert.match(pairText("display"), /Inter/);
  });
});

describe("fonts check", () => {
  it("passes on the real repo fonts/", () => {
    const { pass, results } = checkFonts();
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
  });
});
