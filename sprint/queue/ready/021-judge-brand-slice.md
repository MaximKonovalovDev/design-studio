---
role: judge
title: judge DS-10/18/03 brand plus registry slice
---

Goal: independent verdict on the round-7 slice: DS-10 brandkit gate plus studio kit, DS-18 taste 20-exemplar library plus gate, DS-03 registry 4 to 10 blocks plus gate.

Scope: read-only. `tools/brandkit.mjs`, `brand-kits/`, `tests/brandkit.test.mjs`, `tools/taste.mjs`, `taste/`, `tests/taste.test.mjs`, `tools/registry.mjs`, `templates/registry.json`, `templates/blocks/`, `tests/registry.test.mjs`.

Proof: rerun `node tools/brandkit.mjs --check`, `node tools/taste.mjs --check`, `node tools/registry.mjs --check`, `node --test tests/brandkit.test.mjs tests/taste.test.mjs tests/registry.test.mjs`, and `node tools/check.mjs` yourself, never trusting the builder's log; confirm the var(--*) token contract holds across blocks, 20 exemplars unique with contrast, and 10/10 blocks with 0 hardcoded colors.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged brand-registry slice <VERDICT> | proof: <commands plus numbers>`.
