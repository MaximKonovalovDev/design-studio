---
role: judge
title: judge DS-12 cover variants plus DS-14 ad set
---

Goal: independent verdict on the round-8 slice: DS-12 factory cover two variants (cover-b 1080x1080 plus two-variant DESIGN-REVIEW.md) and DS-14 ad set (3 creatives plus 1 landing hero, each SHIP 10/10).

Scope: read-only. `samples/cover-b/`, `samples/cover/DESIGN-REVIEW.md` (two-variant verdict), `samples/ads/`, plus the round-8 builder record.

Proof: rerun `node tools/audit.mjs` on cover-b plus all four ads briefs, `node tools/judge.mjs` on each, and `node tools/check.mjs` yourself, never trusting the builder's log; open cover-b out.png plus thumb and at least two ads renders with the Read tool and confirm both sizes read as intentional with titles legible at 256px; confirm the two-variant review names real measured numbers.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged cover-ads slice <VERDICT> | proof: <commands plus numbers>`.
