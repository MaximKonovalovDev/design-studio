// tools/tokens.mjs (DS-02 tokens-01): tokens.json -> tokens.css + docs page.
// Single source of truth per sample: samples/<name>/tokens.json. The page may
// use only var(--*) colors; this module fails closed on hardcoded colors
// outside tokens.css and on the Brand-kit checks (vars, pairs, type, spacing,
// dark theme, diff).
//
// Shape: flat ({"colors": {...}, "colorsDark": {...}, "fonts": {...},
// "spacing": {...}}) OR Style Dictionary-shaped ({"color": {"paper":
// {"value": "#..."}}, "font": {...}, "space": {...}, "themes": {"dark":
// {"paper": {"value": "#..."}}}}). Both normalize to the same kit.
// Light theme lands in :root, dark overrides in [data-theme="dark"].
// Hebrew RTL ships the --font-hebrew stack (Heebo/Assistant/Noto Sans Hebrew).
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { contrastRatio } from "./audit.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_JSON = join(ROOT, "samples", "cover", "tokens.json");
const DEFAULT_CSS = join(ROOT, "samples", "cover", "tokens.css");
const DEFAULT_DOCS = join(ROOT, "samples", "cover", "tokens.html");
const DEFAULT_PAGE = join(ROOT, "samples", "cover", "page.html");

const HEX = /^#[0-9a-fA-F]{6}$/;

export const HEBREW_STACK = '"Heebo", "Assistant", "Noto Sans Hebrew", "Segoe UI", Arial, sans-serif';

