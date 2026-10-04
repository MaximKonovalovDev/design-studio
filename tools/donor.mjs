// tools/donor.mjs: the Open Design donor shelf (NEED-08, orders O-026/O-034).
//
// The store lane hand-rolled system picks (a slug in cover.json with no command
// behind it). This tool stands behind the pick:
//
//   node tools/donor.mjs system <slug> [--json <receipt.json>]
//     resolve one design system: studio palette + mood + font stacks from
//     templates/palettes.json, plus the donor DESIGN.md/tokens.css paths when
//     the sparse checkout is on disk. Unknown slugs FAIL with the nearest ones.
//   node tools/donor.mjs open-design [--pull]
//     make the read-only donor copy AGENTS.md names: a sparse checkout of
//     nexu-io/open-design (Apache-2.0) with skills + design-systems +
//     design-templates only (never the whole 3.5 GB repo).
//   node tools/donor.mjs --check   (DONOR PASS: offline gates + one TEMP receipt)
//
// Steal chain (toolsmith recipe, 2026-10-04): `node .../center/arsenal.mjs
// --list` shows no donor/system tool in any repo (nearest is center ghpeek,
// a file reader, and the kaggle image lane — different jobs); factory
// preview/make_cover_*.py scripts draw covers, they never resolve a system
// pick. Nothing to steal, so this file is own code. The slug list comes from
// our own `.opencode/skills/open-design/SKILL.md` customer picks (plus the 5
// brief slugs with no donor folder: epic, painterly, pixel, playful,
// geometric — marked hand-picked); every palette id is verified against our
// own templates/palettes.json. No GitHub read was needed.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DONOR_URL = "https://github.com/nexu-io/open-design.git";
export const DONOR_DIR = join(ROOT, "research", "donors", "open-design");
export const SYSTEMS_DIR = join(DONOR_DIR, "design-systems");

// slug -> { palette (templates/palettes.json id), customer, note }. Slugs from
// our open-design skill's customer picks; the last five have no donor folder
// (maker-store.md names them) and resolve hand-picked to the nearest palette.
export const SYSTEMS = {
  clean: { palette: "clean-professional", customer: "factory", note: "business tools: calm paper, navy ink, one green" },
  professional: { palette: "clean-professional", customer: "factory", note: "business tools: calm paper, navy ink, one green" },
  simple: { palette: "clean-professional", customer: "jobhunt", note: "quiet layouts: one ink, one accent, wide air" },
  refined: { palette: "clean-professional", customer: "jobhunt", note: "quiet layouts: one ink, one accent, wide air" },
  editorial: { palette: "editorial", customer: "factory", note: "books and guides: cream page, serif headline" },
  "warm-editorial": { palette: "editorial", customer: "factory", note: "books and guides: cream page, serif headline" },
  publication: { palette: "editorial", customer: "factory", note: "books and guides: cream page, serif headline" },
  kami: { palette: "editorial", customer: "factory", note: "minimal paper: cream page, serif headline" },
  paper: { palette: "kraft", customer: "factory", note: "paper goods: kraft stock, espresso ink, red stamp" },
  vintage: { palette: "kraft", customer: "factory", note: "paper goods: kraft stock, espresso ink, red stamp" },
  modern: { palette: "modern", customer: "factory", note: "creator kits: indigo field, white type, yellow button" },
  vibrant: { palette: "modern", customer: "marketing-studio", note: "creator kits: indigo field, white type, yellow button" },
  expressive: { palette: "modern", customer: "marketing-studio", note: "creator kits: indigo field, white type, yellow button" },
  storytelling: { palette: "modern", customer: "marketing-studio", note: "creator kits: indigo field, white type, yellow button" },
  bold: { palette: "bold", customer: "marketing-studio", note: "warning-sign yellow, black slabs, square corners" },
  energetic: { palette: "bold", customer: "marketing-studio", note: "warning-sign yellow, black slabs, square corners" },
  neon: { palette: "neon", customer: "forge", note: "arcade night: violet black, hot pink, mint signs" },
  hud: { palette: "neon", customer: "forge", note: "arcade night: violet black, hot pink, mint signs" },
  futuristic: { palette: "neon", customer: "forge", note: "arcade night: violet black, hot pink, mint signs" },
  cosmic: { palette: "neon", customer: "forge", note: "arcade night: violet black, hot pink, mint signs" },
  fantasy: { palette: "neon", customer: "forge", note: "arcade night: violet black, hot pink, mint signs" },
  dramatic: { palette: "neon", customer: "forge", note: "arcade night: violet black, hot pink, mint signs" },
  retro: { palette: "pixel", customer: "forge", note: "cartridge orange, royal purple, chunky screen type" },
  pixel: { palette: "pixel", customer: "factory", note: "no donor folder (hand-picked): cartridge orange, chunky type" },
  playful: { palette: "pixel", customer: "factory", note: "no donor folder (hand-picked): cartridge orange, chunky type" },
  geometric: { palette: "pixel", customer: "factory", note: "no donor folder (hand-picked): cartridge orange, chunky type" },
  epic: { palette: "editorial", customer: "factory", note: "no donor folder (hand-picked): monumental serif, cream page" },
  painterly: { palette: "editorial", customer: "factory", note: "no donor folder (hand-picked): monumental serif, cream page" },
};

