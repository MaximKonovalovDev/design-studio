---
role: judge
title: judge DS-37 single-source emit
---

Goal: independent verdict on DS-37 (single-source block emit on tools/registry.mjs plus templates/blocks/hero.emit.html), built round 14 on disk, uncommitted — judge the working tree as-is.

Scope: read-only. `tools/registry.mjs` (emit gate only), `templates/blocks/hero.emit.html`, `tests/registry.test.mjs`, plus the round-14 builder record.

Proof: rerun `node tools/registry.mjs --check` yourself plus the single-source F2P fixture (missing emit must FAIL, TITLE-swapped emit must FAIL) and the P2P fixture (checked-in emit PASS), plus full `node tools/check.mjs` RESULT PASS yourself; confirm the emitted HTML matches the sample section and no other gate weakened.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-37 <VERDICT> | proof: <commands plus numbers>`.
