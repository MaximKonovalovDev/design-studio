// tests/a06-cards.test.mjs (A-06): 3 token cards plus one-token restyle proof.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  A06_TOKENS,
  cardCss,
  renderSummary,
  renderProof,
  renderCta,
  renderAll,
  restyle,
  shiftProof,
} from "../tokens/a06-cards.mjs";

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/;

describe("A-06 token cards", () => {
  it("renders 3 cards with card parts", () => {
    const cards = renderAll();
    assert.equal(cards.length, 3);
    for (const html of cards) {
      assert.ok(html.includes('class="card '), "shell part present");
      assert.ok(html.includes("card-header"), "header part present");
      assert.ok(html.includes("card-content"), "content part present");
      assert.ok(html.includes("card-footer"), "footer part present");
    }
    assert.ok(renderSummary().includes("card-summary"));
    assert.ok(renderProof().includes("card-proof"));
    assert.ok(renderCta().includes("card-cta"));
  });

  it("cards hold no hex: color comes only from tokens via var(--*)", () => {
    for (const html of renderAll()) {
      assert.ok(!HEX_RE.test(html), `hex found in card: ${html.slice(0, 80)}`);
      assert.ok(html.includes("var(--color-"), "card refs a color token");
    }
  });

  it("css carries every token var", () => {
    const css = cardCss();
    for (const k of ["paper", "ink", "accent", "line"]) {
      assert.ok(css.includes(`--color-${k}:`), `${k} var present`);
    }
    assert.ok(css.includes("--radius-card:"), "radius var present");
  });

  it("one token change shifts all 3 cards", () => {
    const r = shiftProof();
    assert.deepEqual(r.changed, [true, true, true], "each card html shifts with its css");
    assert.deepEqual(r.moved, [true, true, true], "each card page hash moves");
    assert.equal(r.pass, true);
    assert.match(r.cssAfter, /--color-accent: #1d4ed8/);
  });

  it("restyle keeps the base file intact", () => {
    const accentBefore = A06_TOKENS.color.accent.value;
    const next = restyle(A06_TOKENS, { color: { accent: { value: "#1d4ed8" } } });
    assert.equal(A06_TOKENS.color.accent.value, accentBefore, "base not mutated");
    assert.equal(next.color.accent.value, "#1d4ed8");
    assert.equal(next.color.paper.value, A06_TOKENS.color.paper.value);
  });
});
