// tools/workshop.mjs (DS-78c retired 2026-10-04): the DS-07 story workshop lived here.
// workshop/stories + workshop/snapshots moved to archive/2026-10-04/old-starters/workshop/
// with the old starters (templates/pages, templates/blocks, templates/registry.json); 0 orders
// used them. This stub keeps old callers green: --check reports RETIRED and exits 0, while
// --write and the story entry points fail closed with the archive path. normalizeStory stays
// as the pure normalizer (no disk reads) for any importer that kept it.
//   node tools/workshop.mjs --check
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROW = "DS-07";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const RETIRED = {
  row: "DS-78c",
  archive: "archive/2026-10-04/old-starters/workshop",
  successor: "node tools/template.mjs list",
};

const WHY = `workshop retired (DS-78c): stories + snapshots archived to ${RETIRED.archive} (0 orders used them); new orders start from ${RETIRED.successor}`;

export function normalizeStory(src) {
  return String(src ?? "").replace(/\r\n/g, "\n").split("\n").map((l) => l.replace(/[ \t]+$/g, "")).join("\n").replace(/\n+$/, "\n");
}

export function storyPaths(root = ROOT) {
  return { stories: join(root, "workshop", "stories"), snaps: join(root, "workshop", "snapshots") };
}

export function checkWorkshop() {
  return { pass: true, retired: true, results: [{ name: "retired", pass: true, detail: WHY }] };
}

export function writeSnapshots() {
  throw new Error(`${WHY} (snapshots of an archived workshop cannot be re-pinned)`);
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
    console.error(`WORKSHOP RETIRED: ${WHY}`);
    process.exitCode = 1;
  } else if (args.includes("--check") || args.length === 0) {
    console.log(`[PASS] retired: ${WHY}`);
    console.log(`WORKSHOP RETIRED: ${WHY}`);
    void ROOT;
  } else {
    console.log("usage: node tools/workshop.mjs [--check] (retired DS-78c; new orders: node tools/template.mjs list)");
    process.exitCode = 2;
  }
}
