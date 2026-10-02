// tools/agent-block.mjs (DS-05 agent-02): NOT-BUILT stub, honest only.
// Board row DS-05 promises `node tools/agent-block.mjs --check` PASS once
// agent-02 (prompt-to-block loop with judge gate) is built. It is not built
// yet, so every invocation prints a one-line NOT-BUILT note naming the board
// row plus a usage line, and exits nonzero. No fake PASS, no functionality.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROW = "DS-05";
export const WHAT = "agent-02: prompt-to-block loop with judge gate";
export const TOOL = "tools/agent-block.mjs";

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
