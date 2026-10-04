// tools/figma.mjs (DS-08 figma-01, DS-78c ported 2026-10-04): file-drop Figma mapping retired,
// LAND-04 verdict gate kept.
//
// The code-connect mapping table (Landing/* -> templates/blocks/*.html) is retired: the old
// starters moved to archive/2026-10-04/old-starters/ with workshop/ (0 orders used them), so
// there is nothing left to map to. New orders start from templates v1: node tools/template.mjs list.
// What stays is the LAND-04 verdict gate (DS-44, step 4/4 Landing): Landing closes only after
// the landing pages carry a judge SHIP verdict. tools/check.mjs imports checkLandingVerdict
// from here, so that export stays green.
//   node tools/figma.mjs --check
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROW = "DS-08";
export const WHAT = "figma-01: mapping retired (DS-78c, starters archived); LAND-04 verdict gate only (no network)";
export const TOOL = "tools/figma.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const RETIRED_MAPPING = {
  row: "DS-78c",
  archive: "archive/2026-10-04/old-starters",
  successor: "node tools/template.mjs list",
  note: "Landing/* -> templates/blocks mapping retired with the archived starters; file-drop fixture retired with it",
};

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

export function checkFigma({ root = ROOT } = {}) {
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });

  // Retired mapping, noted not gated: the starters it pointed at are archived.
  ok("mapping retired (DS-78c)", true, `Landing/* -> templates/blocks retired; starters in ${RETIRED_MAPPING.archive}, new orders from templates v1`);

  // no-MCP premise: opencode.jsonc must not carry a figma mcp server
  const confText = readText(join(root, "opencode.jsonc")) ?? "";
  ok("no figma MCP path (verdict gate is the alternative)", !/"figma"\s*:/i.test(confText), /"figma"\s*:/i.test(confText) ? "figma key in opencode.jsonc mcp" : "mcp is github+deepwiki+arxiv only");

  // no-network: this tool ships no fetch/http client
  const own = readText(join(root, TOOL)) ?? "";
  // (tokens split so this guard list itself does not trip the scan)
  const netTokens = ["fe" + "tch(", "node:ht" + "tps", "node:ht" + "tp", "axi" + "os", "undi" + "ci", "https" + ".get", "http" + ".get"];
  const netHits = netTokens.filter((s) => own.includes(s));
  ok("tool performs no network", netHits.length === 0, netHits.length ? `network refs: ${netHits.join(",")}` : "no fetch/http imports");

  // LAND-04 verdict gate: no code without verdict (DS-44 closes Landing).
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
  if (args.includes("--check") && args.filter((a) => !a.startsWith("-")).length === 0) {
    const { pass, results } = checkFigma();
    for (const r of results) console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}: ${r.detail}`);
    console.log(pass ? `FIGMA PASS: mapping retired (DS-78c), verdict gate on ${LANDING_VERDICT_SAMPLES.length} samples, no network` : `FIGMA FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
    if (!pass) process.exitCode = 1;
  } else {
    console.log(`usage: node ${TOOL} --check (mapping retired DS-78c; verdict gate over ${LANDING_VERDICT_SAMPLES.join(", ")})`);
    process.exitCode = 2;
  }
}
