---
role: judge
title: judge DS-12 cover variants plus DS-14 ad set
---

Goal: independent verdict on the round-8 slice: DS-12 factory cover two variants (cover-b 1080x1080 plus two-variant DESIGN-REVIEW.md) and DS-14 ad set (3 creatives plus 1 landing hero, each SHIP 10/10).

Scope: read-only. `samples/cover-b/`, `samples/cover/DESIGN-REVIEW.md` (two-variant verdict), `samples/ads/`, plus the round-8 builder record.

Proof: rerun `node tools/audit.mjs` on cover-b plus all four ads briefs, `node tools/judge.mjs` on each, and `node tools/check.mjs` yourself, never trusting the builder's log; open cover-b out.png plus thumb and at least two ads renders with the Read tool and confirm both sizes read as intentional with titles legible at 256px; confirm the two-variant review names real measured numbers.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged cover-ads slice <VERDICT> | proof: <commands plus numbers>`.


## Result (completed)

<task id="ses_efe642926ffeJ22nQ2bGnsJKJH" state="completed">
<task_result>
VERDICT: FAIL
Slice: cover-b 1080x1080 exists + 3 ads + hero exist; two-variant review missing.
Cover REVIEW is single-variant 10/10 only; grep winner/variant/cover-b = 0 hits, no measured comparison.
Renders opened: cover-b 1080x1080 + 256x256 thumb legible; ad-1 1080x1080 + hero 1280x720 intentional, titles legible.
Before (builder/board 5c451ab): claimed check PASS + judge 022 PASS, cover-b 22.8px, all SHIP 10/10.
After (my rerun): audit PASS x5 (cover-b, ad-1/2/3, hero); judge SHIP 10/10 x5 (cover-b, ad-1/2/3, hero).
After: `node tools/check.mjs` RESULT FAIL 1 (cover render ETIMEDOUT Powershell); DS-12/14 need PASS.
Side-effect: my audit/judge rewrote 3 files (cover-b/ad-1 reviews, hero audit).
Revert: `git checkout -- samples/cover-b/DESIGN-REVIEW.md samples/cover-b/design-audit.json samples/ads/ad-1/DESIGN-REVIEW.md samples/ads/hero/design-audit.json` then `git status --short`.
Partly = FAIL per contract (two-variant + check PASS unmet).
RESULT: DONE - judged cover-ads slice FAIL | proof: audit 5xPASS + judge 5xSHIP10/10 + check FAIL1

</task_result>
</task>
