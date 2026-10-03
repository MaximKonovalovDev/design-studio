---
role: judge
title: judge DS-45 mirror gate
---

Goal: independent verdict whether DS-45 RTL-02 holds: `tools/audit.mjs` mixed-dir mirror check warns on unmirrored physical remnants (background-position left/right, clear left/right, translateX) with zero gate weakens on top of the DS-31 direction-token gate. Moves Scorecard row Hebrew RTL.

Scope: read-only except running proofs; own no content files. Run `node tools/audit.mjs --rtl --check` AUDIT RTL PASS (mirror cases quoted) and `node --test tests/audit.test.mjs` (mirror tests quoted); verify 0 weakens (prior 10/10 gates all still green, diff additive-only); verify on-disk RTL samples still PASS (hebrew-hero, cv, jobhunt). Scope dirt to owned files (tools/audit.mjs, tests/audit.test.mjs); attribute all other dirt instead of failing. NOT tokens, NOT page content, NOT VISION.md, NOT board. Shell is pwsh.

Proof: (1) AUDIT RTL PASS + test lines; (2) additive-only note; (3) 3 sample PASS lines. A weakened gate or red sample is FAIL.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-45 <VERDICT> | proof: <commands plus numbers>`.
