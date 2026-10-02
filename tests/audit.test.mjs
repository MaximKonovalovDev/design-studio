// tests/audit.test.mjs: DS-01 audit unit tests (pure math + fixtures).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { luminance, contrastRatio, parseTokens, resolveColor, auditBrief } from "../tools/audit.mjs";

const dir = () => mkdtempSync(`${tmpdir()}\\ds-test-`);

describe("audit math", () => {
  it("black on white is 21:1", () => {
    assert.ok(Math.abs(contrastRatio("#000000", "#ffffff") - 21) < 0.01);
  });

  it("same color is 1:1", () => {
    assert.ok(Math.abs(contrastRatio("#c2410c", "#c2410c") - 1) < 0.001);
  });

  it("rejects non-hex colors", () => {
    assert.throws(() => luminance("red"), /#rrggbb/);
  });

  it("parses :root vars and resolves var() refs", () => {
    const vars = parseTokens(":root { --ink: #1A1A1A; --paper: #FAF7F0; }");
    assert.equal(vars.get("ink"), "#1a1a1a");
    assert.equal(resolveColor("var(--ink)", vars), "#1a1a1a");
    assert.equal(resolveColor("#C2410C", vars), "#c2410c");
    assert.throws(() => resolveColor("var(--missing)", vars), /unresolvable/);
  });
});

describe("auditBrief", () => {
  it("fails closed on a missing image", () => {
    const d = dir();
    writeFileSync(
      join(d, "brief.json"),
      JSON.stringify({
        title: "T",
        size: { w: 1280, h: 720 },
        dir: "ltr",
        tokens: "tokens.css",
        page: "page.html",
        image: "nope.png",
        text: [{ label: "t", fg: "#000000", bg: "#ffffff", min: 4.5 }],
        title_box: [0, 0, 1, 1],
        title_px: 96,
      }),
    );
    writeFileSync(join(d, "tokens.css"), ":root{--a:#000000;--b:#ffffff;}");
    writeFileSync(join(d, "page.html"), '<html dir="ltr"><body>T</body></html>');
    const { pass, errors } = auditBrief(join(d, "brief.json"));
    assert.equal(pass, false);
    assert.ok(errors.some((e) => e.includes("out.png exists")), errors.join("; "));
  });

  it("fails a low-contrast pair with its ratio", () => {
    const d = dir();
    writeFileSync(
      join(d, "brief.json"),
      JSON.stringify({
        title: "T",
        size: { w: 1280, h: 720 },
        dir: "ltr",
        tokens: "tokens.css",
        page: "page.html",
        image: "nope.png",
        text: [{ label: "grey", fg: "#999999", bg: "#ffffff", min: 4.5 }],
        title_box: [0, 0, 1, 1],
        title_px: 96,
      }),
    );
    writeFileSync(join(d, "tokens.css"), ":root{--a:#999999;}");
    writeFileSync(join(d, "page.html"), '<html dir="ltr"><body>T</body></html>');
    const { errors } = auditBrief(join(d, "brief.json"));
    assert.ok(errors.some((e) => e.includes("contrast grey") && e.includes(":1")), errors.join("; "));
  });
});
