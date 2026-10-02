// tools/audit.mjs: S03 structured-brief prompt-shape — brief.json IS the prompt
// (node port of the factory engine/design_audit.py contract, no Python needed here).
// Reads samples/<name>/brief.json + tokens.css + page.html + out.png and writes
// design-audit.json beside the image: contrast (WCAG from resolved tokens),
// PNG size match, title box valid, 256px title legibility, overflow heuristic,
// RTL gate. Every FAIL carries a next: hint for the aimed re-prompt. Taste stays in review.
import { existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pngDims, SIZE_MATRIX } from "./render.mjs";

export function luminance(hex) {
  const m = String(hex ?? "").match(/^#([0-9a-fA-F]{6})$/);
  if (!m) throw new Error(`expected #rrggbb, got ${JSON.stringify(hex)}`);
  const rgb = [0, 2, 4].map((i) => Number.parseInt(m[1].slice(i, i + 2), 16) / 255);
  const lin = rgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function contrastRatio(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// :root { --name: #rrggbb; ... } -> Map name -> #rrggbb (lowercased).
// Only the :root (light theme) block: [data-theme="dark"] overrides must not
// shadow the rendered default (pages render light unless they opt into dark).
export function parseTokens(css) {
  const root = String(css ?? "").match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? String(css ?? "");
  const vars = new Map();
  const re = /--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g;
  let m;
  while ((m = re.exec(root)) !== null) vars.set(m[1], m[2].toLowerCase());
  return vars;
}

// The dark overrides in [data-theme="dark"] { ... }, if present.
export function parseTokensDark(css) {
  const dark = String(css ?? "").match(/\[data-theme\s*=\s*"dark"\]\s*\{([\s\S]*?)\}/)?.[1] ?? "";
  const vars = new Map();
  const re = /--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g;
  let m;
  while ((m = re.exec(dark)) !== null) vars.set(m[1], m[2].toLowerCase());
  return vars;
}

export function resolveColor(ref, vars) {
  const v = String(ref ?? "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  const m = v.match(/^var\(\s*--([\w-]+)\s*\)$/);
  if (m && vars.has(m[1])) return vars.get(m[1]);
  throw new Error(`unresolvable color ${JSON.stringify(ref)} (tokens hold: ${[...vars.keys()].join(", ") || "none"})`);
}

function fail(errors, what) {
  errors.push(what);
  return false;
}

// Full audit of one brief folder. Returns { pass, checks, errors, report }.
export function auditBrief(briefPath) {
  const briefFile = resolve(briefPath);
  const dir = dirname(briefFile);
  const checks = [];
  const errors = [];
  const check = (name, ok, detail) => {
    checks.push({ name, pass: ok, detail });
    if (!ok) errors.push(`${name}: ${detail}`);
  };

  let brief;
  try {
    brief = JSON.parse(readFileSync(briefFile, "utf8"));
  } catch (e) {
    check("brief.json parses", false, `${String(e.message || e)} — next: fix JSON syntax in brief.json`);
    return finish(false, checks, errors, dir);
  }
  check("brief.json parses", true, brief.title ?? "untitled");

  const size = brief.size ?? {};
  const sizeOk = Number.isInteger(size.w) && Number.isInteger(size.h) && size.w >= 16 && size.h >= 16;
  check("brief size sane", sizeOk, sizeOk ? `${size.w}x${size.h}` : 'size must be {w,h} ints >= 16 — next: set size to e.g. {"w":1280,"h":720}');
  if (!sizeOk) return finish(false, checks, errors, dir);

  // Tokens.
  const tokensFile = join(dir, brief.tokens ?? "tokens.css");
  let vars = new Map();
  let tokensRaw = "";
  if (!existsSync(tokensFile)) {
    check("tokens.css exists", false, `${brief.tokens ?? "tokens.css"} missing — next: add tokens.css beside brief.json`);
  } else {
    tokensRaw = readFileSync(tokensFile, "utf8");
    vars = parseTokens(tokensRaw);
    check("tokens.css parses with 2+ colors", vars.size >= 2, vars.size >= 2 ? `${vars.size} vars` : `${vars.size} vars — next: declare 2+ --name: #rrggbb in :root`);
  }

  // Page.
  const pageFile = join(dir, brief.page ?? "page.html");
  let html = null;
  if (!existsSync(pageFile)) {
    check("page.html exists", false, `${brief.page ?? "page.html"} missing — next: add page.html beside brief.json`);
  } else {
    html = readFileSync(pageFile, "utf8");
    check("page.html carries the title", html.includes(brief.title ?? "\0") && (brief.title ?? "") !== "", html.includes(brief.title ?? "\0") && (brief.title ?? "") !== "" ? "title text present" : "title missing from page.html \u2014 next: carry brief.title verbatim in page.html");
    const hard = html.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
    check("no hardcoded colors in page.html", hard.length === 0, hard.length ? `hardcoded ${hard.slice(0, 3).join(", ")} — next: replace hex with var(--*) from tokens.css` : "all color via var(--*)");
    const usesVars = /var\(\s*--[\w-]+\s*\)/.test(html);
    check("page.html uses tokens", usesVars, usesVars ? "var(--*) found" : "no var(--*) reference — next: color via var(--*) from tokens.css");
  }

  // RTL gate.
  // DS-31 S09 direction-as-data token: brief.dir (alias brief.direction) is the
  // single wantDir token; every alignment question goes through it, never by
  // hunting physical left/right (already banned below).
  const wantDir = String(brief.dir ?? brief.direction ?? "ltr").toLowerCase();
  if (html != null) {
    const m = html.match(/<html[^>]*\bdir\s*=\s*"(ltr|rtl)"/i);
    if (wantDir === "rtl") {
      check("rtl: html dir=rtl", !!m && m[1].toLowerCase() === "rtl", m ? `dir=${m[1]}` : 'no dir on <html> — next: add dir="rtl" to <html>');
      const physical = html.match(/\b(margin-left|margin-right|padding-left|padding-right|left\s*:|right\s*:|float\s*:)/i);
      check("rtl: logical properties only", !physical, physical ? `physical CSS ${physical[1]} — next: use logical margin-inline/padding-inline` : "no physical left/right");
      // Hebrew type pair: tokens declare --font-hebrew (a non-color token, so
      // scan the raw CSS, not the hex-only vars map) and the page uses it.
      const declaresHebrew = /--font-hebrew\s*:/.test(tokensRaw);
      const usesHebrew = /var\(\s*--font-hebrew\s*\)/.test(html);
      check(
        "rtl: Hebrew type pair",
        declaresHebrew && usesHebrew,
        declaresHebrew ? (usesHebrew ? "page uses var(--font-hebrew)" : "page never uses var(--font-hebrew) \u2014 next: set font-family: var(--font-hebrew)") : "tokens.css lacks --font-hebrew \u2014 next: declare --font-hebrew in :root",
      );
      // S09 direction-token gate: wantDir=rtl must match <html dir>, and a
      // flex row-reverse/column-reverse without declared intent fails first
      // (warn-first: FAIL with the fix hint, never silent).
      check("direction token matches html dir", !!m && m[1].toLowerCase() === wantDir, m ? (m[1].toLowerCase() === wantDir ? `wantDir=${wantDir} dir=${m[1]}` : `wantDir=${wantDir} dir=${m[1]} \u2014 next: set <html dir to brief dir`) : `wantDir=${wantDir} no dir \u2014 next: add dir to <html> per brief dir`);
      const rev = html.match(/flex-direction\s*:\s*(row-reverse|column-reverse)/i);
      const intent = /data-dir-intent\s*=\s*["']?reverse/i.test(html) || brief.allowReverse === true;
      check("no row-reverse without intent", !rev || intent, rev ? (intent ? "reverse intent declared" : `${rev[1]} without intent \u2014 next: add data-dir-intent="reverse" or keep logical order`) : "no reverse flex");
    } else if (wantDir === "ltr") {
      check("ltr: html dir matches brief", !m || m[1].toLowerCase() === "ltr", !m ? "no dir, ltr default" : (m[1].toLowerCase() === "ltr" ? `dir=${m[1]}` : `dir=${m[1]} \u2014 next: set <html dir="ltr" or brief dir="rtl"`));
    } else {
      check("direction token valid", false, `wantDir=${JSON.stringify(brief.dir)} must be "ltr" or "rtl" \u2014 next: set brief dir to "ltr" or "rtl"`);
    }
  }

  // Image.
  const imageFile = join(dir, brief.image ?? "out.png");
  if (!existsSync(imageFile)) {
    check("out.png exists", false, `${brief.image ?? "out.png"} missing \u2014 next: render page.html to out.png at brief size`);
  } else {
    try {
      const buf = readFileSync(imageFile);
      const dims = pngDims(buf);
      check("out.png size matches brief", dims.w === size.w && dims.h === size.h, dims.w === size.w && dims.h === size.h ? `${dims.w}x${dims.h}` : `${dims.w}x${dims.h} vs ${size.w}x${size.h} \u2014 next: re-render at brief size`);
      check("out.png non-trivial", buf.length >= 4096, buf.length >= 4096 ? `${buf.length}B` : `${buf.length}B \u2014 next: re-render, image looks blank`);
    } catch (e) {
      check("out.png is a PNG", false, `${String(e.message || e)} \u2014 next: replace with a real PNG render`);
    }
  }

  // Contrast swatches.
  const swatches = brief.text ?? [];
  if (!Array.isArray(swatches) || swatches.length === 0) {
    check("brief declares text swatches", false, "text must be a nonempty array \u2014 next: add {label,fg,bg,min} to brief.text");
  } else {
    swatches.forEach((s, i) => {
      const label = s.label ?? `swatch ${i + 1}`;
      try {
        const fg = resolveColor(s.fg, vars);
        const bg = resolveColor(s.bg, vars);
        const min = Number(s.min ?? 4.5);
        if (!(min >= 1 && min <= 21)) throw new Error(`minimum ${s.min} outside 1..21`);
        const ratio = contrastRatio(fg, bg);
        const ok = ratio >= min;
        check(`contrast ${label}`, ok, `${ratio.toFixed(2)}:1 vs ${min}:1 (${fg} on ${bg})${ok ? "" : ` — next: edit ${label} fg/bg toward 7:1`}`);
      } catch (e) {
        check(`contrast ${label}`, false, `${String(e.message || e)} \u2014 next: point fg/bg at tokens.css vars or #rrggbb`);
      }
    });
  }

  // Title box + 256px legibility + overflow heuristic.
  const box = brief.title_box;
  const boxOk = Array.isArray(box) && box.length === 4 && box.every((v) => typeof v === "number");
  const inRange = boxOk && box[0] >= 0 && box[0] < box[2] && box[2] <= 1 && box[1] >= 0 && box[1] < box[3] && box[3] <= 1;
  check("title_box valid fractions", !!inRange, inRange ? box.join(",") : "need [x0,y0,x1,y1] in 0..1 \u2014 next: set title_box e.g. [0.08,0.3,0.92,0.55]");
  const titlePx = Number(brief.title_px ?? 0);
  if (!(titlePx > 0)) {
    check("title_px declared", false, "brief needs title_px (title font size in px) \u2014 next: set title_px e.g. 96");
  } else if (inRange) {
    const at256 = (titlePx * 256) / size.w;
    const legOk = at256 >= 12;
    check("title legible at 256px", legOk, `${at256.toFixed(1)}px at 256px wide (floor 12px)${legOk ? "" : " — next: raise title_px or widen title_box"}`);
    const boxW = (box[2] - box[0]) * size.w;
    const need = String(brief.title ?? "").length * titlePx * 0.5;
    const fitOk = need <= boxW;
    check("title fits its box", fitOk, `need ~${Math.round(need)}px, box ${Math.round(boxW)}px${fitOk ? "" : " — next: shorten title or widen title_box"}`);
  }

  // DS-39 THUMB-02 315px listing gate (step 2/3 Thumbnail): the store/
  // listing slot renders the brief at 315px wide, so the title must stay
  // legible there too — same 12px floor and matrix math as the 256px gate
  // (card research/cards/2026-10-02-s13.md: title_px*315/stage.w >= 12),
  // pinned as its own check so a future shrink that still clears 256px
  // cannot slip past the listing slot. 0 gate weakens.
  if (inRange && titlePx > 0) {
    const at315 = (titlePx * 315) / size.w;
    const listOk = at315 >= 12;
    check("title legible at 315px listing", listOk, `${at315.toFixed(1)}px at 315px listing (floor 12px)${listOk ? "" : " — next: raise title_px for the 315px listing slot"}`);
  }

  // DS-23 S01 one-to-many size matrix + per-size reflow: every matrix size
  // re-passes 256px legibility + title-fits-box (never ships scaled-blind).
  // Uses brief.sizes when declared, else the shared SIZE_MATRIX from render.
  if (inRange && titlePx > 0) {
    const matrix = Array.isArray(brief.sizes) && brief.sizes.length ? brief.sizes : SIZE_MATRIX;
    for (const s of matrix) {
      const sw = Number(s?.w);
      if (!(sw >= 16)) continue;
      const at = (titlePx * 256) / sw;
      const okL = at >= 12;
      check(`size ${sw}x${Number(s?.h)}: title legible at 256px`, okL, `${at.toFixed(1)}px at 256px (floor 12px)${okL ? "" : " — next: raise title_px for this width"}`);
      const bW = (box[2] - box[0]) * sw;
      const needPx = String(brief.title ?? "").length * titlePx * 0.5;
      const okF = needPx <= bW;
      check(`size ${sw}x${Number(s?.h)}: title fits its box`, okF, `need ~${Math.round(needPx)}px, box ${Math.round(bW)}px${okF ? "" : " — next: reflow title_px/box for this size"}`);
    }
  }

  // S07 C1 reference-in parity (donor abi/screenshot-to-code create-from-
  // reference, MIT pattern only): only gates when the brief opts in via
  // brief.reference or a reference.png beside the brief; skipped otherwise
  // so pre-reference samples keep passing. When gated the reference must be
  // a PNG with the same dims as out.png (parity of intent vs pixels).
  checkReferenceParity(dir, brief, join(dir, brief.image ?? "out.png"), check);

  return finish(errors.length === 0, checks, errors, dir, { brief: briefFile, image: imageFile });
}

// Exported for tools/check.mjs winner line plus unit tests. Takes the same
// check() collector auditBrief uses so the gate lands in design-audit.json.
export function checkReferenceParity(dir, brief, imageFile, check) {
  const declared = typeof brief.reference === "string" ? brief.reference : null;
  const autoFile = join(dir, "reference.png");
  const refFile = declared ? join(dir, declared) : autoFile;
  const optedIn = declared != null || existsSync(autoFile);
  if (!optedIn) {
    check("reference.png parity", true, "no reference declared, skipped");
    return { pass: true, skipped: true };
  }
  if (!existsSync(refFile)) {
    check("reference.png parity", false, `${declared ?? "reference.png"} missing — next: add reference.png beside brief.json`);
    return { pass: false };
  }
  try {
    const refDims = pngDims(readFileSync(refFile));
    const outDims = pngDims(readFileSync(imageFile));
    const ok = refDims.w === outDims.w && refDims.h === outDims.h;
    check("reference.png parity", ok, ok ? `${refDims.w}x${refDims.h} matches out.png` : `reference ${refDims.w}x${refDims.h} != out ${outDims.w}x${outDims.h} — next: re-export reference at brief size`);
    return { pass: ok };
  } catch (e) {
    check("reference.png parity", false, `${String(e.message || e)} — next: replace reference.png with a real PNG`);
    return { pass: false };
  }
}

function finish(pass, checks, errors, dir, extra = {}) {
  const report = { pass, checks, errors, ...extra, at: new Date().toISOString().slice(0, 10) };
  try {
    writeFileSync(join(dir, "design-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  } catch {
    // Report write is best-effort; pass/fail still stands.
  }
  return { pass, checks, errors, report };
}

const isMain = (() => {
  try {
    return fileURLToPath(import.meta.url) === resolve(process.argv[1]);
  } catch {
    return false;
  }
})();

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

function finishSelf(results) {
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

function finishSizes(results) {
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

function finishAdSquare(results) {
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

function finishListing(results) {
  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `AUDIT LISTING FAIL: ${fails.length} failing check(s)` : `AUDIT LISTING PASS: cover-b re-passes, small-title fixture fails first`);
  return { pass: fails.length === 0, results };
}

if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes("--sizes") && args.includes("--check")) {
    const a = sizeMatrixSelfCheck();
    const b = adSquareReflowSelfCheck();
    if (!a.pass || !b.pass) process.exitCode = 1;
  } else if (args.includes("--listing") && args.includes("--check")) {
    const { pass } = listingWidthSelfCheck();
    if (!pass) process.exitCode = 1;
  } else if (args.includes("--rtl") && args.includes("--check")) {
    const { pass } = rtlSelfCheck();
    if (!pass) process.exitCode = 1;
  } else if (args.includes("--check")) {
    const { pass } = rtlSelfCheck();
    if (!pass) process.exitCode = 1;
  } else {
    const brief = args.find((a) => !a.startsWith("-"));
    if (brief == null || args.includes("-h") || args.includes("--help")) {
      console.log("usage: node tools/audit.mjs <samples/<name>/brief.json> | node tools/audit.mjs --rtl --check | node tools/audit.mjs --sizes --check | node tools/audit.mjs --listing --check");
      process.exit(args.length < 1 ? 2 : 0);
    } else {
      const { pass, checks, errors } = auditBrief(brief);
      for (const c of checks) console.log(`[${c.pass ? "PASS" : "FAIL"}] ${c.name}: ${c.detail}`);
      console.log(pass ? "AUDIT PASS: render, sizes, contrast, thumbnail, RTL gates" : `AUDIT FAIL: ${errors.length} failing check(s)`);
      if (!pass) process.exitCode = 1;
    }
  }
}