export function normalizeSlug(raw) {
  return String(raw ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-");
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}

// Substring holders first ("clean-developer" holds "clean"), then edit distance.
export function nearestSlugs(raw, limit = 3) {
  const slug = normalizeSlug(raw);
  const keys = Object.keys(SYSTEMS);
  const held = keys.filter((k) => slug.includes(k) || k.includes(slug));
  const rest = keys.filter((k) => !held.includes(k)).sort((a, b) => levenshtein(slug, a) - levenshtein(slug, b));
  return [...held, ...rest].slice(0, limit);
}

function palettes() {
  return JSON.parse(readFileSync(join(ROOT, "templates", "palettes.json"), "utf8")).palettes;
}

export function donorStatus() {
  const present = existsSync(SYSTEMS_DIR);
  let count = 0;
  if (present) {
    try {
      count = readdirSync(SYSTEMS_DIR, { withFileTypes: true }).filter((e) => e.isDirectory()).length;
    } catch { count = 0; }
  }
  return { dir: SYSTEMS_DIR, present, count };
}

export function resolveSystem(raw) {
  const slug = normalizeSlug(raw);
  if (!slug) throw new Error("no system slug given (want e.g. system clean)");
  const hit = SYSTEMS[slug];
  if (!hit) throw new Error(`unknown system ${JSON.stringify(raw)}; nearest: ${nearestSlugs(raw).join(", ")}`);
  const all = palettes();
  const pal = all[hit.palette];
  if (!pal) throw new Error(`palette ${hit.palette} missing from templates/palettes.json`);
  const donorDir = join(SYSTEMS_DIR, slug);
  const designMd = join(donorDir, "DESIGN.md");
  const tokensCss = join(donorDir, "tokens.css");
  const donorPresent = existsSync(designMd) || existsSync(tokensCss);
  return {
    system: slug, palette: hit.palette, paletteName: pal.name, mood: pal.mood,
    tokens: pal.tokens, fonts: pal.fonts, customer: hit.customer, note: hit.note,
    donor: { dir: donorDir, designMd, tokensCss, present: donorPresent },
  };
}

export function writeReceipt(resolved, out) {
  mkdirSync(dirname(resolve(out)), { recursive: true });
  const receipt = { ...resolved, at: new Date().toISOString().slice(0, 10) };
  writeFileSync(resolve(out), `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  return resolve(out);
}

export function ensureOpenDesign({ pull = false } = {}) {
  if (existsSync(join(DONOR_DIR, ".git"))) {
    if (pull) {
      const r = spawnSync("git", ["-C", DONOR_DIR, "pull", "--ff-only"], { encoding: "utf8" });
      if (r.status !== 0) throw new Error(`donor pull failed: ${(r.stderr || r.stdout || "").trim().slice(0, 200)}`);
    }
    return donorStatus();
  }
  mkdirSync(dirname(DONOR_DIR), { recursive: true });
  const clone = spawnSync("git", ["clone", "--depth", "1", "--filter=blob:none", "--sparse", DONOR_URL, DONOR_DIR], { encoding: "utf8" });
  if (clone.status !== 0) throw new Error(`donor clone failed: ${(clone.stderr || "").trim().slice(0, 200)}`);
  const sparse = spawnSync("git", ["-C", DONOR_DIR, "sparse-checkout", "set", "skills", "design-systems", "design-templates"], { encoding: "utf8" });
  if (sparse.status !== 0) throw new Error(`donor sparse-checkout failed: ${(sparse.stderr || "").trim().slice(0, 200)}`);
  return donorStatus();
}

export function selfCheck() {
  const results = [];
  const ok = (name, pass, detail) => {
    results.push({ name, pass: !!pass, detail });
    console.log(`[${pass ? "PASS" : "FAIL"}] ${name}: ${detail}`);
  };
  ok("normalize lowercases + dashes", normalizeSlug(" Warm_Editorial ") === "warm-editorial", normalizeSlug(" Warm_Editorial "));
  try {
    const r = resolveSystem("clean");
    ok("system clean -> clean-professional", r.palette === "clean-professional" && !!r.tokens.bg, `${r.palette} ${r.tokens.bg}`);
  } catch (e) { ok("system clean -> clean-professional", false, String(e.message)); }
  try {
    const all = palettes();
    const bad = Object.entries(SYSTEMS).filter(([, v]) => !all[v.palette]);
    ok("every system maps to a real palette", bad.length === 0, bad.length ? bad.map(([k]) => k).join(",") : `${Object.keys(SYSTEMS).length} systems, 8 palettes`);
  } catch (e) { ok("every system maps to a real palette", false, String(e.message)); }
  const hand = ["epic", "painterly", "pixel", "playful", "geometric"].every((s) => {
    try { return /hand-picked/.test(resolveSystem(s).note); } catch { return false; }
  });
  ok("5 brief slugs without a donor folder resolve hand-picked", hand, "epic painterly pixel playful geometric");
  let threw = false, hint = "";
  try { resolveSystem("cleen"); } catch (e) { threw = true; hint = String(e.message); }
  ok("unknown slug FAILs closed with nearest", threw && hint.includes("clean"), hint.slice(0, 80) || "no throw");
  ok("compound slug holds its system", nearestSlugs("clean-developer")[0] === "clean", nearestSlugs("clean-developer").join(","));
  try {
    const st = donorStatus();
    ok("donor status never clones (reports only)", typeof st.present === "boolean", st.present ? `${st.count} systems on disk` : "checkout absent, run open-design");
  } catch (e) { ok("donor status never clones (reports only)", false, String(e.message)); }
  try {
    const out = join(tmpdir(), `ds-donor-check-${process.pid}.json`);
    const p = writeReceipt(resolveSystem("clean"), out);
    const back = JSON.parse(readFileSync(p, "utf8"));
    ok("receipt round-trips to TEMP", existsSync(p) && back.system === "clean" && !!back.tokens, `${back.system} + tokens`);
  } catch (e) { ok("receipt round-trips to TEMP", false, String(e.message)); }
  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `DONOR FAIL: ${fails.length} failing check(s)` : "DONOR PASS: system + open-design green");
  return fails.length === 0;
}

const isMain = (() => {
  try { return fileURLToPath(import.meta.url) === resolve(process.argv[1]); } catch { return false; }
})();
if (isMain) {
  const [cmd, ...rest] = process.argv.slice(2);
  try {
    if (cmd === "--check") process.exit(selfCheck() ? 0 : 1);
    if (cmd === "system") {
      const slug = rest.find((a) => !a.startsWith("-"));
      const ji = rest.findIndex((a) => a === "--json");
      const jsonOut = ji >= 0 ? rest[ji + 1] : null;
      if (ji >= 0 && !jsonOut) throw new Error("usage: node tools/donor.mjs system <slug> [--json <receipt.json>]");
      const r = resolveSystem(slug);
      if (jsonOut) writeReceipt(r, jsonOut);
      console.log(`SYSTEM ${r.system}: palette ${r.palette} (${r.paletteName}) for ${r.customer}; ${r.note}`);
      console.log(`TOKENS ${r.palette}: bg ${r.tokens.bg}, ink ${r.tokens.ink}, accent ${r.tokens.accent}, muted ${r.tokens.muted}`);
      console.log(`FONTS: display ${r.fonts.display} | body ${r.fonts.body}`);
      console.log(r.donor.present ? `DONOR ${r.donor.designMd} on disk` : `DONOR ${r.donor.dir}/DESIGN.md not on disk (run: node tools/donor.mjs open-design)`);
      if (jsonOut) console.log(`RECEIPT ${resolve(jsonOut)}`);
      process.exit(0);
    }
    if (cmd === "open-design") {
      const st = ensureOpenDesign({ pull: rest.includes("--pull") });
      console.log(`DONOR ${st.present ? "ok" : "cloned"}: ${st.count} design systems in ${st.dir}`);
      process.exit(0);
    }
    console.log("usage: node tools/donor.mjs system <slug> [--json <receipt.json>] | node tools/donor.mjs open-design [--pull] | node tools/donor.mjs --check");
    process.exit(2);
  } catch (e) {
    console.log(`DONOR FAIL: ${e.message}`);
    process.exit(1);
  }
}
