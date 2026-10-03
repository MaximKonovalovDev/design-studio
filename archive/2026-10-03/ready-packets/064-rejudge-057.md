---
role: judge
title: re-judge 057 README wording (tightened scope)
---

Goal: close the 046 job on content: two judges (054, 060-judge) already verified README.md names all 11 sample dirs with RESULT wording 11 == check 11; both FAILs cited only whole-tree `git diff --stat` dirt owned by parallel judged builds, never README content. This re-judge scopes dirt correctly.

Scope: read-only except running proofs; own no content files. (1) Quote README RESULT line (must name 11) and `node tools/check.mjs` RESULT line (11 == 11). (2) Count `^- samples/` entries (11). (3) `git diff HEAD -- README.md`: every hunk must be README-docs (046 entries + 057 wording); list every OTHER dirty path and attribute it to its committed or queued owner (keeper files, cards, snapshot, samples tool-output are never the builder's). Only a README-content error or a README-hunk touching tool code is FAIL. Whole-tree dirt with attributed owners is NOT a fail. NOT samples, NOT gates, NOT VISION.md, NOT board. Shell is pwsh.

Proof: (1) both RESULT lines quoted, 11 == 11; (2) 11 entries; (3) README-hunk list + other-dirt attribution list. Content error is FAIL with the line.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged 057r <VERDICT> | proof: <commands plus numbers>`.
