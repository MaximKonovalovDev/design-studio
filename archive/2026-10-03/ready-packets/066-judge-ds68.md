---
role: judge
title: judge DS-68 CC0 game-art pin
---

Goal: independent verdict whether DS-68 GAMEART-01 holds: manifest pins kenney pack + version + license file + vendored-or-inline slots, per-pack CC0 license check, HUD/menu slot wiring via data-gameart attributes, offline only zero hotlinks. Moves Scorecard row Game UI kits.

Scope: read-only except running proofs; own no content files. Run `node tools/game-ui.mjs --check` plus `--serve --check` GAME-UI PASS (incl. 13 gameart gates, serve 4/4); verify kits/game-ui/LICENSE-kenney.txt exists with CC0 record; verify zero hotlinks (Select-String http in wired slots = 0, offline flag); open hud.html render or one wired slot evidence. NOT avatar slot DS-46, NOT icons, NOT VISION.md, NOT board. Shell is pwsh.

Proof: (1) both GAME-UI PASS lines; (2) license file quote; (3) 0-hotlink evidence; (4) slot-wiring evidence. A missing license, a hotlink, or an unwired slot is FAIL.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-68 <VERDICT> | proof: <commands plus numbers>`.
