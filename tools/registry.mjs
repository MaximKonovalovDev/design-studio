// tools/registry.mjs (DS-03 registry-01): the shadcn-pattern block registry.
// templates/registry.json names every block (hero, feature-grid, pricing, cta)
// and every remix-start page template (cover 1280x720, ad 1080x1080, story 1080x1920,
// capsule 616x353). This module fails closed: missing files, bad sizes,
// hardcoded hex colors, or a template without dir/CTA/action all FAIL.
//   node tools/registry.mjs --check
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = join(ROOT, "templates", "registry.json");

const HEX = /#[0-9a-fA-F]{6}\b/g;

// DS-37 single-source block emit (Mitosis componentToReact idea-only, 0 lines
// copied): one block file fans out to every consumer instead of hand-kept
// copies. emitBlock(id, slots) fills the block's SLOT tokens and returns the
// sample section plus a consumer snippet; the checked-in
// templates/blocks/<id>.emit.html must byte-equal emitBlock(id) with default
// slots, so the block file stays the single source. Consumers pull with:
//   node tools/registry.mjs --emit hero TITLE="Hello"
const EMIT_DEFAULTS = {
  hero: { KICKER: "New drop", TITLE: "Ship the cover", SUBTITLE: "One prompt, one render, one audit." },
};
const EMIT_SLOTS = ["KICKER", "TITLE", "SUBTITLE", "ACTION"];

export function emitBlock(id, slots = {}) {
  const file = join(ROOT, "templates", "blocks", `${id}.html`);
  if (!existsSync(file)) throw new Error(`unknown block ${id}: no templates/blocks/${id}.html`);
  const src = readFileSync(file, "utf8");
  const cut = src.search(/^<style[ >]/m);
  if (cut < 0) throw new Error(`block ${id} has no <style> seam`);
  const merged = { ...(EMIT_DEFAULTS[id] ?? {}), ...slots };
  let out = src.slice(0, cut).replace(/<!--[\s\S]*?-->/g, "").trim();
  for (const [k, v] of Object.entries(merged)) out = out.replace(new RegExp(`\\b${k}\\b`, "g"), String(v));
  const leftover = out.match(new RegExp(`\\b(${EMIT_SLOTS.join("|")})\\b`));
  if (leftover) throw new Error(`block ${id} unfilled slot(s): ${[...new Set(leftover)].join(",")}`);
  return `<!-- single-source emit of ${id}.html (DS-37): do not hand-edit. Regenerate: node tools/registry.mjs --emit ${id} -- consumer snippet: paste this section into the sample page; tokens via var(--*) come from the block <style>. -->\n${out}\n`;
}

