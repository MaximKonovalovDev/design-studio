// tools/g08-eye-judge.mjs: G-08 eye judge 4-of-5 proof.
// Tool-facts first (contrast + touch checklist), then a 5-vote tally.
// A design ships only when >= 4 of 5 eyes agree. One dissent is tolerated,
// two are not. Pure file reads, no browser, writes nothing.
import { existsSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseTokens, resolveColor, contrastRatio } from "./audit.mjs";

export const EYE_VOTERS = ["contrast", "touch", "thumb", "tokens", "composition"];
export const SHIP_VOTES = 4;
export const TOUCH_MIN = 44;
export const THUMB_MIN = 12;

function resolveSample(input) {
  const p = resolve(String(input ?? ""));
  try {
    readFileSync(p);
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

// Estimate the CTA tap height from CSS text. Fail closed: no size hints
// means no proof, never a pass. Estimate = font-size * 1.2 + vertical
// padding, or an explicit min-height when present.
export function ctaSizeEstimate(html) {
  const src = String(html ?? "");
  const sizeRe = /(min-height|font-size|padding)\s*:\s*([^;{}]+)/gi;
  let fontPx = 0;
  let padV = 0;
  let minH = 0;
  let m;
  while ((m = sizeRe.exec(src)) !== null) {
    const prop = m[1].toLowerCase();
    const nums = [...m[2].matchAll(/(\d+(?:\.\d+)?)\s*px/g)].map((x) => Number(x[1]));
    if (nums.length === 0) continue;
    if (prop === "font-size") fontPx = Math.max(fontPx, nums[0]);
    else if (prop === "min-height") minH = Math.max(minH, nums[0]);
    else if (prop === "padding") padV = Math.max(padV, nums.length >= 2 ? nums[0] * 2 : nums[0]);
  }
  const estimate = minH > 0 ? minH : fontPx > 0 ? fontPx * 1.2 + padV : padV;
  return { estimate: Math.round(estimate), fontPx, padV, minH };
}

// Tool-facts: contrast checklist (every brief.text swatch resolves and meets
// its min) + touch checklist (CTA present, CTA >= 44px, title legible at
// 256px). Returns { briefPath, dir, contrast, touch, pass, errors }.
export function toolFacts(input) {
  const { briefPath, dir } = resolveSample(input);
  const contrast = [];
  const touch = [];
  const errors = [];
  let brief = null;
  const raw = readText(briefPath);
  if (raw == null) {
    errors.push(`brief.json missing: ${briefPath}`);
    return { briefPath, dir, contrast, touch, pass: false, errors };
  }
  try {
    brief = JSON.parse(raw);
  } catch (e) {
    errors.push(`brief.json unparsable: ${String(e.message || e)}`);
    return { briefPath, dir, contrast, touch, pass: false, errors };
  }
  const tokensFile = join(dir, brief.tokens ?? "tokens.css");
  const pageFile = join(dir, brief.page ?? "page.html");
  const tokensRaw = readText(tokensFile);
  const html = readText(pageFile);
  const vars = tokensRaw == null ? new Map() : parseTokens(tokensRaw);

  // Contrast checklist: one fact per swatch.
  const swatches = Array.isArray(brief.text) ? brief.text : [];
  if (swatches.length === 0 || tokensRaw == null) {
    contrast.push({ label: "swatches", ratio: 0, min: 4.5, pass: false, detail: "no swatches or no tokens.css" });
    errors.push("contrast: no swatches or no tokens.css");
  } else {
    for (const s of swatches) {
      const min = Number(s.min ?? 4.5);
      try {
        const ratio = contrastRatio(resolveColor(s.fg, vars), resolveColor(s.bg, vars));
        const pass = ratio >= min;
        contrast.push({ label: String(s.label ?? "?"), ratio: Math.round(ratio * 100) / 100, min, pass, detail: `${s.label}:${ratio.toFixed(2)}:1 vs ${min}` });
        if (!pass) errors.push(`contrast: ${s.label} ${ratio.toFixed(2)}:1 < ${min}`);
      } catch (e) {
        contrast.push({ label: String(s.label ?? "?"), ratio: 0, min, pass: false, detail: String(e.message || e) });
        errors.push(`contrast: ${String(e.message || e)}`);
      }
    }
  }

  // Touch checklist, three facts.
  const hasCta = html != null && /class\s*=\s*"[^"]*cta[^"]*"|<button|<a\s[^>]*href/i.test(html);
  touch.push({ id: "touch-cta-present", pass: !!hasCta, detail: hasCta ? "cta action present" : "no cta/button/link in page.html" });
  if (!hasCta) errors.push("touch: no cta/button/link in page.html");
  const est = ctaSizeEstimate(html);
  const sizeOk = !!hasCta && est.estimate >= TOUCH_MIN;
  touch.push({ id: "touch-cta-size", pass: sizeOk, detail: hasCta ? `cta ~${est.estimate}px vs ${TOUCH_MIN}px floor` : "no cta to measure" });
  if (!sizeOk) errors.push(`touch: cta ~${est.estimate}px < ${TOUCH_MIN}px floor`);
  const size = brief.size ?? {};
  if (Number(brief.title_px) > 0 && Number.isInteger(size.w)) {
    const at256 = (Number(brief.title_px) * 256) / size.w;
    const ok = at256 >= THUMB_MIN;
    touch.push({ id: "touch-title-legible", pass: ok, detail: `${at256.toFixed(1)}px at 256px (floor ${THUMB_MIN}px)` });
    if (!ok) errors.push(`touch: title ${at256.toFixed(1)}px at 256px < ${THUMB_MIN}px`);
  } else {
    touch.push({ id: "touch-title-legible", pass: false, detail: "title_px/size missing" });
    errors.push("touch: title_px/size missing");
  }

  const pass = contrast.every((c) => c.pass) && touch.every((t) => t.pass);
  return { briefPath, dir, contrast, touch, pass, errors };
}

// One vote per eye. Votes 1-2 come from tool-facts; votes 3-5 re-read the
// same files so a single bad fact cannot pass twice unnoticed.
export function eyeVotes(input) {
  const { briefPath, dir } = resolveSample(input);
  const facts = toolFacts(briefPath);
  let brief = null;
  try {
    brief = JSON.parse(readFileSync(briefPath, "utf8"));
  } catch {
    brief = null;
  }
  const tokensRaw = readText(join(dir, brief?.tokens ?? "tokens.css"));
  const html = readText(join(dir, brief?.page ?? "page.html"));
  const vars = tokensRaw == null ? new Map() : parseTokens(tokensRaw);
  const votes = [];
  const contrastOk = facts.contrast.length > 0 && facts.contrast.every((c) => c.pass);
  votes.push({ voter: "contrast", pass: contrastOk, detail: contrastOk ? facts.contrast.map((c) => `${c.label}:${c.ratio}`).join(", ") : (facts.errors.find((e) => e.startsWith("contrast:")) ?? "contrast fail") });
  const touchOk = facts.touch.length === 3 && facts.touch.every((t) => t.pass);
  votes.push({ voter: "touch", pass: touchOk, detail: touchOk ? facts.touch.map((t) => t.id).join("+") : (facts.errors.find((e) => e.startsWith("touch:")) ?? "touch fail") });
  let thumbOk = false;
  let thumbDetail = "title_px/size missing";
  if (brief && Number(brief.title_px) > 0 && Number.isInteger(brief.size?.w)) {
    const at256 = (Number(brief.title_px) * 256) / brief.size.w;
    thumbOk = at256 >= THUMB_MIN;
    thumbDetail = `${at256.toFixed(1)}px at 256px (floor ${THUMB_MIN}px)`;
  }
  votes.push({ voter: "thumb", pass: thumbOk, detail: thumbDetail });
  let tokensOk = false;
  let tokensDetail = "tokens or page missing";
  if (tokensRaw != null && html != null) {
    const hard = html.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
    const usesVars = /var\(\s*--[\w-]+\s*\)/.test(html);
    tokensOk = hard.length === 0 && usesVars;
    tokensDetail = hard.length ? `hardcoded ${hard.slice(0, 2).join(",")}` : usesVars ? "all color via var(--*)" : "no var(--*) use";
  }
  votes.push({ voter: "tokens", pass: tokensOk, detail: tokensDetail });
  let compOk = false;
  let compDetail = "page or tokens missing";
  if (brief && html != null && tokensRaw != null) {
    const hasTitle = html.includes(brief.title ?? "\0") && (brief.title ?? "") !== "";
    const hasAction = /class\s*=\s*"[^"]*cta[^"]*"|<button|<a\s[^>]*href/i.test(html);
    const colors = vars.size;
    compOk = hasTitle && hasAction && colors >= 3;
    compDetail = compOk ? `title + action + ${colors} tokens` : `title:${hasTitle ? "y" : "n"} action:${hasAction ? "y" : "n"} colors:${colors}`;
  }
  votes.push({ voter: "composition", pass: compOk, detail: compDetail });

  const agree = votes.filter((v) => v.pass).length;
  return { briefPath, dir, votes, agree, total: votes.length, ship: agree >= SHIP_VOTES, facts };
}

export function judgeEye(input) {
  const v = eyeVotes(input);
  const verdict = v.ship ? `SHIP: ${v.agree}/${v.total} eyes agree (floor ${SHIP_VOTES})` : `REWORK: ${v.agree}/${v.total} eyes agree, need ${SHIP_VOTES}`;
  return { ...v, verdict };
}

// --check self-test: fixtures only (good 5/5, one-dissent 4/5 ships,
// broken reworks) + real samples/cover. Never writes into the repo.
export function selfCheck() {
  const results = [];
  const t = (name, ok, detail) => {
    results.push({ name, pass: !!ok, detail: String(detail ?? "") });
    console.log(`[${ok ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };
  t("5 eyes with floor 4", EYE_VOTERS.length === 5 && SHIP_VOTES === 4, `${EYE_VOTERS.join(",")} floor ${SHIP_VOTES}`);

  const mk = (files) => {
    const d = mkdtempSync(`${tmpdir()}\\ds-g08-`);
    for (const [name, content] of Object.entries(files)) writeFileSync(join(d, name), content, "utf8");
    return d;
  };
  const brief = (text) => ({
    title: "HELLO WORLD",
    size: { w: 1280, h: 720 },
    dir: "ltr",
    tokens: "tokens.css",
    page: "page.html",
    image: "out.png",
    text,
    title_box: [0, 0, 1, 1],
    title_px: 64,
  });
  const goodText = [{ label: "title", fg: "var(--ink)", bg: "var(--paper)", min: 4.5 }];
  const goodTokens = ":root{--ink:#000000;--paper:#ffffff;--accent:#c2410c;--font-a:Arial;}";
  const goodPage = '<html dir="ltr"><head><link rel="stylesheet" href="tokens.css"><style>body{color:var(--ink);background:var(--paper)}.cta{display:inline-block;font-size:32px;color:var(--paper);padding:20px 64px;min-height:44px}</style></head><body><h1>HELLO WORLD</h1><span class="cta">go</span></body></html>';

  {
    const d = mk({ "brief.json": JSON.stringify(brief(goodText)), "tokens.css": goodTokens, "page.html": goodPage });
    const r = judgeEye(join(d, "brief.json"));
    t("good sample ships 5/5", r.ship && r.agree === 5, `${r.agree}/${r.total}`);
    t("tool-facts pass on good sample", r.facts.pass === true, `${r.facts.contrast.length} contrast + ${r.facts.touch.length} touch`);
  }
  {
    const low = [{ label: "title", fg: "#999999", bg: "#ffffff", min: 4.5 }];
    const d = mk({ "brief.json": JSON.stringify(brief(low)), "tokens.css": goodTokens, "page.html": goodPage });
    const r = judgeEye(join(d, "brief.json"));
    t("one dissent still ships 4/5", r.ship && r.agree === 4, `${r.agree}/${r.total}`);
  }
  {
    const d = mk({
      "brief.json": JSON.stringify(brief([{ label: "title", fg: "#999999", bg: "#ffffff", min: 4.5 }])),
      "tokens.css": ":root{--ink:#999999;--paper:#ffffff;--accent:#999999;--font-a:Arial;}",
      "page.html": '<html dir="ltr"><body>no title here</body></html>',
    });
    const r = judgeEye(join(d, "brief.json"));
    t("broken sample reworks (< 4 agree)", !r.ship && r.agree < SHIP_VOTES, `${r.agree}/${r.total}`);
  }
  {
    const tiny = goodPage.replaceAll("32px", "10px").replaceAll("20px 64px", "1px 2px").replaceAll("min-height:44px", "min-height:10px");
    const d = mk({ "brief.json": JSON.stringify(brief(goodText)), "tokens.css": goodTokens, "page.html": tiny });
    const r = judgeEye(join(d, "brief.json"));
    t("tiny cta fails the touch eye", r.votes.find((v) => v.voter === "touch")?.pass === false, r.votes.find((v) => v.voter === "touch")?.detail ?? "?");
  }
  {
    const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
    const cover = join(ROOT, "samples", "cover", "brief.json");
    if (!existsSync(cover)) {
      t("samples/cover exists for self-check", false, "samples/cover/brief.json missing");
    } else {
      const r = judgeEye(cover);
      t("samples/cover ships (>= 4/5 eyes)", r.ship, `${r.agree}/${r.total}`);
    }
  }

  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `EYE FAIL: ${fails.length} failing check(s)` : `EYE PASS: 5 eyes, floor ${SHIP_VOTES}, facts first`);
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
  if (args.includes("-h") || args.includes("--help")) {
    console.log("usage: node tools/g08-eye-judge.mjs <samples/<name>/brief.json> | node tools/g08-eye-judge.mjs --check");
    process.exit(0);
  } else if (args.includes("--check")) {
    const { pass } = selfCheck();
    if (!pass) process.exitCode = 1;
  } else if (args.length >= 1) {
    const r = judgeEye(args[0]);
    for (const f of r.facts.contrast) console.log(`[${f.pass ? "PASS" : "FAIL"}] contrast/${f.label}: ${f.detail}`);
    for (const f of r.facts.touch) console.log(`[${f.pass ? "PASS" : "FAIL"}] ${f.id}: ${f.detail}`);
    for (const v of r.votes) console.log(`[${v.pass ? "PASS" : "FAIL"}] eye/${v.voter}: ${v.detail}`);
    console.log(`${r.ship ? "SHIP" : "REWORK"} ${r.agree}/${r.total} (floor ${SHIP_VOTES}) ${r.facts.briefPath}`);
    if (!r.ship) process.exitCode = 1;
  } else {
    console.log("usage: node tools/g08-eye-judge.mjs <samples/<name>/brief.json> | node tools/g08-eye-judge.mjs --check");
    process.exit(2);
  }
}
