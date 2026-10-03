---
role: judge
title: judge DS-67 picsum placeholders
---

Goal: independent verdict whether DS-67 PLACE-01 holds: `tools/canvas.mjs` placeholder helpers (picsum seed-or-id + size + grayscale/blur, ship:true fail-closed, cache-first plan) plus `canvas/placeholders.json` wireframe slots, wired into --check as opt-in skip when absent. Moves Scorecard row Thumbnail readability.

Scope: read-only except running proofs; own no content files. Run `node tools/canvas.mjs --check` CANVAS PASS (5 templates + 2 slots quoted); verify ship:true fails closed (code quote); verify wireframe-only note in manifest; confirm no hotlink in shipped samples (`Select-String` picsum in samples/ must be 0 outside the manifest); confirm no gate weakened (`git diff HEAD -- tools/canvas.mjs` shows additive only). NOT templates, NOT samples content, NOT VISION.md, NOT board. Shell is pwsh.

Proof: (1) CANVAS PASS line with slot count; (2) fail-closed quote; (3) 0 shipped hotlinks; (4) additive-only diff note. A weakened gate, shipped hotlink, or silent ship:true pass is FAIL.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-67 <VERDICT> | proof: <commands plus numbers>`.
