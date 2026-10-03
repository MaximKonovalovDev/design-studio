// tools/convert.mjs (DS-17 conversion harness): two landing variants plus a
// click plan wired together. Variants convert/variants/{a,b}.html compose the
// DS-03 registry blocks (hero + cta, provenance comments inside); the plan
// convert/plan.json names {page, selector, action, expect} steps plus the
// metric and success bar. --check fails closed: variants must exist, differ,
// carry dir + size tag + exactly one primary CTA with href, use var(--*) with
// 0 hardcoded colors; every plan step's selector must occur in its variant;
// plan must name metric + success and cover both variants.
//   node tools/convert.mjs --check
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROW = "DS-17";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HEX = /#[0-9a-fA-F]{6}\b/g;

export function convertPaths(root = ROOT) {
  return {
    a: join(root, "convert", "variants", "a.html"),
    b: join(root, "convert", "variants", "b.html"),
    plan: join(root, "convert", "plan.json"),
  };
}

function sha(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function checkConvert({ root = ROOT } = {}) {
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });
  const p = convertPaths(root);

  const html = {};
  for (const v of ["a", "b"]) {
    if (!existsSync(p[v])) {
      ok(`variant ${v} exists`, false, `${p[v]} missing`);
      continue;
    }
    ok(`variant ${v} exists`, true, `${v}.html`);
    html[v] = readFileSync(p[v], "utf8");
    ok(`variant ${v} declares dir`, /<html[^>]*\bdir\s*=\s*"(ltr|rtl)"/i.test(html[v]), "dir on <html>");
    const size = html[v].match(/<!--\s*size:\s*(\d+)x(\d+)\s*-->/);
    ok(`variant ${v} declares size`, !!size, size ? `${size[1]}x${size[2]}` : "no <!-- size: WxH --> tag");
    const ctas = html[v].match(/<a[^>]*class="[^"]*\bcta\b[^"]*"[^>]*href="[^"]+"[^>]*>/gi) ?? [];
    ok(`variant ${v} has one primary CTA`, ctas.length === 1, ctas.length === 1 ? "single .cta link with href" : `${ctas.length} primary CTAs`);
    const hard = html[v].replace(/<code>[\s\S]*?<\/code>/gi, "").match(HEX) ?? [];
    ok(`variant ${v} has 0 hardcoded colors`, hard.length === 0, hard.length ? `hardcoded ${hard.slice(0, 2).join(",")}` : "all color via var(--*)");
    ok(`variant ${v} uses tokens`, /var\(\s*--[\w-]+\s*\)/.test(html[v]), "var(--*) found");
    ok(`variant ${v} composes registry blocks`, /templates\/blocks\/hero\.html/.test(html[v]) && /templates\/blocks\/cta\.html/.test(html[v]), "hero + cta provenance");
  }
  if (html.a && html.b) {
    ok("variants differ", sha(html.a) !== sha(html.b), sha(html.a) !== sha(html.b) ? "A and B are distinct pages" : "A and B byte-identical: no experiment");
    const title = (s) => (s.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ?? [])[1]?.trim() ?? "";
    ok("headlines differ", title(html.a) !== title(html.b), `"${title(html.a)}" vs "${title(html.b)}"`);
  }

  if (!existsSync(p.plan)) {
    ok("plan.json exists", false, `${p.plan} missing`);
    return { pass: false, results };
  }
  ok("plan.json exists", true, "plan.json");
  let plan;
  try {
    plan = JSON.parse(readFileSync(p.plan, "utf8"));
    ok("plan.json parses", true, `${plan.steps?.length ?? 0} steps`);
  } catch (e) {
    ok("plan.json parses", false, String(e.message || e));
    return { pass: false, results };
  }
  ok("plan names both variants", JSON.stringify(plan.variants) === JSON.stringify(["a", "b"]), (plan.variants ?? []).join(",") || "missing");
  ok("plan names metric + success", !!plan.metric && !!plan.success, plan.metric ?? "no metric");
  const steps = plan.steps ?? [];
  ok("plan has 3+ steps", steps.length >= 3, `${steps.length} steps`);
  for (const [i, s] of steps.entries()) {
    const tag = `step ${i} (${s?.page}:${s?.selector})`;
    if (!s?.page || !s?.selector || !s?.action || !s?.expect) {
      ok(tag, false, "needs page+selector+action+expect");
      continue;
    }
    if (!html[s.page]) {
      ok(tag, false, `variant ${s.page} missing`);
      continue;
    }
    const sel = String(s.selector);
    const found = sel.startsWith(".") ? html[s.page].includes(sel.slice(1)) : html[s.page].includes(sel);
    ok(tag, found, found ? `${s.action} -> ${s.expect}` : `selector ${sel} not in variant ${s.page}`);
  }
  const covered = new Set(steps.map((s) => s?.page));
  ok("plan covers both variants", covered.has("a") && covered.has("b"), [...covered].join(",") || "none");

  // LAND-03 factory live-page receipt: plan.live = {sample} names the
  // factory pilot page; its receipt.json must carry url+date+rev with rev
  // pinning the live out.png sha256 (same pin rule as checkReceipt, so a
  // stale publish fails closed instead of shipping silently).
  const live = plan.live;
  if (live == null) {
    ok("live page receipt declared", false, "plan.live missing — next: point plan.live.sample at the factory pilot page + receipt.json");
  } else {
    const liveDir = join(root, live.sample ?? "");
    const liveFile = join(liveDir, "receipt.json");
    let lr = null;
    try {
      lr = JSON.parse(readFileSync(liveFile, "utf8"));
      ok("live page receipt parses", true, live.sample);
    } catch (e) {
      ok("live page receipt parses", false, `${live.sample ?? liveDir}/receipt.json unreadable — next: publish the factory pilot page then re-run`);
    }
    if (lr) {
      const urlOk = typeof lr.url === "string" && /^https?:\/\/\S+/.test(lr.url);
      const dateOk = typeof lr.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(lr.date) && !Number.isNaN(Date.parse(lr.date));
      ok("live page receipt url+date", urlOk && dateOk, urlOk && dateOk ? `${lr.url} ${lr.date}` : "receipt needs url http(s) + date YYYY-MM-DD — next: publish then re-run");
      const rev = String(lr.rev ?? "").trim();
      const img = join(liveDir, "out.png");
      if (rev.length >= 7 && existsSync(img)) {
        const hash = createHash("sha256").update(readFileSync(img)).digest("hex");
        const pinned = hash.startsWith(rev) || rev === hash;
        ok("live page receipt rev pinned", pinned, pinned ? `${lr.url} ${hash.slice(0, 12)}` : `rev mismatch out.png sha256:${hash.slice(0, 12)} — next: publish then re-run`);
      } else {
        ok("live page receipt rev pinned", false, "rev must be a >=7-char out.png sha256 prefix — next: publish then re-run");
      }
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
    const { pass, results } = checkConvert();
    for (const r of results) console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}: ${r.detail}`);
    console.log(pass ? "CONVERT PASS: 2 variants differ, click plan covers A+B, metric named" : `CONVERT FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
    if (!pass) process.exitCode = 1;
  } else {
    console.log("usage: node tools/convert.mjs --check");
    process.exitCode = 2;
  }
}
