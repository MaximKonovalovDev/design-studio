---
role: judge
title: judge DS-36 receipt sample
---

Goal: independent verdict on DS-36 (receipt-required landing sample: checkReceipt rev-hash gate plus samples/ads/hero/receipt.json pinned to out.png sha256), built round 13 PARTIAL (DS-37 deferred, different files).

Scope: read-only. `tools/check.mjs` (checkReceipt only), `samples/ads/hero/receipt.json`, plus the round-13 builder record.

Proof: rerun the F2P fixtures yourself (wrong rev must FAIL with rev mismatch; publish:true with no receipt must FAIL unreadable), the P2P fixture (good receipt PASS), and full `node tools/check.mjs` (RESULT PASS, hero receipt line present, other samples receipt-skipped) yourself; confirm rev pins the current out.png hash.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-36 <VERDICT> | proof: <commands plus numbers>`.


## Result (completed)

<task id="ses_f02fe3cf8ffe34eaZzeg2jvsTT" state="completed">
<task_result>
VERDICT: PASS
Changed: r13 1083012: tools/check.mjs +rev-hash gate (rev>=7 prefix of out.png sha256), samples/ads/hero/receipt.json new pinned full hash; DS-37 deferred separate files.
Before: check RESULT PASS receipt-skipped 6/6, no hero receipt.
After: `node tools/check.mjs` RESULT PASS 6/6 receipt-skipped; `node tools/check.mjs samples/ads/hero/brief.json` RESULT PASS receipt https://design-studio.local/ads/hero 1456bd0ed00f.
F2P wrong-rev FAIL rev-mismatch, F2P publish-no-receipt FAIL unreadable, P2P hero PASS; sha256 1456bd0e…==rev PIN-OK.
Row: `node tools/audit.mjs samples/ads/hero/brief.json` PASS, `node tools/judge.mjs` SHIP 10/10 floor 8; thumb 256x144 5675B; PNG opened hierarchy/contrast/alignment/brand/RTL ok.
Revert: `git revert 1083012` (or rm hero/receipt.json + checkout tools/check.mjs).
RESULT: DONE - judged DS-36 PASS | proof: check.mjs RESULT PASS, hero single-sample PASS 42384B, F2P 2xFAIL, P2P PASS, audit PASS, judge 10/10, PIN-OK

</task_result>
</task>
