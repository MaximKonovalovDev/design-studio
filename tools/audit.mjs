// tools/audit.mjs: objective checks on one brief render (node port of the
// factory engine/design_audit.py contract, no Python needed here).
// Reads samples/<name>/brief.json + tokens.css + page.html + out.png and writes
// design-audit.json beside the image: contrast (WCAG from resolved tokens),
// PNG size match, title box valid, 256px title legibility, overflow heuristic,
// RTL gate. Prints FAIL lines, exit 1 on any failure. Taste stays in review.
import { existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pngDims } from "./render.mjs";

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
    check("brief.json parses", false, String(e.message || e));
    return finish(false, checks, errors, dir);
  }
  check("brief.json parses", true, brief.title ?? "untitled");

  const size = brief.size ?? {};
  const sizeOk = Number.isInteger(size.w) && Number.isInteger(size.h) && size.w >= 16 && size.h >= 16;
  check("brief size sane", sizeOk, sizeOk ? `${size.w}x${size.h}` : "size must be {w,h} ints >= 16");
  if (!sizeOk) return finish(false, checks, errors, dir);

  // Tokens.
  const tokensFile = join(dir, brief.tokens ?? "tokens.css");
  let vars = new Map();
  let tokensRaw = "";
  if (!existsSync(tokensFile)) {
    check("tokens.css exists", false, brief.tokens ?? "tokens.css");
  } else {
    tokensRaw = readFileSync(tokensFile, "utf8");
    vars = parseTokens(tokensRaw);
    check("tokens.css parses with 2+ colors", vars.size >= 2, `${vars.size} vars`);
  }

  // Page.
  const pageFile = join(dir, brief.page ?? "page.html");
  let html = null;
  if (!existsSync(pageFile)) {
    check("page.html exists", false, brief.page ?? "page.html");
  } else {
    html = readFileSync(pageFile, "utf8");
    check("page.html carries the title", html.includes(brief.title ?? "\0") && (brief.title ?? "") !== "", "title text present");
    const hard = html.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
    check("no hardcoded colors in page.html", hard.length === 0, hard.length ? `hardcoded ${hard.slice(0, 3).join(", ")}` : "all color via var(--*)");
    const usesVars = /var\(\s*--[\w-]+\s*\)/.test(html);
    check("page.html uses tokens", usesVars, usesVars ? "var(--*) found" : "no var(--*) reference");
  }

  // RTL gate.
  const wantDir = brief.dir ?? "ltr";
  if (html != null) {
    const m = html.match(/<html[^>]*\bdir\s*=\s*"(ltr|rtl)"/i);
    if (wantDir === "rtl") {
      check("rtl: html dir=rtl", !!m && m[1].toLowerCase() === "rtl", m ? `dir=${m[1]}` : "no dir on <html>");
      const physical = html.match(/\b(margin-left|margin-right|padding-left|padding-right|left\s*:|right\s*:|float\s*:)/i);
      check("rtl: logical properties only", !physical, physical ? `physical CSS ${physical[1]}` : "no physical left/right");
      // Hebrew type pair: tokens declare --font-hebrew (a non-color token, so
      // scan the raw CSS, not the hex-only vars map) and the page uses it.
      const declaresHebrew = /--font-hebrew\s*:/.test(tokensRaw);
      const usesHebrew = /var\(\s*--font-hebrew\s*\)/.test(html);
      check(
        "rtl: Hebrew type pair",
        declaresHebrew && usesHebrew,
        declaresHebrew ? (usesHebrew ? "page uses var(--font-hebrew)" : "page never uses var(--font-hebrew)") : "tokens.css lacks --font-hebrew",
      );
    } else {
      check("ltr: html dir matches brief", !m || m[1].toLowerCase() === "ltr", m ? `dir=${m[1]}` : "no dir, ltr default");
    }
  }

  // Image.
  const imageFile = join(dir, brief.image ?? "out.png");
  if (!existsSync(imageFile)) {
    check("out.png exists", false, brief.image ?? "out.png");
  } else {
    try {
      const buf = readFileSync(imageFile);
      const dims = pngDims(buf);
      check("out.png size matches brief", dims.w === size.w && dims.h === size.h, `${dims.w}x${dims.h}`);
      check("out.png non-trivial", buf.length >= 4096, `${buf.length}B`);
    } catch (e) {
      check("out.png is a PNG", false, String(e.message || e));
    }
  }

  // Contrast swatches.
  const swatches = brief.text ?? [];
  if (!Array.isArray(swatches) || swatches.length === 0) {
    check("brief declares text swatches", false, "text must be a nonempty array");
  } else {
    swatches.forEach((s, i) => {
      const label = s.label ?? `swatch ${i + 1}`;
      try {
        const fg = resolveColor(s.fg, vars);
        const bg = resolveColor(s.bg, vars);
        const min = Number(s.min ?? 4.5);
        if (!(min >= 1 && min <= 21)) throw new Error(`minimum ${s.min} outside 1..21`);
        const ratio = contrastRatio(fg, bg);
        check(`contrast ${label}`, ratio >= min, `${ratio.toFixed(2)}:1 vs ${min}:1 (${fg} on ${bg})`);
      } catch (e) {
        check(`contrast ${label}`, false, String(e.message || e));
      }
    });
  }

  // Title box + 256px legibility + overflow heuristic.
  const box = brief.title_box;
  const boxOk = Array.isArray(box) && box.length === 4 && box.every((v) => typeof v === "number");
  const inRange = boxOk && box[0] >= 0 && box[0] < box[2] && box[2] <= 1 && box[1] >= 0 && box[1] < box[3] && box[3] <= 1;
  check("title_box valid fractions", !!inRange, inRange ? box.join(",") : "need [x0,y0,x1,y1] in 0..1");
  const titlePx = Number(brief.title_px ?? 0);
  if (!(titlePx > 0)) {
    check("title_px declared", false, "brief needs title_px (title font size in px)");
  } else if (inRange) {
    const at256 = (titlePx * 256) / size.w;
    check("title legible at 256px", at256 >= 12, `${at256.toFixed(1)}px at 256px wide (floor 12px)`);
    const boxW = (box[2] - box[0]) * size.w;
    const need = String(brief.title ?? "").length * titlePx * 0.5;
    check("title fits its box", need <= boxW, `need ~${Math.round(need)}px, box ${Math.round(boxW)}px`);
  }

  return finish(errors.length === 0, checks, errors, dir, { brief: briefFile, image: imageFile });
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

if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes("--check")) {
    const { pass } = rtlSelfCheck();
    if (!pass) process.exitCode = 1;
  } else {
    const brief = args.find((a) => !a.startsWith("-"));
    if (brief == null || args.includes("-h") || args.includes("--help")) {
      console.log("usage: node tools/audit.mjs <samples/<name>/brief.json> | node tools/audit.mjs --rtl --check");
      process.exit(args.length < 1 ? 2 : 0);
    } else {
      const { pass, checks, errors } = auditBrief(brief);
      for (const c of checks) console.log(`[${c.pass ? "PASS" : "FAIL"}] ${c.name}: ${c.detail}`);
      console.log(pass ? "AUDIT PASS: render, sizes, contrast, thumbnail, RTL gates" : `AUDIT FAIL: ${errors.length} failing check(s)`);
      if (!pass) process.exitCode = 1;
    }
  }
}
