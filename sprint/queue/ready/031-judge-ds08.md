---
role: judge
title: judge DS-08 figma file-drop mapping
---

Goal: independent verdict on DS-08 figma-01 (file-drop Figma JSON plus code-connect mapping table, no MCP, no network), built round 12 over the NOT-BUILT stub.

Scope: read-only. `tools/figma.mjs`, `tests/figma.test.mjs`, plus the round-12 builder record.

Proof: rerun `node tools/figma.mjs --check` (expect FIGMA PASS 6 mappings 6 frames) and `node --test tests/figma.test.mjs` (6/0) yourself; feed the file-drop arg a Figma JSON and confirm the mapping table resolves frames to registry blocks; confirm no network calls and fail-closed gates on unmapped frames; confirm `node tools/check.mjs` stays RESULT PASS.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-08 <VERDICT> | proof: <commands plus numbers>`.
