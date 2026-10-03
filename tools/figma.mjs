// tools/figma.mjs (DS-08 figma-01): file-drop Figma JSON + code-connect mapping, no network.
//
// NO Figma MCP path exists: opencode.jsonc mcp is github+deepwiki+arxiv only,
// so this is the closest runnable alternative. A designer exports the Figma
// file (or copies the REST `document` payload) and drops it as JSON; this
// tool maps every top-level FRAME to a DS-03 registry block via MAPPING and
// fails closed when anything is unmapped, token-less, or networked.
//
//   node tools/figma.mjs --check [drop.json]
//
// With no drop.json arg the embedded DROP_FIXTURE is checked (self-contained,
// no network). With a drop.json path that file is checked through the same
// gates, proving the file-drop path.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROW = "DS-08";
export const WHAT = "figma-01: file-drop Figma JSON + code-connect mapping (no MCP, no network)";
export const TOOL = "tools/figma.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HEX = /#[0-9a-fA-F]{6}\b/g;

// Code-connect mapping table: Figma component/frame name -> registry block.
// slots: Figma node name (TEXT child) -> selector/slot in the block file.
// styles: Figma style name -> CSS var the block must use.
export const MAPPING = [
  { figma: "Landing/Hero", block: "hero", file: "templates/blocks/hero.html", slots: { Title: "h1", Subtitle: "p.lead", CTA: "a.cta" }, styles: { paper: "--paper", ink: "--ink", accent: "--accent" } },
  { figma: "Landing/FeatureGrid", block: "feature-grid", file: "templates/blocks/feature-grid.html", slots: { Title: "h2", Item: "li" }, styles: { paper: "--paper", ink: "--ink", line: "--line" } },
  { figma: "Landing/Pricing", block: "pricing", file: "templates/blocks/pricing.html", slots: { Title: "h2", Price: ".price", CTA: "a.cta" }, styles: { paper: "--paper", ink: "--ink", accent: "--accent" } },
  { figma: "Landing/CTA", block: "cta", file: "templates/blocks/cta.html", slots: { Title: "h2", CTA: "a.cta" }, styles: { accent: "--accent", "on-accent": "--on-accent" } },
  { figma: "Landing/Newsletter", block: "newsletter", file: "templates/blocks/newsletter.html", slots: { Title: "h2", CTA: "button.cta" }, styles: { paper: "--paper", ink: "--ink", accent: "--accent" } },
  { figma: "Landing/Footer", block: "footer", file: "templates/blocks/footer.html", slots: { Note: "small" }, styles: { paper: "--paper", ink: "--ink", line: "--line" } },
];

// Embedded file-drop fixture: the shape a Figma file/REST export drops.
// No URLs, no tokens, no network — pure geometry + text.
export function dropFixture() {
  const frame = (id, name, w, h, texts) => ({
    id, name, type: "FRAME",
    absoluteBoundingBox: { x: 0, y: 0, width: w, height: h },
    children: texts.map(([nid, nname, characters], i) => ({
      id: nid, name: nname, type: "TEXT", characters,
      style: { fontSize: 16 + i * 8, textAlignHorizontal: "LEFT" },
      absoluteBoundingBox: { x: 24, y: 24 + i * 64, width: w - 48, height: 48 },
    })),
  });
  return {
    name: "Landing",
    document: {
      id: "0:0", name: "Document", type: "DOCUMENT",
      children: [
        frame("1:2", "Landing/Hero", 1280, 720, [["1:3", "Title", "Ship faster"], ["1:4", "Subtitle", "Brief to render in one run"], ["1:5", "CTA", "Start free"]]),
        frame("1:6", "Landing/FeatureGrid", 1280, 640, [["1:7", "Title", "Everything included"], ["1:8", "Item", "Tokens"]]),
        frame("1:9", "Landing/Pricing", 1280, 560, [["1:10", "Title", "Simple pricing"], ["1:11", "Price", "$19"], ["1:12", "CTA", "Buy"]]),
        frame("1:13", "Landing/CTA", 1280, 400, [["1:14", "Title", "Ready when you are"], ["1:15", "CTA", "Get started"]]),
        frame("1:16", "Landing/Newsletter", 1280, 360, [["1:17", "Title", "Stay in the loop"], ["1:18", "CTA", "Subscribe"]]),
        frame("1:19", "Landing/Footer", 1280, 240, [["1:20", "Note", "MIT blocks, 0 hardcoded colors"]]),
      ],
    },
  };
}

