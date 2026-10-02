---
role: judge
title: judge DS-24 receipt plus DS-29 winner
---

Goal: independent verdict on the round-9 check-suite slice: DS-24 publish receipt gate (checkReceipt, single-sample fixture mode) and DS-29 reference parity plus 2-variant winner (checkReferenceParity, pickWinner) on tools/check.mjs plus tools/audit.mjs.

Scope: read-only. `tools/check.mjs`, `tools/audit.mjs` (parity gate plus diagnostic hints only), plus the round-9 builder record.

Proof: rerun the F2P fixtures yourself (receipt fixture must FAIL with receipt.json bad; reference fixture must FAIL with reference.png missing), the P2P fixtures (good receipt PASS, matching reference PASS), `node tools/thumb.mjs --check`, `node --test tests/audit.test.mjs tests/thumb.test.mjs`, and full `node tools/check.mjs` (must be RESULT PASS now that K-01 carries its SHA) yourself; confirm the 6-sample suite behavior is unchanged (receipt skipped, winner informational).

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged checksuite slice <VERDICT> | proof: <commands plus numbers>`.