export function checkRegistry(registryPath = REGISTRY) {
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });
  const T = join(dirname(resolve(registryPath)));

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
  ok("registry.json parses", true, `${reg.blocks?.length ?? 0} blocks, ${reg.templates?.length ?? 0} templates`);

  for (const id of ["hero", "feature-grid", "pricing", "cta", "testimonial", "faq", "stats", "gallery", "newsletter", "footer"]) {
    const b = (reg.blocks ?? []).find((x) => x.id === id);
    ok(`block ${id} registered`, !!b?.file, b?.file ?? "missing");
  }
  const sizes = { cover: "1280x720", "ad-square": "1080x1080", story: "1080x1920", capsule: "616x353" };
  for (const [id, size] of Object.entries(sizes)) {
    const t = (reg.templates ?? []).find((x) => x.id === id);
    const good = !!t && t.size?.w && t.size?.h && `${t.size.w}x${t.size.h}` === size;
    ok(`template ${id} at ${size}`, good, t ? `${t.size?.w}x${t.size?.h} ${t.file ?? ""}` : "missing");
  }

  const files = [...(reg.blocks ?? []), ...(reg.templates ?? [])];
  for (const f of files) {
    const file = join(T, f.file ?? "");
    if (!existsSync(file)) {
      ok(`file ${f.id} exists`, false, f.file ?? "(no file)");
      continue;
    }
    ok(`file ${f.id} exists`, true, f.file);
    const html = readFileSync(file, "utf8");
    const hard = html.replace(/<code>[\s\S]*?<\/code>/gi, "").match(HEX) ?? [];
    ok(`no hardcoded colors in ${f.id}`, hard.length === 0, hard.length ? `hardcoded ${hard.slice(0, 2).join(",")}` : "all color via var(--*)");
    ok(`${f.id} uses tokens`, /var\(\s*--[\w-]+\s*\)/.test(html), "var(--*) found");
  }
  for (const t of reg.templates ?? []) {
    const file = join(T, t.file ?? "");
    if (!existsSync(file)) continue;
    const html = readFileSync(file, "utf8");
    const sizeTag = html.match(/<!--\s*size:\s*(\d+)x(\d+)\s*-->/);
    ok(
      `${t.id} size tag matches registry`,
      !!sizeTag && Number(sizeTag[1]) === t.size?.w && Number(sizeTag[2]) === t.size?.h,
      sizeTag ? `${sizeTag[1]}x${sizeTag[2]}` : "no <!-- size: WxH --> tag",
    );
    ok(`${t.id} declares dir`, /<html[^>]*\bdir\s*=\s*"(ltr|rtl)"/i.test(html), "dir on <html>");
    ok(
      `${t.id} has an action`,
      /class\s*=\s*"[^"]*cta[^"]*"|<button|<a\s[^>]*href/i.test(html),
      "cta/button/link present",
    );
  }

  // DS-37 single-source emit gate: hero.emit.html must byte-equal emitBlock("hero").
  try {
    const emitted = emitBlock("hero");
    const emitFile = join(T, "blocks", "hero.emit.html");
    const disk = existsSync(emitFile) ? readFileSync(emitFile, "utf8") : null;
    ok("emit hero matches checked-in hero.emit.html", disk === emitted, disk === null ? "hero.emit.html missing" : disk === emitted ? "single source holds" : "checked-in emit drifted from block");
  } catch (e) {
    ok("emit hero matches checked-in hero.emit.html", false, String(e.message || e));
  }
  // DS-37 fixtures, all fail closed: unknown block throws, slots fill, 0 hex.
  try {
    emitBlock("no-such-block");
    ok("emit unknown block FAILs closed", false, "no throw?");
  } catch (e) {
    ok("emit unknown block FAILs closed", /unknown block/.test(e.message), e.message);
  }
  try {
    emitBlock("cta");
    ok("emit unfilled slots FAIL closed", false, "no throw?");
  } catch (e) {
    ok("emit unfilled slots FAIL closed", /unfilled slot/.test(e.message), e.message);
  }
  try {
    const custom = emitBlock("hero", { TITLE: "Probe title" });
    ok("emit fills slots", custom.includes("Probe title") && !/\bTITLE\b/.test(custom), "TITLE swapped, no leftovers");
    ok("emit carries 0 hardcoded colors", (custom.match(HEX) ?? []).length === 0, "all color via var(--*)");
  } catch (e) {
    ok("emit fills slots", false, String(e.message || e));
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
  if (args.includes("--emit")) {
    const id = args[args.indexOf("--emit") + 1];
    const slots = Object.fromEntries(
      args.filter((a) => a.includes("=") && !a.startsWith("--")).map((a) => {
        const i = a.indexOf("=");
        return [a.slice(0, i), a.slice(i + 1)];
      }),
    );
    try {
      process.stdout.write(emitBlock(id, slots));
    } catch (e) {
      console.error(`EMIT FAIL: ${e.message}`);
      process.exitCode = 1;
    }
  } else if (args.includes("--check") || args.length === 0) {
    const { pass, results } = checkRegistry();
    for (const r of results) console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}: ${r.detail}`);
    console.log(pass ? "REGISTRY PASS: 10 blocks + 4 templates + hero single-source emit, 0 hardcoded colors" : `REGISTRY FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
    if (!pass) process.exitCode = 1;
  } else {
    console.log("usage: node tools/registry.mjs [--check] [--emit <block> [SLOT=value ...]]");
    process.exitCode = 2;
  }
}
