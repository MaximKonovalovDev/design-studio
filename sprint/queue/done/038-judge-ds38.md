---
role: judge
title: judge DS-38 ad-square reflow
---

Goal: independent verdict on DS-38 (THUMB-01 ad-square reflow user of the DS-23 matrix: ad-reflow rule on tools/audit.mjs plus samples/ad-square/page.html reflow), built round 14 on disk, uncommitted — judge the working tree as-is.

Scope: read-only. `tools/audit.mjs` (ad-reflow rule only), `samples/ad-square/page.html`, plus the round-14 builder record.

Proof: rerun `node tools/audit.mjs samples/ad-square/brief.json` yourself (AUDIT PASS, ad-square 1080x1080 title reflows) plus the ad-reflow F2P fixture (must FAIL without the rule) and `node tools/check.mjs` RESULT PASS yourself; confirm 0 existing gates weakened and cover/cover-b still re-pass.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-38 <VERDICT> | proof: <commands plus numbers>`.
