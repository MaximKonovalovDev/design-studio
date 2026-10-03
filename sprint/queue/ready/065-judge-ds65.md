---
role: judge
title: judge DS-65 free text lane
---

Goal: independent verdict whether DS-65 FREE-01 holds: :free text lane for brief-copy-layout drafts (buildFreePrompt + env-only key + draftOnly receipt + per-model Terms note), drafts only never final pixels, wired into agent-block loop. Moves Scorecard row Brief-to-render speed.

Scope: read-only except running proofs; own no content files. Run `node tools/render.mjs --check` RENDER PASS (12/12 incl. 5 free gates) and `node tools/agent-block.mjs --check` AGENT-BLOCK PASS (incl. 2 free gates); verify :free suffix gate + env-only key (no literal key, never print secrets) + draftOnly-never-pixels evidence (code quotes); confirm no network at check time and no image bytes produced. NOT game-art, NOT receipts, NOT VISION.md, NOT board. Shell is pwsh.

Proof: (1) RENDER + AGENT-BLOCK PASS lines; (2) env-only + draftOnly + Terms quotes; (3) no-network/no-bytes note. A literal key, a default call, or final-pixel output is FAIL.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-65 <VERDICT> | proof: <commands plus numbers>`.
