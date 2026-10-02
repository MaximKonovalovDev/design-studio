---
role: judge
title: judge DS-06 rubric judge v1
---

Goal: independent verdict on DS-06 (tools/judge.mjs rubric ds-quality-v1, 10 checks, DESIGN-REVIEW.md writer), built round 1, JUDGE PASS claimed.

Scope: read-only. `tools/judge.mjs`, `tests/judge.test.mjs`, `samples/cover/DESIGN-REVIEW.md`, plus the round-1 builder record in `sprint/queue/done/builder-rows-r1.md`.

Proof: rerun `node tools/judge.mjs --check` and `node tools/check.mjs` yourself, never trusting the builder's log; open `samples/cover/out.png` at full size and `samples/cover/thumb-256.png` at 256px with the Read tool. An unopened capture is an unverified claim.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-06 <VERDICT> | proof: <commands plus numbers>`.