export function resolveMapping(figmaName, mapping = MAPPING) {
  return mapping.find((m) => m.figma === figmaName) ?? null;
}

// LAND-04 verdict gate (DS-44, step 4/4 Landing): Landing closes only after
// the Figma-mapped landing pages carry a judge SHIP verdict. No code without
// verdict: each sample in LANDING_VERDICT_SAMPLES must hold DESIGN-REVIEW.md
// with a ## Verdict section containing SHIP (ds-quality-v1 floor 8).
export const LANDING_VERDICT_SAMPLES = ["samples/ads/hero", "samples/cover-b"];

export function verdictFor(dir, root = ROOT) {
  const file = join(root, dir, "DESIGN-REVIEW.md");
  if (!existsSync(file)) return { pass: false, detail: `${dir}/DESIGN-REVIEW.md missing — next: run judge then re-run` };
  const text = readText(file) ?? "";
  if (!/##\s*Verdict/i.test(text)) return { pass: false, detail: `${dir} review has no ## Verdict — next: run judge then re-run` };
  if (!/\bSHIP\b/.test(text)) return { pass: false, detail: `${dir} verdict is not SHIP — next: fix to SHIP then re-run` };
  const m = text.match(/(\d+)\/10/)?.[1] ?? "SHIP";
  return { pass: true, detail: `${dir} ${m} SHIP` };
}

export function checkLandingVerdict({ root = ROOT, samples = LANDING_VERDICT_SAMPLES } = {}) {
  return samples.map((s) => ({ name: `landing verdict ${s} SHIP`, ...verdictFor(s, root) }));
}

function readText(f) {
  try { return readFileSync(f, "utf8"); } catch { return null; }
}

export function checkFigma({ root = ROOT, mapping = MAPPING, drop = dropFixture() } = {}) {
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });

  // 1. mapping table gates
  ok("mapping table non-empty", Array.isArray(mapping) && mapping.length >= 4, `${mapping?.length ?? 0} entries`);
  const names = new Set((mapping ?? []).map((m) => m.figma));
  ok("mapping covers landing hero+cta", names.has("Landing/Hero") && names.has("Landing/CTA"), [...names].join(",") || "empty");
  ok("mapping names unique", names.size === (mapping?.length ?? 0), `${names.size}/${mapping?.length ?? 0} unique`);

  // registry cross-check (read-only): every mapped block must be registered
  let reg = null;
  const regText = readText(join(root, "templates", "registry.json"));
  if (!regText) ok("registry.json readable", false, "templates/registry.json missing");
  else {
    try { reg = JSON.parse(regText); ok("registry.json readable", true, `${reg.blocks?.length ?? 0} blocks`); }
    catch (e) { ok("registry.json readable", false, String(e.message || e)); }
  }
  for (const m of mapping ?? []) {
    const tag = `map ${m.figma}`;
    if (!m?.figma || !m?.block || !m?.file || !m?.slots) { ok(tag, false, "needs figma+block+file+slots"); continue; }
    const b = (reg?.blocks ?? []).find((x) => x.id === m.block);
    ok(`${tag} -> block ${m.block} registered`, !!b, b ? b.file : "not in registry");
    const file = join(root, m.file);
    if (!existsSync(file)) { ok(`${tag} file exists`, false, m.file); continue; }
    ok(`${tag} file exists`, true, m.file);
    const html = readText(file) ?? "";
    const hard = html.replace(/<code>[\s\S]*?<\/code>/gi, "").match(HEX) ?? [];
    ok(`${tag} block has 0 hardcoded colors`, hard.length === 0, hard.length ? `hardcoded ${hard.slice(0, 2).join(",")}` : "all color via var(--*)");
    ok(`${tag} block uses tokens`, /var\(\s*--[\w-]+\s*\)/.test(html), "var(--*) found");
  }

  // 2. no-MCP premise: opencode.jsonc must not carry a figma mcp server
  const confText = readText(join(root, "opencode.jsonc")) ?? "";
  ok("no figma MCP path (file-drop is the alternative)", !/"figma"\s*:/i.test(confText), /"figma"\s*:/i.test(confText) ? "figma key in opencode.jsonc mcp" : "mcp is github+deepwiki+arxiv only");

  // 3. no-network: this tool ships no fetch/http client, fixture carries no URLs
  const own = readText(join(root, TOOL)) ?? "";
  // (tokens split so this guard list itself does not trip the scan)
  const netTokens = ["fe" + "tch(", "node:ht" + "tps", "node:ht" + "tp", "axi" + "os", "undi" + "ci", "https" + ".get", "http" + ".get"];
  const netHits = netTokens.filter((s) => own.includes(s));
  ok("tool performs no network", netHits.length === 0, netHits.length ? `network refs: ${netHits.join(",")}` : "no fetch/http imports");
  const dropStr = JSON.stringify(drop ?? {});
  ok("drop JSON carries no URLs", !/https?:\/\//.test(dropStr), /https?:\/\//.test(dropStr) ? "drop embeds http(s) URL" : "pure geometry + text");

  // 4. file-drop shape gates
  const frames = drop?.document?.children ?? null;
  if (!Array.isArray(frames)) { ok("drop has document.children frames", false, "no document.children array"); }
  else {
    ok("drop has document.children frames", frames.length >= 2, `${frames.length} top-level frames`);
    for (const f of frames) {
      const m = resolveMapping(f?.name, mapping);
      ok(`frame ${f?.name ?? "?"} mapped`, !!m, m ? `-> ${m.block} (${m.file})` : "unmapped frame: add a MAPPING row");
      if (!m) continue;
      ok(`frame ${f.name} is a FRAME with bounds`, f.type === "FRAME" && !!f.absoluteBoundingBox?.width, f.type === "FRAME" ? `${f.absoluteBoundingBox?.width}x${f.absoluteBoundingBox?.height}` : `type ${f?.type}`);
      for (const [slot] of Object.entries(m.slots ?? {})) {
        const kids = (f.children ?? []).map((c) => c?.name);
        ok(`frame ${f.name} slot ${slot} present`, kids.includes(slot), kids.includes(slot) ? "text node present" : `children: ${kids.join(",") || "none"}`);
      }
    }
    const covered = new Set(frames.map((f) => resolveMapping(f?.name, mapping)?.block).filter(Boolean));
    ok("drop covers hero+cta blocks", covered.has("hero") && covered.has("cta"), [...covered].join(",") || "none");
  }

  // 5. LAND-04 verdict gate: no code without verdict (DS-44 closes Landing).
  for (const v of checkLandingVerdict({ root })) {
    ok(v.name, v.pass, v.detail);
  }

  return { pass: results.every((r) => r.pass), results };
}