// Flatten one Style Dictionary subtree: {a: {value:"#.."}, b: {c: {value:"#.."}}}
// -> {"a": "#..", "b-c": "#.."}. Plain values pass through.
function sdMap(node) {
  if (node == null || typeof node !== "object" || Array.isArray(node)) return null;
  const out = {};
  const walk = (obj, prefix) => {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}-${k}` : k;
      if (v != null && typeof v === "object" && !Array.isArray(v) && ("value" in v || "$value" in v)) {
        out[key] = String(v.value ?? v.$value);
      } else if (v != null && typeof v === "object" && !Array.isArray(v)) {
        walk(v, key);
      } else {
        out[key] = String(v);
      }
    }
  };
  walk(node, "");
  return out;
}

// Accept flat OR Style Dictionary shape. Never throws on shape: unknowns stay {}.
export function normalizeTokens(raw = {}) {
  const src = raw ?? {};
  let colors = src.colors;
  if (colors == null && src.color != null) colors = sdMap(src.color);
  let colorsDark = src.colorsDark ?? src.colorDark;
  if (colorsDark == null && src.themes?.dark != null) colorsDark = sdMap(src.themes.dark);
  if (colorsDark == null && src.theme?.dark != null) colorsDark = sdMap(src.theme.dark);
  if (colorsDark == null && src.color?.dark != null && typeof src.color.dark === "object") colorsDark = sdMap(src.color.dark);
  let fonts = src.fonts;
  if (fonts == null && src.font != null) fonts = sdMap(src.font);
  let spacing = src.spacing;
  if (spacing == null && src.space != null) spacing = sdMap(src.space);
  return {
    colors: colors ?? {},
    colorsDark: colorsDark ?? {},
    fonts: fonts ?? {},
    spacing: spacing ?? {},
  };
}

// S12 C1 transform/resolve fixpoint (style-dictionary pattern-only port,
// Apache-2.0, no vendor code): transitive {refs} converge without ordering
// hacks. Resolved values emit at once; deferred ones wait a pass. A stalled
// deferred count means circular/broken refs -> surface it, never hang.
const REF_TEST = /\{[^{}]+\}/;
const REF_RE = /\{([^{}]+)\}/g;

export function usesReferences(value) {
  return typeof value === "string" && REF_TEST.test(value);
}

// "{colors.brand}" / "{color.brand.value}" / "{brand}" -> "brand".
export function refKey(inner) {
  const parts = String(inner ?? "").trim().split(".").map((s) => s.trim()).filter(Boolean);
  while (parts.length > 1 && (parts[parts.length - 1] === "value" || parts[parts.length - 1] === "$value")) parts.pop();
  return parts.length ? parts[parts.length - 1] : "";
}

// Fixpoint loop with deferred set + circular stall guard. Dark callers pass
// the resolved light map as fallback so "{paper}" finds the light value.
export function resolveColorRefs(colors = {}, fallback = {}) {
  const lookup = { ...fallback, ...(colors ?? {}) };
  const resolved = {};
  for (const [k, v] of Object.entries(lookup)) {
    if (!usesReferences(String(v))) resolved[k] = String(v);
  }
  const deferred = new Set(Object.keys(colors ?? {}).filter((k) => !(k in resolved)));
  let prev = deferred.size + 1;
  while (deferred.size > 0 && deferred.size < prev) {
    prev = deferred.size;
    for (const k of [...deferred]) {
      let ok = true;
      const out = String(lookup[k]).replace(REF_RE, (m, inner) => {
        const key = refKey(inner);
        if (resolved[key] != null && !usesReferences(String(resolved[key]))) return String(resolved[key]);
        ok = false;
        return m;
      });
      if (ok && !usesReferences(out)) {
        resolved[k] = out;
        lookup[k] = out;
        deferred.delete(k);
      }
    }
  }
  return { resolved, deferred: [...deferred] };
}

// DS-35 C1 pair convention (shadcn-ui/ui themes.ts cssVars light/dark pairs,
// MIT LICENSE SHA fad4d887, file SHA 80fdfba3, patterns only): every surface
// token ships as a background/foreground pair and dark redefines the same
// names ([data-theme="dark"] override). Warn-free lint: bg without its fg mate
// fails; extras outside the pairs (line, chart) never fail.
export const PAIR_RULES = [["paper", "ink"], ["accent", "on-accent"]];

export function lintPairMates(colors = {}) {
  const missing = [];
  for (const [bg, fg] of PAIR_RULES) {
    if (bg in (colors ?? {}) && !(fg in (colors ?? {}))) missing.push(`${bg} without ${fg}`);
    if (fg in (colors ?? {}) && !(bg in (colors ?? {}))) missing.push(`${fg} without ${bg}`);
  }
  return missing;
}

// Dark must redefine every pair member shipped in light (same-name override).
export function darkPairGaps(colors = {}, darkColors = {}) {
  const gaps = [];
  for (const [bg, fg] of PAIR_RULES) {
    for (const k of [bg, fg]) if (k in (colors ?? {}) && !(k in (darkColors ?? {}))) gaps.push(k);
  }
  return gaps;
}

// DS-35 C2 registry merge (shadcn buildRegistryTheme base+theme -> one item,
// MIT SHA fad4d887, patterns only): base + overlay compose per section,
// overlay wins per key, collisions counted never silent.
export function mergeKits(base = {}, overlay = {}) {
  const merged = { ...base, ...overlay };
  let collisions = 0;
  for (const sec of ["palette", "paletteDark", "type", "spacing", "voice", "lockup", "tokens", "colors", "colorsDark", "fonts"]) {
    const b = base?.[sec], o = overlay?.[sec];
    if (b != null && typeof b === "object" && o != null && typeof o === "object" && !Array.isArray(b) && !Array.isArray(o)) {
      merged[sec] = { ...b, ...o };
      for (const k of Object.keys(o)) if (k in b && String(b[k]) !== String(o[k])) collisions++;
    }
  }
  return { merged, collisions };
}

export function readTokens(jsonPath = DEFAULT_JSON) {
  return JSON.parse(readFileSync(jsonPath, "utf8"));
}

export function buildCss(tokens) {
  const t = normalizeTokens(tokens);
  const light = resolveColorRefs(t.colors ?? {}).resolved;
  const darkR = resolveColorRefs(t.colorsDark ?? {}, light).resolved;
  const lines = [
    "/* Generated by tools/tokens.mjs from tokens.json (DS-02). Edit the JSON, not this file. */",
    ":root {",
  ];
  for (const k of Object.keys(t.colors ?? {})) lines.push(`  --${k}: ${String(light[k] ?? t.colors[k]).toLowerCase()};`);
  for (const [k, v] of Object.entries(t.fonts ?? {})) lines.push(`  --font-${k}: ${v};`);
  for (const [k, v] of Object.entries(t.spacing ?? {})) lines.push(`  --space-${k}: ${v};`);
  lines.push("}");
  const darkKeys = Object.keys(t.colorsDark ?? {});
  if (darkKeys.length > 0) {
    lines.push('[data-theme="dark"] {');
    for (const k of darkKeys) lines.push(`  --${k}: ${String(darkR[k] ?? t.colorsDark[k]).toLowerCase()};`);
    lines.push("}");
  }
  return `${lines.join("\n")}\n`;
}

export function buildDocs(tokens) {
  const t = normalizeTokens(tokens);
  const swatches = Object.entries(t.colors ?? {})
    .map(
      ([k, v]) =>
        `    <div class="sw"><span class="chip" style="background: var(--${k})"></span><code>--${k}: ${String(v).toLowerCase()}</code></div>`,
    )
    .join("\n");
  const darkNote =
    Object.keys(t.colorsDark ?? {}).length > 0
      ? `  <p class="muted">Dark theme: toggle <code>data-theme="dark"</code> on &lt;html&gt;. Hebrew type: <span style="font-family: var(--font-hebrew)">עיצוב שעובד</span>.</p>`
      : ``;
  return `<!DOCTYPE html>
<!-- Generated by tools/tokens.mjs (DS-02). Docs page: every color via var(--*), no hex in this file. -->
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<title>Tokens docs</title>
<link rel="stylesheet" href="tokens.css">
<style>
  body { background: var(--paper); color: var(--ink); font-family: var(--font-body); margin: 0; padding: var(--space-lg); }
  h1 { font-family: var(--font-display); }
  .grid { display: grid; gap: var(--space-sm); margin: var(--space-md) 0; }
  .sw { display: flex; align-items: center; gap: var(--space-sm); border: 1px solid var(--line); padding: var(--space-sm); }
  .chip { width: 48px; height: 48px; border: 1px solid var(--line); display: inline-block; }
  .cta { display: inline-block; background: var(--accent); color: var(--on-accent); padding: var(--space-sm) var(--space-md); }
  .muted { color: var(--muted); }
</style>
</head>
<body>
  <h1>Brand tokens</h1>
  <p class="muted">Source: tokens.json. Type: display plus body plus Hebrew. Spacing scale below.</p>
  <div class="grid">
${swatches}
  </div>
${darkNote}
  <p style="font-family: var(--font-display)">Display type specimen: DESIGN THAT SHIPS</p>
  <p>Body type specimen: Brief to rendered, audited pixels.</p>
  <p><span class="cta">Accent CTA specimen</span></p>
</body>
</html>
`;
}

function hardColors(text) {
  // Strip :root var declarations when scanning tokens.css itself is handled by caller;
  // here we scan pages/docs which must carry zero hex colors.
  return text.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
}

export function checkTokens({ json = DEFAULT_JSON, css = DEFAULT_CSS, docs = DEFAULT_DOCS, page = DEFAULT_PAGE } = {}) {
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });

  if (!existsSync(json)) {
    ok("tokens.json exists", false, json);
    return { pass: false, results };
  }
  ok("tokens.json exists", true, json);
  let raw;
  try {
    raw = JSON.parse(readFileSync(json, "utf8"));
  } catch (e) {
    ok("tokens.json parses", false, String(e.message || e));
    return { pass: false, results };
  }
  ok("tokens.json parses", true, "valid JSON");
  const tokens = normalizeTokens(raw);
  const sd = raw.colors == null && raw.color != null;
  ok("shape: flat or Style Dictionary", true, sd ? "Style Dictionary color/value shape" : "flat colors shape");

  // S12 fixpoint: resolve {ref} chains (hover-after-base) before the color
  // gates, so aliases read as their final hex. Unresolved names stay raw and
  // trip the refs gates below instead of hanging the loop.
  const lightR = resolveColorRefs(tokens.colors ?? {});
  const darkR = resolveColorRefs(tokens.colorsDark ?? {}, lightR.resolved);
  const rawColors = tokens.colors ?? {};
  const rawDark = tokens.colorsDark ?? {};
  const colors = {};
  for (const k of Object.keys(rawColors)) colors[k] = lightR.resolved[k] ?? rawColors[k];
  const darkColors = {};
  for (const k of Object.keys(rawDark)) darkColors[k] = darkR.resolved[k] ?? rawDark[k];

  // vars: 5+ colors, all #rrggbb.
  const names = Object.keys(colors);
  const allHex = names.every((k) => HEX.test(String(colors[k] ?? "")));
  ok("vars: 5+ colors are #rrggbb", names.length >= 5 && allHex, `${names.length} colors${allHex ? "" : " (non-hex found)"}`);

  // pairs: the three shipped text pairs hit 4.5:1 (light theme).
  const pairs = [
    ["ink", "paper"],
    ["muted", "paper"],
    ["on-accent", "accent"],
  ];
  for (const [fg, bg] of pairs) {
    try {
      const ratio = contrastRatio(String(colors[fg]).toLowerCase(), String(colors[bg]).toLowerCase());
      ok(`pairs: ${fg} on ${bg} >= 4.5:1`, ratio >= 4.5, `${ratio.toFixed(2)}:1`);
    } catch (e) {
      ok(`pairs: ${fg} on ${bg} >= 4.5:1`, false, String(e.message || e));
    }
  }

  // DS-35 C1: pair-name lint (accent needs on-accent, paper needs ink).
  const pairMissing = lintPairMates(colors);
  ok(
    "pairs: bg/fg convention (paper/ink, accent/on-accent)",
    pairMissing.length === 0,
    pairMissing.length ? `missing mate: ${pairMissing.join(", ")}` : "pairs ship together",
  );

  // type: display + body + hebrew stacks present.
  const typeOk = Boolean(tokens.fonts?.display) && Boolean(tokens.fonts?.body) && Boolean(tokens.fonts?.hebrew);
  ok("type: display + body + hebrew stacks", typeOk, typeOk ? "three stacks present" : "fonts.display/body/hebrew required");

  // spacing: 3+ --space-* tokens shaped Npx.
  const spacing = tokens.spacing ?? {};
  const sNames = Object.keys(spacing);
  const shapeOk = sNames.every((k) => /^\d+px$/.test(String(spacing[k] ?? "")));
  ok("spacing: 3+ --space-* tokens", sNames.length >= 3 && shapeOk, `${sNames.length} tokens${shapeOk ? "" : " (shape must be Npx)"}`);

  // refs: S12 deferred-set gate (hover-after-base) + circular stall guard.
  // Flat kits with no aliases pass both; chains must fully resolve; a stalled
  // deferred set (circular or broken ref) fails closed with the token names.
  const stalled = [...lightR.deferred, ...darkR.deferred];
  const aliasCount = Object.keys(rawColors).filter((k) => usesReferences(String(rawColors[k]))).length
    + Object.keys(rawDark).filter((k) => usesReferences(String(rawDark[k]))).length;
  ok(
    "refs: alias chain resolves (hover-after-base)",
    stalled.length === 0,
    stalled.length ? `unresolved ${stalled.join(", ")}` : aliasCount ? `${aliasCount} aliases resolved` : "no aliases",
  );
  ok(
    "refs: no circular stall",
    stalled.length === 0,
    stalled.length ? `stall: ${stalled.join(", ")} (circular or broken ref)` : "no stall",
  );

  // dark: overrides for paper/ink/accent ship and the dark pairs pass.
  const dark = darkColors;
  const dNames = Object.keys(dark);
  if (dNames.length === 0) {
    ok("dark: light/dark overrides", false, "colorsDark (or themes.dark) missing: light/dark required");
  } else {
    const need = ["paper", "ink", "accent"];
    const missing = need.filter((k) => !(k in dark));
    ok("dark: light/dark overrides", missing.length === 0, missing.length ? `missing ${missing.join(",")}` : `${dNames.length} dark overrides`);
    const darkPairs = [
      ["ink", "paper"],
      ["on-accent", "accent"],
    ];
    for (const [fg, bg] of darkPairs) {
      const f = dark[fg] ?? colors[fg];
      const b = dark[bg] ?? colors[bg];
      try {
        const ratio = contrastRatio(String(f).toLowerCase(), String(b).toLowerCase());
        ok(`dark pairs: ${fg} on ${bg} >= 4.5:1`, ratio >= 4.5, `${ratio.toFixed(2)}:1`);
      } catch (e) {
        ok(`dark pairs: ${fg} on ${bg} >= 4.5:1`, false, String(e.message || e));
      }
    }
  }

  // DS-35 C1: dark must override every pair member shipped in light.
  const pairGaps = darkPairGaps(colors, darkColors);
  ok(
    "dark: overrides every surface pair",
    Object.keys(darkColors).length > 0 && pairGaps.length === 0,
    Object.keys(darkColors).length === 0 ? "no dark theme" : pairGaps.length ? `dark missing ${pairGaps.join(",")}` : "pairs overridden in dark",
  );

  // diff: tokens.css on disk equals the generator output.
  const expected = buildCss(raw);
  if (!existsSync(css)) {
    ok("diff: tokens.css matches tokens.json", false, "tokens.css missing (run --build)");
  } else {
    const onDisk = readFileSync(css, "utf8");
    ok(
      "diff: tokens.css matches tokens.json",
      onDisk.replace(/\r\n/g, "\n") === expected.replace(/\r\n/g, "\n"),
      onDisk.replace(/\r\n/g, "\n") === expected.replace(/\r\n/g, "\n") ? "in sync" : "drift: run node tools/tokens.mjs --build",
    );
  }

  // no hardcoded colors in the consumer page + docs page (docs may name hex
  // values inside <code> specimens; those are documentation, not styling).
  const pageHard = (file, stripCode) => {
    let text = readFileSync(file, "utf8");
    if (stripCode) text = text.replace(/<code>[\s\S]*?<\/code>/gi, "");
    return hardColors(text);
  };
  for (const [label, file, stripCode] of [
    ["page.html", page, false],
    ["tokens.html", docs, true],
  ]) {
    if (!existsSync(file)) {
      ok(`no hardcoded colors in ${label}`, false, `${label} missing`);
    } else {
      const hard = pageHard(file, stripCode);
      ok(`no hardcoded colors in ${label}`, hard.length === 0, hard.length ? `hardcoded ${hard.slice(0, 3).join(", ")}` : "all color via var(--*)");
    }
  }

  // docs page exists and links tokens.css.
  if (existsSync(docs)) {
    const html = readFileSync(docs, "utf8");
    ok("docs: tokens.html lists the kit", html.includes("tokens.css") && html.includes("--accent"), "tokens.css linked, swatches listed");
  } else {
    ok("docs: tokens.html lists the kit", false, "tokens.html missing (run --build)");
  }

  return { pass: results.every((r) => r.pass), results };
}

export function buildAll({ json = DEFAULT_JSON, css = DEFAULT_CSS, docs = DEFAULT_DOCS } = {}) {
  const tokens = readTokens(json);
  writeFileSync(css, buildCss(tokens), "utf8");
  writeFileSync(docs, buildDocs(tokens), "utf8");
  return { css, docs };
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
  if (args.includes("--build")) {
    const i = args.indexOf("--build");
    const j = args[i + 1]?.startsWith("--") || args[i + 1] == null ? {} : { json: resolve(args[i + 1]) };
    const out = buildAll(j.json ? { json: j.json } : {});
    console.log(`TOKENS BUILD ${out.css} + ${out.docs}`);
  }
  if (args.includes("--check") || args.length === 0) {
    const { pass, results } = checkTokens();
    for (const r of results) console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}: ${r.detail}`);
    console.log(pass ? "TOKENS PASS: tokens.json -> tokens.css + docs, 0 hardcoded colors" : `TOKENS FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
    if (!pass) process.exitCode = 1;
  }
  if (!args.includes("--build") && !args.includes("--check") && args.length > 0) {
    console.log("usage: node tools/tokens.mjs [--build [tokens.json]] [--check]");
    process.exitCode = 2;
  }
}
