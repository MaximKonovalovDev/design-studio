// tests/tokens.test.mjs: DS-02 tokens-01 unit tests.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildCss, buildDocs, checkTokens } from "../tools/tokens.mjs";

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
