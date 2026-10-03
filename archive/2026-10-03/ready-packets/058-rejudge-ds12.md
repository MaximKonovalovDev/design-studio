---
role: judge
title: re-judge DS-12 duel after preserve-gate
---

Goal: close DS-12: with the 052 preserve-gate committed (66da6d2, judged PASS 053), verify the cover vs cover-b two-variant evidence in `samples/cover-b/DESIGN-REVIEW.md` survives the full suite intact. Moves Scorecard row Thumbnail readability.

Scope: read-only except running proofs; own no content files. Count `Select-String winner|variant|cover-b samples/cover-b/DESIGN-REVIEW.md` BEFORE (expect 10) and AFTER the suite (`node tools/check.mjs` plus `node tools/judge.mjs samples/cover-b/brief.json` — per-sample run now gate-protected, but any wipe is instant FAIL naming the wiper). Confirm both audits AUDIT PASS, both SHIP numbers and thumb bytes in the prose match fresh outputs, winner cover-b by audit + 256px. Open cover-b out.png full-size plus 256px. NOT gates, NOT page.html, NOT VISION.md, NOT board. Shell is pwsh.

Proof: (1) 10 hits before and after with section-identical note; (2) both AUDIT PASS lines with title px; (3) `node tools/check.mjs` RESULT PASS; (4) PNG opened full-size plus 256px; (5) rubric score x/10, PASS only at >= 7/10 with prose numbers matching. Any wipe or number mismatch is FAIL.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - re-judged DS-12 <VERDICT> | proof: <commands plus numbers>`.
