// tools/taste.mjs (DS-18 taste library): NOT-BUILT stub, honest only.
// Board row DS-18 promises `node tools/taste.mjs --check` PASS once the taste
// library v1 from od-taste (20 exemplars with tokens) is built. It is not
// built yet, so every invocation prints a one-line NOT-BUILT note naming the
// board row plus a usage line, and exits nonzero. No fake PASS.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROW = "DS-18";
export const WHAT = "taste library v1 from od-taste: 20 exemplars with tokens";
export const TOOL = "tools/taste.mjs";

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
