// tools/audit-checks.mjs: the audit self-checks, split out of tools/audit.mjs.
// Core audit (auditBrief, contrast math, reference parity) stays in audit.mjs;
// the 4 self-checks (rtl / sizeMatrix / adSquare / listingWidth) plus their
// finish helpers live here and are re-exported by audit.mjs, so existing
// `import ... from "./audit.mjs"` callers (tests, CLI, tools) keep working.
import { existsSync, readFileSync, writeFileSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SIZE_MATRIX } from "./render.mjs";
import { auditBrief } from "./audit.mjs";

// DS-16 rtl-01 self-check: the 3-gate RTL bar (dir attr, logical properties,
// Hebrew type pair) over temp fixtures plus every on-disk samples/*/brief.json
// with dir=rtl. Fixture images are byte copies of samples/hebrew-hero/out.png
// (a real render, 1280x720), so no synthetic PNG is ever trusted.
export function rtlSelfCheck() {
  const results = [];
  const t = (name, ok, detail) => {
    results.push({ name, pass: !!ok, detail: String(detail ?? "") });
    console.log(`[${ok ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };

  const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
  const heroPng = join(ROOT, "samples", "hebrew-hero", "out.png");
  if (!existsSync(heroPng)) {
    t("fixture image samples/hebrew-hero/out.png exists", false, "render hebrew-hero first");
    return finishSelf(results);
  }
  t("fixture image samples/hebrew-hero/out.png exists", true, "real 1280x720 render");

  const kitCss =
    ":root{--paper:#faf7f0;--ink:#1a1a1a;--muted:#57534e;--accent:#c2410c;--on-accent:#ffffff;--line:#e7e0d3;" +
    '--font-hebrew:"Heebo", "Assistant", "Noto Sans Hebrew", Arial, sans-serif;}';
  const mkRtl = (pageHtml, { tokensCss = kitCss, dir = "rtl" } = {}) => {
    const d = mkdtempSync(`${tmpdir()}/ds-audit-rtl-`);
    writeFileSync(
      join(d, "brief.json"),
      JSON.stringify({
        title: "עיצוב שמנצח",
        size: { w: 1280, h: 720 },
        dir,
        tokens: "tokens.css",
        page: "page.html",
        image: "out.png",
        text: [{ label: "title", fg: "var(--ink)", bg: "var(--paper)", min: 4.5 }],
        title_box: [0.08, 0.3, 0.92, 0.55],
        title_px: 96,
      }),
      "utf8",
    );
    writeFileSync(join(d, "tokens.css"), tokensCss, "utf8");
    writeFileSync(join(d, "page.html"), pageHtml, "utf8");
    writeFileSync(join(d, "out.png"), readFileSync(heroPng));
    return join(d, "brief.json");
  };
  const rtlPage = (inner, htmlAttrs = 'lang="he" dir="rtl"') =>
    `<!DOCTYPE html><html ${htmlAttrs}><head><meta charset="utf-8"><link rel="stylesheet" href="tokens.css">` +
    `<style>body{width:1280px;height:720px;background:var(--paper);color:var(--ink);font-family:var(--font-hebrew);}` +
    `.hero{margin-inline:auto;padding-inline:24px;text-align:center;border-block-start:6px solid var(--accent);}` +
    `h1{font-family:var(--font-hebrew);font-size:96px;color:var(--ink);}</style></head>` +
    `<body><div class="hero"><h1>עיצוב שמנצח</h1>${inner}</div></body></html>`;

  // 1. Good RTL: all three gates green.
  {
    const { pass, errors } = auditBrief(mkRtl(rtlPage("<p>שלום</p>")));
    t("good rtl sample passes all 3 rtl gates", pass, pass ? "dir + logical + hebrew type" : errors.slice(0, 2).join("; "));
  }
  // 2. Missing dir=rtl fails the dir gate.
  {
    const { errors } = auditBrief(mkRtl(rtlPage("<p>שלום</p>", 'lang="he"')));
    t("rtl without dir=rtl fails the dir gate", errors.some((e) => e.includes("rtl: html dir=rtl")), errors.slice(0, 2).join("; ") || "no errors?");
  }
  // 3. Physical CSS fails the logical-properties gate.
  {
    const bad = rtlPage("<p>שלום</p>").replace("margin-inline:auto", "margin-left:auto");
    const { errors } = auditBrief(mkRtl(bad));
    t("rtl with margin-left fails the logical gate", errors.some((e) => e.includes("rtl: logical properties only")), errors.slice(0, 2).join("; ") || "no errors?");
  }
  // 4. No Hebrew type pair fails the type gate.
  {
    const noFont = rtlPage("<p>שלום</p>").replaceAll("var(--font-hebrew)", "var(--ink)");
    const { errors } = auditBrief(
      mkRtl(noFont, { tokensCss: ":root{--paper:#faf7f0;--ink:#1a1a1a;}" }),
    );
    t("rtl without --font-hebrew fails the type gate", errors.some((e) => e.includes("rtl: Hebrew type pair")), errors.slice(0, 2).join("; ") || "no errors?");
  }
  // 5. LTR pages are untouched by the RTL gates (no regression for cover-style samples).
  {
    const { pass, errors } = auditBrief(
      mkRtl(
        '<!DOCTYPE html><html lang="en" dir="ltr"><head><style>body{color:#000}</style></head><body><h1 style="margin-left:8px">x</h1></body></html>',
        { dir: "ltr" },
      ),
    );
    void pass;
    t("ltr pages skip the rtl gates", errors.every((e) => !e.startsWith("rtl:")), errors.slice(0, 2).join("; ") || "no rtl errors");
  }
  // DS-31 S09 direction-token gate: row-reverse without intent fails first,
  // with intent passes; token mismatch fails.
  {
    const bad = rtlPage("<p>שלום</p>").replace(".hero{", ".hero{flex-direction:row-reverse;");
    const { errors } = auditBrief(mkRtl(bad));
    t("rtl row-reverse without intent fails the direction-token gate", errors.some((e) => e.includes("no row-reverse without intent")), errors.slice(0, 2).join("; ") || "no errors?");
  }
  {
    const okRev = rtlPage("<p>שלום</p>").replace(".hero{", ".hero{flex-direction:row-reverse;").replace('<div class="hero">', '<div class="hero" data-dir-intent="reverse">');
    const { pass, errors } = auditBrief(mkRtl(okRev));
    t("rtl row-reverse with intent passes the direction-token gate", pass, pass ? "intent declared" : errors.slice(0, 2).join("; "));
  }
  {
    const mismatch = rtlPage("<p>שלום</p>", 'lang="he" dir="ltr"');
    const { errors } = auditBrief(mkRtl(mismatch));
    t("rtl token mismatch (brief rtl, html ltr) fails the token gate", errors.some((e) => e.includes("direction token matches html dir")), errors.slice(0, 2).join("; ") || "no errors?");
  }
  // RTL-02 mixed-dir mirror: latin/ltr segment + translateX remnant fails
  // the mirror gate; the mirrored twin passes. 0 gate weakens by construction.
  {
    const bad = rtlPage('<p>שלום</p><p dir="ltr">Starter plan $9/mo</p>').replace(".hero{", ".hero{transform:translateX(-8px);");
    const { errors } = auditBrief(mkRtl(bad));
    t("mixed-dir translateX remnant fails the mirror gate", errors.some((e) => e.includes("rtl: mixed-dir mirror")), errors.slice(0, 2).join("; ") || "no errors?");
  }
  {
    const { pass, errors } = auditBrief(mkRtl(rtlPage('<p>שלום</p><p dir="ltr">Starter plan $9/mo</p>')));
    t("mixed-dir mirrored page passes the mirror gate", pass, pass ? "latin segment, no remnants" : errors.slice(0, 2).join("; "));
  }

  // 6. Every Hebrew sample on disk passes the full audit.
  let rtlSamples = [];
  try {
    rtlSamples = readdirSync(join(ROOT, "samples"), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => join(ROOT, "samples", e.name, "brief.json"))
      .filter((f) => existsSync(f))
      .filter((f) => {
        try {
          return JSON.parse(readFileSync(f, "utf8")).dir === "rtl";
        } catch {
          return false;
        }
      });
  } catch (e) {
    t("samples dir scans", false, String(e.message || e));
  }
  t("1+ rtl samples on disk", rtlSamples.length >= 1, rtlSamples.length ? rtlSamples.map((f) => f.split("samples")[1]).join(", ") : "no dir=rtl brief found");
  for (const f of rtlSamples) {
    const { pass, errors } = auditBrief(f);
    t(`rtl sample passes audit: ${f.split("samples")[1]}`, pass, pass ? "all gates green" : errors.slice(0, 2).join("; "));
  }

  return finishSelf(results);
}

export function finishSelf(results) {
  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `AUDIT RTL FAIL: ${fails.length} failing check(s)` : `AUDIT RTL PASS: dir + logical-properties + Hebrew-type gates green`);
  return { pass: fails.length === 0, results };
}

// DS-23 S01 size-matrix self-check: cover re-passes every matrix size, while a
// long-title narrow-box fixture FAILs at least one per-size reflow gate (the
// F2P proof). Images are byte copies of samples/cover/out.png (real render).
export function sizeMatrixSelfCheck() {
  const results = [];
  const t = (name, ok, detail) => {
    results.push({ name, pass: !!ok, detail: String(detail ?? "") });
    console.log(`[${ok ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
  const coverPng = join(ROOT, "samples", "cover", "out.png");
  if (!existsSync(coverPng)) {
    t("fixture image samples/cover/out.png exists", false, "render cover first");
    return finishSizes(results);
  }
  t("fixture image samples/cover/out.png exists", true, "real render");
  t("size matrix covers 1280x720+1080x1080+1200x628", SIZE_MATRIX.length === 3 && SIZE_MATRIX.some((s) => s.w === 1280 && s.h === 720) && SIZE_MATRIX.some((s) => s.w === 1080 && s.h === 1080) && SIZE_MATRIX.some((s) => s.w === 1200 && s.h === 628), SIZE_MATRIX.map((s) => `${s.w}x${s.h}`).join("+"));
  const mk = (brief) => {
    const d = mkdtempSync(`${tmpdir()}/ds-audit-sizes-`);
    writeFileSync(join(d, "brief.json"), JSON.stringify(brief), "utf8");
    writeFileSync(join(d, "tokens.css"), ":root{--paper:#faf7f0;--ink:#1a1a1a;--muted:#57534e;--accent:#c2410c;--on-accent:#ffffff;--line:#e7e0d3;}");
    writeFileSync(join(d, "page.html"), `<!DOCTYPE html><html dir="ltr"><head><style>body{color:var(--ink);}</style></head><body><h1>${brief.title}</h1></body></html>`);
    writeFileSync(join(d, "out.png"), readFileSync(coverPng));
    return join(d, "brief.json");
  };
  {
    const { pass, errors } = auditBrief(mk({ title: "DESIGN THAT SHIPS", size: { w: 1280, h: 720 }, dir: "ltr", tokens: "tokens.css", page: "page.html", image: "out.png", text: [{ label: "t", fg: "#000000", bg: "#ffffff", min: 1 }], title_box: [0.08, 0.3, 0.92, 0.55], title_px: 96 }));
    t("cover brief re-passes every matrix size", pass, pass ? "1280x720+1080x1080+1200x628 green" : errors.slice(0, 2).join("; "));
  }
  {
    const { errors } = auditBrief(mk({ title: "A VERY LONG TITLE THAT CANNOT FIT ANY NARROW SQUARE BOX AT ALL", size: { w: 1280, h: 720 }, dir: "ltr", tokens: "tokens.css", page: "page.html", image: "out.png", text: [{ label: "t", fg: "#000000", bg: "#ffffff", min: 1 }], title_box: [0.4, 0.3, 0.6, 0.55], title_px: 96 }));
    t("long-title narrow-box fixture FAILs the per-size reflow gate", errors.some((e) => e.includes("title fits its box")), errors.slice(0, 2).join("; ") || "no errors?");
  }
  return finishSizes(results);
}

export function finishSizes(results) {
  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `AUDIT SIZES FAIL: ${fails.length} failing check(s)` : `AUDIT SIZES PASS: 1280x720+1080x1080+1200x628 each re-pass`);
  return { pass: fails.length === 0, results };
}

// DS-38 THUMB-01 ad-square reflow user of the DS-23 matrix (step 1/3
// Thumbnail): the on-disk samples/ad-square brief re-passes every matrix
// size, a cramped ad fixture FAILs the fits gate first (the F2P proof),
// and the reflowed variant (title_px + box adjusted) re-passes with
// 0 gate weakens — same 12px floor, same fits math, no threshold moved.
export function adSquareReflowSelfCheck() {
  const results = [];
  const t = (name, ok, detail) => {
    results.push({ name, pass: !!ok, detail: String(detail ?? "") });
    console.log(`[${ok ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
  const adPng = join(ROOT, "samples", "ad-square", "out.png");
  if (!existsSync(adPng)) {
    t("fixture image samples/ad-square/out.png exists", false, "render ad-square first");
    return finishAdSquare(results);
  }
  t("fixture image samples/ad-square/out.png exists", true, "real 1080x1080 render");
  {
    const { pass, errors } = auditBrief(join(ROOT, "samples", "ad-square", "brief.json"));
    t("ad-square brief re-passes every matrix size", pass, pass ? "1080x1080 + matrix green" : errors.slice(0, 2).join("; "));
  }
  const mk = (brief) => {
    const d = mkdtempSync(`${tmpdir()}/ds-audit-ad-`);
    writeFileSync(join(d, "brief.json"), JSON.stringify(brief), "utf8");
    writeFileSync(join(d, "tokens.css"), ":root{--paper:#faf7f0;--ink:#1a1a1a;--muted:#57534e;--accent:#c2410c;--on-accent:#ffffff;--line:#e7e0d3;}");
    writeFileSync(join(d, "page.html"), `<!DOCTYPE html><html dir="ltr"><head><style>body{color:var(--ink);}</style></head><body><h1>${brief.title}</h1></body></html>`);
    writeFileSync(join(d, "out.png"), readFileSync(adPng));
    return join(d, "brief.json");
  };
  const base = {
    title: "DESIGN THAT SELLS",
    size: { w: 1080, h: 1080 },
    dir: "ltr",
    tokens: "tokens.css",
    page: "page.html",
    image: "out.png",
    text: [{ label: "t", fg: "#000000", bg: "#ffffff", min: 1 }],
  };
  {
    const { errors } = auditBrief(mk({ ...base, title_box: [0.4, 0.32, 0.6, 0.58], title_px: 96 }));
    t("cramped ad fixture FAILs the fits gate first", errors.some((e) => e.includes("title fits its box")), errors.slice(0, 2).join("; ") || "no errors?");
  }
  {
    const { pass, errors } = auditBrief(mk({ ...base, title_box: [0.2, 0.32, 0.8, 0.58], title_px: 72 }));
    t("reflowed ad variant (72px + wider box) re-passes", pass, pass ? "need ~612px in 648px box, 17.1px at 256px" : errors.slice(0, 2).join("; "));
  }
  return finishAdSquare(results);
}

export function finishAdSquare(results) {
  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `AUDIT AD-SQUARE FAIL: ${fails.length} failing check(s)` : `AUDIT AD-SQUARE PASS: ad-square reflows green, cramped fixture fails first`);
  return { pass: fails.length === 0, results };
}

// DS-39 THUMB-02 315px listing gate self-check (step 2/3 Thumbnail): the
// on-disk samples/cover-b brief re-passes the new gate, a small-title
// fixture FAILs the listing gate first (the F2P proof), and the reflowed
// variant (title_px back up) re-passes with 0 gate weakens — same 12px
// floor as the 256px gate, no threshold moved.
export function listingWidthSelfCheck() {
  const results = [];
  const t = (name, ok, detail) => {
    results.push({ name, pass: !!ok, detail: String(detail ?? "") });
    console.log(`[${ok ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
  {
    const { pass, errors } = auditBrief(join(ROOT, "samples", "cover-b", "brief.json"));
    t("cover-b re-passes the 315px listing gate", pass, pass ? "28.0px at 315px listing (floor 12px)" : errors.slice(0, 2).join("; "));
  }
  const mk = (brief) => {
    const d = mkdtempSync(`${tmpdir()}/ds-audit-315-`);
    writeFileSync(join(d, "brief.json"), JSON.stringify(brief), "utf8");
    writeFileSync(join(d, "tokens.css"), ":root{--paper:#faf7f0;--ink:#1a1a1a;--muted:#57534e;--accent:#c2410c;--on-accent:#ffffff;--line:#e7e0d3;}");
    writeFileSync(join(d, "page.html"), `<!DOCTYPE html><html dir="ltr"><head><style>body{color:var(--ink);}</style></head><body><h1>${brief.title}</h1></body></html>`);
    writeFileSync(join(d, "out.png"), readFileSync(join(ROOT, "samples", "cover-b", "out.png")));
    return join(d, "brief.json");
  };
  const base = {
    title: "DESIGN THAT SHIPS",
    size: { w: 1080, h: 1080 },
    dir: "ltr",
    tokens: "tokens.css",
    page: "page.html",
    image: "out.png",
    text: [{ label: "t", fg: "#000000", bg: "#ffffff", min: 1 }],
    title_box: [0.08, 0.3, 0.92, 0.56],
  };
  {
    const { errors } = auditBrief(mk({ ...base, title_px: 40 }));
    t("small-title fixture FAILs the 315px listing gate first", errors.some((e) => e.includes("title legible at 315px listing")), errors.slice(0, 2).join("; ") || "no errors?");
  }
  {
    const { pass, errors } = auditBrief(mk({ ...base, title_px: 96 }));
    t("reflowed variant (96px) re-passes the listing gate", pass, pass ? "28.0px at 315px listing" : errors.slice(0, 2).join("; "));
  }
  return finishListing(results);
}

export function finishListing(results) {
  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `AUDIT LISTING FAIL: ${fails.length} failing check(s)` : `AUDIT LISTING PASS: cover-b re-passes, small-title fixture fails first`);
  return { pass: fails.length === 0, results };
}
