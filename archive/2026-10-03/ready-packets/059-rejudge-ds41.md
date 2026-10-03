---
role: judge
title: re-judge DS-41 receipt after preserve-gate
---

Goal: close DS-41: with the 052 preserve-gate committed (66da6d2, judged PASS 053), verify `samples/cover-b/receipt.json` still pins `out.png` sha256 AND the review duel section survives the suite. Moves Scorecard row Landing-page conversion.

Scope: read-only except running proofs; own no content files. Recompute out.png sha256 vs receipt rev (exact match, no re-render-and-replace). Run `node tools/check.mjs samples/cover-b/brief.json` RESULT PASS receipt pinned plus full-suite RESULT PASS. Count review hits before/after (10 and identical). Confirm hero receipt intact. Open cover-b out.png full-size plus 256px. NOT receipt edits, NOT gates, NOT VISION.md, NOT board. Shell is pwsh.

Proof: (1) both sha256 strings quoted, match true; (2) per-sample plus full-suite RESULT PASS lines; (3) review 10 hits before and after; (4) PNG opened full-size plus 256px; (5) rubric score x/10, PASS only at >= 7/10 with rev PIN-OK. Stale rev or wipe is FAIL.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - re-judged DS-41 <VERDICT> | proof: <commands plus numbers>`.
