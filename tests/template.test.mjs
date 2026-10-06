// tests/template.test.mjs: the template system (tools/template.mjs) without touching designs/.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CONTRAST_PAIRS, TOKENS, check, fitTitle, hardColours, inlineTokens, loadPalettes, loadTemplate, newOrder, paletteProblems, parseArgs, stamp, templateDirs, tokensCss, wrapTitle } from "../tools/template.mjs";

const palettes = loadPalettes();
const good = () => structuredClone(palettes["clean-professional"]);
const scratch = () => mkdtempSync(join(tmpdir(), "ds-tpl-test-"));

describe("palettes", () => {
  it("8 palettes, 2 or more dark, each with every token and the 7 contrast pairs", () => {
    const ids = Object.keys(palettes);
    assert.equal(ids.length, 8);
    assert.ok(ids.filter((id) => palettes[id].dark === true).length >= 2);
    for (const id of ids) assert.deepEqual(paletteProblems(palettes[id]), [], id);
    assert.equal(CONTRAST_PAIRS.length, 7);
  });
  it("a low-contrast pair, a missing token and a double-quoted font stack fail", () => {
    const low = good(); low.tokens.muted = low.tokens.bg;
    assert.ok(paletteProblems(low).some((x) => x.includes("muted on bg")));
    const gap = good(); delete gap.tokens["chip-line"];
    assert.ok(paletteProblems(gap).some((x) => x.includes("chip-line")));
    const quoted = good(); quoted.fonts.body = '"Segoe UI", Arial';
    assert.ok(paletteProblems(quoted).some((x) => x.includes("double quotes")));
  });
  it("tokens.css carries the 10 colour tokens and the 4 font stacks", () => {
    const css = tokensCss(good(), "clean-professional", "T-1 social/card");
    for (const k of [...TOKENS, "font-display", "font-body", "font-mono", "font-hebrew"]) assert.ok(css.includes(`--${k}:`), k);
  });
  it("inlineTokens swaps var() for the literal value and drops the tokens.css link", () => {
    const p = good();
    const out = inlineTokens('<link rel="stylesheet" href="tokens.css">\n<td style="color: var(--ink); background: var(--bg)">x</td>', p);
    assert.ok(out.includes(p.tokens.ink) && out.includes(p.tokens.bg));
    assert.ok(!out.includes("var(--") && !out.includes("tokens.css"));
  });
});

describe("colours written by hand", () => {
  it("hex, rgb() and named colours are found", () => {
    assert.deepEqual(hardColours("<style>a { color: #ff0000; }</style>"), ["#ff0000"]);
    assert.ok(hardColours("<style>a { color: rgb(1, 2, 3); }</style>").length);
    assert.ok(hardColours("<style>a { background: white; }</style>").includes("white"));
    assert.ok(hardColours("a { color: #abc; }", "x.css").includes("#abc"));
  });
  it("tokens, color-mix of tokens, black shadows and anchors are allowed", () => {
    const ok = '<a href="#top">x</a><style>a { color: var(--ink); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); background: color-mix(in srgb, var(--ink) 12%, transparent); }</style>';
    assert.deepEqual(hardColours(ok), []);
  });
});

describe("the templates on disk", () => {
  it("the check passes with 0 notes: every slot has a default, 0 colours by hand, every stamp clean", () => {
    const r = check({ log: () => {} });
    assert.deepEqual(r.results.filter((x) => !x.pass).map((x) => `${x.name}: ${x.detail}`), []);
    assert.deepEqual(r.notes, []);
  });
  it("3 cover layouts and 11 page templates, each with a preview picture", () => {
    const dirs = templateDirs();
    assert.equal(dirs.filter((d) => d.family === "covers").length, 3);
    assert.equal(dirs.filter((d) => d.family !== "covers").length, 11);
    for (const d of dirs) assert.ok(existsSync(join(d.dir, "preview.png")), `${d.ref} preview.png`);
  });
  it("the old starters are not templates here", () => {
    assert.ok(!templateDirs().some((d) => ["pages", "blocks"].includes(d.family)));
    assert.throws(() => loadTemplate("pages/cover"), /family/);
  });
});

