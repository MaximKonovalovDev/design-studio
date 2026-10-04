// tools/registry.mjs (DS-78c retired 2026-10-04): the DS-03 block registry lived here.
// The old starters (templates/pages, templates/blocks, templates/registry.json) moved to
// archive/2026-10-04/old-starters/ together with workshop/ (0 orders used them). New orders
// start from templates v1: node tools/template.mjs list. This stub keeps old callers green:
// --check reports RETIRED and exits 0, while --emit and the library entry points fail closed
// with the archive path.
//   node tools/registry.mjs --check
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const RETIRED = {
  row: "DS-78c",
  archive: "archive/2026-10-04/old-starters",
  successor: "node tools/template.mjs list",
};

const WHY = `block registry retired (DS-78c): starters archived to ${RETIRED.archive} (0 orders used them); new orders start from ${RETIRED.successor}`;

export function emitBlock(id) {
  throw new Error(`${WHY} (asked for block ${JSON.stringify(id)})`);
}

export function checkRegistry() {
  return { pass: true, retired: true, results: [{ name: "retired", pass: true, detail: WHY }] };
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
    console.error(`EMIT RETIRED: ${WHY}`);
    process.exitCode = 1;
  } else if (args.includes("--check") || args.length === 0) {
    console.log(`[PASS] retired: ${WHY}`);
    console.log(`REGISTRY RETIRED: ${WHY}`);
  } else {
    console.log("usage: node tools/registry.mjs [--check] (retired DS-78c; new orders: node tools/template.mjs list)");
    process.exitCode = 2;
  }
}
