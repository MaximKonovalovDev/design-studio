---
role: judge
title: judge DS-35 pair plus merge
---

Goal: independent verdict on DS-35 (pair convention plus registry merge on tools/tokens.mjs plus tools/brandkit.mjs: PAIR_RULES, lintPairMates, darkPairGaps, mergeKits overlay-wins), built round 13.

Scope: read-only. `tools/tokens.mjs`, `tools/brandkit.mjs`, `tests/tokens.test.mjs`, `tests/brandkit.test.mjs`, `brand-kits/`, plus the round-13 builder record.

Proof: rerun `node tools/tokens.mjs --check`, `node tools/brandkit.mjs --check`, `node --test tests/tokens.test.mjs tests/brandkit.test.mjs`, and `node tools/check.mjs` yourself; confirm the pair fixture FAILs without the fix, the two-kit overlay-wins fixture passes, dark overrides every surface pair, and the shipped kit stays green.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-35 <VERDICT> | proof: <commands plus numbers>`.


## Result (completed)

<task id="ses_f02fe3d04ffeTMcIV8YRZE3B7R" state="completed">
<task_result>
VERDICT: PASS
Changed: tools/tokens.mjs + brandkit.mjs add PAIR_RULES, lintPairMates, darkPairGaps, mergeKits overlay-wins; tests add DS-35 cases (1083012).
Before (bad fixtures FAIL as required): accent w/o on-accent FAIL, dark drops pair FAIL, pair-convention gate FAIL.
After `node tools/tokens.mjs --check`: PASS 20 gates, 16.27:1/7.13:1/5.18:1, dark overrides every pair.
After `node tools/brandkit.mjs --check`: PASS 1 kit studio, 0 collisions, overlay-wins green.
After `node --test tests/tokens.test.mjs tests/brandkit.test.mjs`: 27 pass / 0 fail, 7 suites.
After `node tools/check.mjs`: RESULT PASS 20/0/0 + 6 samples render+thumb+audit PASS; thumb-256.png opened OK.
Revert: `git revert 1083012` or `git checkout 1083012^ -- tools/tokens.mjs tools/brandkit.mjs tests/tokens.test.mjs tests/brandkit.test.mjs`
RESULT: DONE - judged DS-35 PASS | proof: tokens --check PASS, brandkit --check 1-kit 0-collision PASS, --test 27/0 PASS, check.mjs 20/0/0+6 PASS

</task_result>
</task>
