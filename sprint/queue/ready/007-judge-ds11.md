---
role: judge
title: judge DS-11 game UI kit
---

Goal: independent verdict on DS-11 (tools/game-ui.mjs plus kits/game-ui HUD/menu/button kit), built round 2, GAME-UI PASS 30/30 claimed.

Scope: read-only. `tools/game-ui.mjs`, `kits/game-ui/` (manifest, tokens, buttons, hud, menu), plus the round-2 builder record in `sprint/queue/done/builder-rows-r2.md`.

Proof: rerun `node tools/game-ui.mjs --check`, `node tools/game-ui.mjs --serve --check`, and `node tools/check.mjs` yourself, never trusting the builder's log; confirm Kenney CC0 plus Lucide ISC provenance with no unlicensed art.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-11 <VERDICT> | proof: <commands plus numbers>`.
