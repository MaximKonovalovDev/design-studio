---
role: judge
title: judge DS-04 screenshot-to-code loop
---

Goal: independent verdict on DS-04 (tools/agent-shot.mjs ds-agent-shot-v1, MIT harness only), built round 2, AGENT-SHOT PASS 11/11 claimed.

Scope: read-only. `tools/agent-shot.mjs` only, plus the round-2 builder record in `sprint/queue/done/builder-rows-r1.md`.

Proof: rerun `node tools/agent-shot.mjs --check` and `node tools/check.mjs` yourself, never trusting the builder's log; confirm donor shape only from abi/screenshot-to-code MIT with no copied code and no network.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-04 <VERDICT> | proof: <commands plus numbers>`.
