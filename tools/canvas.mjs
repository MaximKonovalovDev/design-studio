// tools/canvas.mjs (DS-09 canvas-01): NOT-BUILT stub, honest only.
// Board row DS-09 promises `node tools/canvas.mjs --check` PASS once
// canvas-01 (Konva template editor, 5 templates) is built. It is not built
// yet, so every invocation prints a one-line NOT-BUILT note naming the board
// row plus a usage line, and exits nonzero. No fake PASS.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROW = "DS-09";
export const WHAT = "canvas-01: Konva template editor, 5 templates";
export const TOOL = "tools/canvas.mjs";

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
