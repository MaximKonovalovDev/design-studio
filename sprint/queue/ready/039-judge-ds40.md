---
role: judge
title: judge DS-40 thumb-claim gate
---

Goal: independent verdict on DS-40 (workshop story thumb-256 legibility claim checked against computed 256px title-size math in tools/workshop.mjs plus 2 tests in tests/workshop.test.mjs), built round 14 on disk with the 034 stories landing, uncommitted — judge the working tree as-is.

Scope: read-only. `tools/workshop.mjs` (thumb-claim gate only), `tests/workshop.test.mjs`, plus the round-14 builder record. NOT the 6 new stories/snapshots (034's, judged by landing).

Proof: rerun `node tools/workshop.mjs --check` yourself (WORKSHOP PASS 10 stories) plus the lied-claim F2P fixture (a story citing a wrong `px at 256w` figure must FAIL naming the new check) and `node --test tests/workshop.test.mjs` plus `node tools/check.mjs` RESULT PASS yourself; confirm no story/snapshot file needed edits and no other gate weakened.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-40 <VERDICT> | proof: <commands plus numbers>`.
