// tools/game-ui.mjs (DS-11 game-ui-01): HUD + menu + button kit on Kenney CC0
// placeholders plus Lucide ISC inline icons. Fail-closed: 5 checks (tokens,
// states, icons, sizes, import). DS-20 reuses this file with --serve.
//   node tools/game-ui.mjs --check
//   node tools/game-ui.mjs --serve --check   (adds the engine-import gate)
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KIT = join(ROOT, "kits", "game-ui");
const MANIFEST = join(KIT, "manifest.json");
const HEX = /#[0-9a-fA-F]{6}\b/g;

export function checkGameUi({ serve = false, kitDir = KIT, manifestPath = MANIFEST } = {}) {
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });
  const read = (f) => readFileSync(join(kitDir, f), "utf8");

  if (!existsSync(manifestPath)) {
    ok("manifest.json exists", false, manifestPath);
    return { pass: false, results };
  }
  ok("manifest.json exists", true, manifestPath);
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (e) {
    ok("manifest.json parses", false, String(e.message || e));
    return { pass: false, results };
  }
  ok("manifest.json parses", true, `${manifest.pieces?.length ?? 0} pieces`);

  // 1. tokens: tokens.css ships 6+ --gui-* colors, pieces use var(--gui-*) only.
  const tokensFile = join(kitDir, manifest.tokens ?? "tokens.css");
  if (!existsSync(tokensFile)) {
    ok("tokens: tokens.css exists", false, manifest.tokens ?? "tokens.css");
  } else {
    const css = readFileSync(tokensFile, "utf8");
    const vars = [...css.matchAll(/--gui-[\w-]+\s*:\s*(#[0-9a-fA-F]{6})\b/g)];
    ok("tokens: 6+ --gui-* colors", vars.length >= 6, `${vars.length} gui vars`);
    for (const p of manifest.pieces ?? []) {
      const file = join(kitDir, p.file ?? "");
      if (!existsSync(file)) {
        ok(`tokens: ${p.id} exists`, false, p.file ?? "(no file)");
        continue;
      }
      ok(`tokens: ${p.id} exists`, true, p.file);
      const html = readFileSync(file, "utf8").replace(/<code>[\s\S]*?<\/code>/gi, "");
      const hard = manifest.tokens && p.file === manifest.tokens ? [] : (html.match(HEX) ?? []);
      // tokens.css itself declares the palette (allowed); consumers must not.
      const isTokens = (p.file ?? "") === (manifest.tokens ?? "tokens.css");
      ok(
        `tokens: no hardcoded colors in ${p.id}`,
        isTokens ? true : hard.length === 0,
        isTokens ? "palette declarations only" : hard.length ? `hardcoded ${hard.slice(0, 2).join(",")}` : "all color via var(--gui-*)",
      );
      if (!isTokens) ok(`tokens: ${p.id} uses var(--gui-*)`, /var\(\s*--gui-[\w-]+\s*\)/.test(html), "var(--gui-*) found");
    }
  }

  // 2. states: button kit covers default/hover/active/disabled/focus.
  const btnFile = join(kitDir, "buttons.css");
  if (!existsSync(btnFile)) {
    ok("states: buttons.css exists", false, "buttons.css");
  } else {
    const css = readFileSync(btnFile, "utf8");
    ok("states: buttons.css exists", true, "buttons.css");
    ok("states: .btn + .btn-primary", /\.btn\s*\{/.test(css) && /\.btn-primary/.test(css), ".btn base + primary variant");
    for (const [label, re] of [
      ["hover", /\.btn[^\{]*:hover/],
      ["active", /\.btn[^\{]*:active/],
      ["disabled", /(\.btn[^\{]*:disabled|\.btn\[disabled\]|\[disabled\])/],
      ["focus-visible", /:focus-visible/],
    ]) {
      ok(`states: ${label}`, re.test(css), re.test(css) ? `${label} styled` : `no ${label} rule on .btn`);
    }
  }

  // 3. icons: inline Lucide-style stroke SVGs, license tracked.
  const lic = manifest.icons ?? {};
  ok("icons: Lucide ISC tracked", /lucide/i.test(lic.set ?? "") && /ISC/.test(lic.license ?? ""), lic.license ?? "missing icons.license");
  ok("icons: Kenney CC0 art tracked", /kenney/i.test(lic.art ?? "") && /CC0/.test(lic.art ?? ""), lic.art ?? "missing icons.art");
  for (const f of ["hud.html", "menu.html"]) {
    if (!existsSync(join(kitDir, f))) {
      ok(`icons: ${f} exists`, false, f);
      continue;
    }
    const html = read(f);
    const svgs = [...html.matchAll(/<svg[^>]*>/gi)];
    const stroked = [...html.matchAll(/<svg[^>]*stroke="currentColor"[^>]*>/gi)];
    const sized = [...html.matchAll(/<svg[^>]*width="24"[^>]*height="24"[^>]*>/gi)];
    ok(`icons: ${f} ships 2+ inline SVGs`, svgs.length >= 2, `${svgs.length} svg(s)`);
    ok(`icons: ${f} 24px stroke=currentColor`, stroked.length >= 2 && sized.length >= 2, `${sized.length} at 24x24, ${stroked.length} stroked`);
  }

  // 4. sizes: 44px touch targets, HUD bar height, menu width floor.
  const sizes = manifest.sizes ?? {};
  ok("sizes: manifest touchMin >= 44", Number(sizes.touchMin) >= 44, `touchMin ${sizes.touchMin ?? "missing"}`);
  if (existsSync(btnFile)) {
    const css = readFileSync(btnFile, "utf8");
    const m = css.match(/\.btn\s*\{[\s\S]*?min-height\s*:\s*(\d+)px/);
    ok("sizes: .btn min-height >= 44px", !!m && Number(m[1]) >= 44, m ? `${m[1]}px` : "no min-height on .btn");
  }
  if (existsSync(join(kitDir, "hud.html"))) {
    const html = read("hud.html");
    ok("sizes: HUD bar height >= 12px", /\.bar\s*\{[^}]*height\s*:\s*(\d+)px/.test(html) && Number(html.match(/\.bar\s*\{[^}]*height\s*:\s*(\d+)px/)[1]) >= 12, "bar height declared");
    ok("sizes: HUD touch targets 44px", /44px/.test(html), "44px targets in HUD");
  }

  // 5. import: HUD + menu link both stylesheets (one drop-in import each).
  for (const f of ["hud.html", "menu.html"]) {
    if (!existsSync(join(kitDir, f))) continue;
    const html = read(f);
    ok(`import: ${f} links tokens.css + buttons.css`, /href="tokens\.css"/.test(html) && /href="buttons\.css"/.test(html), "two <link> imports");
  }

  // --serve gate (DS-20): manifest engines name forge + engine2040, pieces tagged.
  if (serve) {
    const engines = manifest.engines ?? {};
    ok("serve: forge import named", typeof engines.forge === "string" && engines.forge.length > 0, engines.forge ?? "missing engines.forge");
    ok("serve: engine2040 import named", typeof engines.engine2040 === "string" && engines.engine2040.length > 0, engines.engine2040 ?? "missing engines.engine2040");
    for (const f of ["hud.html", "menu.html"]) {
      if (!existsSync(join(kitDir, f))) continue;
      ok(`serve: ${f} tagged data-engine`, /data-engine="/.test(read(f)), "data-engine present");
    }
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
    const { pass, results } = checkGameUi({ serve: args.includes("--serve") });
    for (const r of results) console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}: ${r.detail}`);
    console.log(pass ? "GAME-UI PASS: HUD + menu + button kit, tokens/states/icons/sizes/import green" : `GAME-UI FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
    if (!pass) process.exitCode = 1;
  } else {
    console.log("usage: node tools/game-ui.mjs [--serve] [--check]");
    process.exitCode = 2;
  }
}
