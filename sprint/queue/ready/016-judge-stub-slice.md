---
role: judge
title: judge DS-07/09/17 stub-replacement slice
---

Goal: independent verdict on the round-6 slice that replaced 3 NOT-BUILT stubs with fail-closed implementations: DS-07 workshop-01 (stories plus 256px gate plus snapshots), DS-09 canvas-01 (5 Konva-compatible scene templates plus SVG export), DS-17 convert harness (two variants plus click plan).

Scope: read-only. `tools/workshop.mjs`, `workshop/`, `tests/workshop.test.mjs`, `tools/canvas.mjs`, `canvas/`, `tests/canvas.test.mjs`, `tools/convert.mjs`, `convert/`, `tests/convert.test.mjs`.

Proof: rerun `node tools/workshop.mjs --check`, `node tools/canvas.mjs --check`, `node tools/convert.mjs --check`, `node --test tests/workshop.test.mjs tests/canvas.test.mjs tests/convert.test.mjs`, and `node tools/check.mjs` yourself, never trusting the builder's log; confirm no vendored Konva code, variants truly differ, every plan selector occurs in its variant.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged stub-replacement slice <VERDICT> | proof: <commands plus numbers>`.
