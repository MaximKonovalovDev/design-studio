// tools/brandkit.mjs (DS-10 brand-01): NOT-BUILT stub, honest only.
// Board row DS-10 promises `node tools/brandkit.mjs --check` PASS once
// brand-01 (name to palette, type, voice, lockup plus tokens export) is
// built. It is not built yet, so every invocation prints a one-line
// NOT-BUILT note naming the board row plus a usage line, and exits nonzero.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROW = "DS-10";
export const WHAT = "brand-01: name to palette, type, voice, lockup plus tokens export";
export const TOOL = "tools/brandkit.mjs";

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
