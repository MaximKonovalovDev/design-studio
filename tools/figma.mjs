// tools/figma.mjs (DS-08 figma-01): NOT-BUILT stub, honest only.
// Board row DS-08 promises `node tools/figma.mjs --check` PASS once figma-01
// (code-connect mapping plus Figma MCP read seat) is built. It is not built
// yet, so every invocation prints a one-line NOT-BUILT note naming the board
// row plus a usage line, and exits nonzero. No fake PASS.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROW = "DS-08";
export const WHAT = "figma-01: code-connect mapping plus Figma MCP read seat";
export const TOOL = "tools/figma.mjs";

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
