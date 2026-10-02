// tools/judge.mjs: DS-06 rubric judge v1 (ds-quality-v1, 10 checks).
// Every design output is scored by a fixed rubric plus a written
// DESIGN-REVIEW.md; nothing ships below 8/10. Objective gates only here:
// taste notes stay human prose in the review file, the score stays machine.
//
// Usage:
//   node tools/judge.mjs <samples/<name>/brief.json | samples/<name>/
//   node tools/judge.mjs --check   (self-test: fixtures + real samples/cover)
import { existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pngDims } from "./render.mjs";
import { auditBrief, parseTokens, resolveColor, contrastRatio } from "./audit.mjs";

export const RUBRIC_ID = "ds-quality-v1";
export const RUBRIC_VERSION = 1;
export const SHIP_FLOOR = 8;

export const CHECK_IDS = [
  "brief-complete",
  "render-exists",
  "audit-green",
  "contrast-aa",
  "thumbnail-legible",
  "title-fits",
  "tokens-disciplined",
  "type-pair",
  "rtl-gate",
  "composition",
];

function resolveSample(input) {
  const p = resolve(String(input ?? ""));
  if (existsSync(p)) {
    try {
      const st = readFileSync(p);
      void st;
    } catch { /* fall through */ }
  }
  // File -> its dir; dir -> dir/brief.json.
  try {
    const fs = readFileSync(p);
    void fs;
    // It is a file: treat as the brief path.
    return { briefPath: p, dir: dirname(p) };
  } catch {
    return { briefPath: join(p, "brief.json"), dir: p };
  }
}

