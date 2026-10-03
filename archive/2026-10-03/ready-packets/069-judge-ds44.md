---
role: judge
title: judge DS-44 verdict gate
---

Goal: independent verdict whether DS-44 LAND-04 holds: `tools/figma.mjs` verdictFor + checkLandingVerdict (section 5 of checkFigma) requires a DESIGN-REVIEW.md with ## Verdict + SHIP for hero + cover-b, wired into `tools/check.mjs` so the suite fails on verdict FAIL — no code without verdict. Step 4/4 Landing; on PASS the planner can move Landing %%. Moves Scorecard row Landing-page conversion.

Scope: read-only except running proofs; own no content files. Run `node tools/figma.mjs --check` FIGMA PASS (6 mappings + 2 verdict gates quoted) and `node tools/check.mjs` RESULT PASS (verdict lines quoted); verify fail-closed (unmapped drop still FAILs — code read, do not break fixtures); verify hero + cover-b reviews both carry ## Verdict + SHIP. Scope dirt to owned files (tools/figma.mjs, tools/check.mjs); attribute other dirt instead of failing. NOT samples content, NOT receipts, NOT VISION.md, NOT board. Shell is pwsh.

Proof: (1) FIGMA PASS + verdict gates; (2) RESULT PASS + verdict lines; (3) both reviews SHIP quoted. Missing gate, silent pass, or suite regression is FAIL.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-44 <VERDICT> | proof: <commands plus numbers>`.
