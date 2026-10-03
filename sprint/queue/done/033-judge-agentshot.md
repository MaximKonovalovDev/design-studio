---
role: judge
title: judge DS-28 strip plus DS-34 ledger
---

Goal: independent verdict on the round-12 agent-shot slice: DS-28 strip-old-code plus fence path merge and DS-34 fix-once-per-render ledger plus hang guard on tools/agent-shot.mjs (85 insertions, 0 deletions of prior behavior).

Scope: read-only. `tools/agent-shot.mjs`, plus the round-12 builder record.

Proof: rerun `node tools/agent-shot.mjs --check` (expect AGENT-SHOT PASS 16/16 incl. 5 new fixtures) and `node tools/check.mjs` yourself; confirm the 5-turn strip (2180 to 935 chars, newest verbatim), 3-fence path merge, double-fire single-fix, hang-key block, and missing-asset rewrite directive; confirm no prior behavior deleted.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged agentshot slice <VERDICT> | proof: <commands plus numbers>`.
