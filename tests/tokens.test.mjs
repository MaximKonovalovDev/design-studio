// tests/tokens.test.mjs: DS-02 tokens-01 unit tests.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildCss, buildDocs, checkTokens, normalizeTokens, resolveColorRefs, usesReferences, HEBREW_STACK, lintPairMates, darkPairGaps, mergeKits } from "../tools/tokens.mjs";

const GOOD = {
  colors: {
    paper: "#faf7f0",
    ink: "#1a1a1a",
    muted: "#57534e",
    accent: "#c2410c",
    "on-accent": "#ffffff",
    line: "#e7e0d3",
  },
  fonts: { display: '"Arial Black", sans-serif', body: '"Segoe UI", sans-serif' },
  spacing: { xs: "8px", sm: "16px", md: "24px" },
};

function setup(tokens, { pageHex = false, drift = false } = {}) {
  const d = mkdtempSync(`${tmpdir()}\\ds-tokens-`);
  writeFileSync(join(d, "tokens.json"), JSON.stringify(tokens));
  writeFileSync(join(d, "tokens.css"), drift ? ":root{--paper: #000000;}\n" : buildCss(tokens));
  writeFileSync(join(d, "tokens.html"), buildDocs(tokens));
  writeFileSync(join(d, "page.html"), pageHex ? '<html dir="ltr"><body style="color:#ff0000">T</body></html>' : '<html dir="ltr"><body style="color: var(--ink)">T</body></html>');
  return d;
}