describe("stamp", () => {
  it("a page: slots filled and escaped, tokens.css from the palette, brief.json with title, order and palette", () => {
    const st = stamp({ template: "social/card", palette: "neon", order: "T-1", slots: { TITLE: "Cut & Paste <Kit>" } });
    const page = st.files.get("page.html");
    assert.ok(page.includes("Cut &amp; Paste &lt;Kit&gt;"));
    assert.ok(!page.includes("{{"));
    assert.ok(st.files.get("tokens.css").includes(palettes.neon.tokens.bg));
    const brief = JSON.parse(st.files.get("brief.json"));
    assert.equal(brief.order, "T-1");
    assert.equal(brief.palette, "neon");
    assert.equal(brief.template, "social/card");
    assert.equal(brief.sizes.length, 3);
    assert.ok(!st.sample.includes("TITLE"));
    assert.ok(st.sample.includes("CLAIM"));
  });
  it("rtl: DIR and LANG reach the page and the brief", () => {
    const st = stamp({ template: "print/portfolio-card", order: "T-2", slots: { DIR: "rtl", LANG: "he" } });
    assert.ok(/<html lang="he" dir="rtl">/.test(st.files.get("page.html")));
    assert.equal(JSON.parse(st.files.get("brief.json")).dir, "rtl");
  });
  it("email: the sendable page carries literal colours, its var() twin stays for the audit", () => {
    const st = stamp({ template: "email/announce", order: "T-3" });
    assert.ok(!st.files.get("page.html").includes("var(--"));
    assert.ok(st.files.get("page.tokens.html").includes("var(--"));
    assert.equal(JSON.parse(st.files.get("brief.json")).page, "page.tokens.html");
  });
  it("a cover: cover.json takes tokens and fonts from the palette and a title that fits", () => {
    const st = stamp({ template: "covers/app-window", palette: "editorial", order: "T-4", slots: { TITLE: "Keyword Steroids 70" } });
    const spec = JSON.parse(st.files.get("cover.json"));
    assert.equal(spec.title, "Keyword Steroids 70");
    assert.equal(spec.pick, "editorial");
    assert.deepEqual(spec.tokens, Object.fromEntries(TOKENS.map((k) => [k, palettes.editorial.tokens[k]])));
    assert.ok(spec.titlePx >= 64 && spec.titlePxCard >= 32);
    assert.ok(st.files.has("art.html") && st.files.has("art.css"));
    assert.ok(st.pictures.length > 0);
  });
  it("NEED-15: covers/app-window defaults to the OFL shelf, no system-font hand fix", () => {
    const st = stamp({ template: "covers/app-window", order: "T-15" });
    const spec = JSON.parse(st.files.get("cover.json"));
    for (const k of ["display", "body"]) {
      assert.ok(spec.fonts[k].startsWith("'Inter'"), `${k}: ${spec.fonts[k]}`);
      assert.ok(!/Bahnschrift|Segoe UI/.test(spec.fonts[k]), `${k}: ${spec.fonts[k]}`);
    }
    const shelf = JSON.parse(readFileSync(join("fonts", "fonts.json"), "utf8"));
    assert.ok(shelf.families?.inter?.license?.startsWith("OFL"), "inter is OFL stock");
  });
  it("an unknown slot, palette, picture or a {{ in a value is refused", () => {
    assert.throws(() => stamp({ template: "social/card", slots: { NOPE: "x" } }), /unknown slot NOPE/);
    assert.throws(() => stamp({ template: "social/card", palette: "nope" }), /unknown palette/);
    assert.throws(() => stamp({ template: "covers/app-window", assets: { nope: "x.png" } }), /unknown picture nope/);
    assert.throws(() => stamp({ template: "social/card", slots: { TITLE: "a {{b}}" } }), /holds a \{\{/);
    assert.throws(() => stamp({ template: "social/card", slots: { ORDER: "x" } }), /set by the tool/);
  });
});

describe("new", () => {
  it("writes the order folder and never overwrites one", () => {
    const designsDir = scratch();
    try {
      const st = newOrder("T-9", { template: "web/site" }, { designsDir });
      for (const f of ["page.html", "guide.html", "tool.html", "privacy.html", "site.css", "tokens.css", "brief.json"]) assert.ok(existsSync(join(st.dest, f)), f);
      assert.ok(!readFileSync(join(st.dest, "guide.html"), "utf8").includes("{{"));
      assert.throws(() => newOrder("T-9", { template: "web/site" }, { designsDir }), /exists already/);
      mkdirSync(join(designsDir, "T-10"));
      assert.throws(() => newOrder("T-10", { template: "social/card" }, { designsDir }), /exists already/);
    } finally { rmSync(designsDir, { recursive: true, force: true }); }
  });
});

describe("title fit and the command line", () => {
  it("wrapTitle balances lines; fitTitle steps the size down until the title fits", () => {
    assert.deepEqual(wrapTitle("Keyword Steroids 70", 12), ["Keyword", "Steroids 70"]);
    assert.equal(wrapTitle("Supercalifragilistic", 8), null);
    const fit = fitTitle("A Very Long Product Title Indeed", { width: 560, maxPx: 104, minPx: 64, advance: 0.58, maxLines: (px) => (px > 88 ? 2 : 3) });
    assert.ok(fit.fits && fit.px < 104 && fit.lines.length <= 3);
  });
  it("SLOT=value, --asset name=path, --template and --palette parse", () => {
    const o = parseArgs(["new", "O-30", "--template", "covers/sheet-fan", "--palette", "kraft", "TITLE=Launch Planner", "--asset", "sheet-1=C:/x/a.png"]);
    assert.deepEqual(o._, ["new", "O-30"]);
    assert.equal(o.template, "covers/sheet-fan");
    assert.equal(o.palette, "kraft");
    assert.deepEqual(o.slots, { TITLE: "Launch Planner" });
    assert.deepEqual(o.assets, { "sheet-1": "C:/x/a.png" });
    assert.throws(() => parseArgs(["--asset", "nopath"]), /name=path/);
  });
});
