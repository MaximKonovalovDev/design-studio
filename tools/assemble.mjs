// tools/assemble.mjs (O-040): plan-to-steps-to-assemble + brand-kit JSON.
// Idea reuse (MIT, 0 lines copied) from Anil-matcha/Open-AI-Design-Agent
// @ f029d0d708d8c581463f018cdc2b0084494ce401: Plan (deliverable list) ->
// Route/Execute (ordered steps) -> Assemble (full kit handed back) with a
// persistent brand kit (palette, fonts, tone) threaded through every step.
// Here the steps assemble to standalone HTML that tools/render.mjs renders
// (HTML-to-PNG pipeline kept). No model calls, no network: deterministic,
// offline, fail-closed.
//   node tools/assemble.mjs <plan.json> [out.html]
//   node tools/assemble.mjs --check
import { existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const STEP_KINDS = ["hero", "chips", "spec", "cta"];
const HEX = /^#[0-9a-fA-F]{6}$/;

export function repoRoot() {
  return ROOT;
}

// Brand-kit ref: repo-root-relative ("brand-kits/x.json"), plan-dir-relative
// ("../brand-kits/x.json"), or a registry id ("engine2040-ui1"). Fail closed.
export function resolveBrandKit(ref, planDir = ROOT) {
  const r = String(ref ?? "").trim();
  if (!r) throw new Error("plan needs a brand-kit ref (never silent)");
  const candidates = [resolve(planDir, r), resolve(ROOT, r)];
  for (const c of candidates) {
    if (existsSync(c) && !c.endsWith(".json")) continue;
    if (existsSync(c)) return c;
  }
  const regPath = join(ROOT, "brand-kits", "registry.json");
  try {
    const reg = JSON.parse(readFileSync(regPath, "utf8"));
    const hit = (reg.kits ?? []).find((k) => k.id === r);
    if (hit?.file) {
      const p = resolve(ROOT, "brand-kits", hit.file);
      if (existsSync(p)) return p;
    }
  } catch { /* registry unreadable: fall through to fail-closed */ }
  throw new Error(`brand-kit ref not found (fail closed): ${r}`);
}

export function loadBrandKit(ref, planDir = ROOT) {
  const path = resolveBrandKit(ref, planDir);
  let kit;
  try {
    kit = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    throw new Error(`brand-kit JSON unreadable (fail closed): ${path}: ${e.message}`);
  }
  const pal = kit.palette ?? {};
  const names = Object.keys(pal);
  if (names.length < 5 || !names.every((n) => HEX.test(String(pal[n])))) {
    throw new Error(`brand-kit needs a 5+ hex palette (fail closed): ${path}`);
  }
  if (!kit.type?.display || !kit.type?.body) {
    throw new Error(`brand-kit needs type.display + type.body (fail closed): ${path}`);
  }
  if (!kit.voice?.tone || !kit.voice?.tagline || !kit.voice?.cta) {
    throw new Error(`brand-kit needs voice tone + tagline + cta (fail closed): ${path}`);
  }
  return { kit, path };
}

export function loadPlan(planPath) {
  const abs = resolve(planPath);
  if (!existsSync(abs)) throw new Error(`plan missing (fail closed): ${planPath}`);
  let plan;
  try {
    plan = JSON.parse(readFileSync(abs, "utf8"));
  } catch (e) {
    throw new Error(`plan JSON unreadable (fail closed): ${planPath}: ${e.message}`);
  }
  const size = plan.size ?? {};
  if (!Number.isInteger(size.w) || !Number.isInteger(size.h) || size.w < 16 || size.w > 8192 || size.h < 16 || size.h > 8192) {
    throw new Error("plan needs size {w,h} between 16 and 8192 (fail closed)");
  }
  if (!Array.isArray(plan.steps) || plan.steps.length === 0) {
    throw new Error("plan needs 1+ ordered steps (fail closed)");
  }
  const ids = new Set();
  plan.steps.forEach((s, i) => {
    if (!s || typeof s !== "object") throw new Error(`step ${i} is not an object (fail closed)`);
    if (!s.id || typeof s.id !== "string") throw new Error(`step ${i} needs an id (fail closed)`);
    if (ids.has(s.id)) throw new Error(`duplicate step id (fail closed): ${s.id}`);
    ids.add(s.id);
    if (!STEP_KINDS.includes(s.kind)) throw new Error(`step ${s.id}: kind must be ${STEP_KINDS.join("|")} (fail closed)`);
    if (s.kind === "hero" && (!s.title || !s.subtitle)) throw new Error(`step ${s.id}: hero needs title + subtitle (fail closed)`);
    if (s.kind === "chips" && (!Array.isArray(s.items) || s.items.length === 0)) throw new Error(`step ${s.id}: chips needs 1+ items (fail closed)`);
    if (s.kind === "spec" && (!s.heading || !Array.isArray(s.lines) || s.lines.length === 0)) throw new Error(`step ${s.id}: spec needs heading + 1+ lines (fail closed)`);
    if (s.kind === "cta" && !s.label) throw new Error(`step ${s.id}: cta needs a label (fail closed)`);
  });
  return { plan, dir: dirname(abs) };
}

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function stepHtml(s) {
  if (s.kind === "hero") {
    return `<div class="hero"><p class="kicker">${esc(s.kicker ?? "")}</p><h1>${esc(s.title)}</h1><p class="sub">${esc(s.subtitle)}</p></div>`;
  }
  if (s.kind === "chips") {
    return `<div class="chips">${s.items.map((c) => `<span>${esc(c)}</span>`).join("")}</div>`;
  }
  if (s.kind === "spec") {
    return `<div class="spec"><h2>${esc(s.heading)}</h2>${s.lines.map((l) => `<p>${esc(l)}</p>`).join("")}</div>`;
  }
  return `<div class="ctaline"><span class="cta">${esc(s.label)}</span>${s.note ? `<p class="note">${esc(s.note)}</p>` : ""}</div>`;
}

// Standalone HTML: tokens inlined in <style>, no <link>, no <script>, no
// external src/href, no url(, no @import, no http(s):. Renders offline.
export function assembleHtml(plan, kit) {
  const pal = kit.palette;
  const size = plan.size;
  const css =
    `:root{--paper:${pal.paper};--panel:${pal.panel ?? pal.paper};--ink:${pal.ink};--muted:${pal.muted};` +
    `--accent:${pal.accent};--on-accent:${pal["on-accent"]};--line:${pal.line ?? pal.muted};` +
    `--font-display:${kit.type.display};--font-body:${kit.type.body};}`;
  const sections = plan.steps.map(stepHtml).join("\n  ");
  return `<!DOCTYPE html>
<!-- Assembled by tools/assemble.mjs (O-040) from plan "${esc(plan.plan ?? "plan")}" + brand-kit "${esc(kit.id ?? kit.name ?? "kit")}". Standalone: tokens inlined, zero network refs. -->
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<title>${esc(plan.title ?? plan.plan ?? "Assembled cover")}</title>
<style>
  ${css}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{width:${size.w}px;height:${size.h}px;overflow:hidden;background:var(--paper);color:var(--ink);font-family:var(--font-body);}
  .stage{width:${size.w}px;height:${size.h}px;padding:48px 56px;display:grid;grid-template-rows:auto auto 1fr auto;row-gap:20px;background:var(--paper);border-block-start:12px solid var(--accent);}
  .hero .kicker{font-size:26px;letter-spacing:8px;color:var(--accent);font-weight:700;}
  .hero h1{font-family:var(--font-display);font-size:72px;line-height:1.05;color:var(--accent);margin:12px 0 8px;}
  .hero .sub{font-size:30px;color:var(--muted);}
  .chips{display:flex;gap:12px;flex-wrap:wrap;}
  .chips span{font-size:22px;font-weight:700;padding:10px 18px;border:2px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink);}
  .spec h2{font-family:var(--font-display);font-size:36px;color:var(--ink);margin-block-end:8px;}
  .spec p{font-size:24px;color:var(--muted);}
  .ctaline .cta{display:inline-block;font-size:26px;font-weight:800;padding:14px 28px;border-radius:8px;background:var(--accent);color:var(--on-accent);}
  .ctaline .note{font-size:20px;color:var(--muted);margin-block-start:8px;}
  .lockup{font-size:18px;letter-spacing:4px;color:var(--muted);border-block-start:2px solid var(--line);padding-block-start:12px;}
</style>
</head>
<body>
<div class="stage">
  ${sections}
  <p class="lockup">${esc(kit.lockup?.wordmark ?? kit.name ?? "")} — ${esc(kit.voice?.tagline ?? "")}</p>
</div>
</body>
</html>
`;
}

// Zero-network gate over the assembled bytes (fail-closed list).
export function networkRefs(html) {
  const hits = [];
  const body = String(html ?? "");
  for (const [name, re] of [
    ["absolute-url", /https?:/i],
    ["protocol-relative", /["']\/\//],
    ["link-tag", /<link[\s>]/i],
    ["script-tag", /<script[\s>]/i],
    ["ext-src", /\ssrc\s*=\s*["'](?!data:)/i],
    ["ext-href", /\shref\s*=\s*["'](?!#)/i],
    ["css-url", /url\s*\(/i],
    ["css-import", /@import/i],
  ]) {
    if (re.test(body)) hits.push(name);
  }
  return hits;
}

export function assemblePlan(planPath) {
  const { plan, dir } = loadPlan(planPath);
  const { kit, path } = loadBrandKit(plan.brandKit, dir);
  const html = assembleHtml(plan, kit);
  const nets = networkRefs(html);
  if (nets.length) throw new Error(`assembled HTML has network refs (fail closed): ${nets.join(",")}`);
  if (!html.includes(String(kit.palette.accent)) || !html.includes("var(--accent)")) {
    throw new Error("assembled HTML must inline the brand-kit tokens (fail closed)");
  }
  return { html, plan, kit, kitPath: path };
}

export function assembleSelfCheck() {
  const results = [];
  const t = (name, ok, detail) => {
    results.push({ name, pass: !!ok, detail: String(detail ?? "") });
    console.log(`[${ok ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };
  const example = join(ROOT, "packs", "plan-assemble-o040", "plan.json");
  try {
    const { html, plan, kit } = assemblePlan(example);
    const nets = networkRefs(html);
    t("example plan assembles to standalone HTML", nets.length === 0, `${plan.steps.length} steps kit=${kit.id} bytes=${Buffer.byteLength(html, "utf8")}`);
    t("assembled HTML inlines brand-kit tokens", html.includes(String(kit.palette.accent)) && html.includes("var(--accent)"), `accent ${kit.palette.accent} inlined`);
    t("assembled HTML has zero network refs", nets.length === 0, nets.length ? nets.join(",") : "no http/link/script/src/url");
  } catch (e) {
    t("example plan assembles to standalone HTML", false, String(e.message || e));
    t("assembled HTML inlines brand-kit tokens", false, "no HTML");
    t("assembled HTML has zero network refs", false, "no HTML");
  }
  try {
    const dir = mkdtempSync(`${tmpdir()}${sep}ds-asm-`);
    const bad = join(dir, "plan.json");
    writeFileSync(bad, JSON.stringify({ plan: "bad", brandKit: "brand-kits/nope.json", size: { w: 1280, h: 720 }, steps: [{ id: "h", kind: "hero", title: "T", subtitle: "S" }] }));
    try {
      assemblePlan(bad);
      t("bad brand-kit ref fails closed", false, "no throw?");
    } catch (e) {
      t("bad brand-kit ref fails closed", /brand-kit ref not found/.test(e.message), e.message.slice(0, 80));
    }
  } catch (e) {
    t("bad brand-kit ref fails closed", false, String(e.message || e));
  }
  try {
    const dir = mkdtempSync(`${tmpdir()}${sep}ds-asm-`);
    const bad = join(dir, "plan.json");
    writeFileSync(bad, JSON.stringify({ plan: "bad", brandKit: "../../brand-kits/engine2040-ui1.json", size: { w: 1280, h: 720 }, steps: [{ id: "x", kind: "video" }] }));
    try {
      assemblePlan(bad);
      t("unknown step kind fails closed", false, "no throw?");
    } catch (e) {
      t("unknown step kind fails closed", /kind must be/.test(e.message), e.message.slice(0, 80));
    }
  } catch (e) {
    t("unknown step kind fails closed", false, String(e.message || e));
  }
  try {
    const dir = mkdtempSync(`${tmpdir()}${sep}ds-asm-`);
    const bad = join(dir, "plan.json");
    writeFileSync(bad, JSON.stringify({ plan: "bad", brandKit: "../../brand-kits/engine2040-ui1.json", size: { w: 1280, h: 720 }, steps: [] }));
    try {
      assemblePlan(bad);
      t("empty steps fail closed", false, "no throw?");
    } catch (e) {
      t("empty steps fail closed", /1\+ ordered steps/.test(e.message), e.message.slice(0, 80));
    }
  } catch (e) {
    t("empty steps fail closed", false, String(e.message || e));
  }
  const pass = results.every((r) => r.pass);
  console.log(pass ? "ASSEMBLE PASS: plan->steps->HTML green (example pack + 3 fail-closed fixtures)" : `ASSEMBLE FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
  return { pass, results };
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
    const { pass } = assembleSelfCheck();
    process.exit(pass ? 0 : 1);
  }
  if (args.length < 1 || args.includes("-h") || args.includes("--help")) {
    console.log("usage: node tools/assemble.mjs <plan.json> [out.html] | node tools/assemble.mjs --check");
    console.log("assembles ordered plan steps + brand-kit JSON to standalone HTML (tokens inlined, zero network) for tools/render.mjs.");
    process.exit(args.length < 1 ? 2 : 0);
  }
  try {
    const { html, plan, kit } = assemblePlan(args[0]);
    const out = resolve(args[1] ?? join(dirname(resolve(args[0])), "out.html"));
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html, "utf8");
    console.log(`ASSEMBLE OK ${out} ${Buffer.byteLength(html, "utf8")}B steps=${plan.steps.length} kit=${kit.id}`);
  } catch (e) {
    console.log(`ASSEMBLE FAIL ${args[0]}: ${e.message}`);
    process.exit(1);
  }
}