describe("tokens build", () => {
  it("emits vars for colors, fonts and spacing", () => {
    const css = buildCss(GOOD);
    assert.match(css, /--paper: #faf7f0/);
    assert.match(css, /--font-display/);
    assert.match(css, /--space-sm: 16px/);
  });

  it("docs page styles only via var(--*)", () => {
    const html = buildDocs(GOOD).replace(/<code>[\s\S]*?<\/code>/gi, "");
    assert.equal((html.match(/#[0-9a-fA-F]{6}\b/g) ?? []).length, 0);
  });
});

describe("checkTokens", () => {
  it("passes the shipped sample kit", () => {
    const { pass, results } = checkTokens();
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
  });

  it("fails a hardcoded color in page.html", () => {
    const d = setup(GOOD, { pageHex: true });
    const { pass, results } = checkTokens({ json: join(d, "tokens.json"), css: join(d, "tokens.css"), docs: join(d, "tokens.html"), page: join(d, "page.html") });
    assert.equal(pass, false);
    assert.ok(results.some((r) => r.name.includes("page.html") && !r.pass));
  });

  it("fails css drift from tokens.json", () => {
    const d = setup(GOOD, { drift: true });
    const { pass, results } = checkTokens({ json: join(d, "tokens.json"), css: join(d, "tokens.css"), docs: join(d, "tokens.html"), page: join(d, "page.html") });
    assert.equal(pass, false);
    assert.ok(results.some((r) => r.name.startsWith("diff") && !r.pass));
  });

  it("fails a low-contrast pair", () => {
    const bad = { ...GOOD, colors: { ...GOOD.colors, ink: "#faf7f0" } };
    const d = setup(bad);
    const { pass } = checkTokens({ json: join(d, "tokens.json"), css: join(d, "tokens.css"), docs: join(d, "tokens.html"), page: join(d, "page.html") });
    assert.equal(pass, false);
  });

  it("generated tokens.html renders (smoke)", () => {
    const html = readFileSync(join(setup(GOOD), "tokens.html"), "utf8");
    assert.ok(html.includes("tokens.css") && html.includes("var(--accent)"));
  });
});

describe("Style Dictionary shape + dark + Hebrew", () => {
  const SD = {
    color: {
      paper: { value: "#faf7f0" },
      ink: { value: "#1a1a1a" },
      muted: { value: "#57534e" },
      accent: { value: "#c2410c" },
      "on-accent": { value: "#ffffff" },
      line: { value: "#e7e0d3" },
    },
    font: {
      display: { value: '"Arial Black", sans-serif' },
      body: { value: '"Segoe UI", sans-serif' },
      hebrew: { value: HEBREW_STACK },
    },
    space: { xs: { value: "8px" }, sm: { value: "16px" }, md: { value: "24px" } },
    themes: {
      dark: {
        paper: { value: "#1c1917" },
        ink: { value: "#faf7f0" },
        muted: { value: "#d6d3d1" },
        accent: { value: "#fb923c" },
        "on-accent": { value: "#1c1917" },
        line: { value: "#44403c" },
      },
    },
  };

  it("normalizes value/value nesting to the flat kit", () => {
    const t = normalizeTokens(SD);
    assert.equal(t.colors.paper, "#faf7f0");
    assert.equal(t.colorsDark.accent, "#fb923c");
    assert.equal(t.fonts.hebrew, HEBREW_STACK);
    assert.equal(t.spacing.sm, "16px");
  });

  it("emits light :root plus a dark override block", () => {
    const css = buildCss(SD);
    assert.match(css, /:root\s*\{[^}]*--paper: #faf7f0/);
    assert.match(css, /\[data-theme="dark"\][^}]*--paper: #1c1917/);
    assert.match(css, /--font-hebrew/);
  });

  it("fails a kit with no dark theme", () => {
    const { colors, fonts, spacing } = normalizeTokens(SD);
    const d = mkdtempSync(`${tmpdir()}\\ds-tokens-`);
    const flat = { colors, fonts: { display: fonts.display, body: fonts.body, hebrew: fonts.hebrew }, spacing };
    writeFileSync(join(d, "tokens.json"), JSON.stringify(flat));
    writeFileSync(join(d, "tokens.css"), buildCss(flat));
    writeFileSync(join(d, "tokens.html"), buildDocs(flat));
    writeFileSync(join(d, "page.html"), '<html dir="ltr"><body style="color: var(--ink)">T</body></html>');
    const { pass, results } = checkTokens({ json: join(d, "tokens.json"), css: join(d, "tokens.css"), docs: join(d, "tokens.html"), page: join(d, "page.html") });
    assert.equal(pass, false);
    assert.ok(results.some((r) => r.name.startsWith("dark") && !r.pass));
  });

  it("fails a kit with no Hebrew stack", () => {
    const noHeb = JSON.parse(JSON.stringify(GOOD));
    const d = setup(noHeb);
    const { pass, results } = checkTokens({ json: join(d, "tokens.json"), css: join(d, "tokens.css"), docs: join(d, "tokens.html"), page: join(d, "page.html") });
    assert.equal(pass, false);
    assert.ok(results.some((r) => r.name.startsWith("type") && !r.pass));
  });
});

describe("S12 transform/resolve fixpoint (DS-33)", () => {
  // 3-token chain: brand -> button-base -> button-hover. Hover is declared
  // BEFORE base on purpose: the fixpoint must resolve hover after base with
  // no ordering hack.
  const REF_BASE = {
    colors: {
      paper: "#faf7f0",
      ink: "#1a1a1a",
      muted: "#57534e",
      accent: "#c2410c",
      "on-accent": "#ffffff",
      line: "#e7e0d3",
      brand: "#c2410c",
      "button-hover": "{button-base}",
      "button-base": "{brand}",
    },
    colorsDark: {
      paper: "#1c1917",
      ink: "#faf7f0",
      muted: "#d6d3d1",
      accent: "#fb923c",
      "on-accent": "#1c1917",
      line: "#44403c",
    },
    fonts: { display: '"Arial Black", sans-serif', body: '"Segoe UI", sans-serif', hebrew: HEBREW_STACK },
    spacing: { xs: "8px", sm: "16px", md: "24px" },
  };

  it("resolves the 3-token chain hover-after-base", () => {
    const { resolved, deferred } = resolveColorRefs(REF_BASE.colors);
    assert.deepEqual(deferred, []);
    assert.equal(resolved["button-base"], "#c2410c");
    assert.equal(resolved["button-hover"], "#c2410c");
  });

  it("checkTokens passes the ref-chain kit (refs gates green)", () => {
    const d = setup(REF_BASE);
    const { pass, results } = checkTokens({ json: join(d, "tokens.json"), css: join(d, "tokens.css"), docs: join(d, "tokens.html"), page: join(d, "page.html") });
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
    assert.ok(results.some((r) => r.name.startsWith("refs:") && r.pass && r.detail.includes("aliases resolved")));
  });

  it("emits resolved hex for aliases in tokens.css", () => {
    const css = buildCss(REF_BASE);
    assert.match(css, /--button-base: #c2410c/);
    assert.match(css, /--button-hover: #c2410c/);
    assert.ok(!css.includes("{brand}") && !css.includes("{button-base}"), "no raw {ref} left in emitted css");
  });

  it("resolves Style Dictionary {value} refs via dotted paths", () => {
    const sd = {
      color: {
        accent: { value: "#c2410c" },
        "button-base": { value: "{color.accent}" },
        "button-hover": { value: "{button-base}" },
      },
    };
    const t = normalizeTokens(sd);
    const { resolved, deferred } = resolveColorRefs(t.colors);
    assert.deepEqual(deferred, []);
    assert.equal(resolved["button-hover"], "#c2410c");
  });

  it("fails closed on a circular pair (stall guard, no hang)", () => {
    const circ = JSON.parse(JSON.stringify(REF_BASE));
    circ.colors["button-base"] = "{button-hover}";
    circ.colors["button-hover"] = "{button-base}";
    const { deferred } = resolveColorRefs(circ.colors);
    assert.deepEqual([...deferred].sort(), ["button-base", "button-hover"]);
    const d = setup(circ);
    const { pass, results } = checkTokens({ json: join(d, "tokens.json"), css: join(d, "tokens.css"), docs: join(d, "tokens.html"), page: join(d, "page.html") });
    assert.equal(pass, false);
    assert.ok(results.some((r) => r.name.startsWith("refs:") && !r.pass));
  });
});

describe("DS-35 pair convention + dark override (brandkit-vision-r9 C1)", () => {
  // F2P: pair fixture FAILs tokens --check today (missing on-accent mate).
  const NO_MATE = {
    colors: { paper: "#faf7f0", ink: "#1a1a1a", muted: "#57534e", accent: "#c2410c", line: "#e7e0d3" },
    colorsDark: { paper: "#1c1917", ink: "#faf7f0", muted: "#d6d3d1", accent: "#fb923c", "on-accent": "#1c1917", line: "#44403c" },
    fonts: { display: '"Arial Black", sans-serif', body: '"Segoe UI", sans-serif', hebrew: HEBREW_STACK },
    spacing: { xs: "8px", sm: "16px", md: "24px" },
  };

  it("lints a background without its foreground mate", () => {
    assert.deepEqual(lintPairMates(NO_MATE.colors), ["accent without on-accent"]);
  });

  it("checkTokens FAILs the pair fixture on the convention gate", () => {
    const d = setup(NO_MATE);
    const { pass, results } = checkTokens({ json: join(d, "tokens.json"), css: join(d, "tokens.css"), docs: join(d, "tokens.html"), page: join(d, "page.html") });
    assert.equal(pass, false);
    assert.ok(results.some((r) => r.name.startsWith("pairs: bg/fg") && !r.pass));
  });

  it("flags a dark theme missing a surface-pair override", () => {
    const thin = JSON.parse(JSON.stringify(GOOD));
    thin.colorsDark = { paper: "#1c1917" };
    assert.deepEqual(darkPairGaps(thin.colors, thin.colorsDark).sort(), ["accent", "ink", "on-accent"]);
    const d = setup({ ...GOOD, colorsDark: thin.colorsDark, fonts: { ...GOOD.fonts, hebrew: HEBREW_STACK } });
    const { pass, results } = checkTokens({ json: join(d, "tokens.json"), css: join(d, "tokens.css"), docs: join(d, "tokens.html"), page: join(d, "page.html") });
    assert.equal(pass, false);
    assert.ok(results.some((r) => r.name === "dark: overrides every surface pair" && !r.pass));
  });
});
