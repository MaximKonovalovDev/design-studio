---
role: judge
title: judge DS-23 sizes plus DS-31 dir-token
---

Goal: independent verdict on the round-9 audit slice: DS-23 size matrix plus per-size reflow (SIZE_MATRIX, outForSize, --sizes CLI) and DS-31 direction-token gates (wantDir, no row-reverse without intent) on tools/audit.mjs plus tools/render.mjs.

Scope: read-only. `tools/audit.mjs`, `tools/render.mjs`, `samples/hebrew-hero/page.html` (comment only), plus the round-9 builder record.

Proof: rerun `node tools/audit.mjs --sizes --check` (3 sizes re-pass, long-title fixture FAILs as expected), `node tools/audit.mjs --rtl --check` (reverse no-intent FAILs as expected, 3 on-disk rtl samples PASS), `node --test tests/audit.test.mjs tests/render.test.mjs`, and `node tools/check.mjs` (must be RESULT PASS now that K-01 carries its SHA) yourself; confirm existing rtl:-prefixed gate names untouched and LTR behavior unchanged.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged audit slice <VERDICT> | proof: <commands plus numbers>`.
