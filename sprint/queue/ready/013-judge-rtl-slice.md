---
role: judge
title: judge DS-13/15/16 Hebrew RTL slice
---

Goal: independent verdict on the Hebrew RTL slice built round 5: DS-16 rtl-01 gate (Hebrew type pair plus rtlSelfCheck), DS-13 jobhunt bilingual page, DS-15 Hebrew CV.

Scope: read-only. `tools/audit.mjs` (third RTL gate plus rtlSelfCheck), `tests/audit.test.mjs` (5 RTL tests), `samples/jobhunt/`, `samples/cv/`, plus the round-5 builder record in `sprint/queue/done/builder-rows-*` (weakest-slice run).

Proof: rerun `node tools/audit.mjs --rtl --check`, `node tools/audit.mjs samples/jobhunt/brief.json`, `node tools/audit.mjs samples/cv/brief.json`, and `node tools/check.mjs` yourself, never trusting the builder's log; open the jobhunt and cv renders with the Read tool and confirm Hebrew RTL reads correctly (dir rtl, logical properties, Hebrew type); confirm LTR samples behave byte-identically.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged RTL slice <VERDICT> | proof: <commands plus numbers>`.
