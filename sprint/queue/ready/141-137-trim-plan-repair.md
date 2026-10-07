---
role: builder
title: repair 137 trim plan counts (DS-100)
chain: repair
of: 137-ds100-trim-plan
writer: builder
attempt: 2
origin_title: DS-100 TRIM-D1 plan with numbers (no moves, no deletes)
---
The judge FAILED 137-ds100-trim-plan. Verdict, cut: plan section 2 claims `designs/*/VERDICT.md` = 0 files but 55 exist on disk (incl. O-042/O-043/O-045); same line claims `designs/*/DELIVERED.json` = 0 but O-042/O-043/O-045 hold DELIVERED.json. Checks the judge reran itself: `node sprint/check.mjs` RESULT PASS (21/0/0), `node tools/orders-check.mjs` ORDERS PASS 66.

Goal: fix exactly what the verdict names, nothing else. Scope (owned path, working tree only, never commit): `sprint/notes/trim-plan-2026-10-07.md` (correct the two false counts, each with its measurement source + UTC date). Read-only everywhere else: `designs/*/VERDICT.md` and `designs/*/DELIVERED.json` for counting (count them yourself, do not trust the verdict's 55), `sprint/queue/ready/137-ds100-trim-plan.md`. Never move, delete, commit, add a dependency, or touch `sprint/halt`.

Proof: every number in the corrected lines matches a command you ran (paste counts); `node sprint/check.mjs` still RESULT PASS; `node tools/orders-check.mjs` still ORDERS PASS. Stop (M 30 min; one repair only).
End: `RESULT: DONE - trim-plan counts corrected (VERDICT.md <n>, DELIVERED.json <n>, sourced) | proof: <counts + both checks>`
