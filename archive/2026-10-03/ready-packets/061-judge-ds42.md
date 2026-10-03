---
role: judge
title: judge DS-42 hero A/B winner
---

Goal: independent verdict whether DS-42 LAND-02 holds: `samples/ads/hero-b` variant B exists and the check suite prints an informational hero winner line (hero vs hero-b by audit + 256px) that never fails the suite. Moves Scorecard row Landing-page conversion.

Scope: read-only except running proofs; own no content files. Verify hero-b brief/page/tokens exist; run `node tools/check.mjs` (RESULT PASS plus winner-hero line quoted), `node tools/thumb.mjs --check` THUMB PASS, `node tools/audit.mjs samples/ads/hero-b/brief.json` AUDIT PASS; confirm the winner block is informational (break hero-b deliberately? No — read-only: confirm code path never returns fail on winner). Open hero-b out.png full-size plus 256px. NOT hero content, NOT receipts, NOT gates, NOT VISION.md, NOT board. Shell is pwsh.

Proof: (1) winner-hero line quoted; (2) RESULT PASS + THUMB PASS + AUDIT PASS lines; (3) hero-b PNG opened full-size plus 256px; (4) rubric x/10, PASS only at >= 7/10. Missing variant, failing suite, or gating winner is FAIL.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-42 <VERDICT> | proof: <commands plus numbers>`.
