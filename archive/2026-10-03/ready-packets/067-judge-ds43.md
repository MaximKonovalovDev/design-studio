---
role: judge
title: judge DS-43 live-receipt gate
---

Goal: independent verdict whether DS-43 LAND-03 holds: `tools/convert.mjs` carries the live-receipt gate (plan.live sample pinned, receipt rev == out.png sha256, fail-closed when unpinned), `convert/plan.json` live.sample = samples/cover-b with 6 steps intact, step 3/4 Landing. Moves Scorecard row Landing-page conversion.

Scope: read-only except running proofs; own no content files. Run `node tools/convert.mjs --check` CONVERT PASS (live gates quoted) and `node --test tests/convert.test.mjs` (fail-closed tests quoted); verify cover-b rev pinned (both hashes quoted, match true); run `node tools/check.mjs` RESULT PASS. Scope dirt to owned files (tools/convert.mjs, tests/convert.test.mjs, convert/plan.json); attribute all other dirt to committed or queued owners instead of failing. NOT hero content, NOT audit gates, NOT VISION.md, NOT board. Shell is pwsh.

Proof: (1) CONVERT PASS + test lines; (2) rev match true quoted; (3) RESULT PASS. Unpinned receipt, broken plan steps, or suite regression is FAIL.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-43 <VERDICT> | proof: <commands plus numbers>`.
