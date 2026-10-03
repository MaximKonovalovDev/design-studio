---
role: judge
title: judge DS-08 figma file-drop mapping
---

Goal: independent verdict on DS-08 figma-01 (file-drop Figma JSON plus code-connect mapping table, no MCP, no network), built round 12 over the NOT-BUILT stub.

Scope: read-only. `tools/figma.mjs`, `tests/figma.test.mjs`, plus the round-12 builder record.

Proof: rerun `node tools/figma.mjs --check` (expect FIGMA PASS 6 mappings 6 frames) and `node --test tests/figma.test.mjs` (6/0) yourself; feed the file-drop arg a Figma JSON and confirm the mapping table resolves frames to registry blocks; confirm no network calls and fail-closed gates on unmapped frames; confirm `node tools/check.mjs` stays RESULT PASS.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-08 <VERDICT> | proof: <commands plus numbers>`.


## Result (completed)

<task id="ses_efe46d461ffeONM0V5MyVOWdoM" state="completed">
<task_result>
VERDICT: PASS
Changed: r12 6ab0e10 replaced NOT-BUILT stub with file-drop Figma JSON + 6-row code-connect table (tools/figma.mjs, tests/figma.test.mjs), no MCP, no network.
Before (stub 90ca5f2): `node tools/figma.mjs --check` → NOT-BUILT nonzero, 0 mappings/frames.
After (reran): `node tools/figma.mjs --check` → FIGMA PASS 6 mappings 6 frames.
After (reran): `node tools/figma.mjs --check /tmp/drop.json` → FIGMA PASS 6/6, frames resolve hero/footer/etc to registry blocks.
After (reran): `node --test tests/figma.test.mjs` → 6 pass 0 fail.
Gates (reran): unmapped Landing/Mystery → pass=false; URL drop → pass=false; grep fetch|http in tool → 0; no figma key in opencode.jsonc.
After (reran): `node tools/check.mjs` → RESULT PASS 6 samples.
Scope: owned files only, no secrets/weakened checks; PNG/rubric N/A (mapping row, no render).
Revert: `git revert 6ab0e10` (or `git checkout 90ca5f2 -- tools/figma.mjs`) restores stub.
RESULT: DONE - judged DS-08 PASS | proof: figma --check PASS 6/6, file-drop PASS 6/6, tests 6/0, check RESULT PASS

</task_result>
</task>
