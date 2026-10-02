// tools/workshop.mjs (DS-07 workshop-01): story per registry block plus a real
// 256px title-legibility computation plus a snapshot diff per story.
// A story is workshop/stories/<block>.html: it names its block via
// data-story="<id>", cites its source fragment, declares its layout width via
// <!-- width: NNNN -->, and carries a .ws-title rule whose px size must stay
// >= 12px when the layout is scaled to 256px wide (scaled = size*256/width).
// workshop/snapshots/<block>.txt pins the normalized story source; --check
// fails on drift, --write re-pins after human review.
//   node tools/workshop.mjs --check
//   node tools/workshop.mjs --write
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROW = "DS-07";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = join(ROOT, "templates", "registry.json");
const HEX = /#[0-9a-fA-F]{6}\b/g;

export function normalizeStory(src) {
  return String(src ?? "").replace(/\r\n/g, "\n").split("\n").map((l) => l.replace(/[ \t]+$/g, "")).join("\n").replace(/\n+$/, "\n");
}

export function storyPaths(root = ROOT) {
  return { stories: join(root, "workshop", "stories"), snaps: join(root, "workshop", "snapshots") };
}

export function checkWorkshop({ root = ROOT } = {}) {
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });
  const { stories, snaps } = storyPaths(root);

  let blocks = [];
  try {
    const reg = JSON.parse(readFileSync(join(root, "templates", "registry.json"), "utf8"));
    blocks = (reg.blocks ?? []).map((b) => b.id);
    ok("registry.json parses", blocks.length > 0, `${blocks.length} blocks`);
  } catch (e) {
    ok("registry.json parses", false, String(e.message || e));
    return { pass: false, results };
  }

  for (const id of blocks) {
    const file = join(stories, `${id}.html`);
    if (!existsSync(file)) {
      ok(`story ${id} exists`, false, `${file} missing`);
      continue;
    }
    ok(`story ${id} exists`, true, `${id}.html`);
    const html = readFileSync(file, "utf8");
    ok(`story ${id} names data-story`, new RegExp(`data-story="${id}"`).test(html), `data-story="${id}"`);
    ok(`story ${id} cites source fragment`, new RegExp(`templates/blocks/${id}\\.html`).test(html), "provenance comment");
    const hard = html.replace(/<code>[\s\S]*?<\/code>/gi, "").match(HEX) ?? [];
    ok(`story ${id} has 0 hardcoded colors`, hard.length === 0, hard.length ? `hardcoded ${hard.slice(0, 2).join(",")}` : "all color via var(--*)");
    ok(`story ${id} uses tokens`, /var\(\s*--[\w-]+\s*\)/.test(html), "var(--*) found");
    const w = html.match(/<!--\s*width:\s*(\d+)\s*-->/);
    const size = html.match(/\.ws-title\s*\{[^}]*font-size\s*:\s*(\d+)px/);
    if (!w) {
      ok(`story ${id} declares width`, false, "no <!-- width: NNNN --> tag");
    } else if (!size) {
      ok(`story ${id} title size readable`, false, "no .ws-title font-size rule");
    } else {
      const scaled = (Number(size[1]) * 256) / Number(w[1]);
      ok(`story ${id} declares width`, true, `${w[1]}w, title ${size[1]}px`);
      ok(`story ${id} title legible at 256px`, scaled >= 12, `${size[1]}px at ${w[1]}w -> ${scaled.toFixed(1)}px at 256w (floor 12px)`);
    }
    ok(`story ${id} declares thumb expectation`, /<!--\s*thumb-256:/.test(html), "thumb-256 comment");
    // DS-40 (THUMB-03 close): the thumb-256 claim must agree with the math. A
    // story that declares the comment while citing a wrong scaled size would
    // pass every gate above, so cross-check claim vs computation (±0.15px).
    const claim = html.match(/thumb-256:[\s\S]*?(\d+(?:\.\d+)?)px\s+at\s+256w/);
    if (!w || !size) {
      ok(`story ${id} thumb claim matches math`, false, "needs width + .ws-title size first");
    } else if (!claim) {
      ok(`story ${id} thumb claim matches math`, false, "no '<n>px at 256w' figure in thumb-256 comment");
    } else {
      const scaled = (Number(size[1]) * 256) / Number(w[1]);
      const delta = Math.abs(Number(claim[1]) - scaled);
      ok(`story ${id} thumb claim matches math`, delta <= 0.15, `claimed ${claim[1]}px vs computed ${scaled.toFixed(1)}px at 256w`);
    }
    const snap = join(snaps, `${id}.txt`);
    if (!existsSync(snap)) {
      ok(`snapshot ${id} pinned`, false, `${id}.txt missing (run --write after review)`);
    } else {
      const want = readFileSync(snap, "utf8");
      const got = normalizeStory(html);
      ok(`snapshot ${id} pinned`, true, `${id}.txt`);
      ok(`snapshot ${id} matches story`, want === got, want === got ? "byte-identical" : "STORY DRIFTED: review the diff, then --write");
    }
  }
  return { pass: results.every((r) => r.pass), results };
}

export function writeSnapshots({ root = ROOT } = {}) {
  const { stories, snaps } = storyPaths(root);
  mkdirSync(snaps, { recursive: true });
  const reg = JSON.parse(readFileSync(join(root, "templates", "registry.json"), "utf8"));
  const pinned = [];
  for (const b of reg.blocks ?? []) {
    const file = join(stories, `${b.id}.html`);
    if (!existsSync(file)) continue;
    writeSnapshotsFile(snaps, b.id, normalizeStory(readFileSync(file, "utf8")));
    pinned.push(b.id);
  }
  return pinned;
}

function writeSnapshotsFile(snaps, id, text) {
  writeFileSync(join(snaps, `${id}.txt`), text, "utf8");
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
  if (args.includes("--write")) {
    const pinned = writeSnapshots();
    console.log(`WORKSHOP WRITE: pinned ${pinned.length} snapshot(s): ${pinned.join(", ")}`);
  } else if (args.includes("--check") || args.length === 0) {
    const { pass, results } = checkWorkshop();
    for (const r of results) console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}: ${r.detail}`);
    console.log(pass ? `WORKSHOP PASS: ${results.filter((r) => r.pass && r.name.endsWith("exists") && r.name.startsWith("story")).length} stories, 256px titles legible, snapshots match` : `WORKSHOP FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
    if (!pass) process.exitCode = 1;
  } else {
    console.log("usage: node tools/workshop.mjs [--check|--write]");
    process.exitCode = 2;
  }
}
