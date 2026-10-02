// tools/taste.mjs (DS-18 taste library v1 from od-taste): 20 exemplars with tokens.
// Fail-closed: taste/library.json must hold 20 uniquely-id'd exemplars, each
// with a mood, a density, and a tokens export (5+ hex colors with 4.5:1 text
// pairs, display+body+hebrew type, 3+ Npx spacing). No fake PASS.
//   node tools/taste.mjs --check
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { contrastRatio } from "./audit.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIBRARY = join(ROOT, "taste", "library.json");

const HEX = /^#[0-9a-fA-F]{6}$/;

export function checkTaste({ libraryPath = LIBRARY } = {}) {
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });

  if (!existsSync(libraryPath)) {
    ok("library.json exists", false, libraryPath);
    return { pass: false, results };
  }
  ok("library.json exists", true, libraryPath);
  let lib;
  try {
    lib = JSON.parse(readFileSync(libraryPath, "utf8"));
  } catch (e) {
    ok("library.json parses", false, String(e.message || e));
    return { pass: false, results };
  }
  const ex = lib.exemplars ?? [];
  ok("library.json parses", true, `${ex.length} exemplar(s)`);
  ok("20 exemplars shipped", ex.length === 20, `${ex.length}/20`);
  const ids = ex.map((e) => e.id);
  ok("exemplar ids unique", new Set(ids).size === ids.length && ids.every(Boolean), `${new Set(ids).size} unique`);

  for (const e of ex) {
    const tag = e.id ?? "(no id)";
    ok(`${tag} has mood + density`, Boolean(e.mood) && Boolean(e.density), `${e.mood ?? "?"} / ${e.density ?? "?"}`);
    const colors = e.tokens?.colors ?? {};
    const names = Object.keys(colors);
    ok(`${tag} tokens: 5+ hex colors`, names.length >= 5 && names.every((n) => HEX.test(String(colors[n]))), `${names.length} colors`);
    for (const [fg, bg] of [["ink", "paper"], ["on-accent", "accent"]]) {
      try {
        const ratio = contrastRatio(String(colors[fg]).toLowerCase(), String(colors[bg]).toLowerCase());
        ok(`${tag} pairs: ${fg} on ${bg} >= 4.5:1`, ratio >= 4.5, `${ratio.toFixed(2)}:1`);
      } catch (err) {
        ok(`${tag} pairs: ${fg} on ${bg} >= 4.5:1`, false, String(err.message || err));
      }
    }
    const f = e.tokens?.fonts ?? {};
    ok(`${tag} type: display + body + hebrew`, Boolean(f.display) && Boolean(f.body) && Boolean(f.hebrew), "three stacks");
    const sp = e.tokens?.spacing ?? {};
    ok(`${tag} spacing: 3+ Npx tokens`, Object.keys(sp).length >= 3 && Object.values(sp).every((v) => /^\d+px$/.test(String(v))), `${Object.keys(sp).length} tokens`);
  }

  return { pass: results.every((r) => r.pass), results };
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
  if (args.includes("--check") || args.length === 0) {
    const { pass, results } = checkTaste();
    for (const r of results) console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}: ${r.detail}`);
    console.log(pass ? "TASTE PASS: 20 exemplars with tokens" : `TASTE FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
    if (!pass) process.exitCode = 1;
  } else {
    console.log("usage: node tools/taste.mjs [--check]");
    process.exitCode = 2;
  }
}
