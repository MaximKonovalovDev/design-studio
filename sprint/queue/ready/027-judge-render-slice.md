---
role: judge
title: judge DS-21/30 render refine plus stream
---

Goal: independent verdict on the round-10 render slice: DS-21 screenshot-refine plus measured preview (measurePreview bundleMs, refineHtml create|update, under 120 lines) and DS-30 streaming chunk-to-preview plus annotate-refine (3-chunk progressive, FIX-comment refine, under 45 lines) on tools/render.mjs.

Scope: read-only. `tools/render.mjs`, plus the round-10 builder record.

Proof: rerun `node tools/render.mjs --check` (preview bundleMs plus badge, 3-chunk progressive, empty-preview and 1-chunk fixtures fail closed as expected), `node --test tests/render.test.mjs`, `node tools/audit.mjs --sizes --check`, `node tools/audit.mjs --rtl --check`, and `node tools/check.mjs` yourself; confirm pure wrappers reuse the existing render path and the suite stays green.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged render slice <VERDICT> | proof: <commands plus numbers>`.
