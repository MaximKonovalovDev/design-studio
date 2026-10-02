// tools/brandkit.mjs (DS-10 brand-01): name to palette, type, voice, lockup plus tokens export.
// Fail-closed: every kit in brand-kits/registry.json must ship a 5+ color hex
// palette with 4.5:1 text pairs, display+body+hebrew type, 3+ Npx spacing,
// voice (tone/tagline/cta), a var(--*)-only lockup, and a tokens.json-compatible
// export that mirrors the palette. No Python needed.
//   node tools/brandkit.mjs --check
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { contrastRatio } from "./audit.mjs";
import { lintPairMates, darkPairGaps, mergeKits } from "./tokens.mjs";

export { mergeKits };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "brand-kits");
const REGISTRY = join(DIR, "registry.json");

const HEX = /^#[0-9a-fA-F]{6}$/;

export function checkBrandkit({ dir = DIR, registryPath = REGISTRY } = {}) {
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });

  if (!existsSync(registryPath)) {
    ok("registry.json exists", false, registryPath);
    return { pass: false, results };
  }
  ok("registry.json exists", true, registryPath);
  let reg;
  try {
    reg = JSON.parse(readFileSync(registryPath, "utf8"));
  } catch (e) {
    ok("registry.json parses", false, String(e.message || e));
    return { pass: false, results };
  }
  ok("registry.json parses", true, `${reg.kits?.length ?? 0} kit(s)`);
  if (!Array.isArray(reg.kits) || reg.kits.length < 1) {
    ok("1+ kits registered", false, "kits[] empty");
    return { pass: false, results };
  }
  ok("1+ kits registered", true, reg.kits.map((k) => k.id).join(","));

  for (const k of reg.kits) {
    const file = join(dir, k.file ?? "");
    if (!existsSync(file)) {
      ok(`kit ${k.id} file exists`, false, k.file ?? "(no file)");
      continue;
    }
    ok(`kit ${k.id} file exists`, true, k.file);
    let kit;
    try {
      kit = JSON.parse(readFileSync(file, "utf8"));
    } catch (e) {
      ok(`kit ${k.id} parses`, false, String(e.message || e));
      continue;
    }
    ok(`kit ${k.id} parses`, true, kit.name ?? k.id);

    const pal = kit.palette ?? {};
    const names = Object.keys(pal);
    ok(`kit ${k.id} vars: 5+ hex colors`, names.length >= 5 && names.every((n) => HEX.test(String(pal[n]))), `${names.length} colors`);
    for (const [fg, bg] of [["ink", "paper"], ["muted", "paper"], ["on-accent", "accent"]]) {
      try {
        const ratio = contrastRatio(String(pal[fg]).toLowerCase(), String(pal[bg]).toLowerCase());
        ok(`kit ${k.id} pairs: ${fg} on ${bg} >= 4.5:1`, ratio >= 4.5, `${ratio.toFixed(2)}:1`);
      } catch (e) {
        ok(`kit ${k.id} pairs: ${fg} on ${bg} >= 4.5:1`, false, String(e.message || e));
      }
    }
    const t = kit.type ?? {};
    ok(`kit ${k.id} type: display + body + hebrew`, Boolean(t.display) && Boolean(t.body) && Boolean(t.hebrew), "three stacks present");
    const sp = kit.spacing ?? {};
    const sNames = Object.keys(sp);
    ok(`kit ${k.id} spacing: 3+ Npx tokens`, sNames.length >= 3 && sNames.every((n) => /^\d+px$/.test(String(sp[n]))), `${sNames.length} tokens`);
    const v = kit.voice ?? {};
    ok(`kit ${k.id} voice: tone + tagline + cta`, Boolean(v.tone) && Boolean(v.tagline) && Boolean(v.cta), v.tagline ?? "voice missing");
    const lock = kit.lockup ?? {};
    const css = String(lock.css ?? "");
    ok(`kit ${k.id} lockup: wordmark + var(--*) css`, Boolean(lock.wordmark) && /var\(\s*--[\w-]+\s*\)/.test(css), lock.wordmark ?? "wordmark missing");
    ok(`kit ${k.id} lockup: no hardcoded hex`, (css.match(/#[0-9a-fA-F]{6}\b/g) ?? []).length === 0, "lockup css via var(--*)");
    const tok = kit.tokens ?? {};
    const tc = tok.colors ?? {};
    const mirror = names.length > 0 && names.every((n) => String(tc[n] ?? "").toLowerCase() === String(pal[n] ?? "").toLowerCase());
    ok(`kit ${k.id} tokens export mirrors palette`, mirror, mirror ? "tokens.colors == palette" : "drift: tokens.colors must equal palette");
    ok(`kit ${k.id} tokens export has type + spacing`, Boolean(tok.fonts?.display) && Object.keys(tok.spacing ?? {}).length >= 3, "tokens.json-compatible");
    // DS-35 C1: same pair convention + dark-override per kit (palette/paletteDark).
    const mates = lintPairMates(pal);
    ok(`kit ${k.id} pairs: bg/fg convention`, mates.length === 0, mates.length ? `missing mate: ${mates.join(", ")}` : "pairs ship together");
    const gaps = darkPairGaps(pal, kit.paletteDark ?? {});
    ok(
      `kit ${k.id} dark: overrides every surface pair`,
      Object.keys(kit.paletteDark ?? {}).length > 0 && gaps.length === 0,
      Object.keys(kit.paletteDark ?? {}).length === 0 ? "paletteDark missing" : gaps.length ? `dark missing ${gaps.join(",")}` : "pairs overridden in dark",
    );
  }

  // DS-35 C2: registry merge — base + overlays compose to one shippable kit
  // set, overlay wins per key, collisions counted never silent. Informational
  // gate: proves the merge ran on the real registry.
  try {
    const kits = reg.kits.map((k) => JSON.parse(readFileSync(join(dir, k.file ?? ""), "utf8")));
    let acc = kits[0] ?? {};
    let collisions = 0;
    for (const next of kits.slice(1)) {
      const r = mergeKits(acc, next);
      acc = r.merged;
      collisions += r.collisions;
    }
    ok("registry: base+overlay merge (overlay wins)", true, `${kits.length} kit(s), ${collisions} collision(s)`);
  } catch (e) {
    ok("registry: base+overlay merge (overlay wins)", false, String(e.message || e));
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
    const { pass, results } = checkBrandkit();
    for (const r of results) console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}: ${r.detail}`);
    console.log(pass ? "BRANDKIT PASS: name to palette, type, voice, lockup plus tokens export" : `BRANDKIT FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
    if (!pass) process.exitCode = 1;
  } else {
    console.log("usage: node tools/brandkit.mjs [--check]");
    process.exitCode = 2;
  }
}
