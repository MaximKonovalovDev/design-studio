// tests/audit.test.mjs: DS-01 audit unit tests (pure math + fixtures).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { luminance, contrastRatio, parseTokens, parseTokensDark, resolveColor, auditBrief, rtlSelfCheck } from "../tools/audit.mjs";

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

  it("reads light from :root even when a dark block shadows it", () => {
    const css = ":root{--paper:#FAF7F0;--ink:#1A1A1A;}[data-theme=\"dark\"]{--paper:#1C1917;--ink:#FAF7F0;}";
    assert.equal(parseTokens(css).get("paper"), "#faf7f0");
    assert.equal(parseTokensDark(css).get("paper"), "#1c1917");
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

describe("rtl gate (DS-16: dir + logical + Hebrew type)", () => {
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
  const KIT =
    ":root{--paper:#faf7f0;--ink:#1a1a1a;--muted:#57534e;--accent:#c2410c;--on-accent:#ffffff;--line:#e7e0d3;" +
    '--font-hebrew:"Heebo", "Assistant", Arial, sans-serif;}';
  const rtlPage = (css, attrs = 'lang="he" dir="rtl"') =>
    `<!DOCTYPE html><html ${attrs}><head><link rel="stylesheet" href="tokens.css">` +
    `<style>body{width:1280px;height:720px;background:var(--paper);color:var(--ink);font-family:var(--font-hebrew);}${css}</style></head>` +
    `<body><h1>עיצוב שמנצח</h1></body></html>`;
  const mkRtl = ({ css = "h1{font-family:var(--font-hebrew);font-size:96px;}", tokens = KIT, attrs, dir: want = "rtl" } = {}) => {
    const d = dir();
    writeFileSync(
      join(d, "brief.json"),
      JSON.stringify({
        title: "עיצוב שמנצח",
        size: { w: 1280, h: 720 },
        dir: want,
        tokens: "tokens.css",
        page: "page.html",
        image: "out.png",
        text: [{ label: "t", fg: "var(--ink)", bg: "var(--paper)", min: 4.5 }],
        title_box: [0, 0, 1, 1],
        title_px: 96,
      }),
    );
    writeFileSync(join(d, "tokens.css"), tokens);
    writeFileSync(join(d, "page.html"), rtlPage(css, attrs));
    copyFileSync(join(ROOT, "samples", "hebrew-hero", "out.png"), join(d, "out.png"));
    return join(d, "brief.json");
  };
  const rtlNames = (r) => r.checks.filter((c) => c.name.startsWith("rtl:")).map((c) => `${c.name}=${c.pass ? "1" : "0"}`).join(",");

  it("good rtl passes all three rtl gates", () => {
    const r = auditBrief(mkRtl());
    assert.equal(rtlNames(r), "rtl: html dir=rtl=1,rtl: logical properties only=1,rtl: Hebrew type pair=1");
    assert.equal(r.pass, true);
  });

  it("missing dir=rtl fails the dir gate", () => {
    const r = auditBrief(mkRtl({ attrs: 'lang="he"' }));
    assert.ok(r.errors.some((e) => e.includes("rtl: html dir=rtl")), r.errors.join("; "));
  });

  it("physical CSS fails the logical gate", () => {
    const r = auditBrief(mkRtl({ css: "h1{margin-left:8px;font-family:var(--font-hebrew);}" }));
    assert.ok(r.errors.some((e) => e.includes("rtl: logical properties only")), r.errors.join("; "));
  });

  it("no --font-hebrew pair fails the type gate", () => {
    const r = auditBrief(
      mkRtl({ css: "h1{color:var(--ink);}", tokens: ":root{--paper:#faf7f0;--ink:#1a1a1a;}" }),
    );
    assert.ok(r.errors.some((e) => e.includes("rtl: Hebrew type pair")), r.errors.join("; "));
  });

  it("--rtl --check self-test passes on disk", () => {
    const { pass, results } = rtlSelfCheck();
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
  });
});
