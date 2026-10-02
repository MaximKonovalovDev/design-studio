// tools/registry.mjs (DS-03 registry-01): the shadcn-pattern block registry.
// templates/registry.json names every block (hero, feature-grid, pricing, cta)
// and every page template (cover 1280x720, ad 1080x1080, story 1080x1920,
// capsule 616x353). This module fails closed: missing files, bad sizes,
// hardcoded hex colors, or a template without dir/CTA/action all FAIL.
//   node tools/registry.mjs --check
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = join(ROOT, "templates", "registry.json");

const HEX = /#[0-9a-fA-F]{6}\b/g;

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

  for (const id of ["hero", "feature-grid", "pricing", "cta"]) {
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
    const { pass, results } = checkRegistry();
    for (const r of results) console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}: ${r.detail}`);
    console.log(pass ? "REGISTRY PASS: 4 blocks + 4 templates, 0 hardcoded colors" : `REGISTRY FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
    if (!pass) process.exitCode = 1;
  } else {
    console.log("usage: node tools/registry.mjs [--check]");
    process.exitCode = 2;
  }
}
