// tests/check.test.mjs: regression net for the two check scripts (fast, no browser).
// tools/check.mjs is a script (importing it would re-render all 11 samples),
// so it is covered through its side-effect-free CLI surface (--help) plus
// source-contract assertions on its two exported gates (checkReceipt,
// pickWinner); sprint/check.mjs high-churn paths (command, agents, board,
// handoff, inbox, keeper) are covered by read-only assertions on the live
// files that mirror what the loop check enforces — a drift fails here first.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(ROOT, rel), "utf8").replace(/\r\n/g, "\n");
const run = (args) => spawnSync(process.execPath, args, { cwd: ROOT, encoding: "utf8" });

describe("tools/check.mjs CLI surface (no render run)", () => {
  it("--help prints usage with the receipt rule and exits 0", () => {
    const r = run(["tools/check.mjs", "--help"]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /usage: node tools\/check\.mjs/);
    assert.match(r.stdout, /receipt\.json/);
  });

  it("-h is the same guidance, not a render run", () => {
    const r = run(["tools/check.mjs", "-h"]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /usage: node tools\/check\.mjs/);
  });
});

describe("tools/check.mjs receipt gate contract (S02)", () => {
  const src = () => read("tools/check.mjs");
  it("exports checkReceipt with skip-when-undeclared and url/date/rev shape", () => {
    assert.match(src(), /export function checkReceipt\(dir, brief\)/);
    assert.match(src(), /no receipt declared, skipped/);
    assert.match(src(), /\^https\?:\\/);
    assert.match(src(), /date YYYY-MM-DD/);
  });

  it("pins rev to the out.png sha256 with a 7-char floor", () => {
    assert.match(src(), /sha256/);
    assert.match(src(), /rev\.length < 7/);
    assert.match(src(), /rev mismatch/);
  });

  it("honours a custom brief.receipt filename, default receipt.json", () => {
    assert.match(src(), /brief\.receipt/);
    assert.match(src(), /receipt\.json/);
  });
});

describe("tools/check.mjs winner contract (S07 audit-first + thumb bytes)", () => {
  const src = () => read("tools/check.mjs");
  it("exports pickWinner: audit decides first, thumb bytes break ties", () => {
    assert.match(src(), /export function pickWinner\(aDir, bDir\)/);
    assert.match(src(), /a\.pass && !b\.pass/);
    assert.match(src(), /b\.pass && !a\.pass/);
    assert.match(src(), /thumb-256\.png/);
  });

  it("cover vs cover-b fixtures the winner needs are on disk", () => {
    for (const f of ["samples/cover/brief.json", "samples/cover-b/brief.json", "samples/cover/thumb-256.png", "samples/cover-b/thumb-256.png"]) {
      assert.ok(existsSync(join(ROOT, f)), `${f} present for pickWinner`);
    }
  });
});

describe("sprint/check.mjs high-churn paths (command/agents/board/handoff/inbox/keeper)", () => {
  it("command: keeper marker, handoff path, chain and batch lines present", () => {
    const cmd = read(".opencode/commands/sprint.md");
    for (const need of ["sprint/handoff.md", "LOOP STOP:", "packet: <name>", "compaction", "The chain", "Goal, Scope, Proof and Stop", "## Recurring duties", "sprint/halt"]) {
      assert.ok(cmd.includes(need), `command lost: ${need}`);
    }
    assert.match(cmd, /^---\n[\s\S]*?\n---\n/, "front matter block");
    assert.ok(cmd.includes("agent: lead"), "command front matter agent: lead");
  });

  it("agents: lead primary, rest subagent, helpers allowed, nobody answers", () => {
    for (const role of ["lead", "builder", "judge", "planner", "researcher", "pilot", "runner", "overseer"]) {
      const text = read(`.opencode/agents/${role}.md`);
      const mode = text.match(/^mode:\s*(.*)$/m)?.[1].trim();
      assert.equal(mode, role === "lead" ? "primary" : "subagent", `${role} mode`);
      assert.match(text, /^\s+task:\s*allow\b/m, `${role} task: allow`);
      assert.match(text, /^\s+question:\s*deny\b/m, `${role} question: deny`);
    }
    for (const role of ["judge", "overseer"]) {
      assert.match(read(`.opencode/agents/${role}.md`), /^\s+edit:\s*deny\b/m, `${role} read-only`);
    }
    assert.match(read("opencode.jsonc"), /"default_agent"\s*:\s*"lead"/, "default_agent lead");
  });

  it("board: table parses, statuses valid, DONE rows carry a SHA, rows open", () => {
    const md = read("sprint/board.md");
    const lines = md.split("\n").filter((l) => l.trim().startsWith("|"));
    assert.ok(lines.length >= 3, "board table with rows");
    const cells = (l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const head = cells(lines[0]);
    const rows = lines.slice(2).map((l) => Object.fromEntries(head.map((h, i) => [h, cells(l)[i] ?? ""])));
    const ids = rows.map((r) => r.ID);
    assert.equal(new Set(ids).size, ids.length, "board IDs unique");
    for (const r of rows) {
      assert.ok(["TOP", "READY", "DOING", "BLOCKED", "OWNER", "DONE"].includes(r.Status), `board ${r.ID} bad status ${r.Status}`);
    }
    for (const r of rows.filter((r) => r.Status === "DONE")) {
      assert.match(r.Evidence ?? "", /\b[0-9a-f]{7,40}\b/, `board ${r.ID} DONE without SHA`);
    }
    assert.ok(rows.some((r) => ["TOP", "READY", "DOING"].includes(r.Status)), "board has open rows");
  });

  it("handoff first line + inbox ## Open section", () => {
    assert.match(read("sprint/handoff.md"), /^# design-studio handoff - round \d+ \(token [^)]+\)/, "handoff first line");
    assert.match(read("sprint/inbox.md"), /^## Open\b/m, "inbox ## Open");
  });

  it("keeper: repo name, marker and REPOS table entry", () => {
    const keeper = read(".opencode/plugin/loop-keeper.js");
    assert.ok(keeper.includes('repo: "design-studio"'), "keeper CFG repo");
    assert.ok(keeper.includes("Run the design-studio loop from `sprint/board.md` toward `VISION.md`"), "keeper marker");
    assert.ok(keeper.includes('"design-studio": {') || keeper.includes("  design-studio: {"), "keeper REPOS table");
  });
});
