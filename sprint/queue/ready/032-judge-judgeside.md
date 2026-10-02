---
role: judge
title: judge DS-22 iterate plus DS-27 oid dispatch
---

Goal: independent verdict on the round-12 judge-side slice: DS-22 iterate plus oid plus story harness and DS-27 data-oid plus typed-action dispatch (OIDS, FIX_ACTIONS, dispatchFix, iterateSample, Next-edits review section, 5 new self-tests) on tools/judge.mjs plus 4 data-oid attrs on samples/cover/page.html.

Scope: read-only. `tools/judge.mjs`, `tests/judge.test.mjs`, `samples/cover/page.html` (attrs only), plus the round-12 builder record.

Proof: rerun `node tools/judge.mjs --check` (expect JUDGE PASS 15/15), `node --test tests/judge.test.mjs`, and `node tools/check.mjs` yourself; confirm failing details append oid->action next-edits, the 4 cover oids exist, unknown actions throw, and score semantics unchanged (broken 5/10, 7/10 no-ship); confirm cover still SHIP 10/10.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged judge-side slice <VERDICT> | proof: <commands plus numbers>`.
