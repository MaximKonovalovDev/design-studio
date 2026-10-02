// tools/workshop.mjs (DS-07 workshop-01): NOT-BUILT stub, honest only.
// Board row DS-07 promises `node tools/workshop.mjs --check` PASS once
// workshop-01 (story per block plus 256px visual diff) is built. It is not
// built yet, so every invocation prints a one-line NOT-BUILT note naming the
// board row plus a usage line, and exits nonzero. No fake PASS.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROW = "DS-07";
export const WHAT = "workshop-01: story per block plus 256px visual diff";
export const TOOL = "tools/workshop.mjs";

export function notBuiltMessage() {
  return `NOT-BUILT ${ROW} ${WHAT}: no implementation yet - see sprint/board.md ${ROW} (node ${TOOL} --check has no PASS yet)`;
}

export function usageMessage() {
  return `usage: node ${TOOL} --check (${ROW} not built yet)`;
}

const isMain = (() => {
  try {
    return fileURLToPath(import.meta.url) === resolve(process.argv[1]);
  } catch {
    return false;
  }
})();

if (isMain) {
  console.log(notBuiltMessage());
  console.log(usageMessage());
  process.exitCode = 1;
}
