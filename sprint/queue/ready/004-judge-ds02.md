---
role: judge
title: judge DS-02 tokens pipeline
---

Goal: independent verdict on DS-02 (tokens.json to tokens.css plus docs page, 0 hardcoded colors), built round 1, TOKENS PASS 12/12 claimed.

Scope: read-only. `tools/tokens.mjs`, `samples/cover/tokens.json`, `samples/cover/tokens.css`, `samples/cover/tokens.html`, `tests/tokens.test.mjs`, plus the round-1 builder record in `sprint/queue/done/builder-rows-r2.md`.

Proof: rerun `node tools/tokens.mjs --check` and `node tools/check.mjs` yourself, never trusting the builder's log; confirm 0 hardcoded colors and docs linkage with your own eyes.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-02 <VERDICT> | proof: <commands plus numbers>`.