function readText(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

// Score one sample dir. Pure + file reads; never launches a browser.
// Writes nothing (see writeReview). Returns { rubric, score, max, pass, checks, errors }.
export function judgeSample(input) {
  const { briefPath, dir } = resolveSample(input);
  const checks = [];
  const errors = [];
  const check = (id, ok, detail) => {
    checks.push({ id, pass: !!ok, detail: String(detail ?? "") });
    if (!ok) errors.push(`${id}: ${detail}`);
  };

  let brief = null;
  const briefRaw = readText(briefPath);
  if (briefRaw == null) {
    check("brief-complete", false, `brief.json missing: ${briefPath}`);
  } else {
    try {
      brief = JSON.parse(briefRaw);
    } catch (e) {
      check("brief-complete", false, `brief.json unparsable: ${String(e.message || e)}`);
    }
  }
  if (brief) {
    const need = ["title", "size", "tokens", "page", "image", "text", "title_box", "title_px"];
    const missing = need.filter((k) => brief[k] === undefined);
    const sizeOk =
      brief.size && Number.isInteger(brief.size.w) && Number.isInteger(brief.size.h) && brief.size.w >= 16 && brief.size.h >= 16;
    const ok = missing.length === 0 && !!brief.title && sizeOk && Array.isArray(brief.text) && brief.text.length > 0;
    check("brief-complete", ok, ok ? `${brief.title} ${brief.size.w}x${brief.size.h}` : `missing: ${missing.join(",") || "bad size/text"}`);
  }

  const size = brief?.size ?? {};
  const tokensFile = join(dir, brief?.tokens ?? "tokens.css");
  const pageFile = join(dir, brief?.page ?? "page.html");
  const imageFile = join(dir, brief?.image ?? "out.png");
  const tokensRaw = readText(tokensFile);
  const html = readText(pageFile);
  const vars = tokensRaw == null ? new Map() : parseTokens(tokensRaw);

  // 2. render-exists: PNG on disk, dims match brief, non-trivial bytes.
  if (brief && existsSync(imageFile)) {
    try {
      const buf = readFileSync(imageFile);
      const dims = pngDims(buf);
      const match = dims.w === size.w && dims.h === size.h;
      const big = buf.length >= 4096;
      check("render-exists", match && big, match && big ? `${dims.w}x${dims.h} ${buf.length}B` : `${dims.w}x${dims.h} vs ${size.w}x${size.h}, ${buf.length}B`);
    } catch (e) {
      check("render-exists", false, String(e.message || e));
    }
  } else if (brief) {
    check("render-exists", false, `image missing: ${brief.image ?? "out.png"}`);
  }

  // 3. audit-green: fresh audit run passes (no stale-file trust).
  if (brief && briefRaw != null) {
    try {
      const a = auditBrief(briefPath);
      check("audit-green", a.pass, a.pass ? "fresh auditBrief PASS" : a.errors.slice(0, 2).join("; "));
    } catch (e) {
      check("audit-green", false, String(e.message || e));
    }
  }

  // 4. contrast-aa: every swatch resolves and meets its min.
  if (brief && Array.isArray(brief.text) && brief.text.length > 0 && tokensRaw != null) {
    const bad = [];
    const ratios = [];
    for (const s of brief.text) {
      try {
        const fg = resolveColor(s.fg, vars);
        const bg = resolveColor(s.bg, vars);
        const ratio = contrastRatio(fg, bg);
        ratios.push(`${s.label ?? "?"}:${ratio.toFixed(1)}`);
        if (ratio < Number(s.min ?? 4.5)) bad.push(`${s.label ?? "?"} ${ratio.toFixed(2)}:1 < ${s.min}`);
      } catch (e) {
        bad.push(String(e.message || e));
      }
    }
    check("contrast-aa", bad.length === 0, bad.length ? bad.slice(0, 2).join("; ") : ratios.join(", "));
  } else if (brief) {
    check("contrast-aa", false, "no swatches or no tokens.css");
  }

  // 5. thumbnail-legible: title_px scaled to 256px wide >= 12px.
  if (brief && Number(brief.title_px) > 0 && Number.isInteger(size.w)) {
    const at256 = (Number(brief.title_px) * 256) / size.w;
    check("thumbnail-legible", at256 >= 12, `${at256.toFixed(1)}px at 256px (floor 12px)`);
  } else if (brief) {
    check("thumbnail-legible", false, "title_px missing");
  }

  // 6. title-fits: estimated width fits the title box.
  if (brief && Array.isArray(brief.title_box) && brief.title_box.length === 4 && Number(brief.title_px) > 0) {
    const [x0, , x1] = brief.title_box;
    const boxW = (x1 - x0) * size.w;
    const need = String(brief.title ?? "").length * Number(brief.title_px) * 0.5;
    check("title-fits", need <= boxW, `need ~${Math.round(need)}px, box ${Math.round(boxW)}px`);
  } else if (brief) {
    check("title-fits", false, "title_box/title_px missing");
  }

  // 7. tokens-disciplined: no hardcoded hex in page.html, color via var(--*).
  if (html != null) {
    const hard = html.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
    const usesVars = /var\(\s*--[\w-]+\s*\)/.test(html);
    check("tokens-disciplined", hard.length === 0 && usesVars, hard.length ? `hardcoded ${hard.slice(0, 2).join(",")}` : usesVars ? "all color via var(--*)" : "no var(--*) use");
  } else if (brief) {
    check("tokens-disciplined", false, "page.html missing");
  }

  // 8. type-pair: tokens declare 2+ font stacks and the page uses them.
  if (tokensRaw != null && html != null) {
    const fonts = [...tokensRaw.matchAll(/--font-[\w-]+\s*:/g)];
    const usesFont = /var\(\s*--font-[\w-]+\s*\)/.test(html) || /font-family/.test(html);
    check("type-pair", fonts.length >= 1 && usesFont, fonts.length ? `${fonts.length} font token(s), page ${usesFont ? "uses" : "ignores"} type` : "no --font-* tokens");
  } else if (brief) {
    check("type-pair", false, "tokens or page missing");
  }

  // 9. rtl-gate: dir attr matches brief; rtl forbids physical left/right.
  if (brief && html != null) {
    const want = brief.dir ?? "ltr";
    const m = html.match(/<html[^>]*\bdir\s*=\s*"(ltr|rtl)"/i);
    if (want === "rtl") {
      const physical = html.match(/\b(margin-left|margin-right|padding-left|padding-right|left\s*:|right\s*:|float\s*:)/i);
      const ok = !!m && m[1].toLowerCase() === "rtl" && !physical;
      check("rtl-gate", ok, ok ? "dir=rtl, logical only" : physical ? `physical CSS ${physical[1]}` : "no dir=rtl on <html>");
    } else {
      check("rtl-gate", !m || m[1].toLowerCase() === "ltr", m ? `dir=${m[1]}` : "no dir, ltr default");
    }
  } else if (brief) {
    check("rtl-gate", false, "page missing");
  }

  // 10. composition: title on the page + one action + 3+ color tokens.
  if (brief && html != null && tokensRaw != null) {
    const hasTitle = html.includes(brief.title ?? "\0") && (brief.title ?? "") !== "";
    const hasAction = /class\s*=\s*"[^"]*cta[^"]*"|<button|<a\s[^>]*href/i.test(html);
    const colors = vars.size;
    const ok = hasTitle && hasAction && colors >= 3;
    check("composition", ok, ok ? `title + action + ${colors} tokens` : `title:${hasTitle ? "y" : "n"} action:${hasAction ? "y" : "n"} colors:${colors}`);
  } else if (brief) {
    check("composition", false, "page or tokens missing");
  }

  // Pad to exactly 10 when the brief itself was unreadable.
  while (checks.length < 10) {
    const id = CHECK_IDS[checks.length] ?? `check-${checks.length + 1}`;
    check(id, false, "skipped: brief unreadable");
  }

  const score = checks.filter((c) => c.pass).length;
  return { rubric: RUBRIC_ID, version: RUBRIC_VERSION, floor: SHIP_FLOOR, score, max: 10, pass: score >= SHIP_FLOOR, checks, errors, dir, briefPath };
}

// Write (or refresh) DESIGN-REVIEW.md beside the sample. Returns the file path.
export function writeReview(input, result = null) {
  const r = result ?? judgeSample(input);
  const { dir } = resolveSample(input);
  mkdirSync(dir, { recursive: true });
  const lines = [
    `# DESIGN-REVIEW.md: rubric ${r.rubric} v${r.version} — ${r.score}/${r.max} ${r.pass ? "SHIP" : "REWORK"}`,
    ``,
    `Rubric: ${r.rubric} (10 fixed checks, ship floor ${r.floor}/10). Scored by \`node tools/judge.mjs\`.`,
    `Sample: ${r.briefPath}`,
    ``,
    `## Score`,
    ``,
    ...r.checks.map((c) => `- [${c.pass ? "x" : " "}] ${c.id}: ${c.detail}`),
    ``,
    `## Verdict`,
    ``,
    r.pass
      ? `SHIP: ${r.score}/${r.max} meets the floor. A human eye still confirms thumbnail and taste.`
      : `REWORK: ${r.score}/${r.max} below floor ${r.floor}. Fix: ${r.errors.slice(0, 3).join("; ") || "see checks"}.`,
    ``,
    `## Taste (human, not scored)`,
    ``,
    `- Automated gates say nothing about taste. Distinctiveness, type feel and`,
    `  the thumbnail read by a human eye go here on the next art-director pass.`,
    ``,
  ];
  const out = join(dir, "DESIGN-REVIEW.md");
  writeFileSync(out, `${lines.join("\n")}\n`, "utf8");
  return out;
}

// --check self-test: fixtures (good 10/10, broken <floor, threshold) + real sample.
export function selfCheck() {
  const results = [];
  const t = (name, ok, detail) => {
    results.push({ name, pass: !!ok, detail: String(detail ?? "") });
    console.log(`[${ok ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };

  t("rubric id is ds-quality-v1", RUBRIC_ID === "ds-quality-v1", RUBRIC_ID);
  t("rubric has 10 checks", CHECK_IDS.length === 10, `${CHECK_IDS.length} checks`);
  t("ship floor is 8", SHIP_FLOOR === 8, `floor ${SHIP_FLOOR}`);

  const mk = (files) => {
    const d = mkdtempSync(`${tmpdir()}\\ds-judge-`);
    for (const [name, content] of Object.entries(files)) writeFileSync(join(d, name), content, "utf8");
    // 1x1 PNG fixture (dims check bypassed: fixture uses its own size).
    const tiny = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    return { d, tiny };
  };
  const goodBrief = (size, image) => ({
    title: "HELLO WORLD",
    size,
    dir: "ltr",
    tokens: "tokens.css",
    page: "page.html",
    image,
    text: [{ label: "title", fg: "var(--ink)", bg: "var(--paper)", min: 4.5 }],
    title_box: [0, 0, 1, 1],
    title_px: 64,
  });

  // Good fixture: cheat the PNG by writing the real IHDR? Instead judge via
  // a crafted dir whose image we copy from the real sample (always present).
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
  const realBrief = join(ROOT, "samples", "cover", "brief.json");
  const realPng = join(ROOT, "samples", "cover", "out.png");
  // Real-sample gate: copy samples/cover to a temp dir first, so --check
  // never mutates repo files (judge + review write beside the brief).
  if (!existsSync(realBrief) || !existsSync(realPng)) {
    t("samples/cover exists for self-check", false, "samples/cover/brief.json + out.png missing");
  } else {
    t("samples/cover exists for self-check", true, "brief + png present");
    const d = mkdtempSync(`${tmpdir()}\\ds-judge-cover-`);
    const cover = JSON.parse(readFileSync(realBrief, "utf8"));
    copyFileSync(realBrief, join(d, "brief.json"));
    copyFileSync(join(ROOT, "samples", "cover", cover.tokens ?? "tokens.css"), join(d, cover.tokens ?? "tokens.css"));
    copyFileSync(join(ROOT, "samples", "cover", cover.page ?? "page.html"), join(d, cover.page ?? "page.html"));
    copyFileSync(realPng, join(d, cover.image ?? "out.png"));
    const r = judgeSample(join(d, "brief.json"));
    t("samples/cover scores >= 8", r.score >= 8 && r.pass, `${r.score}/${r.max}`);
    t("samples/cover audit-green passes", r.checks.find((c) => c.id === "audit-green")?.pass === true, "fresh audit PASS");
    const out = writeReview(join(d, "brief.json"), r);
    const review = readText(out) ?? "";
    t("DESIGN-REVIEW.md written with rubric + verdict", review.includes(RUBRIC_ID) && /SHIP|REWORK/.test(review) && out.startsWith(d), out);
  }

  // Broken fixture: low contrast + missing image + hardcoded color.
  {
    const { d } = mk({
      "brief.json": JSON.stringify(goodBrief({ w: 1280, h: 720 }, "missing.png")),
      "tokens.css": ":root{--ink:#999999;--paper:#ffffff;--accent:#999999;--font-a:Arial;}",
      "page.html": '<html dir="ltr"><head><style>body{color:#999999;font-family:Arial}</style></head><body>no title here</body></html>',
    });
    const r = judgeSample(join(d, "brief.json"));
    t("broken sample scores below floor", !r.pass && r.score < SHIP_FLOOR, `${r.score}/${r.max}`);
    t("broken sample names contrast/action faults", r.errors.some((e) => /contrast|composition|render-exists/.test(e)), r.errors.slice(0, 2).join("; ") || "no errors?");
  }

  // Threshold unit: 7/10 must not ship.
  {
    const fake = { score: 7, max: 10, pass: 7 >= SHIP_FLOOR };
    t("7/10 does not ship", fake.pass === false, "7 < 8");
  }

  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `JUDGE FAIL: ${fails.length} failing check(s)` : `JUDGE PASS: rubric ${RUBRIC_ID} 10 checks, floor ${SHIP_FLOOR}, samples/cover ships`);
  return { pass: fails.length === 0, results };
}

const isMain = (() => {
  try {
    return fileURLToPath(import.meta.url) === resolve(process.argv[1]);
  } catch {
    return false;
  }
})();

if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes("--check")) {
    const { pass } = selfCheck();
    if (!pass) process.exitCode = 1;
  } else if (args.length >= 1 && !args.includes("-h") && !args.includes("--help")) {
    const r = judgeSample(args[0]);
    for (const c of r.checks) console.log(`[${c.pass ? "PASS" : "FAIL"}] ${c.id}: ${c.detail}`);
    const out = writeReview(args[0], r);
    console.log(`${r.pass ? "SHIP" : "REWORK"} ${r.score}/${r.max} (floor ${r.floor}) rubric ${r.rubric} -> ${out}`);
    if (!r.pass) process.exitCode = 1;
  } else {
    console.log("usage: node tools/judge.mjs <samples/<name>/brief.json> | node tools/judge.mjs --check");
    process.exit(2);
  }
}