const isMain = (() => {
  try { return fileURLToPath(import.meta.url) === resolve(process.argv[1]); }
  catch { return false; }
})();

if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes("--check")) {
    let drop;
    const extra = args.filter((a) => a !== "--check" && !a.startsWith("-"));
    if (extra.length > 0) {
      const p = resolve(extra[0]);
      if (!existsSync(p)) { console.log(`[FAIL] drop file exists: ${extra[0]} missing`); console.log("FIGMA FAIL: 1 failing check(s)"); process.exitCode = 1; }
      else {
        try { drop = JSON.parse(readFileSync(p, "utf8")); }
        catch (e) { console.log(`[FAIL] drop file parses: ${String(e.message || e)}`); console.log("FIGMA FAIL: 1 failing check(s)"); process.exitCode = 1; }
      }
    }
    if (process.exitCode !== 1) {
      const { pass, results } = checkFigma(drop === undefined ? {} : { drop });
      for (const r of results) console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}: ${r.detail}`);
      console.log(pass ? `FIGMA PASS: ${MAPPING.length} mappings, ${dropFixture().document.children.length} frames, no network` : `FIGMA FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
      if (!pass) process.exitCode = 1;
    }
  } else {
    console.log(`usage: node ${TOOL} --check [drop.json] (${ROW} file-drop, no MCP, no network)`);
    process.exitCode = 2;
  }
}
