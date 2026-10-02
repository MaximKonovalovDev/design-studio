// tools/convert.mjs (DS-17 conversion harness): NOT-BUILT stub, honest only.
// Board row DS-17 promises `node tools/convert.mjs --check` PASS once the
// conversion harness (two landing variants plus click plan) is built. It is
// not built yet, so every invocation prints a one-line NOT-BUILT note naming
// the board row plus a usage line, and exits nonzero. No fake PASS.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROW = "DS-17";
export const WHAT = "conversion harness: two landing variants plus click plan";
export const TOOL = "tools/convert.mjs";

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
