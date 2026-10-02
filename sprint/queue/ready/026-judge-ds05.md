---
role: judge
title: judge DS-05 prompt-to-block loop
---

Goal: independent verdict on DS-05 agent-02 (prompt-to-block loop with ds-quality-v1 judge gate, floor 8, fail-closed), built round 10 over the NOT-BUILT stub.

Scope: read-only. `tools/agent-block.mjs`, `tests/agent-block.test.mjs`, plus the round-10 builder record.

Proof: rerun `node tools/agent-block.mjs --check` (expect 15/15 incl. 10/10 default block, 10/10 RTL block, fail-closed 5/10 refusal, loop convergence), `node --test tests/agent-block.test.mjs`, `node tools/judge.mjs --check` (harness untouched and green), and `node tools/check.mjs` yourself; confirm the rubric is imported from tools/judge.mjs (not forked) and below-floor output reports REWORK, never SHIP.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-05 <VERDICT> | proof: <commands plus numbers>`.
