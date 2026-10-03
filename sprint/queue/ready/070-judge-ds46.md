---
role: judge
title: judge DS-46 avatar slot
---

Goal: independent verdict whether DS-46 AVATAR-01 holds: kits/game-ui/avatar.html slot (player-avatar + 2 inline-SVG styles, dicebear MIT idea-only, no network, 44px, tokens/buttons links, 0 hex) + manifest pin + 11 game-ui gates, sizes/import green. Moves Scorecard row Game UI kits.

Scope: read-only except running proofs; own no content files. Run `node tools/game-ui.mjs --check` plus `--serve --check` GAME-UI PASS (avatar gates quoted, serve 4/4); verify 0 hex + 0 http in avatar.html; open avatar.html render evidence. Scope dirt to owned files (kits/game-ui/*, tools/game-ui.mjs); attribute other dirt instead of failing. NOT icons, NOT backdrops, NOT VISION.md, NOT board. Shell is pwsh.

Proof: (1) both GAME-UI PASS lines; (2) 0-hex/0-http evidence; (3) visual evidence. Unwired slot, hotlink, or hex is FAIL.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-46 <VERDICT> | proof: <commands plus numbers>`.
