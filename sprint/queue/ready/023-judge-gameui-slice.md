---
role: judge
title: judge DS-20 serve plus DS-32 gap linter
---

Goal: independent verdict on the round-9 game-UI slice: DS-20 serve-forge gate (already green since DS-11, re-verified) and DS-32 equal-gap HUD linter (gapEqual plus-minus 1px, 5 new gap checks, hud data-gap wiring).

Scope: read-only. `tools/game-ui.mjs`, `kits/game-ui/hud.html`, plus the round-9 builder record.

Proof: rerun `node tools/game-ui.mjs --check` (expect gap 5/5), `node tools/game-ui.mjs --serve --check` (serve 4/4), and `node tools/check.mjs` yourself; verify the gap fixture FAILs without the fix logic (or confirm fail-closed on bad gaps); confirm Kenney CC0 plus Lucide ISC provenance, no unlicensed art.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged game-ui slice <VERDICT> | proof: <commands plus numbers>`.
