---
role: judge
title: judge DS-66 image opt-in lane
---

Goal: independent verdict whether DS-66 IMAGE-01 holds: `tools/image.mjs` builds a paid Image API POST shape with env-only key (fail-closed, no default call, no network at check) and a receipt carrier (model + usage.cost + media_type) compatible with existing receipts. Moves Scorecard row Landing-page conversion.

Scope: read-only except running proofs; own no content files. Verify no key/secret in repo (`Select-String` OPENROUTER_API_KEY shows env-read only, no literal key); run `node tools/image.mjs --check` IMAGE PASS (offline, zero spend); run `node tools/check.mjs` RESULT PASS with hero receipt still valid (extra receipt fields ignored); confirm `node tools/image.mjs` makes no network call without explicit env key. Open nothing visual (no pixels lane); verify file length ~40-120 lines. NOT receipts, NOT render, NOT VISION.md, NOT board. Shell is pwsh. Never print a secret.

Proof: (1) IMAGE PASS line with offline note; (2) RESULT PASS line; (3) env-only key evidence (code quote); (4) no-network evidence. A literal key, a default paid call, or a broken hero receipt is FAIL.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-66 <VERDICT> | proof: <commands plus numbers>`.
